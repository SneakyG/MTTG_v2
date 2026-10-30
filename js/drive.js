// ==========================================
// 1. CÁC HÀM TIỆN ÍCH GỌI GOOGLE DRIVE API
// ==========================================

/* Đọc cây thư mục Google Drive (Drive API v3) với hỗ trợ phân trang (pagination) */
async function ls(q, f) {
  let o = [], t = '';
  do {
    const r = await fetch(`${API}?q=${encodeURIComponent(q)}&fields=nextPageToken,files(${f})&pageSize=1000&key=${CFG.key}${t ? '&pageToken=' + t : ''}`),
          j = await r.json();
          
    if (!r.ok) throw Error(j.error?.message || r.status);
    o = o.concat(j.files);
    t = j.nextPageToken;
  } while (t);
  
  return o;
}

/* Tạo câu lệnh truy vấn lọc các mục nằm trong danh sách thư mục cha (parents) */
const par = a => '(' + a.map(i => `'${i}' in parents`).join(' or ') + ')';

/* Chia mảng ID thành từng nhóm nhỏ (tối đa 30 phần tử) để tránh vượt quá giới hạn query của Google API */
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n)),

/* Gọi API tìm kiếm đồng thời cho nhiều danh sách ID thư mục cha theo từng lô */
lsIn = async (ids, x, f) => (await Promise.all(chunk(ids, 30).map(c => ls(par(c) + x, f)))).flat(),

/* Định dạng điều kiện lọc file: chỉ lấy Ảnh hoặc Video, và không nằm trong thùng rác */
MEDIA = " and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false";


// ==========================================
// 2. XÂY DỰNG DỮ LIỆU TỪNG GIAI ĐOẠN (STAGES BUILDER)
// ==========================================
function build(sf, it) {
  X.items = it;
  // Xác định tổng số giai đoạn dựa trên cấu hình mặc định (DEF) và số thư mục thực tế
  const N = Math.max(DEF.length, ...sf.map(f => f.n));
  
  X.stages = [...Array(N)].map((_, i) => {
    const n = i + 1,
          f = sf.find(x => x.n == n),
          sl = f ? f.slug : DEF[i],
          m = ST[sl] || [(sl || 'Giai đoạn ' + n).replace(/_/g, ' '), '💞', 'đã bên nhau'],
          a = it.filter(x => x.s == n),
          ds = a.map(x => x.d).sort();
          
    return {
      n,
      l: m[0],                          // Tiêu đề / Tên giai đoạn
      e: m[1],                          // Biểu tượng cảm xúc (Emoji)
      v: m[2],                          // Văn bản trạng thái (ví dụ: đã bên nhau)
      st: CFG.start[n] || ds[0] || '',  // Ngày bắt đầu giai đoạn
      last: ds[ds.length - 1] || '',    // Ngày kết thúc / mới nhất trong giai đoạn
      np: a.filter(x => !x.v).length,   // Tổng số lượng ảnh
      nv: a.filter(x => x.v).length     // Tổng số lượng video
    };
  });
}


// ==========================================
// 3. TẢI VÀ XỬ LÝ TOÀN BỘ DỮ LIỆU TỪ GOOGLE DRIVE
// ==========================================
async function load() {
  // Lấy danh sách toàn bộ thư mục cấp 1 bên trong thư mục gốc (CFG.root)
  const all = await ls(`'${CFG.root}' in parents` + FO, 'id,name'),
        
        // Lọc các thư mục chứa ảnh đại diện (avatar)
        av = all.filter(f => /ava/i.test(f.name)),
        
        // Lấy danh sách file ảnh hợp lệ bên trong thư mục ava (nếu có)
        pa = av.length ? ls(par(av.map(f => f.id)) + FO, 'id').then(x => ls(par([...av, ...x].map(f => f.id)) + " and mimeType contains 'image/' and trashed=false", 'id,name')).catch(() => []) : Promise.resolve([]),
        
        // Lọc các thư mục giai đoạn theo định dạng số_tên (ví dụ: 1_yeu_nhau)
        sf = all.filter(f => !/ava/i.test(f.name)).map(f => {
          const m = /^(\d+)_(.+)$/.exec(f.name);
          return m && { id: f.id, n: +m[1], slug: m[2] };
        }).filter(Boolean),
        
        // Lấy danh sách các thư mục con bên trong các giai đoạn
        mf = sf.length ? await ls(par(sf.map(f => f.id)) + FO, 'id,parents') : [],
        by = {};

  mf.forEach(f => by[f.id] = sf.find(s => s.id == f.parents[0]).n);

  // Đọc danh sách thư mục con cấp sâu hơn (nếu có) để trích xuất ngày tháng từ tên thư mục/file
  const dfs = mf.length ? await lsIn(mf.map(f => f.id), FO, 'id,name,parents') : [],
        dm = {};

  dfs.forEach(f => {
    // Phân tích cú pháp ngày tháng từ tên thư mục (Định dạng: YYYYMMDD[Mô_tả])
    const m = /^(\d{4})(\d{2})(\d{2})(.*)$/.exec(f.name);
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return;
    
    const c = m[4].replace(/^[\s_-]+/, '');
    dm[f.id] = {
      d: `${m[1]}-${m[2]}-${m[3]}`,           // Chuẩn hóa ngày (YYYY-MM-DD)
      s: by[f.parents[0]],                   // Thuộc giai đoạn số mấy
      c: /\p{L}/u.test(c) ? c : ''           // Mô tả (Caption) nếu có chứa chữ cái
    };
  });

  // Truy vấn lấy toàn bộ file ảnh/video thực tế bên trong các thư mục hợp lệ
  const fl = Object.keys(dm).length ? await lsIn(Object.keys(dm), MEDIA, 'id,name,mimeType,parents') : [],
        it = [];

  fl.sort((a, b) => a.name.localeCompare(b.name)).forEach(f => {
    const x = dm[f.parents[0]];
    if (x) {
      it.push({
        id: f.id,
        d: x.d,
        s: x.s,
        v: f.mimeType[0] == 'v' ? 1 : 0,     // Phân loại: Video (1) hoặc Ảnh (0) dựa vào mimeType bắt đầu bằng 'v'
        c: x.c
      });
    }
  });

  // Sắp xếp danh sách kỷ niệm theo thứ tự thời gian giảm dần (mới nhất lên trên)
  it.sort((a, b) => b.d.localeCompare(a.d));
  build(sf, it);

  // Xử lý và gán ảnh đại diện (Avatar) cho 2 người
  const pics = (await pa).sort((x, y) => x.name.localeCompare(y.name)),
        bn = f => f.name.replace(/\.[^.]*$/, '').toLowerCase(),
        pk = (n, i) => (pics.find(f => bn(f) == n.toLowerCase()) || pics[i])?.id;

  AV = { a: pk(CFG.a, 0), b: pk(CFG.b, 1) };
  
  // Lưu cache dữ liệu vào LocalStorage để lần sau tải nhanh hơn
  try {
    localStorage.mttg = JSON.stringify({ sf, it, AV });
  } catch (e) {}
}


// ==========================================
// 4. KHỞI TẠO TỪ BỘ NHỚ ĐỆM (LOCALSTORAGE)
// ==========================================
try {
  const c = JSON.parse(localStorage.mttg || 'null');
  if (c) {
    build(c.sf, c.it);
    AV = c.AV || {};
  }
} catch (e) {}
