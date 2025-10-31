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

export default function QuizModal({ visible, onClose, questions = QUESTIONS }) {
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

  if (!visible) return null;

  const q = questions[index];

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
    if (index < questions.length - 1) {
      setIndex((s) => s + 1);
    } else {
      setShowResult(true);
    }
  };

  const prev = () => {
    if (index > 0) setIndex((s) => s - 1);
  };

  const score = Object.keys(answers).reduce((acc, k) => {
    const qObj = questions.find((x) => String(x.id) === String(k));
    if (!qObj) return acc;
    return acc + (answers[k] === qObj.answerIndex ? 1 : 0);
  }, 0);

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setRevealed({});
    setShowResult(false);
  };

  const baseChoiceStyle = {
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const correctStyle = {
    background: "#ecfdf5",
    border: "2px solid #10b981",
    color: "#065f46",
  };

  const wrongStyle = {
    background: "#fff1f2",
    border: "2px solid #ef4444",
    color: "#7f1d1d",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 80 }}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2,6,23,0.6)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          maxWidth: "94vw",
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(2,6,23,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>Quiz nhanh</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {showResult ? `Kết quả` : `${index + 1} / ${questions.length}`}
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
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {!showResult ? (
            <>
              <div style={{ marginBottom: 12, fontWeight: 600 }}>{q.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.choices.map((c, i) => {
                  const isRevealed = Boolean(revealed[q.id]);
                  const selectedIdx = answers[q.id];
                  const isSelected = selectedIdx === i;
                  const isCorrect = q.answerIndex === i;

                  let style = { ...baseChoiceStyle };
                  if (isRevealed) {
                    if (isCorrect) style = { ...style, ...correctStyle };
                    else if (isSelected && !isCorrect)
                      style = { ...style, ...wrongStyle };
                    else style = { ...style, opacity: 0.95 };
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => select(i)}
                      disabled={Boolean(revealed[q.id])}
                      style={style}
                      aria-pressed={isSelected}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            border: "1px solid rgba(0,0,0,0.06)",
                            background: isSelected ? "#eef2ff" : "#fff",
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div style={{ maxWidth: "calc(100% - 40px)" }}>{c}</div>
                      </div>
                      <div
                        style={{
                          marginLeft: 8,
                          width: 22,
                          textAlign: "center",
                        }}
                      >
                        {isRevealed && isCorrect && "✅"}
                        {isRevealed && isSelected && !isCorrect && "❌"}
                      </div>
                    </button>
                  );
                })}
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
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                    opacity: index === 0 ? 0.6 : 1,
                  }}
                >
                  ← Trước
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={restart}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                    }}
                  >
                    Làm lại
                  </button>

                  <button
                    onClick={next}
                    disabled={!canGoNext}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: canGoNext ? "#4f46e5" : "#a78bfa88",
                      color: "white",
                      cursor: canGoNext ? "pointer" : "not-allowed",
                    }}
                  >
                    {index < questions.length - 1 ? "Tiếp →" : "Hoàn tất"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Kết quả
              </div>
              <div style={{ color: "#374151", marginBottom: 12 }}>
                Bạn đúng <strong>{score}</strong> / {questions.length}
              </div>

              <div
                style={{ maxHeight: 260, overflowY: "auto", paddingRight: 8 }}
              >
                {questions.map((qq, qi) => {
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
                          const s = {
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            background: corr
                              ? "#ecfdf5"
                              : chosen
                              ? "#fff1f2"
                              : "#fff",
                            color: corr
                              ? "#065f46"
                              : chosen
                              ? "#7f1d1d"
                              : "#111827",
                          };
                          return (
                            <div key={ii} style={s}>
                              <strong style={{ marginRight: 6 }}>
                                {String.fromCharCode(65 + ii)}.
                              </strong>
                              {c}
                              {corr && " ✅"}
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
                <button
                  onClick={restart}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                  }}
                >
                  Làm lại
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#4f46e5",
                    color: "white",
                  }}
                >
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
