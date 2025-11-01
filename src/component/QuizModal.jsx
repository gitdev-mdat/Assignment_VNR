import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * QuizModal (with full QUESTIONS converted)
 * - immediate feedback: correct -> green, wrong -> red (and show correct)
 * - Next enabled only after an answer is selected (revealed)
 * - Props: visible, onClose, questions (overrides default)
 */

const QUESTIONS = [
  {
    id: 1,
    q: "Sau ngày 30-4-1975, Đảng Cộng sản Việt Nam đã lãnh đạo đất nước bước vào giai đoạn nào?",
    choices: [
      "Thống nhất Tổ quốc và toàn dân đi lên chủ nghĩa xã hội",
      "Tiếp tục kháng chiến chống Mỹ cứu nước",
      "Xây dựng chủ nghĩa cộng sản hoàn chỉnh",
      "Phục hồi kinh tế sau chiến tranh thế giới",
    ],
    answerIndex: 0,
  },
  {
    id: 2,
    q: "Đại hội đại biểu toàn quốc lần thứ IV của Đảng diễn ra vào tháng năm nào?",
    choices: ["Tháng 12-1976", "Tháng 9-1975", "Tháng 3-1982", "Tháng 12-1986"],
    answerIndex: 0,
  },
  {
    id: 3,
    q: "Tại Đại hội IV, Đảng đã đổi tên từ Đảng Lao động Việt Nam thành gì?",
    choices: [
      "Đảng Cộng sản Việt Nam",
      "Đảng Nhân dân Việt Nam",
      "Đảng Xã hội Việt Nam",
      "Đảng Cách mạng Việt Nam",
    ],
    answerIndex: 0,
  },
  {
    id: 4,
    q: "Đồng chí nào trình bày Báo cáo chính trị tại Đại hội IV?",
    choices: ["Lê Duẩn", "Trường Chinh", "Nguyễn Văn Linh", "Phạm Văn Đồng"],
    answerIndex: 0,
  },
  {
    id: 5,
    q: "Mục tiêu chiến lược được Đại hội IV xác định là xây dựng một nước Việt Nam như thế nào?",
    choices: [
      "Hòa bình, thống nhất, độc lập, dân chủ và giàu mạnh",
      "Công nghiệp hóa hoàn toàn trong 5 năm",
      "Liên minh với các nước tư bản",
      "Tập trung vào nông nghiệp tự cấp tự túc",
    ],
    answerIndex: 0,
  },
  {
    id: 6,
    q: "Kế hoạch Nhà nước 5 năm lần thứ hai (1976-1980) tập trung vào nhiệm vụ trung tâm nào?",
    choices: [
      "Công nghiệp hóa xã hội chủ nghĩa",
      "Xây dựng quân đội hiện đại",
      "Phát triển du lịch quốc tế",
      "Cải cách giáo dục phổ thông",
    ],
    answerIndex: 0,
  },
  {
    id: 7,
    q: "Trong xây dựng chủ nghĩa xã hội giai đoạn 1975-1981, Đảng ưu tiên phát triển ngành kinh tế nào?",
    choices: [
      "Công nghiệp nặng",
      "Công nghiệp nhẹ",
      "Nông nghiệp hữu cơ",
      "Dịch vụ tài chính",
    ],
    answerIndex: 0,
  },
  {
    id: 8,
    q: "Đảng lãnh đạo cải tạo xã hội chủ nghĩa ở miền Nam đối với các hình thức kinh tế nào?",
    choices: [
      "Tư bản tư nhân, công nghiệp nhỏ, thương nghiệp cá thể",
      "Kinh tế nhà nước tập trung",
      "Kinh tế hợp tác xã miền Bắc",
      "Kinh tế thị trường tự do",
    ],
    answerIndex: 0,
  },
  {
    id: 9,
    q: "Nguyên tắc phân phối trong chủ nghĩa xã hội theo Đại hội IV là gì?",
    choices: [
      "Làm theo năng lực, hưởng theo lao động",
      "Hưởng theo nhu cầu cá nhân",
      "Phân phối bình quân",
      "Hưởng theo địa vị xã hội",
    ],
    answerIndex: 0,
  },
  {
    id: 10,
    q: "Cơ chế quản lý kinh tế giai đoạn 1975-1981 được Đảng áp dụng là gì?",
    choices: [
      "Tập trung dân chủ, kế hoạch hóa nhà nước",
      "Thị trường tự do",
      "Hợp tác quốc tế",
      "Phân quyền địa phương hoàn toàn",
    ],
    answerIndex: 0,
  },
  {
    id: 11,
    q: "Thách thức lớn nhất trong xây dựng chủ nghĩa xã hội 1975-1981 là gì?",
    choices: [
      "Cơ chế quan liêu bao cấp dẫn đến đình trệ",
      "Thiếu nguồn lực con người",
      "Ảnh hưởng của chiến tranh thế giới",
      "Thiếu hợp tác quốc tế",
    ],
    answerIndex: 0,
  },
  {
    id: 12,
    q: "Đảng lãnh đạo bảo vệ Tổ quốc trong sự kiện nào vào tháng 2-1979?",
    choices: [
      "Chiến tranh biên giới phía Bắc với Trung Quốc",
      "Chiến tranh biên giới Tây Nam với Campuchia",
      "Kháng chiến chống Pháp",
      "Chiến dịch Hồ Chí Minh",
    ],
    answerIndex: 0,
  },
  {
    id: 13,
    q: "Quân tình nguyện Việt Nam phối hợp lật đổ chế độ Pol Pot ở Campuchia vào tháng năm nào?",
    choices: ["Tháng 12-1978", "Tháng 4-1975", "Tháng 3-1982", "Tháng 12-1986"],
    answerIndex: 0,
  },
  {
    id: 14,
    q: 'Đảng lãnh đạo xây dựng "con người xã hội chủ nghĩa mới" thuộc lĩnh vực nào?',
    choices: ["Văn hóa - xã hội", "Kinh tế", "Quốc phòng", "Ngoại giao"],
    answerIndex: 0,
  },
  {
    id: 15,
    q: "Hội nghị Hiệp thương chính trị thống nhất hai miền diễn ra vào tháng năm nào?",
    choices: ["Tháng 11-1975", "Tháng 12-1976", "Tháng 3-1982", "Tháng 8-1983"],
    answerIndex: 0,
  },
  {
    id: 16,
    q: "Cuộc tổng tuyển cử bầu Quốc hội thống nhất diễn ra ngày nào?",
    choices: ["25-4-1976", "30-4-1975", "20-12-1976", "27-3-1982"],
    answerIndex: 0,
  },
  {
    id: 17,
    q: "Nước ta được đổi tên thành Cộng hòa Xã hội chủ nghĩa Việt Nam tại kỳ họp nào?",
    choices: [
      "Kỳ họp thứ nhất Quốc hội khóa VI (24-6 đến 3-7-1976)",
      "Đại hội IV",
      "Đại hội V",
      "Hội nghị Trung ương 8",
    ],
    answerIndex: 0,
  },
  {
    id: 18,
    q: "Đồng chí nào được bầu làm Chủ tịch nước tại Quốc hội thống nhất?",
    choices: ["Tôn Đức Thắng", "Lê Duẩn", "Trường Chinh", "Phạm Văn Đồng"],
    answerIndex: 0,
  },
  {
    id: 19,
    q: "Đảng lãnh đạo thống nhất các tổ chức quần chúng như Mặt trận Tổ quốc Việt Nam vào giai đoạn nào?",
    choices: ["1975-1981", "1982-1986", "1930-1945", "1945-1954"],
    answerIndex: 0,
  },
  {
    id: 20,
    q: "Theo giáo trình, điều kiện quốc tế giai đoạn 1975-1981 có những gì?",
    choices: [
      "Thuận lợi từ phong trào cộng sản quốc tế nhưng bị bao vây cấm vận",
      "Hỗ trợ hoàn toàn từ Mỹ",
      "Không có thách thức",
      "Tập trung vào châu Âu",
    ],
    answerIndex: 0,
  },
  {
    id: 21,
    q: "Đại hội đại biểu toàn quốc lần thứ V của Đảng diễn ra vào tháng năm nào?",
    choices: [
      "Tháng 3-1982",
      "Tháng 12-1976",
      "Tháng 12-1986",
      "Tháng 10-1982",
    ],
    answerIndex: 0,
  },
  {
    id: 22,
    q: "Tại Đại hội V, Đảng tổng kết việc thực hiện Nghị quyết của Đại hội nào?",
    choices: ["Đại hội IV", "Đại hội III", "Đại hội VI", "Đại hội II"],
    answerIndex: 0,
  },
  {
    id: 23,
    q: "Đại hội V nhận định rằng sau 6 năm giải phóng miền Nam, cách mạng Việt Nam đạt được gì?",
    choices: [
      "Những thành tựu to lớn nhưng gặp nhiều khó khăn",
      "Hoàn toàn thất bại",
      "Không có thay đổi",
      "Chỉ thành công về quân sự",
    ],
    answerIndex: 0,
  },
  {
    id: 24,
    q: "Nhiệm vụ cơ bản được Đại hội V xác định là gì?",
    choices: [
      "Xây dựng và bảo vệ Tổ quốc xã hội chủ nghĩa, từng bước công nghiệp hóa",
      "Tiếp tục kháng chiến",
      "Xây dựng kinh tế thị trường tự do",
      "Tập trung vào giáo dục",
    ],
    answerIndex: 0,
  },
  {
    id: 25,
    q: "Đại hội V ưu tiên phát triển kinh tế theo hướng nào?",
    choices: [
      "Nông nghiệp và công nghiệp nhẹ",
      "Công nghiệp nặng",
      "Dịch vụ",
      "Khai thác mỏ",
    ],
    answerIndex: 0,
  },
  {
    id: 26,
    q: "Đảng cải tiến quản lý kinh tế tại Đại hội V bằng cách nào?",
    choices: [
      "Tăng cường tính chủ động",
      "Tập trung hoàn toàn vào trung ương",
      "Bỏ kế hoạch hóa",
      "Chuyển sang tư nhân hóa",
    ],
    answerIndex: 0,
  },
  {
    id: 27,
    q: "Ban Chấp hành Trung ương Đảng khóa V có bao nhiêu ủy viên chính thức?",
    choices: ["124", "101", "173", "32"],
    answerIndex: 0,
  },
  {
    id: 28,
    q: "Đồng chí nào được bầu làm Tổng Bí thư tại Đại hội V?",
    choices: ["Lê Duẩn", "Nguyễn Văn Linh", "Trường Chinh", "Phạm Hùng"],
    answerIndex: 0,
  },
  {
    id: 29,
    q: "Kế hoạch Nhà nước 5 năm lần thứ ba là giai đoạn nào?",
    choices: ["1981-1985", "1976-1980", "1986-1990", "1975-1979"],
    answerIndex: 0,
  },
  {
    id: 30,
    q: "Nghị quyết về cải tiến công tác kế hoạch hóa được ban hành tháng năm nào?",
    choices: ["Tháng 10-1982", "Tháng 8-1983", "Tháng 12-1976", "Tháng 3-1982"],
    answerIndex: 0,
  },
  {
    id: 31,
    q: "Hội nghị Trung ương lần thứ 6 (khóa V) ban hành các giải pháp cấp bách về gì?",
    choices: [
      "Cải tiến chính sách giá, lương, tiền; xóa bỏ bao cấp",
      "Xây dựng quốc phòng",
      "Phát triển văn hóa",
      "Thống nhất hai miền",
    ],
    answerIndex: 0,
  },
  {
    id: 32,
    q: "Đảng khuyến khích sản xuất hàng hóa và phát triển kinh tế nhiều thành phần vào giai đoạn nào?",
    choices: ["1982-1986", "1975-1981", "1930-1945", "1945-1954"],
    answerIndex: 0,
  },
  {
    id: 33,
    q: "Thách thức kinh tế giai đoạn 1982-1986 là gì?",
    choices: [
      "Đình trệ kéo dài, lạm phát cao năm 1985",
      "Thiếu lao động",
      "Xuất khẩu dư thừa",
      "Không có thách thức",
    ],
    answerIndex: 0,
  },
  {
    id: 34,
    q: "Đại hội VI (1986) được coi là điểm mốc cho gì?",
    choices: [
      "Công cuộc đổi mới toàn diện",
      "Tiếp tục cơ chế cũ",
      "Xây dựng công nghiệp nặng",
      "Thống nhất Đảng",
    ],
    answerIndex: 0,
  },
  {
    id: 35,
    q: "Tại Đại hội VI, Đảng quyết định chuyển nền kinh tế từ gì sang gì?",
    choices: [
      "Kế hoạch hóa tập trung quan liêu bao cấp sang kinh tế hàng hóa nhiều thành phần",
      "Thị trường tự do sang kế hoạch hóa",
      "Nông nghiệp sang công nghiệp",
      "Tư bản sang cộng sản",
    ],
    answerIndex: 0,
  },
  {
    id: 36,
    q: "Đại hội VI thực hiện cải cách nào?",
    choices: ["Giá, lương, tiền", "Chỉ giá", "Chỉ lương", "Chỉ tiền"],
    answerIndex: 0,
  },
  {
    id: 37,
    q: "Ban Chấp hành Trung ương Đảng khóa VI có bao nhiêu ủy viên chính thức?",
    choices: ["173", "124", "101", "49"],
    answerIndex: 0,
  },
  {
    id: 38,
    q: "Đồng chí nào được bầu làm Tổng Bí thư tại Đại hội VI?",
    choices: ["Nguyễn Văn Linh", "Lê Duẩn", "Trường Chinh", "Phạm Văn Đồng"],
    answerIndex: 0,
  },
  {
    id: 39,
    q: "Từ năm 1986, Đảng đẩy mạnh công cuộc đổi mới với các bước đột phá nào?",
    choices: [
      "Cải cách giá, lương, tiền; hình thành cơ chế thị trường",
      "Xây dựng công nghiệp nặng",
      "Tập trung vào quốc phòng",
      "Thống nhất văn hóa",
    ],
    answerIndex: 0,
  },
  {
    id: 40,
    q: "Những chuyển biến tích cực sau Đại hội VI xuất hiện ở đâu?",
    choices: [
      "Sản xuất và đời sống nhân dân",
      "Chỉ sản xuất",
      "Chỉ đời sống",
      "Không có chuyển biến",
    ],
    answerIndex: 0,
  },
  {
    id: 41,
    q: "Theo giáo trình, ba cuộc cách mạng đồng thời được Đại hội IV nêu là gì?",
    choices: [
      "Quan hệ sản xuất, khoa học-kỹ thuật, tư tưởng-văn hóa",
      "Kinh tế, chính trị, xã hội",
      "Quân sự, ngoại giao, nội vụ",
      "Nông nghiệp, công nghiệp, dịch vụ",
    ],
    answerIndex: 0,
  },
  {
    id: 42,
    q: "Đặc trưng của chủ nghĩa xã hội theo Đại hội IV có bao nhiêu?",
    choices: ["Bốn", "Ba", "Năm", "Hai"],
    answerIndex: 0,
  },
  {
    id: 43,
    q: "Hậu quả chiến tranh được giáo trình đề cập bao gồm bao nhiêu tấn bom?",
    choices: ["7,85 triệu tấn", "5 triệu tấn", "10 triệu tấn", "2 triệu tấn"],
    answerIndex: 0,
  },
  {
    id: 44,
    q: "Đảng lãnh đạo đoàn kết quốc tế với nước nào trong giai đoạn 1975-1981?",
    choices: ["Lào, Liên Xô, Campuchia", "Mỹ, Pháp", "Chỉ Lào", "Chỉ Liên Xô"],
    answerIndex: 0,
  },
  {
    id: 45,
    q: "Văn kiện Đảng Toàn tập, tập 37, trang 988 được trích dẫn về gì?",
    choices: ["Hậu quả chiến tranh", "Đại hội IV", "Đại hội V", "Đổi mới"],
    answerIndex: 0,
  },
  {
    id: 46,
    q: "Đại hội V nhấn mạnh đổi mới tư duy về gì?",
    choices: [
      "Chủ nghĩa xã hội",
      "Chủ nghĩa tư bản",
      "Chiến tranh",
      "Giáo dục",
    ],
    answerIndex: 0,
  },
  {
    id: 47,
    q: "Cuộc khủng hoảng toàn diện mà đất nước đối mặt trước Đại hội VI là gì?",
    choices: ["Kinh tế - xã hội", "Chỉ kinh tế", "Chỉ xã hội", "Quân sự"],
    answerIndex: 0,
  },
  {
    id: 48,
    q: "Định hướng của kinh tế hàng hóa nhiều thành phần tại Đại hội VI là gì?",
    choices: ["Xã hội chủ nghĩa", "Tư bản chủ nghĩa", "Trung lập", "Hỗn hợp"],
    answerIndex: 0,
  },
  {
    id: 49,
    q: "Số ủy viên Bộ Chính trị khóa V là bao nhiêu?",
    choices: ["13", "14", "173", "101"],
    answerIndex: 0,
  },
  {
    id: 50,
    q: "Giáo trình nhấn mạnh vai trò lãnh đạo của Đảng trong giai đoạn 1975-1986 là gì?",
    choices: [
      "Xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc",
      "Chỉ xây dựng kinh tế",
      "Chỉ bảo vệ biên giới",
      "Thống nhất Đảng",
    ],
    answerIndex: 0,
  },

  // --- if you want more questions from the block, append similarly ---
];

/**
 * QuizModal
 * Props:
 * - visible (bool)
 * - onClose (func)
 * - questions (array)
 *
 * This component injects a small scoped CSS when mounted so
 * the modal looks correct in both light/dark modes and scrollbar is visible.
 */
/* ======= QuizModal component ======= */
export default function QuizModal({ visible, onClose, questions }) {
  // use provided questions when available, otherwise fallback to default bank
  const QUIZ =
    Array.isArray(questions) && questions.length ? questions : QUESTIONS;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIndex(0);
      setAnswers({});
      setRevealed({});
      setShowResult(false);
    }
  }, [visible]);

  // inject scoped CSS for modal once (keeps darkmode + scrollbar + button styles)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "quiz-modal-styles";
    if (document.getElementById(id)) return;

    const css = `
      /* base backdrop/card */
      .quiz-modal-backdrop { position: fixed; inset: 0; z-index: 9999; display:flex; align-items:center; justify-content:center; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
      .qm-overlay{ position:absolute; inset:0; background: rgba(2,6,23,0.6); backdrop-filter: blur(2px); }
      .quiz-modal-card { position: relative; width:800px; max-width:94vw; border-radius:12px; overflow:hidden; box-shadow:0 12px 40px rgba(2,6,23,0.4); background:var(--panel-bg, white); color:var(--text-on-dark,#07102a); z-index:10000; border:1px solid rgba(2,6,23,0.06); }
      .quiz-modal-header{ display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.04); background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0)); }
      .quiz-modal-header .meta { font-size:12px; color: var(--muted, #6b7280); }
      .quiz-modal-body{ padding:16px; }
      .quiz-question{ margin-bottom:12px; font-weight:600; }
      .quiz-choices{ display:flex; flex-direction:column; gap:8px; }

      /* choice */
      .quiz-choice{ text-align:left; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:var(--surface,#fff); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: transform 120ms ease, box-shadow 120ms ease; }
      .quiz-choice:active{ transform: translateY(1px); }
      .quiz-choice.correct{ background: linear-gradient(180deg, rgba(220,252,231,1), rgba(236,253,245,1)); border:2px solid #10b981; color:#065f46; }
      .quiz-choice.wrong{ background: linear-gradient(180deg, rgba(255,241,242,1), rgba(255,239,241,1)); border:2px solid #ef4444; color:#7f1d1d; }
      .quiz-choice.dim{ opacity:0.96; }

      /* buttons */
      .quiz-btn { padding:8px 12px; border-radius:8px; font-weight:700; border:none; cursor:pointer; min-width:72px; display:inline-flex; align-items:center; justify-content:center; }
      .quiz-btn.ghost { background: var(--surface, #fff); border:1px solid rgba(0,0,0,0.06); color: inherit; }
      .quiz-btn.primary { background: linear-gradient(90deg, var(--accent-from,#4f46e5), var(--accent-to,#a78bfa)); color: white; box-shadow: 0 6px 20px rgba(79,70,229,0.18); }

      /* results area scrollbar + styles */
      .quiz-results{ max-height:260px; overflow-y:auto; padding-right:8px; }
      .quiz-results::-webkit-scrollbar{ width:12px; height:12px; }
      .quiz-results::-webkit-scrollbar-track{ background: transparent; }
      .quiz-results::-webkit-scrollbar-thumb{ background: linear-gradient(180deg, var(--accent-from,#ffd966), var(--accent-to,#ff8a4b)); border-radius:10px; border:3px solid transparent; background-clip: padding-box; }
      .quiz-results { scrollbar-width: thin; scrollbar-color: var(--accent-from,#ffd966) transparent; }

      /* small layout tweaks */
      .quiz-choice .bullet { min-width:28px; height:28px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-weight:700; border:1px solid rgba(0,0,0,0.06); background: var(--choice-bg,#fff); margin-right:10px; }

      /* dark adjustments */
      @media (prefers-color-scheme: dark) {
        .quiz-modal-card { background: linear-gradient(180deg,#071428,#0b2740); color:#f8fafc; border:1px solid rgba(255,255,255,0.04); }
        .quiz-modal-header { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .quiz-choice { border: 1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.02); color: var(--text-on-dark,#f8fafc); }
        .quiz-choice .bullet { border-color: rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); }
        .quiz-btn.ghost { background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); color: var(--text-on-dark,#f8fafc); }
        .quiz-btn.primary { box-shadow: 0 8px 30px rgba(79,70,229,0.12); }
        .quiz-results::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--accent-from,#ffd966), var(--accent-to,#ff8a4b)); }
      }
    `.trim();

    const node = document.createElement("style");
    node.id = id;
    node.appendChild(document.createTextNode(css));
    document.head.appendChild(node);
  }, []);

  if (!visible) return null;

  const q = QUIZ[index];

  const select = (choiceIdx) => {
    if (!q) return;
    if (revealed[q.id]) return;
    setAnswers((prev) => ({ ...prev, [q.id]: choiceIdx }));
    setRevealed((prev) => ({ ...prev, [q.id]: true }));
  };

  const canGoNext = Boolean(revealed[q?.id]);
  const next = () => {
    if (!q) return;
    if (!canGoNext) return;
    if (index < QUIZ.length - 1) setIndex((s) => s + 1);
    else setShowResult(true);
  };
  const prev = () => {
    if (index > 0) setIndex((s) => s - 1);
  };

  const score = Object.keys(answers).reduce((acc, k) => {
    const qObj = QUIZ.find((x) => String(x.id) === String(k));
    if (!qObj) return acc;
    return acc + (answers[k] === qObj.answerIndex ? 1 : 0);
  }, 0);

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setRevealed({});
    setShowResult(false);
  };

  const renderChoice = (qq, i) => {
    const isRevealed = Boolean(revealed[qq.id]);
    const selectedIdx = answers[qq.id];
    const isSelected = selectedIdx === i;
    const isCorrect = qq.answerIndex === i;

    let className = "quiz-choice";
    if (isRevealed) {
      if (isCorrect) className += " correct";
      else if (isSelected && !isCorrect) className += " wrong";
      else className += " dim";
    }

    return (
      <button
        key={i}
        className={className}
        onClick={() => select(i)}
        disabled={Boolean(revealed[qq.id])}
        aria-pressed={isSelected}
        type="button"
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            className="bullet"
            style={{
              background: isSelected ? "rgba(238,242,255,0.9)" : undefined,
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
          <div style={{ maxWidth: "calc(100% - 40px)" }}>{qq.choices[i]}</div>
        </div>
        <div style={{ marginLeft: 8, width: 22, textAlign: "center" }}>
          {isRevealed && isCorrect && "✅"}
          {isRevealed && isSelected && !isCorrect && "❌"}
        </div>
      </button>
    );
  };

  return (
    <div className="quiz-modal-backdrop" role="dialog" aria-modal="true">
      <div className="qm-overlay" onClick={onClose} />
      <div className="quiz-modal-card" role="document" aria-label="Quiz nhanh">
        <div className="quiz-modal-header">
          <div>
            <div style={{ fontWeight: 700 }}>Quiz nhanh</div>
            <div className="meta">
              {showResult ? `Kết quả` : `${index + 1} / ${QUIZ.length}`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={onClose}
              aria-label="Đóng"
              style={{
                background: "transparent",
                border: "none",
                padding: 6,
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="quiz-modal-body">
          {!showResult ? (
            <>
              <div className="quiz-question">{q?.q}</div>
              <div className="quiz-choices">
                {(q?.choices || []).map((_, i) => renderChoice(q, i))}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="quiz-btn ghost"
                  style={{
                    opacity: index === 0 ? 0.6 : 1,
                    cursor: index === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Trước
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={restart} className="quiz-btn ghost">
                    Làm lại
                  </button>
                  <button
                    onClick={next}
                    disabled={!canGoNext}
                    className="quiz-btn primary"
                    style={{ opacity: canGoNext ? 1 : 0.7 }}
                  >
                    {index < QUIZ.length - 1 ? "Tiếp →" : "Hoàn tất"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Kết quả
              </div>
              <div style={{ color: "var(--muted,#374151)", marginBottom: 12 }}>
                Bạn đúng <strong>{score}</strong> / {QUIZ.length}
              </div>

              <div className="quiz-results">
                {QUIZ.map((qq, qi) => {
                  const sel = answers[qq.id];
                  const correct = qq.answerIndex;
                  return (
                    <div key={qq.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600 }}>
                        {qi + 1}. {qq.q}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {qq.choices.map((c, ii) => {
                          const chosen = sel === ii;
                          const corr = correct === ii;
                          const bg = corr
                            ? "linear-gradient(180deg,#ecfdf5,#dcfce7)"
                            : chosen
                            ? "linear-gradient(180deg,#fff1f2,#fff1f2)"
                            : "transparent";
                          const color = corr
                            ? "#065f46"
                            : chosen
                            ? "#7f1d1d"
                            : undefined;
                          return (
                            <div
                              key={ii}
                              style={{
                                padding: "6px 8px",
                                borderRadius: 8,
                                border: "1px solid rgba(0,0,0,0.06)",
                                background: bg,
                                color,
                              }}
                            >
                              <strong style={{ marginRight: 6 }}>
                                {String.fromCharCode(65 + ii)}.
                              </strong>
                              {c} {corr && " ✅"}{" "}
                              {chosen && !corr && " (Bạn chọn) ❌"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button onClick={restart} className="quiz-btn ghost">
                  Làm lại
                </button>
                <button onClick={onClose} className="quiz-btn primary">
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
