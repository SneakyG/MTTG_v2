// ==========================================
// 1. TÍNH KHOẢNG THỜI GIAN CHI TIẾT (NĂM, THÁNG, NGÀY)
// ==========================================
/* Tính toán số năm, số tháng và số ngày chênh lệch chính xác giữa hai mốc thời gian a và b */
function ymd(a, b) {
  let y = b.getFullYear() - a.getFullYear(),
      m = b.getMonth() - a.getMonth(),
      d = b.getDate() - a.getDate();
      
  // Nếu số ngày bị âm, lùi lại 1 tháng và cộng thêm số ngày của tháng trước đó
  if (d < 0) {
    m--;
    d += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  
  // Nếu số tháng bị âm, lùi lại 1 năm và cộng thêm 12 tháng
  if (m < 0) {
    y--;
    m += 12;
  }
  
  return [y, m, d];
}


// ==========================================
// 2. TÍNH TOÁN CÁC MỐC KỶ NIỆM SẮP TỚI (UPCOMING MILESTONES)
// ==========================================
/* s: Ngày bắt đầu (Start date), cs: Giai đoạn hiện tại (Current stage) */
function ups(s, cs) {
  const t = today(),                                // Lấy ngày hiện tại
        L = [],                                     // Mảng chứa danh sách các mốc sắp tới
        v = cs.v.replace('đã ', ''),                // Chuẩn hóa tên trạng thái (ví dụ: "đã bên nhau" -> "bên nhau")
        
        // Hàm phụ: Kiểm tra nếu mốc thời gian lớn hơn hoặc bằng ngày hiện tại thì thêm vào danh sách
        add = (n, d, o) => d >= t && L.push({ n, d, k: dd(t, d), ...o });

  // 1. Thêm các mốc số ngày tròn (Ví dụ: 100 ngày, 365 ngày, 1000 ngày,...)
  [100, 200, 300, 365, 500, 666, 777, 888, 999, 1000, 1111, 1314, 1500, 2000, 2500, 3000, 3650, 5000].forEach(n => 
    add(n + ' ngày ' + v, new Date(s.getFullYear(), s.getMonth(), s.getDate() + n))
  );

  // 2. Thêm mốc kỷ niệm tròn năm (Ví dụ: Kỷ niệm 1 năm, 2 năm,...)
  for (let y = 1; y < 80; y++) {
    const d = new Date(s.getFullYear() + y, s.getMonth(), s.getDate());
    if (d >= t) {
      add('Kỷ niệm ' + y + ' năm', d);
      break; // Chỉ lấy mốc năm gần nhất tiếp theo
    }
  }

  // 3. Thêm các sự kiện tùy chỉnh được cấu hình sẵn trong mảng CFG.events
  CFG.events.forEach(e => {
    const o = D(e.d),
          d = new Date(t.getFullYear(), o.getMonth(), o.getDate());
          
    // Nếu sự kiện trong năm nay đã qua, tự động dịch sang năm sau
    if (d < t) d.setFullYear(d.getFullYear() + 1);
    add(e.n, d);
  });

  // Sắp xếp các mốc theo thứ tự thời gian gần nhất và chỉ lấy ra tối đa 5 mốc đầu tiên
  return L.sort((a, b) => a.d - b.d).slice(0, 5);
}
