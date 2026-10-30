// Cài đặt công khai của app. Khoá API và ID thư mục nằm riêng trong js/env.js
const CFG={
  ...(window.ENV||{}),   // key, root
  a:'MTrieu', b:'TGiang', // tên hai bạn (cũng là tên file ảnh trong thư mục avatar)
  current:2,              // giai đoạn hiện tại: 1 tìm hiểu, 2 người yêu, 3 vợ chồng, 4 có con, 5 về già
  start:{2026-08-30},               // ngày bắt đầu từng giai đoạn, vd {2:'2024-02-14'}; bỏ trống = lấy ngày của ảnh đầu tiên
  events:[]               // ngày đặc biệt lặp mỗi năm, vd [{n:'Sinh nhật em',d:'2000-05-20'}]
};
