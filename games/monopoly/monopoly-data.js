/**
 * MODULE 1: DỮ LIỆU & CẤU HÌNH (DATA)
 * Chứa bản đồ 24 ô, ngân hàng sự kiện, và tham số game.
 */

window.MonopolyData = {
    CONFIG: {
        START_MONEY: 10000,
        PASS_GO_REWARD: 2000, // Qua cổng trường
        LAND_ON_GO_REWARD: 3000, // Đậu vào cổng trường
        BAIL_COST: 1000, // Phí bảo lãnh ra tù
        TAX_AMOUNT: 2000, // Thuế GTGT
        TUITION_FEE_PERCENT: 0.1, // Học phí 10%
        MAX_GAME_TIME: 20 * 60, // 20 phút (tính bằng giây)
    },

    // 4 Giai đoạn nhịp độ (Pacing)
    PHASES: [
        { name: "KHỞI ĐỘNG", endAt: 5 * 60, multiplier: 1.0, desc: "Bình yên trước giông bão. Mua đất đi!", maxLevel: 2 },
        { name: "TĂNG TỐC", endAt: 12 * 60, multiplier: 1.5, desc: "Vật giá leo thang. Mở khóa nhà cấp 3.", maxLevel: 3 },
        { name: "HỖN MANG", endAt: 18 * 60, multiplier: 2.5, desc: "Mùa thi cử. Nợ môn lãi suất cao!", maxLevel: 3, debtMode: true },
        { name: "SUDDEN DEATH", endAt: 20 * 60, multiplier: 5.0, desc: "Bảo vệ đồ án. Chạm là chết.", maxLevel: 3, moveCost: 30 }
    ],

    // Bản đồ 24 ô (Theo chiều kim đồng hồ)
    // Types: START, LAND, CHANCE (Cơ hội), LUCK (Khí vận), JAIL (Tù), CORNER (Góc), TAX
    MAP: [
        { id: 0, name: "CỔNG TRƯỜNG", type: "START", color: "bg-emerald-600", icon: "school" },
        { id: 1, name: "Bãi Xe Đạp", type: "LAND", group: "gray", price: 600, baseRent: 100, color: "bg-slate-500" },
        { id: 2, name: "Trà Đá Vỉa Hè", type: "LAND", group: "gray", price: 800, baseRent: 150, color: "bg-slate-500" },
        { id: 3, name: "CƠ HỘI", type: "CHANCE", color: "bg-amber-500", icon: "help-circle" },
        { id: 4, name: "Quán Cơm Bụi", type: "LAND", group: "green", price: 1200, baseRent: 300, color: "bg-green-500" },
        { id: 5, name: "Tiệm Photo", type: "LAND", group: "green", price: 1400, baseRent: 350, color: "bg-green-500" },
        { id: 6, name: "PHÒNG ĐÀO TẠO", type: "CORNER", action: "tuition", color: "bg-rose-900", icon: "landmark", desc: "Nộp 10% học phí" },
        { id: 7, name: "Thư Viện", type: "LAND", group: "blue", price: 2000, baseRent: 600, color: "bg-blue-500" },
        { id: 8, name: "Sân Bóng", type: "LAND", group: "blue", price: 2200, baseRent: 700, color: "bg-blue-500" },
        { id: 9, name: "KHÍ VẬN", type: "LUCK", color: "bg-purple-500", icon: "sparkles" },
        { id: 10, name: "Quán Net", type: "LAND", group: "indigo", price: 3000, baseRent: 1000, color: "bg-indigo-500" },
        { id: 11, name: "Trà Sữa Luxury", type: "LAND", group: "indigo", price: 3200, baseRent: 1100, color: "bg-indigo-500" },
        { id: 12, name: "CĂN TIN", type: "CORNER", action: "parking", color: "bg-orange-500", icon: "coffee", desc: "Bãi đậu xe Free" },
        { id: 13, name: "Phòng Gym", type: "LAND", group: "orange", price: 4000, baseRent: 1500, color: "bg-orange-600" },
        { id: 14, name: "Nhà Trọ VIP", type: "LAND", group: "orange", price: 4200, baseRent: 1600, color: "bg-orange-600" },
        { id: 15, name: "CƠ HỘI", type: "CHANCE", color: "bg-amber-500", icon: "help-circle" },
        { id: 16, name: "Phòng Lab", type: "LAND", group: "red", price: 5500, baseRent: 2200, color: "bg-red-500" },
        { id: 17, name: "Hội Trường Lớn", type: "LAND", group: "red", price: 6000, baseRent: 2500, color: "bg-red-500" },
        { id: 18, name: "PHÒNG THI", type: "JAIL", color: "bg-slate-800", icon: "lock", desc: "Mất 2 lượt hoặc $1000" },
        { id: 19, name: "KTX Nữ", type: "LAND", group: "yellow", price: 7500, baseRent: 3500, color: "bg-yellow-500" },
        { id: 20, name: "KTX Nam", type: "LAND", group: "yellow", price: 8000, baseRent: 4000, color: "bg-yellow-500" },
        { id: 21, name: "KHÍ VẬN", type: "LUCK", color: "bg-purple-500", icon: "sparkles" },
        { id: 22, name: "Tòa Nhà Hiệu Bộ", type: "LAND", group: "diamond", price: 10000, baseRent: 6000, color: "bg-cyan-400" },
        { id: 23, name: "Thuế GTGT", type: "TAX", color: "bg-rose-700", icon: "receipt", desc: "Nộp phạt $2000" }
    ],

    // Ngân hàng sự kiện (Flavor Text)
    EVENTS: {
        PVP_TRADE: [
            "Nghe đồn bạn mới chia tay người yêu, mình mua lại đất để bạn đỡ nhớ kỷ niệm xưa nhé! Giá 50%.",
            "Deadline dí quá hả? Bán lại cho mình ô đất này lấy tiền mua Redbull uống đi bạn ơi.",
            "Thấy bạn nghèo quá mình cũng thương. Đưa đây mình giữ hộ miếng đất này cho, bao giờ giàu chuộc lại.",
            "Tin gầm giường: Khu này sắp quy hoạch làm bãi rác. Bán nhanh còn kịp, mình chịu lỗ mua giùm cho."
        ],
        PVP_COMMUNIST: [
            "Mình mới khởi nghiệp bán bánh tráng trộn. Cả lớp ủng hộ nha (Nộp $500/người).",
            "Hôm nay sinh nhật mình (lần thứ 3 trong tháng). Mỗi bạn lì xì một ít lấy may nào!",
            "Quỹ lớp âm rồi các bạn ơi. Lớp trưởng kêu gọi đóng tiền quỹ gấp (tiền chảy vào túi bạn).",
            "Mình lỡ tay làm cháy phòng Lab. Anh em quyên góp chút đỉnh đền bù thiệt hại giúp mình với.",
            "Đi ăn lẩu quên mang ví. Campuchia tiền nha các chiến hữu!"
        ],
        BAD_LUCK: [
            "Đang đi thì gặp người yêu cũ đi với người yêu mới. Ngượng quá chạy lùi 3 bước trốn.",
            "Quên thẻ sinh viên ở nhà xe. Quay lại lấy gấp! (Lùi 3 ô)",
            "Bị chó rượt tụt quần. Chạy bán sống bán chết ngược về sau.",
            "Đi nhầm vào nhà vệ sinh khác giới. Bị bảo vệ đuổi chạy té khói."
        ],
        TO_JAIL: [
            "Giám thị bắt gặp quay cóp tài liệu thu nhỏ trong chai nước. Mời lên phòng hội đồng uống trà.",
            "Điểm danh hộ bạn bị giảng viên phát hiện. Đình chỉ học 2 lượt!",
            "Đánh Lol trong giờ học, combat hét to quá bị thầy gank. Lên bảng đếm số."
        ],
        GOOD_LUCK: [
            "Tự nhiên tìm thấy tờ 500k trong túi áo khoác mùa đông năm ngoái. Giàu to!",
            "Được học bổng khuyến khích học tập (dù toàn ngủ gật). Nhận $1000.",
            "Bán đồ án cũ cho khóa dưới. Kiếm chác được chút đỉnh.",
            "Tham gia đa cấp lừa được đứa bạn thân. Lương về!"
        ]
    }
};