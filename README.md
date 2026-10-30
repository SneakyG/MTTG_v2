# Our Love Story 💕

Web app theo dõi chặng đường yêu nhau của MTrieu và TGiang. Ảnh và clip đọc trực tiếp từ Google Drive, không cần server, chạy trên GitHub Pages.

## Cấu trúc project

```
love-story/
├── index.html                    # khung trang
├── css/style.css                 # giao diện (sáng/tối tự động)
├── js/
│   ├── env.example.js            # mẫu khoá API + ID thư mục (copy thành env.js, không commit)
│   ├── config.js                 # tên, giai đoạn hiện tại, ngày bắt đầu, ngày đặc biệt
│   ├── utils.js                  # hàm tiện ích, hằng số, trạng thái
│   ├── drive.js                  # đọc cây thư mục Google Drive
│   ├── milestones.js             # thời gian bên nhau, mốc sắp tới
│   ├── views.js                  # Trang chủ, Kỷ niệm, Hành trình
│   ├── lightbox.js               # xem ảnh/clip toàn màn hình
│   └── main.js                   # vẽ giao diện, sự kiện, khởi động
├── assets/favicon.svg
├── .github/workflows/deploy.yml  # tự deploy, tạo env.js từ GitHub Secrets
├── .gitignore
└── .nojekyll
```

## Thư mục trên Google Drive

```
MTTG/
├── 1_tim_hieu/
│   ├── images/
│   │   └── 20240214/     ảnh của ngày 14/02/2024, tên file tuỳ ý
│   └── videos/
│       └── 20240214/     clip của ngày đó, tên file tuỳ ý
├── 2_nguoi_yeu/          (cùng cấu trúc)
├── 3_vo_chong/           (cùng cấu trúc)
├── 4_co_con/             (cùng cấu trúc)
├── 5_ve_gia/             (cùng cấu trúc)
└── avatar/               MTrieu.jpg, TGiang.jpg
```

- Thư mục giai đoạn bắt đầu bằng số `1` đến `5`, theo sau là `_` và tên tuỳ chọn (vd `1_tim_hieu`, `2_nguoi_yeu`). Bên trong đặt `images` và/hoặc `videos`; có thể bỏ qua một trong hai nếu không dùng.
- Trong `images` hoặc `videos`, tạo thư mục ngày tên `yyyyMMdd`; file bên trong đặt tên gì cũng được. Thêm chữ sau ngày để làm chú thích: thư mục `20240214_Valentine đầu tiên`. Thư mục ngày cũng có thể nằm trực tiếp trong thư mục giai đoạn.
- Ảnh và clip cùng ngày (ở `images` và `videos`) được gom chung một ngày trong app.
- Avatar dùng quy tắc riêng: tạo thư mục tên `avatar` ngay dưới `MTTG`, đặt ảnh trực tiếp bên trong và đặt tên theo `a` và `b` trong `js/config.js`.
- Thêm kỷ niệm: tạo thư mục ngày trong `images` hoặc `videos`, bỏ file vào, rồi bấm "Cập nhật" trong app.

## Thiết lập một lần

1. Google Cloud Console: tạo project, bật **Google Drive API**, tạo **API key**. Giới hạn key: HTTP referrers `https://TENBAN.github.io/*` (thêm `http://localhost:8000/*` nếu chạy ở máy) và chỉ cho phép Google Drive API.
2. Trên Drive, chia sẻ thư mục MTTG ở chế độ "Anyone with the link: Viewer". ID thư mục là đoạn sau `/folders/` trong link.
3. Sửa `js/config.js`: `current`, `start`, `events`.

## Chạy ở máy

```
cp js/env.example.js js/env.js     # rồi điền key và root
python3/py -m http.server 8000        # mở http://localhost:8000
```

## Deploy lên GitHub Pages

1. Đẩy code lên nhánh `main`: `git init`, `git add .`, `git commit -m "init"`, `git remote add origin ...`, `git push -u origin main`.
2. Settings → Secrets and variables → Actions → New repository secret: `DRIVE_API_KEY` và `DRIVE_ROOT_ID`.
3. Settings → Pages → Source: **GitHub Actions**. Mỗi lần push, workflow tự tạo `js/env.js` từ Secrets rồi deploy.

Cách đơn giản hơn: xoá dòng `js/env.js` trong `.gitignore`, điền key vào `js/env.js`, commit, rồi chọn Pages → Deploy from a branch.

## Lưu ý

- Key vẫn nằm trong JS mà trình duyệt tải về, nên bắt buộc giới hạn key theo domain.
- Thư mục chia sẻ dạng link: ai có link đều xem được ảnh.
