// ==========================================
// 1. ĐIỀU HƯỚNG & HIỂN THỊ LIGHTBOX
// ==========================================

/* Lấy phần tử khung Lightbox từ DOM */
const lb = $('#lb'),

  /* Hàm chuyển đổi qua lại giữa các ảnh/video (n: bước nhảy, ví dụ: +1 hoặc -1) */
  step = n => {
    LB.i = (LB.i + n + LB.l.length) % LB.l.length;
    show();
  };

/* Hàm hiển thị nội dung chi tiết của ảnh/video trong Lightbox */
function show() {
  const x = LB.l[LB.i];
  if (!x) return;
  
  lb.className = 'on';
  
  // Xây dựng cấu trúc HTML cho Lightbox (Nút đóng, nút chuyển trái/phải, khung hiển thị video/ảnh và mô tả)
  lb.innerHTML = `
    <button class="lx" data-a="lc">✕</button>
    ${LB.l.length > 1 ? '<button class="lp" data-a="lp">‹</button><button class="lq" data-a="lq">›</button>' : ''}
    <div class="lm">
      ${x.v 
        ? `<iframe src="https://drive.google.com/file/d/${x.id}/preview" allow="autoplay;fullscreen" allowfullscreen></iframe>` 
        : `<img src="${U(x.id, 1600)}" alt="">`
      }
    </div>
    <p>
      ${fmt(x.d)}${x.c ? ', ' + E(x.c) : ''}. 
      <a href="https://drive.google.com/file/d/${x.id}/view" target="_blank" rel="noopener">Mở bản gốc</a>
    </p>
  `;
}


// ==========================================
// 2. XỬ LÝ SỰ KIỆN CẢM ỨNG (VUỐT MÀN HÌNH TRÊN ĐIỆN THOẠI)
// ==========================================
let tx = 0;

/* Lưu lại tọa độ X khi người dùng bắt đầu chạm màn hình */
lb.addEventListener('touchstart', e => {
  tx = e.touches[0].clientX;
}, { passive: true });

/* Xác định khoảng cách vuốt khi nhấc tay ra để chuyển ảnh (Vuốt trái/phải) */
lb.addEventListener('touchend', e => {
  const d = e.changedTouches[0].clientX - tx;
  if (Math.abs(d) > 60) {
    step(d < 0 ? 1 : -1); // Vuốt sang trái (next) hoặc vuốt sang phải (prev)
  }
});


// ==========================================
// 3. XỬ LÝ SỰ KIỆN BÀN PHÍM (CHO MÁY TÍNH)
// ==========================================
addEventListener('keydown', e => {
  // Nếu Lightbox chưa mở thì bỏ qua
  if (!lb.className) return;
  
  // Phím Esc: Đóng Lightbox
  if (e.key == 'Escape') ACT.lc();
  
  // Phím Mũi tên phải: Xem ảnh tiếp theo
  if (e.key == 'ArrowRight') step(1);
  
  // Phím Mũi tên trái: Xem ảnh trước đó
  if (e.key == 'ArrowLeft') step(-1);
});
