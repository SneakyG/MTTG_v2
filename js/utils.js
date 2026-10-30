// ==========================================
// 1. TIỆN ÍCH DOM & XỬ LÝ CHUỖI (DOM & STRING UTILITIES)
// ==========================================

/* Viết gọn hàm document.querySelector để chọn phần tử HTML */
const $ = s => document.querySelector(s),

/* Hàm mã hóa chuỗi HTML chống lỗi XSS (chuyển đổi các ký tự đặc biệt sang dạng thực thể HTML) */
E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');


// ==========================================
// 2. TIỆN ÍCH XỬ LÝ NGÀY THÁNG & THỜI GIAN (DATE UTILITIES)
// ==========================================

const DAY = 864e5,                                           // Số mili-giây trong một ngày (24 * 60 * 60 * 1000)
      P = n => String(n).padStart(2, 0),                      // Thêm số 0 phía trước nếu số có 1 chữ số (ví dụ: 5 -> "05")
      iso = d => d.getFullYear() + '-' + P(d.getMonth() + 1) + '-' + P(d.getDate()), // Chuyển Date thành chuỗi YYYY-MM-DD
      D = s => new Date(s + 'T00:00:00'),                     // Chuyển chuỗi ngày thành đối tượng Date (mốc 00:00)
      fmt = s => D(s).toLocaleDateString('vi-VN'),           // Định dạng ngày sang kiểu Việt Nam (dd/mm/yyyy)
      dd = (a, b) => Math.round((b - a) / DAY),              // Tính số ngày chênh lệch giữa 2 mốc thời gian a và b
      
      /* Lấy ngày hiện tại (đặt về mốc 00:00 để tính toán chính xác) */
      today = () => {
        const n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
      },

      /* Tạo đường dẫn URL lấy ảnh thu nhỏ (thumbnail) từ Google Drive */
      U = (id, w) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;


// ==========================================
// 3. HẰNG SỐ CẤU HÌNH (STAGES, API & TABS)
// ==========================================

/* Danh nghĩa các giai đoạn tình yêu: [Tên hiển thị, Biểu tượng emoji, Văn bản trạng thái] */
const ST = {
        tim_hieu: ['Tìm hiểu', '🌱', 'đang tìm hiểu nhau'],
        nguoi_yeu: ['Người yêu', '💕', 'đã yêu nhau'],
        vo_chong: ['Vợ chồng', '💍', 'đã là vợ chồng'],
        con_con: ['Có con', '👶', 'đã làm ba mẹ'],     // (hoặc co_con tùy cấu hình)
        ve_gia: ['Về già', '🌅', 'đã bên nhau trọn đời']
      },
      DEF = Object.keys(ST),                                    // Danh sách khóa mặc định của các giai đoạn

      API = 'https://www.googleapis.com/drive/v3/files',       // Endpoint API Google Drive v3
      FO = " and mimeType='application/vnd.google-apps.folder' and trashed=false", // Bộ lọc thư mục không nằm trong thùng rác

      /* Cấu hình các tab trên thanh điều hướng: [Mã tab, Biểu tượng, Tên hiển thị] */
      TABS = [
        ['home', '🏠', 'Trang chủ'],
        ['mem', '📖', 'Kỷ niệm'],
        ['road', '🗺️', 'Hành trình']
      ];


// ==========================================
// 4. TRẠNG THÁI TOÀN CỤC CỦA ỨNG DỤNG (GLOBAL STATE)
// ==========================================
let X = { items: [], stages: [] },    // Lưu trữ danh sách kỷ niệm và thông tin các giai đoạn
    tab = 'home',                       // Tab hiện đang được chọn (mặc định là 'home')
    F = { s: 0, t: '' },                // Bộ lọc hiện tại (s: giai đoạn, t: loại file)
    R = [],                             // Danh sách kết quả render tạm thời
    LB = { l: [], i: 0 },               // Trạng thái Lightbox (l: danh sách ảnh xem, i: chỉ số ảnh hiện tại)
    err = '',                           // Lưu thông báo lỗi (nếu có)
    AV = {};                            // Lưu thông tin ảnh đại diện (Avatar) của 2 người
