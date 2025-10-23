# 🌏 VNR Globe Tour – Trang học lịch sử Việt Nam tương tác

> “Globe 3D + Rồng dẫn chuyện + Modal từng cột mốc” — mượt, gọn, dễ mở rộng.  
> Stack: **React**, **Vite**, **globe.gl (three.js)**, **CSS Modules**, **lucide-react**

---

## 🚀 Project Setup & Usage

### 1️⃣ Cài đặt và chạy dự án (local)

**Bước 1.** Clone repo về máy:

```bash
git clone https://github.com/<your-username>/VNR-GlobeTour.git
cd VNR-GlobeTour

npm install

npm run dev
🔗 Deployed Web URL

✍️ (Điền sau khi deploy bằng Vercel / Netlify / GitHub Pages)
Demo: https://vnr-globetour.vercel.app/

💻 Project Introduction
🔍 Tổng quan

Đây là trang web học lịch sử Việt Nam tương tác – nơi người học khám phá từng cột mốc lịch sử qua bản đồ 3D và Rồng dẫn chuyện sinh động.

🔥 Điểm nhấn

🌍 Quả địa cầu 3D (globe.gl) hiển thị sự kiện theo vị trí địa lý.

🐉 Rồng dẫn chuyện với hiệu ứng gõ chữ (typing animation).

🪟 Event Modal hiển thị chi tiết từng mốc (ảnh, mô tả, facts).

💡 Giao diện mượt mà – nhẹ – thân thiện, phù hợp desktop và mobile.

🎯 Mục tiêu

Giúp người học dễ hiểu – dễ nhớ mốc lịch sử qua hình ảnh và tương tác.

Mô phỏng trải nghiệm “du lịch qua các sự kiện lịch sử”.

Có thể mở rộng thành tour lịch sử toàn quốc.

🧭 Các chức năng chính
🗺️ Earth (Globe + Markers)

Hiển thị quả địa cầu và tự động xoay đến Việt Nam.

Khi click marker:

Camera bay đến vị trí sự kiện.

Rồng đọc lời dẫn (narration).

Sau 2 giây → mở Event Modal chi tiết.

🐉 Dragon (Rồng dẫn chuyện)

Hiệu ứng typing từng chữ.

Hỗ trợ đọc playlist nhiều câu.

Có callback sau khi đọc xong → mở modal tự động.

Tuỳ chỉnh tốc độ, delay, và hiệu ứng “Sẵn sàng”.

🪟 Event Modal (Chi tiết sự kiện)

Header: tiêu đề, năm, địa điểm, nút Copy link.

Body: ảnh minh họa, mô tả, và phần “Did you know?”.

Sidebar: danh sách năm, click để chuyển mốc khác.

Tự động reveal nội dung từng bullet (animation mượt).

Đóng modal → Rồng tiếp tục dẫn sang sự kiện kế tiếp.

🎛️ TourControls

Thanh điều khiển có Play / Pause / Next / Prev / Progress bar.

Có thể mở rộng thêm mini timeline hoặc animation đường đi.

✨ Điểm đặc biệt

✅ Trình bày một mốc/lần giúp người xem tập trung.
✅ Hiệu ứng chuyển cảnh tự nhiên, không giật.
✅ Delay hợp lý giữa Rồng → Modal tạo cảm giác kể chuyện.
✅ Animation mượt, phù hợp cả trên laptop và mobile.
✅ Dễ mở rộng thêm dữ liệu hoặc thời kỳ mới.

🧠 Hướng phát triển tương lai

🔊 Thêm âm thanh, nhạc nền, hoặc giọng đọc tự nhiên (TTS).

🕰️ Mở rộng bản đồ sang các thời kỳ khác của lịch sử Việt Nam.

🧭 Thêm lọc mốc sự kiện theo vùng / thời kỳ / chủ đề.

🕹️ Tích hợp mini-game hoặc quiz để củng cố kiến thức.

📱 Tối ưu hiển thị trên điện thoại và tablet.

🧩 Công nghệ sử dụng
Thành phần	Công nghệ
Frontend	React (Vite)
3D Globe	globe.gl (Three.js)
UI & Icons	CSS Modules, lucide-react
Animation	Framer Motion, CSS transition
Triển khai	Vercel / Netlify
Dữ liệu	JSON tĩnh (local)
✅ Checklist cho người kiểm thử
Mục kiểm tra	Trạng thái
Chạy npm run dev không lỗi	✅
Globe hiển thị đúng, xoay đến Việt Nam	✅
Dragon dẫn intro, delay mở modal đúng	✅
EventModal hiển thị chi tiết mốc	✅
Nút Copy link hoạt động	✅
Animation mượt, không lag	✅
README đầy đủ & rõ ràng	✅
❓ FAQ – Hướng dẫn nhanh
🧭 Xem sự kiện

→ Bấm “Sẵn sàng” để Rồng dẫn, sau đó click vào marker để mở modal.

📜 Chuyển sang mốc khác

→ Click năm ở thanh bên hoặc dùng nút Next/Prev.

🐉 Rồng nói thêm hoặc khác

→ Thêm nội dung trong content/tour.control.js.

🎥 Muốn thêm ảnh hoặc video

→ Thêm trường image hoặc videoUrl vào mỗi sự kiện trong hanoiEvents.js.

📩 Liên hệ tác giả

👤 Nguyễn Minh Đạt – FPT University
📧 dattmse170508@fpt.edu.vn
