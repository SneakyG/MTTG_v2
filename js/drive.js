// ==========================================
// 1. HÀM GỌI API GOOGLE DRIVE & XỬ LÝ QUÁ TẢI (RATE LIMIT)
// ==========================================

/**
 * Đọc dữ liệu từ Google Drive API v3 có hỗ trợ phân trang (pagination) 
 * và tự động thử lại (retry) nếu gặp lỗi quá giới hạn tốc độ (Rate Limit / 429).
 */
async function ls(q, f) {
  let o = [], t = '';
  do {
    let j;
    // Vòng lặp thử lại tối đa 3 lần khi gặp lỗi Rate Limit từ Google API
    for (let k = 0;; k++) {
      const r = await fetch(`${API}?q=${encodeURIComponent(q)}&fields=nextPageToken,files(${f})&pageSize=1000&key=${CFG.key}${t ? '&pageToken=' + t : ''}`);
      j = await r.json();
      
      if (r.ok) break; // Nếu gọi thành công thì thoát vòng lặp retry
      
      // Nếu đã thử 3 lần hoặc lỗi khác không phải do Rate Limit thì báo lỗi ngay
      if (k >= 3 || !/ateLimit/.test(JSON.stringify(j.error))) {
        throw Error(j.error?.message || r.status);
      }
      
      // Chờ thời gian tăng dần trước khi gọi lại (Exponential Backoff: 600ms, 1200ms, 1800ms)
      await new Promise(z => setTimeout(z, 600 * (k + 1)));
    }
    o = o.concat(j.files);
    t = j.nextPageToken; // Lấy mã trang tiếp theo (nếu có)
  } while (t);
  
  return o;
}


// ==========================================
// 2. CÁC TIỆN ÍCH TRUY VẤN ĐỒNG THỜI (POOL & HELPERS)
// ==========================================

/* 
  Lưu ý quan trọng: 
  Key công khai chỉ được phép truy vấn từng thư mục một dạng ('ID' in parents); 
  nếu gộp nhiều thư mục bằng toán tử "or" sẽ bị Google trả về mã lỗi 403.
*/

// Bộ lọc điều kiện: Chỉ lấy file thực tế (không phải thư mục) và không nằm trong thùng rác
const NF = " and mimeType!='application/vnd.google-apps.folder' and trashed=false",

      /**
       * Hàm giới hạn số lượng tác vụ bất đồng bộ chạy song song cùng lúc (mặc định tối đa 10 luồng).
       * Giúp tăng tốc độ tải mà không làm sập API.
       */
      pool = async (a, fn, n = 10) => {
        const o = [];
        let i = 0;
        await Promise.all(Array.from({ length: Math.min(n, a.length) }, async () => {
          while (i < a.length) {
            const k = i++;
            o[k] = await fn(a[k]);
          }
        }));
        return o;
      },

      /* Quét file/thư mục con bên trong danh sách ID cha bằng cơ chế pool đã định nghĩa */
      lsIn = async (ids, x, f) => (await pool(ids, id => ls(`'${id}' in parents` + x, f))).flat(),

      /* Kiểm tra nhanh xem file có phải là Ảnh hoặc Video hay không dựa vào mimeType */
      isMedia = f => /^(image|video)\//.test(f.mimeType);


// ==========================================
// 3. XÂY DỰNG DỮ LIỆU CÁC GIAI ĐOẠN (STAGES BUILDER)
// ==========================================
function build(sf, it) {
  X.items = it;
  // Xác định tổng số giai đoạn (lấy max giữa cấu hình mặc định DEF và số thư mục thực tế tìm thấy)
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
      e: m[1],                          // Emoji biểu tượng
      v: m[2],                          // Văn bản trạng thái (ví dụ: đã bên nhau)
      st: CFG.start[n] || ds[0] || '',  // Ngày bắt đầu giai đoạn
      last: ds[ds.length - 1] || '',    // Ngày mới nhất trong giai đoạn
      np: a.filter(x => !x.v).length,   // Tổng số lượng ảnh trong giai đoạn
      nv: a.filter(x => x.v).length     // Tổng số lượng video trong giai đoạn
    };
  });
}


// ==========================================
// 4. HÀM TẢI VÀ ĐỒNG BỘ DỮ LIỆU CHÍNH (MAIN LOAD)
// ==========================================
async function load() {
  // BƯỚC 4.1: Lấy danh sách toàn bộ thư mục cấp 1 nằm trong thư mục gốc (CFG.root)
  const all = await ls(`'${CFG.root}' in parents` + FO, 'id,name'),
        
        // Lọc ra các thư mục chứa ảnh đại diện (avatar) dựa theo tên có chữ "ava"
        av = all.filter(f => /ava/i.test(f.name)),
        
        // Truy vấn lấy danh sách file ảnh avatar hợp lệ (nếu tồn tại thư mục ava)
        pa = av.length ? lsIn(av.map(f => f.id), FO, 'id')
                         .then(x => lsIn([...av, ...x].map(f => f.id), NF, 'id,name,mimeType'))
                         .then(a => a.filter(f => f.mimeType.startsWith('image/')))
                         .catch(() => []) : Promise.resolve([]),
        
        // Lọc ra các thư mục giai đoạn (có định dạng số_tên, ví dụ: 1_yeu_nhau)
        sf = all.filter(f => !/ava/i.test(f.name)).map(f => {
          const m = /^(\d+)_(.+)$/.exec(f.name);
          return m && { id: f.id, n: +m[1], slug: m[2] };
        }).filter(Boolean),
        
        // Lấy danh sách các thư mục con bên trong các giai đoạn
        mf = sf.length ? await lsIn(sf.map(f => f.id), FO, 'id,parents') : [],
        by = {};

  mf.forEach(f => by[f.id] = sf.find(s => s.id == f.parents[0]).n);

  // BƯỚC 4.2: Đọc các thư mục ngày tháng (Cấp sâu hơn bên trong giai đoạn, định dạng YYYYMMDD[Mô_tả])
  const dfs = mf.length ? await lsIn(mf.map(f => f.id), FO, 'id,name,parents') : [],
        dm = {};

  dfs.forEach(f => {
    const m = /^(\d{4})(\d{2})(\d{2})(.*)$/.exec(f.name);
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return;
    
    const c = m[4].replace(/^[\s_-]+/, '');
    dm[f.id] = {
      d: `${m[1]}-${m[2]}-${m[3]}`,           // Chuẩn hóa định dạng ngày (YYYY-MM-DD)
      s: by[f.parents[0]],                   // Thuộc giai đoạn số mấy
      c: /\p{L}/u.test(c) ? c : ''           // Mô tả (Caption) nếu tên thư mục có chứa chữ cái
    };
  });

  // BƯỚC 4.3: Truy vấn lấy toàn bộ file media thực tế nằm bên trong các thư mục ngày tháng
  const fl = Object.keys(dm).length ? await lsIn(Object.keys(dm), NF, 'id,name,mimeType,parents') : [],
        it = [];

  fl.sort((a, b) => a.name.localeCompare(b.name)).forEach(f => {
    const x = dm[f.parents[0]];
    if (x && isMedia(f)) {
      it.push({
        id: f.id,
        d: x.d,
        s: x.s,
        v: f.mimeType[0] == 'v' ? 1 : 0,     // Phân loại: Video (1) hoặc Ảnh (0)
        c: x.c
      });
    }
  });

  // Sắp xếp danh sách kỷ niệm theo thứ tự thời gian giảm dần (mới nhất hiển thị lên trên)
  it.sort((a, b) => b.d.localeCompare(a.d));
  build(sf, it);

  // BƯỚC 4.4: Xử lý và gán ID ảnh đại diện (Avatar) cho 2 người
  const pics = (await pa).sort((x, y) => x.name.localeCompare(y.name)),
        bn = f => f.name.replace(/\.[^.]*$/, '').toLowerCase(),
        pk = (n, i) => (pics.find(f => bn(f) == n.toLowerCase()) || pics[i])?.id;

  AV = { a: pk(CFG.a, 0), b: pk(CFG.b, 1) };
  
  // Lưu cache toàn bộ dữ liệu vào LocalStorage để lần sau tải trang cực kỳ nhanh
  try {
    localStorage.mttg = JSON.stringify({ sf, it, AV });
  } catch (e) {}
}


// ==========================================
// 5. KHỞI TẠO DỮ LIỆU TỪ BỘ NHỚ ĐỆM (LOCALSTORAGE)
// ==========================================
try {
  const c = JSON.parse(localStorage.mttg || 'null');
  if (c) {
    build(c.sf, c.it);
    AV = c.AV || {};
  }
} catch (e) {}
