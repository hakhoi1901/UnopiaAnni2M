/**
 * MODULE 1: DỮ LIỆU & CẤU HÌNH (DATA)
 * Chứa bản đồ 24 ô, ngân hàng sự kiện, và tham số game.
 */

window.MonopolyData = {
    CONFIG: {
        START_MONEY: 10000,
        PASS_GO_REWARD: 2000,
        LAND_ON_GO_REWARD: 3000,
        BAIL_COST: 1000,
        TAX_AMOUNT: 2000,
        TUITION_FEE_PERCENT: 0.1,
        MAX_GAME_TIME: 20 * 60,
    },

    PHASES: [
        { name: "KHỞI ĐỘNG", endAt: 5 * 60, multiplier: 1.0, desc: "Bình yên. Mua đất đi!", maxLevel: 2 },
        { name: "TĂNG TỐC", endAt: 12 * 60, multiplier: 1.5, desc: "Vật giá leo thang.", maxLevel: 3 },
        { name: "HỖN MANG", endAt: 18 * 60, multiplier: 2.5, desc: "Mùa thi cử. Nợ môn lãi cao!", maxLevel: 3 },
        { name: "SUDDEN DEATH", endAt: 20 * 60, multiplier: 5.0, desc: "Bảo vệ đồ án. Chạm là chết.", maxLevel: 3, moveCost: 30 }
    ],

    // Helper để tạo level nhanh
    // Nhóm 1: Giá Rẻ (Xám/Xanh Lá)
    _genLv1: (baseRent) => [
        { name: "Đất trống", rent: baseRent },
        { name: "Vẽ vôi chia ô", rent: Math.floor(baseRent * 3.5) },
        { name: "Dựng mái tôn", rent: Math.floor(baseRent * 7) },
        { name: "Hệ thống vé từ", rent: Math.floor(baseRent * 13) }
    ],
    // Nhóm 1b: Quán Cơm/Photo
    _genLv1b: (baseRent) => [
        { name: "Xe đẩy vỉa hè", rent: baseRent },
        { name: "Thêm bàn nhựa", rent: Math.floor(baseRent * 3.5) },
        { name: "Quạt công nghiệp", rent: Math.floor(baseRent * 7) },
        { name: "Máy lạnh + Wifi", rent: Math.floor(baseRent * 13) }
    ],
    // Nhóm 2: Tầm Trung (Xanh Dương/Tím)
    _genLv2: (baseRent) => [
        { name: "Phòng cơ bản", rent: baseRent },
        { name: "Ghế đệm êm ái", rent: Math.floor(baseRent * 3.5) },
        { name: "Khu vực VIP", rent: Math.floor(baseRent * 7) },
        { name: "Dịch vụ 5 sao", rent: Math.floor(baseRent * 13) }
    ],
    _genLvNet: (baseRent) => [
        { name: "Máy cỏ", rent: baseRent },
        { name: "Gear xịn + Led", rent: Math.floor(baseRent * 3.5) },
        { name: "Card RTX 4090", rent: Math.floor(baseRent * 7) },
        { name: "Phòng thi đấu", rent: Math.floor(baseRent * 13) }
    ],
    // Nhóm 3: Cao Cấp (Cam/Đỏ)
    _genLv3: (baseRent) => [
        { name: "Phòng khép kín", rent: baseRent },
        { name: "Có gác xép", rent: Math.floor(baseRent * 3.5) },
        { name: "Full nội thất", rent: Math.floor(baseRent * 7) },
        { name: "Penthouse SV", rent: Math.floor(baseRent * 13) }
    ],
    _genLvLab: (baseRent) => [
        { name: "Máy đo cũ kỹ", rent: baseRent },
        { name: "Máy móc Nhật", rent: Math.floor(baseRent * 3.5) },
        { name: "Robot phục vụ", rent: Math.floor(baseRent * 7) },
        { name: "Siêu máy tính AI", rent: Math.floor(baseRent * 13) }
    ],
    // Nhóm 4: Huyền Thoại (Vàng/Kim Cương)
    _genLv4: (baseRent) => [
        { name: "Giường tầng sắt", rent: baseRent },
        { name: "Nệm cao su", rent: Math.floor(baseRent * 3.5) },
        { name: "Tủ lạnh riêng", rent: Math.floor(baseRent * 7) },
        { name: "Khách sạn 5 sao", rent: Math.floor(baseRent * 13) }
    ],
    _genLvBoss: (baseRent) => [
        { name: "Bàn tiếp dân", rent: baseRent },
        { name: "Trà nước Free", rent: Math.floor(baseRent * 3.5) },
        { name: "Ghế Massage", rent: Math.floor(baseRent * 7) },
        { name: "Thang máy vàng", rent: Math.floor(baseRent * 13) }
    ],

    MAP: [] // Sẽ được init bên dưới
};

// Khởi tạo MAP chi tiết
window.MonopolyData.MAP = [
    { id: 0, name: "CỔNG TRƯỜNG", type: "START", color: "bg-emerald-600", icon: "school" },
    
    // NHÓM 1: GIÁ RẺ
    { id: 1, name: "Bãi Xe Đạp", type: "LAND", group: "gray", price: 600, color: "bg-slate-500", levels: window.MonopolyData._genLv1(100) },
    { id: 2, name: "Trà Đá Vỉa Hè", type: "LAND", group: "gray", price: 800, color: "bg-slate-500", levels: window.MonopolyData._genLv1b(150) },
    
    { id: 3, name: "CƠ HỘI", type: "CHANCE", color: "bg-amber-500", icon: "help-circle" },
    
    { id: 4, name: "Quán Cơm Bụi", type: "LAND", group: "green", price: 1200, color: "bg-green-500", levels: window.MonopolyData._genLv1b(300) },
    { id: 5, name: "Tiệm Photo", type: "LAND", group: "green", price: 1400, color: "bg-green-500", levels: window.MonopolyData._genLv1b(350) },
    
    { id: 6, name: "PHÒNG ĐÀO TẠO", type: "CORNER", action: "tuition", color: "bg-rose-900", icon: "landmark", desc: "Nộp 10% học phí" },
    
    // NHÓM 2: TẦM TRUNG
    { id: 7, name: "Thư Viện", type: "LAND", group: "blue", price: 2000, color: "bg-blue-500", levels: window.MonopolyData._genLv2(600) },
    { id: 8, name: "Sân Bóng", type: "LAND", group: "blue", price: 2200, color: "bg-blue-500", levels: window.MonopolyData._genLv2(700) },
    
    { id: 9, name: "KHÍ VẬN", type: "LUCK", color: "bg-purple-500", icon: "sparkles" },
    
    { id: 10, name: "Quán Net", type: "LAND", group: "indigo", price: 3000, color: "bg-indigo-500", levels: window.MonopolyData._genLvNet(1000) },
    { id: 11, name: "Trà Sữa Luxury", type: "LAND", group: "indigo", price: 3200, color: "bg-indigo-500", levels: window.MonopolyData._genLvNet(1100) },
    
    { id: 12, name: "CĂN TIN", type: "CORNER", action: "parking", color: "bg-orange-500", icon: "coffee", desc: "Bãi đậu xe Free" },
    
    // NHÓM 3: CAO CẤP
    { id: 13, name: "Phòng Gym", type: "LAND", group: "orange", price: 4000, color: "bg-orange-600", levels: window.MonopolyData._genLv3(1500) },
    { id: 14, name: "Nhà Trọ VIP", type: "LAND", group: "orange", price: 4200, color: "bg-orange-600", levels: window.MonopolyData._genLv3(1600) },
    
    { id: 15, name: "CƠ HỘI", type: "CHANCE", color: "bg-amber-500", icon: "help-circle" },
    
    { id: 16, name: "Phòng Lab", type: "LAND", group: "red", price: 5500, color: "bg-red-500", levels: window.MonopolyData._genLvLab(2200) },
    { id: 17, name: "Hội Trường Lớn", type: "LAND", group: "red", price: 6000, color: "bg-red-500", levels: window.MonopolyData._genLvLab(2500) },
    
    { id: 18, name: "PHÒNG THI", type: "JAIL", color: "bg-slate-800", icon: "lock", desc: "Mất 2 lượt hoặc $1000" },
    
    // NHÓM 4: HUYỀN THOẠI
    { id: 19, name: "KTX Nữ", type: "LAND", group: "yellow", price: 7500, color: "bg-yellow-500", levels: window.MonopolyData._genLv4(3500) },
    { id: 20, name: "KTX Nam", type: "LAND", group: "yellow", price: 8000, color: "bg-yellow-500", levels: window.MonopolyData._genLv4(4000) },
    
    { id: 21, name: "KHÍ VẬN", type: "LUCK", color: "bg-purple-500", icon: "sparkles" },
    
    { id: 22, name: "Tòa Nhà Hiệu Bộ", type: "LAND", group: "diamond", price: 10000, color: "bg-cyan-400", levels: window.MonopolyData._genLvBoss(6000) },
    { id: 23, name: "Thuế GTGT", type: "TAX", color: "bg-rose-700", icon: "receipt", desc: "Nộp phạt $2000" }
];


window.MonopolyData.EVENTS = {
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
};

        