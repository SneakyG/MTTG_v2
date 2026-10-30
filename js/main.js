// ==========================================
// 1. RENDER GIAO DIỆN & ĐỒNG HỒ THỜI GIAN THỰC
// ==========================================

/* Hàm render chính: vẽ lại giao diện ứng dụng dựa trên trạng thái hiện tại */
function render() {
  R = [];
  const a = $('#app');
  
  // Kiểm tra cấu hình bắt buộc (Google API key và Thư mục gốc root)
  if (!CFG.key || !CFG.root) {
    return a.innerHTML = '<h1>Cần cấu hình</h1><p>Điền <b>key</b> (Google API key) và <b>root</b> (ID thư mục MTTG) trong file js/env.js (xem README).</p>';
  }
  
  // Hiển thị thông báo lỗi, nội dung tab hiện tại hoặc trạng thái đang tải dữ liệu
  a.innerHTML = (err ? `<p class=er>Không tải được từ Google Drive: ${E(err)}<br><small>Kiểm tra API key (đã bật Drive API, đúng domain), ID thư mục, và thư mục đã chia sẻ “Anyone with the link”.</small></p>` : '') + 
                (X.stages.length ? V[tab]() : err ? '' : '<p class=mu>Đang tải kỷ niệm từ Google Drive…</p>');
  
  // Vẽ thanh điều hướng dưới cùng (Navigation Tabs)
  $('#nav').innerHTML = TABS.map(([k, i, n]) => `<button class="${k == tab ? 'on' : ''}" data-a=go data-k=${k}><b>${i}</b>${n}</button>`).join('');
  
  tick();
}

/* Hàm cập nhật đồng hồ thời gian thực (định dạng giờ:phút:giây) mỗi giây */
const tick = () => {
  const el = $('#hms');
  if (el) {
    const n = new Date();
    el.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()].map(P).join(':');
  }
};
setInterval(tick, 1000);


// ==========================================
// 2. BỘ XỬ LÝ HÀNH ĐỘNG NGƯỜI DÙNG (ACTIONS)
// ==========================================
const ACT = {
  // Chuyển tab hiển thị
  go: k => { tab = k; render(); scrollTo(0, 0); },
  
  // Lọc theo giai đoạn (Stage)
  fs: (k, i) => { F.s = +i; render(); },
  
  // Lọc theo loại (Type)
  ft: (k, i) => { F.t = i; render(); },
  
  // Chọn giai đoạn nhanh, chuyển thẳng sang tab kỷ niệm ('mem')
  sf: (k, i) => { F.s = +i; F.t = ''; tab = 'mem'; render(); scrollTo(0, 0); },
  
  // Mở Lightbox để xem ảnh/video toàn màn hình
  lb: (k, i, b) => { LB = { l: R[b.dataset.l], i: +i }; show(); },
  
  // Đóng Lightbox
  lc: () => { lb.className = ''; lb.innerHTML = ''; },
  
  // Chuyển về mục trước trong Lightbox
  lp: () => step(-1),
  
  // Chuyển sang mục tiếp theo trong Lightbox
  lq: () => step(1),
  
  // Mở trực tiếp thư mục trên Google Drive trong tab mới của trình duyệt
  dr: () => window.open('https://drive.google.com/drive/folders/' + CFG.root, '_blank'),
  
  // Tải lại dữ liệu (Refresh) từ Google Drive
  rf: async (k, i, b) => {
    b.textContent = 'Đang cập nhật…';
    err = '';
    try {
      await load();
    } catch (e) {
      err = String(e.message || e);
    }
    render();
  }
};


// ==========================================
// 3. LẮNG NGHE SỰ KIỆN TOÀN CỤC (GLOBAL EVENT LISTENER)
// ==========================================
/* Bắt tất cả sự kiện click có chứa thuộc tính data-a và điều hướng gọi hàm trong ACT */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (b) ACT[b.dataset.a]?.(b.dataset.k, b.dataset.i, b);
});


// ==========================================
// 4. KHỞI ĐỘNG ỨNG DỤNG (INITIALIZATION)
// ==========================================
render();

// Nếu đã có cấu hình key và root thì tiến hành gọi API tải dữ liệu từ Google Drive
if (CFG.key && CFG.root) {
  load().catch(e => {
    err = String(e.message || e);
  }).finally(render);
}
