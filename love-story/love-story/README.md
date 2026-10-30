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
├── 1_tim_hieu/   (images/, videos/)
├── 2_nguoi_yeu/  (images/, videos/)
├── 3_vo_chong/   (images/, videos/)
├── 4_co_con/     (images/, videos/)
├── 5_ve_gia/     (images/, videos/)
└── 6_avatar/     MTrieu.jpg, TGiang.jpg
```

- Tên file là `yyyyMMdd`, vd `20240214.jpg`. Thêm chữ sau ngày để làm chú thích: `20240214_Valentine đầu tiên.jpg`.
- Thư mục avatar có tên chứa chữ "ava"; ảnh đặt tên theo `a` và `b` trong `js/config.js`.
- Thêm kỷ niệm: bỏ file vào đúng thư mục trên Drive, rồi bấm "Cập nhật" trong app.

## Thiết lập một lần

1. Google Cloud Console: tạo project, bật **Google Drive API**, tạo **API key**. Giới hạn key: HTTP referrers `https://TENBAN.github.io/*` (thêm `http://localhost:8000/*` nếu chạy ở máy) và chỉ cho phép Google Drive API.
2. Trên Drive, chia sẻ thư mục MTTG ở chế độ "Anyone with the link: Viewer". ID thư mục là đoạn sau `/folders/` trong link.
3. Sửa `js/config.js`: `current`, `start`, `events`.

## Chạy ở máy

```
cp js/env.example.js js/env.js     # rồi điền key và root
python3 -m http.server 8000        # mở http://localhost:8000
```

## Deploy lên GitHub Pages

1. Đẩy code lên nhánh `main`: `git init`, `git add .`, `git commit -m "init"`, `git remote add origin ...`, `git push -u origin main`.
2. Settings → Secrets and variables → Actions → New repository secret: `DRIVE_API_KEY` và `DRIVE_ROOT_ID`.
3. Settings → Pages → Source: **GitHub Actions**. Mỗi lần push, workflow tự tạo `js/env.js` từ Secrets rồi deploy.

Cách đơn giản hơn: xoá dòng `js/env.js` trong `.gitignore`, điền key vào `js/env.js`, commit, rồi chọn Pages → Deploy from a branch.

## Lưu ý

- Key vẫn nằm trong JS mà trình duyệt tải về, nên bắt buộc giới hạn key theo domain.
- Thư mục chia sẻ dạng link: ai có link đều xem được ảnh.
