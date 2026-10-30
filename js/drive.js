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
  const all = await ls(`'${CFG.root}' in parents` + FO, 'id,name'),
        avatar = all.find(f => f.name.trim().toLowerCase() == 'avatar'),
        sf = all.map(f => {
          const m = /^([1-5])(?:[_\s-]+(.*))?$/.exec(f.name.trim());
          return m && {
            id: f.id,
            n: +m[1],
            slug: (m[2] || DEF[+m[1] - 1]).trim().toLowerCase().replace(/[\s-]+/g, '_')
          };
        }).filter(Boolean),
        stageFolders = sf.length ? await lsIn(sf.map(f => f.id), FO, 'id,name,parents') : [],
        stageByFolder = {};

  stageFolders.forEach(f => {
    const stage = sf.find(s => s.id == f.parents[0]);
    if (stage) stageByFolder[f.id] = stage.n;
  });

  const mediaFolders = stageFolders.filter(f => /^(images|videos)$/i.test(f.name.trim())),
        datesInMedia = mediaFolders.length ? await lsIn(mediaFolders.map(f => f.id), FO, 'id,name,parents') : [],
        dateFolders = [...stageFolders, ...datesInMedia].filter(f => {
          const m = /^(\d{4})(\d{2})(\d{2})(.*)$/.exec(f.name.trim());
          if (!m) return false;
          const d = new Date(+m[1], +m[2] - 1, +m[3]);
          return d.getFullYear() == +m[1] && d.getMonth() == +m[2] - 1 && d.getDate() == +m[3];
        }),
        stageByMedia = {};

  mediaFolders.forEach(f => {
    const stage = stageFolders.find(s => s.id == f.parents[0]);
    if (stage) stageByMedia[f.id] = stageByFolder[stage.id];
  });

  const dm = {};
  dateFolders.forEach(f => {
    const m = /^(\d{4})(\d{2})(\d{2})(.*)$/.exec(f.name.trim()),
          parentStage = stageByFolder[f.parents[0]],
          parentMedia = stageByMedia[f.parents[0]],
          stage = parentStage || parentMedia;
    if (!stage) return;
    const c = m[4].replace(/^[\s_-]+/, '');
    dm[f.id] = {
      d: `${m[1]}-${m[2]}-${m[3]}`,
      s: stage,
      c: /\p{L}/u.test(c) ? c : ''
    };
  });

  const fl = Object.keys(dm).length ? await lsIn(Object.keys(dm), MEDIA, 'id,name,mimeType,parents') : [],
        it = fl.map(f => {
          const x = dm[f.parents[0]];
          return x && {
            id: f.id,
            d: x.d,
            s: x.s,
            v: f.mimeType.startsWith('video/') ? 1 : 0,
            c: x.c
          };
        }).filter(Boolean);

  // Sắp xếp danh sách kỷ niệm theo thứ tự thời gian giảm dần (mới nhất lên trên)
  it.sort((a, b) => b.d.localeCompare(a.d));
  build(sf, it);

  // Avatar là ảnh nằm trực tiếp trong thư mục avatar, không theo cấu trúc thư mục ngày.
  const pics = avatar ? await ls(`'${avatar.id}' in parents and mimeType contains 'image/' and trashed=false`, 'id,name') : [],
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
