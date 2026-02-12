// --- 1. KHỞI TẠO (INITIALIZATION) ---
document.addEventListener('DOMContentLoaded', () => {
    // Kích hoạt Lucide Icons
    lucide.createIcons();

    // Bắn pháo hoa khi load trang (Màu sắc Ocean)
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#22d3ee', '#3b82f6', '#f472b6'] // Cyan, Blue, Pink
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#22d3ee', '#3b82f6', '#f472b6']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // Khởi chạy các module
    initTabs();
    initUptime();
    initCharts();
    initSliders();
    initWordCloud();
    initFloatingMemories(); 
    initOracle();
    initMessageBottles(); 
    initLuckyWheel();
    initGoldenAwards();
    initGameCenter();
    consoleEasterEgg();
});

// --- 2. XỬ LÝ CHUYỂN TAB ---
function initTabs() {
    const buttons = document.querySelectorAll('.nav-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            buttons.forEach(b => b.classList.remove('active'));
            // Add active class
            btn.classList.add('active');

            // Animation chuyển tab mượt mà hơn
            const targetId = btn.getAttribute('data-tab');
            
            contents.forEach(c => {
                if(c.id === targetId) {
                    c.classList.remove('hidden');
                    // Reset animation
                    c.classList.remove('animate-fadeInUp');
                    void c.offsetWidth; // Trigger reflow
                    c.classList.add('animate-fadeInUp');
                } else {
                    c.classList.add('hidden');
                }
            });
        });
    });
}

// --- 3. ĐỒNG HỒ UPTIME ---
function initUptime() {
    const display = document.getElementById('uptime-display');
    
    // =========================================================================
    // 👇 NHẬP NGÀY THÀNH LẬP NHÓM
    const ngayBatDau = "2025-12-07T21:00:00"; 
    // =========================================================================

    const startDate = new Date(ngayBatDau);

    if (isNaN(startDate.getTime())) {
        display.innerHTML = "<span style='color: #ef4444'>⚠️ Invalid Date</span>";
        return;
    }

    setInterval(() => {
        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) {
             display.innerText = "Coming Soon";
             return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const d = days.toString().padStart(2, '0');
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');

        // Style số to đẹp, màu gradient
        const numberStyle = "bg-clip-text text-transparent bg-gradient-to-b from-white to-cyan-200";
        const labelStyle = "text-xs text-cyan-500/50 font-sans block mt-1 uppercase tracking-wider";

        display.innerHTML = `
            <div class="text-center">
                <span class="${numberStyle}">${d}</span>
                <span class="${labelStyle}">Ngày</span>
            </div>
            <span class="text-cyan-500/30 -mt-6">:</span>
            <div class="text-center">
                <span class="${numberStyle}">${h}</span>
                <span class="${labelStyle}">Giờ</span>
            </div>
            <span class="text-cyan-500/30 -mt-6">:</span>
            <div class="text-center">
                <span class="${numberStyle}">${m}</span>
                <span class="${labelStyle}">Phút</span>
            </div>
            <span class="text-cyan-500/30 -mt-6">:</span>
            <div class="text-center">
                <span class="${numberStyle}">${s}</span>
                <span class="${labelStyle}">Giây</span>
            </div>
        `;
    }, 1000);
}

// --- 4. BIỂU ĐỒ (CHART.JS) ---
function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // 1. Biểu đồ Line (Thống Kê Tin Nhắn)
    const ctxLine = document.getElementById('bugChart').getContext('2d');
    
    // Gradient cho Tin Nhắn (Cyan Ocean)
    const gradientMsg = ctxLine.createLinearGradient(0, 0, 0, 300);
    gradientMsg.addColorStop(0, 'rgba(34, 211, 238, 0.6)'); // Cyan-400
    gradientMsg.addColorStop(1, 'rgba(34, 211, 238, 0)');

    // Dữ liệu từ bảng thống kê (2025-12-07 đến 2026-01-22)
    const rawData = [
        { date: '07/12', count: 918 }, { date: '08/12', count: 710 }, { date: '13/12', count: 234 }, 
        { date: '16/12', count: 59 }, { date: '18/12', count: 1491 }, { date: '19/12', count: 1700 }, 
        { date: '20/12', count: 408 }, { date: '21/12', count: 2592 }, { date: '22/12', count: 1693 }, 
        { date: '23/12', count: 375 }, { date: '24/12', count: 2041 }, { date: '25/12', count: 3717 }, 
        { date: '26/12', count: 2715 }, { date: '27/12', count: 1790 }, { date: '28/12', count: 334 }, 
        { date: '29/12', count: 1907 }, { date: '30/12', count: 1636 }, { date: '31/12', count: 1133 }, 
        { date: '01/01', count: 715 }, { date: '02/01', count: 812 }, { date: '03/01', count: 3319 }, 
        { date: '04/01', count: 1105 }, { date: '05/01', count: 1839 }, { date: '06/01', count: 379 }, 
        { date: '07/01', count: 740 }, { date: '08/01', count: 1509 }, { date: '09/01', count: 694 }, 
        { date: '10/01', count: 566 }, { date: '11/01', count: 868 }, { date: '12/01', count: 1266 }, 
        { date: '13/01', count: 192 }, { date: '14/01', count: 819 }, { date: '15/01', count: 1922 }, 
        { date: '16/01', count: 4036 }, { date: '17/01', count: 754 }, { date: '18/01', count: 1434 }, 
        { date: '19/01', count: 2072 }, { date: '20/01', count: 1411 }, { date: '21/01', count: 4026 }, 
        { date: '22/01', count: 662 }
    ];

    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: rawData.map(d => d.date),
            datasets: [
                {
                    label: 'Số lượng tin nhắn',
                    data: rawData.map(d => d.count),
                    borderColor: '#22d3ee', // Cyan-400
                    backgroundColor: gradientMsg,
                    fill: true,
                    tension: 0.3, // Đường cong mượt
                    pointBackgroundColor: '#0891b2',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, // Ẩn legend vì chỉ có 1 dòng dữ liệu
                tooltip: {
                    backgroundColor: 'rgba(2, 6, 23, 0.9)',
                    backdropFilter: 'blur(4px)',
                    titleColor: '#22d3ee',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(34, 211, 238, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `💬 ${context.parsed.y} tin nhắn`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: function(value) { return value >= 1000 ? (value/1000).toFixed(1) + 'k' : value; } }
                },
                x: { 
                    grid: { display: false },
                    ticks: { maxTicksLimit: 10 } // Giới hạn số lượng nhãn ngày để không bị rối
                }
            }
        }
    });

    // 2. Biểu đồ Doughnut
    const ctxPie = document.getElementById('timeChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Code', 'Debug', 'Chửi Bug', 'Đi Trễ', 'Cafe'],
            datasets: [{
                data: [15, 30, 25, 10, 20],
                backgroundColor: [
                    '#06b6d4', // Cyan
                    '#f43f5e', // Rose
                    '#f59e0b', // Amber
                    '#8b5cf6', // Violet
                    '#10b981'  // Emerald
                ],
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', 
            plugins: {
                legend: { position: 'right', labels: { padding: 20, usePointStyle: true } }
            }
        }
    });
}

// --- 5. SLIDER SO SÁNH ẢNH ---
function initSliders() {
    const wrappers = document.querySelectorAll('.img-comp-wrapper');

    wrappers.forEach(wrapper => {
        const imgBefore = wrapper.querySelector('.img-before');
        const handle = wrapper.querySelector('.slider-handle');
        let isDown = false;

        const move = (e) => {
            if (!isDown && e.type !== 'mousemove') return; 
            
            const rect = wrapper.getBoundingClientRect();
            let x = (e.pageX || e.touches[0].pageX) - rect.left;
            
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;

            const percent = (x / rect.width) * 100;
            
            imgBefore.style.width = `${percent}%`;
            // Căn chỉnh lại handle một chút cho chuẩn giữa
            handle.style.left = `${percent}%`;
        };

        wrapper.addEventListener('mousedown', () => isDown = true);
        wrapper.addEventListener('mouseup', () => isDown = false);
        wrapper.addEventListener('mouseleave', () => isDown = false);
        wrapper.addEventListener('touchstart', () => isDown = true);
        wrapper.addEventListener('touchend', () => isDown = false);

        wrapper.addEventListener('mousemove', move);
        wrapper.addEventListener('touchmove', move);
    });
}


// --- 6. MÁY TIÊN TRI ---
function initOracle() {

    const btn = document.getElementById('prophecy-btn');
    const text = document.getElementById('prophecy-text');
    let isRunning = false;

    btn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        
        // Hiệu ứng chạy chữ
        text.className = "text-xl font-mono text-cyan-400 blur-sm transition-all";
        let count = 0;
        const interval = setInterval(() => {
            text.innerText = quotes[Math.floor(Math.random() * quotes.length)];
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalQuote = quotes[Math.floor(Math.random() * quotes.length)];
                text.innerText = `"${finalQuote}"`;
                text.className = "text-xl font-mono text-cyan-300 animate-fadeInUp drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]";
                isRunning = false;
            }
        }, 80);
    });
}

// --- 7. EASTER EGG ---
function consoleEasterEgg() {
    console.log("%cSTOP!", "color: #06b6d4; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0px black;");
    console.log("%cWelcome to Ocean Mode.", "color: #fff; font-size: 16px; font-family: monospace;");
}

// --- 8. WORD CLOUD (MỚI) ---
function initWordCloud() {

    const rows = csvData.trim().split('\n');
    let list = [];
    rows.forEach(row => {
        const parts = row.split(',');
        if (parts.length >= 2) {
            const text = parts[0].trim();
            const size = parseInt(parts[1].trim());
            if (text && !isNaN(size)) {
                list.push([text, size]);
            }
        }
    });

    // Sắp xếp và lấy top 50
    list.sort((a, b) => b[1] - a[1]);
    list = list.slice(0, 70);

    // Cập nhật Top 3
    if(list.length > 0) document.getElementById('top-word-1').innerText = `${list[0][0]} (${list[0][1]})`;
    if(list.length > 1) document.getElementById('top-word-2').innerText = `${list[1][0]} (${list[1][1]})`;
    if(list.length > 2) document.getElementById('top-word-3').innerText = `${list[2][0]} (${list[2][1]})`;

    // 2. Render Word Cloud Thủ Công (Manual DOM) - Nhẹ & Đẹp
    const canvas = document.getElementById('word-cloud-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;

    // Xóa toàn bộ nội dung cũ (Canvas + Loader) để thay thế bằng các thẻ từ khóa
    container.innerHTML = '';
    
    // Thiết lập Flexbox để các từ tự sắp xếp vào giữa
    container.className = 'glass-panel rounded-3xl p-8 relative flex flex-wrap content-center justify-center gap-x-6 gap-y-4 overflow-hidden min-h-[500px]';

    // Inject CSS động cho hiệu ứng Floating & Glow (để không cần sửa file CSS)
    const styleId = 'word-cloud-manual-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .word-tag {
                display: inline-block;
                line-height: 1;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                cursor: default;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                animation: floatWord 6s ease-in-out infinite;
                backdrop-filter: blur(4px);
            }
            .word-tag:hover {
                transform: scale(1.15) translateY(-5px);
                background: rgba(255, 255, 255, 0.15);
                border-color: #22d3ee;
                box-shadow: 0 0 25px rgba(34, 211, 238, 0.4);
                z-index: 20;
                opacity: 1 !important;
            }
            @keyframes floatWord {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Màu sắc Ocean Theme (Cyan, Sky, Teal, Violet, White)
    const colors = ['#22d3ee', '#38bdf8', '#5eead4', '#c084fc', '#e2e8f0', '#94a3b8'];

    // Tính toán Max/Min để scale chữ
    const maxVal = list.length > 0 ? list[0][1] : 1;
    const minVal = list.length > 0 ? list[list.length - 1][1] : 0;

    // Tạo các thẻ span
    list.forEach((item) => {
        const [text, count] = item;
        const el = document.createElement('span');
        el.innerText = text;
        el.className = 'word-tag';
        
        // Tính toán kích thước chữ: Min 0.9rem -> Max 3.2rem
        // Fix lỗi chia cho 0 nếu tất cả từ có số lượng bằng nhau
        const scale = maxVal === minVal ? 0.5 : (count - minVal) / (maxVal - minVal);
        const fontSize = 0.9 + (scale * 2.3); 
        
        el.style.fontSize = `${fontSize}rem`;
        
        // Độ đậm & Trong suốt dựa trên độ phổ biến
        el.style.fontWeight = scale > 0.6 ? '800' : (scale > 0.3 ? '600' : '400');
        el.style.opacity = 0.6 + (scale * 0.4); // Từ mờ (60%) đến rõ (100%)
        
        // Random màu sắc
        el.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random thời gian animation để các từ bay không đồng bộ (tự nhiên hơn)
        el.style.animationDelay = `${Math.random() * -5}s`;
        el.style.animationDuration = `${4 + Math.random() * 4}s`; // Từ 4s đến 8s
        
        // Tooltip native
        el.title = `${text}: ${count} lần`;

        container.appendChild(el);
    });
}

// --- 9. FLOATING GALLERY (KÝ ỨC TRÔI NỔI) ---
function initFloatingMemories() {
    const galleryTab = document.getElementById('gallery');
    if (!galleryTab) return;

    // 1. Inject CSS (Giữ nguyên như cũ)
    const styleId = 'floating-gallery-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .floating-section-title {
                text-align: center;
                font-size: 2rem;
                font-weight: 800;
                color: white;
                margin-top: 4rem;
                margin-bottom: 0.5rem;
                text-shadow: 0 0 30px rgba(34, 211, 238, 0.6);
            }
            .floating-section-subtitle {
                text-align: center;
                color: #94a3b8;
                margin-bottom: 3rem;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9rem;
            }
            .floating-container {
                position: relative;
                width: 100%;
                height: 3500px; /* Tăng chiều cao lên vì bạn có tới 199 ảnh */
                overflow: hidden;
                border-radius: 2rem;
                background: linear-gradient(to bottom, 
                    rgba(15, 23, 42, 0) 0%, 
                    rgba(6, 182, 212, 0.05) 20%, 
                    rgba(15, 23, 42, 0.8) 100%);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
            }
            .float-img {
                position: absolute;
                object-fit: cover;
                border-radius: 1rem;
                border: 2px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transition: all 0.5s ease;
                animation: randomFloat infinite ease-in-out alternate;
                filter: grayscale(0.4) brightness(0.9);
                opacity: 0;
                animation-fill-mode: both;
            }
            .float-img:hover {
                filter: grayscale(0) brightness(1.1);
                z-index: 100;
                transform: scale(1.3) !important; /* Phóng to hơn xíu để nhìn rõ */
                border-color: #22d3ee;
                box-shadow: 0 0 30px rgba(34, 211, 238, 0.4);
            }
            @keyframes randomFloat {
                0% { transform: translate(0, 0) rotate(0deg); }
                100% { transform: translate(var(--mx), var(--my)) rotate(var(--mr)); }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Tạo cấu trúc HTML
    if (document.getElementById('floating-memories-wrap')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'floating-memories-wrap';
    
    wrapper.innerHTML = `
        <h3 class="floating-section-title">Kho Lưu Trữ Ký Ức</h3>
        <p class="floating-section-subtitle">// Khoảnh khắc ngẫu nhiên từ quá khứ đến hiện tại</p>
        <div class="floating-container" id="floating-area"></div>
    `;
    
    galleryTab.appendChild(wrapper);

    // 3. TẠO ẢNH TỪ FOLDER LOCAL (Sampling ngẫu nhiên nhưng có thứ tự)
    const container = document.getElementById('floating-area');
    
    // --- CẤU HÌNH ---
    const totalAlbumImages = 199; // Tổng số ảnh có trong thư mục (0001 -> 0199)
    const maxDisplayImages = 100;  // Số lượng ảnh hiển thị tối đa để không lag
    const folderPath = './memories/';
    const baseName = 'Anniversary '; 
    const extension = '.jpg'; 

    // --- LOGIC LẤY MẪU NGẪU NHIÊN CÓ SẮP XẾP ---
    // 1. Tạo mảng chứa toàn bộ index [1, 2, ..., 199]
    const allIndices = Array.from({length: totalAlbumImages}, (_, i) => i + 1);

    // 2. Xáo trộn mảng (Fisher-Yates Shuffle)
    for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }

    // 3. Lấy ra 'maxDisplayImages' phần tử đầu tiên và SẮP XẾP LẠI tăng dần
    // Việc sắp xếp lại giúp ảnh số nhỏ (cũ) ở trên, số to (mới) ở dưới -> Giữ được dòng thời gian
    const selectedIndices = allIndices.slice(0, maxDisplayImages).sort((a, b) => a - b);

    // 4. Render các ảnh đã chọn
    selectedIndices.forEach((imgIndex, loopIndex) => {
        const img = document.createElement('img');
        
        // Pad start để tạo tên file đúng (ví dụ: 45 -> "0045")
        const paddedNumber = imgIndex.toString().padStart(4, '0');
        img.src = `${folderPath}${baseName}${paddedNumber}${extension}`;
        
        img.className = 'float-img';
        img.loading = "lazy";

        img.onerror = function() { 
            this.style.display = 'none'; 
            console.warn('Không tìm thấy ảnh:', this.src);
        };

        // --- CÁC THÔNG SỐ ANIMATION ---
        
        // Random kích thước: 100px - 200px
        const size = Math.floor(Math.random() * 150) + 150;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;

        // Vị trí Top: Dựa vào thứ tự hiển thị (loopIndex) để rải đều chiều cao
        // Không dùng imgIndex vì nếu random trúng toàn số lớn thì ảnh sẽ dồn hết xuống dưới
        const topPos = (loopIndex / maxDisplayImages) * 95; 
        img.style.top = `${topPos + Math.random() * 2}%`; 

        // Vị trí Left: Random từ 5% đến 85%
        const leftPos = Math.random() * 80 + 5;
        img.style.left = `${leftPos}%`;

        // Animation bay bổng
        const moveX = (Math.random() - 0.5) * 1000;
        const moveY = (Math.random() - 0.5) * 1000; 
        const rotate = (Math.random() - 0.5) * 100;
        
        img.style.setProperty('--mx', `${moveX}px`);
        img.style.setProperty('--my', `${moveY}px`);
        img.style.setProperty('--mr', `${rotate}deg`);
        
        img.style.animationDuration = `${6 + Math.random() * 6}s`;
        img.style.animationDelay = `${Math.random() * -5}s`;

        // Hiện dần khi cuộn tới
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 }); 
        
        img.style.opacity = '0';
        observer.observe(img);

        container.appendChild(img);
    });
}

// --- 10. THÔNG ĐIỆP TRONG CHAI (MESSAGE IN A BOTTLE) ---
// Đã nâng cấp: Chế độ Hỏi - Đáp (Flip Card)
function initMessageBottles() {

    // 2. INJECT CSS CHO HIỆU ỨNG LẬT 3D
    const styleId = 'bottle-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Container cho chai trôi */
            #bottle-layer {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 40;
                overflow: hidden;
            }

            /* Cái chai */
            .drifting-bottle {
                position: absolute;
                cursor: pointer;
                pointer-events: auto;
                filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));
                transition: transform 0.3s ease;
                opacity: 0.8;
            }
            .drifting-bottle:hover {
                transform: scale(1.2) rotate(-10deg) !important;
                filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.8));
                opacity: 1;
            }

            /* Modal Container */
            #message-modal {
                position: fixed;
                inset: 0;
                z-index: 1000;
                background: rgba(2, 6, 23, 0.85);
                backdrop-filter: blur(8px);
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                perspective: 1000px; /* Quan trọng cho hiệu ứng 3D */
            }
            #message-modal.open {
                display: flex;
                opacity: 1;
            }

            /* Thẻ lật (Flip Card) Wrapper */
            .paper-card {
                width: 90%;
                max-width: 500px;
                min-height: 350px;
                position: relative;
                transform-style: preserve-3d; /* Giữ không gian 3D cho mặt con */
                transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
            }

            /* Trạng thái lật */
            .paper-card.is-flipped {
                transform: rotateY(180deg);
            }

            /* Style chung cho 2 mặt */
            .card-face {
                position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden; /* Ẩn mặt sau khi lật */
                backface-visibility: hidden;
                border-radius: 8px;
                padding: 3rem 2rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                box-shadow: 0 0 50px rgba(251, 191, 36, 0.2);
                background-color: #fef3c7;
                background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');
                font-family: 'Courier New', Courier, monospace;
                color: #451a03;
            }

            /* Mặt trước (Câu hỏi) */
            .card-front {
                z-index: 2;
                border: 2px solid rgba(120, 53, 15, 0.2);
            }

            /* Mặt sau (Đáp án) */
            .card-back {
                transform: rotateY(180deg); /* Xoay sẵn 180 độ */
                background-color: #fffbeb; /* Màu giấy sáng hơn chút */
                border: 2px dashed rgba(120, 53, 15, 0.3);
            }

            .card-label {
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #92400e;
                margin-bottom: 1rem;
                border-bottom: 1px solid #92400e;
                padding-bottom: 0.25rem;
            }

            .card-text {
                font-size: 1.25rem;
                font-weight: bold;
                line-height: 1.5;
            }

            .tap-hint {
                margin-top: 2rem;
                font-size: 0.8rem;
                color: #b45309;
                animation: pulse 2s infinite;
                font-style: italic;
            }

            /* Nút đóng */
            .close-modal {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 2rem;
                cursor: pointer;
                color: #78350f;
                opacity: 0.5;
                transition: opacity 0.2s;
                z-index: 10;
            }
            .close-modal:hover { opacity: 1; }

            @keyframes floatRight {
                0% { left: -100px; transform: translateY(0) rotate(15deg); }
                100% { left: 100vw; transform: translateY(0) rotate(15deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Inject HTML Modal
    if (!document.getElementById('message-modal')) {
        const modalHTML = `
            <div id="bottle-layer"></div>
            <div id="message-modal">
                <div class="paper-card" id="flip-card">
                    
                    <!-- Mặt trước: Câu hỏi -->
                    <div class="card-face card-front">
                        <span class="close-modal">&times;</span>
                        <div class="mb-4 text-amber-700 opacity-80">
                            <i data-lucide="help-circle" class="w-12 h-12 mx-auto"></i>
                        </div>
                        <div class="card-label">Câu Hỏi Bí Mật</div>
                        <p id="q-text" class="card-text">Loading...</p>
                        <div class="tap-hint">(Chạm để lật xem đáp án)</div>
                    </div>

                    <!-- Mặt sau: Đáp án -->
                    <div class="card-face card-back">
                        <span class="close-modal">&times;</span>
                        <div class="mb-4 text-green-700 opacity-80">
                            <i data-lucide="check-circle-2" class="w-12 h-12 mx-auto"></i>
                        </div>
                        <div class="card-label">Sự Thật Là</div>
                        <p id="a-text" class="card-text text-green-900">Loading...</p>
                        <div class="tap-hint text-green-700">(Chạm để lật lại)</div>
                    </div>

                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 3. LOGIC XỬ LÝ
    const bottleLayer = document.getElementById('bottle-layer');
    const modal = document.getElementById('message-modal');
    const flipCard = document.getElementById('flip-card');
    const closeBtns = document.querySelectorAll('.close-modal');
    const qText = document.getElementById('q-text');
    const aText = document.getElementById('a-text');

    // Đóng Modal
    const closeModal = (e) => {
        if(e) e.stopPropagation(); // Ngăn sự kiện click xuyên qua card
        modal.classList.remove('open');
        // Reset lật bài về mặt trước sau khi đóng
        setTimeout(() => flipCard.classList.remove('is-flipped'), 300);
        scheduleNextBottle(); 
    };

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    // Click outside để đóng
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Click vào card để lật
    flipCard.addEventListener('click', () => {
        flipCard.classList.toggle('is-flipped');
    });

    // Tạo chai
    const spawnBottle = () => {
        if (modal.classList.contains('open')) return;

        const bottle = document.createElement('div');
        bottle.className = 'drifting-bottle';
        bottle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a5f3fc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-lg">
                <path d="M10 2v2a2 2 0 0 1-2 2v2.5"/>
                <path d="M14 2v2a2 2 0 0 0 2 2v2.5"/>
                <path d="M6 8.5V19a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8.5"/>
                <path d="M9 13.5l2.5 2.5 3.5-3.5"/> 
                <path d="M10 2h4"/>
            </svg>
        `;

        const randomTop = Math.random() * 60 + 10; 
        bottle.style.top = `${randomTop}%`;

        const duration = Math.random() * 10 + 15;
        bottle.style.animation = `floatRight ${duration}s linear forwards`;

        bottle.addEventListener('click', () => {
            bottle.remove(); 
            
            // Random Q&A
            const item = qaList[Math.floor(Math.random() * qaList.length)];
            qText.innerText = item.q;
            aText.innerText = item.a;
            
            // Đảm bảo card đang ở mặt trước
            flipCard.classList.remove('is-flipped');
            
            modal.classList.add('open');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        bottle.addEventListener('animationend', () => {
            bottle.remove();
            scheduleNextBottle();
        });

        bottleLayer.appendChild(bottle);
    };

    const scheduleNextBottle = () => {
        const nextTime = Math.random() * 20000 + 30000; 
        setTimeout(spawnBottle, nextTime);
    };

    setTimeout(spawnBottle, 5000);
}

// --- 11. VÒNG QUAY ĐỊNH MỆNH (LUCKY WHEEL) ---
function initLuckyWheel() {
    const styleId = 'wheel-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Trigger Button */
            #wheel-btn-trigger { 
                position: fixed; bottom: 20px; left: 20px; width: 60px; height: 60px; 
                background: linear-gradient(135deg, #f59e0b, #d97706); 
                border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                cursor: pointer; box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); z-index: 999; 
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                border: 3px solid rgba(255,255,255,0.2); 
            }
            #wheel-btn-trigger:hover { transform: scale(1.15) rotate(180deg); }
            
            /* Modal */
            #wheel-modal { 
                position: fixed; inset: 0; background: rgba(2, 6, 23, 0.95); 
                backdrop-filter: blur(15px); z-index: 2000; display: none; 
                flex-direction: column; align-items: center; justify-content: center; 
                opacity: 0; transition: opacity 0.3s ease; 
            }
            #wheel-modal.open { display: flex; opacity: 1; }
            
            /* Wheel Container */
            .wheel-wrapper {
                position: relative;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
                box-shadow: 0 0 50px rgba(34, 211, 238, 0.1);
                margin-bottom: 2rem;
            }
            .wheel-container { 
                position: relative; width: 400px; height: 400px; 
                border-radius: 50%; overflow: hidden;
                border: 4px solid #0f172a;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
            }
            
            /* Pointer (Mũi tên bên PHẢI) */
            .wheel-pointer { 
                position: absolute; 
                top: 50%; 
                right: -25px; /* Đặt bên phải */
                transform: translateY(-50%); 
                width: 0; height: 0; 
                border-top: 20px solid transparent; 
                border-bottom: 20px solid transparent; 
                border-right: 45px solid #ef4444; /* Tam giác hướng sang trái */
                z-index: 20; 
                filter: drop-shadow(-4px 2px 4px rgba(0,0,0,0.5)); 
            }
            
            /* Controls */
            .wheel-controls { 
                background: rgba(15, 23, 42, 0.8); 
                padding: 1.5rem; border-radius: 1.5rem; 
                border: 1px solid rgba(255, 255, 255, 0.1); 
                text-align: center; width: 90%; max-width: 450px; 
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            .wheel-input { 
                width: 100%; background: rgba(0, 0, 0, 0.4); 
                border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; 
                padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 1rem; 
                font-family: 'Outfit', sans-serif; resize: vertical; min-height: 80px;
            }
            .spin-btn { 
                background: linear-gradient(90deg, #ec4899, #8b5cf6); 
                color: white; font-weight: 800; padding: 1rem 3rem; 
                border-radius: 9999px; transition: all 0.3s; 
                text-transform: uppercase; letter-spacing: 1.5px; 
                width: 100%; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .spin-btn:hover { 
                transform: translateY(-3px); 
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.6); 
                filter: brightness(1.1);
            }
            .spin-btn:disabled { 
                opacity: 0.6; cursor: not-allowed; transform: none; 
                filter: grayscale(0.5);
            }
            .close-wheel { 
                position: absolute; top: 30px; right: 30px; 
                color: #94a3b8; cursor: pointer; padding: 10px; 
                transition: color 0.2s;
            }
            .close-wheel:hover { color: white; transform: scale(1.1); }
        `;
        document.head.appendChild(style);
    }

    if (!document.getElementById('wheel-modal')) {
        const html = `
            <div id="wheel-btn-trigger" title="Vòng Quay Định Mệnh">
                <i data-lucide="life-buoy" class="text-white w-8 h-8"></i>
            </div>
            <div id="wheel-modal">
                <div class="close-wheel"><i data-lucide="x" class="w-10 h-10"></i></div>
                <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-8 uppercase tracking-widest drop-shadow-lg">Vòng Quay Nhân Phẩm</h2>
                
                <div class="wheel-wrapper">
                    <div class="wheel-pointer"></div>
                    <div class="wheel-container">
                        <canvas id="wheel-canvas" width="400" height="400"></canvas>
                    </div>
                </div>

                <div class="wheel-controls">
                    <label class="block text-sm text-cyan-400 mb-2 text-left font-bold uppercase tracking-wider">Danh sách (Ngăn cách bằng dấu phẩy):</label>
                    <textarea id="wheel-items" rows="3" class="wheel-input" placeholder="Nhập các lựa chọn...">Ai bao trà sữa?, Kể 1 bí mật động trời, Show ảnh dìm hàng bản thân, Hát 1 bài, Hít đất 20 cái, Kể chuyện tình đầu, Mời cả nhóm đi ăn, Gọi điện tỏ tình với Crush</textarea>
                    <button id="spin-btn" class="spin-btn">Quay Ngay</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spin-btn');
    const inputArea = document.getElementById('wheel-items');
    const modal = document.getElementById('wheel-modal');
    const triggerBtn = document.getElementById('wheel-btn-trigger');
    const closeBtn = document.querySelector('.close-wheel');

    let items = [];
    let currentAngle = 0;
    let isSpinning = false;
    let spinVelocity = 0;
    
    // Palette màu sang trọng hơn
    const colors = ['#1e293b', '#334155']; // Slate đậm nhạt xen kẽ
    const textColors = ['#38bdf8', '#f472b6', '#fbbf24', '#a3e635']; // Cyan, Pink, Amber, Lime

    function parseItems() {
        const val = inputArea.value;
        items = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (items.length === 0) items = ['?'];
        drawWheel();
    }

    function drawWheel() {
        if (!ctx) return;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2;
        const arc = (2 * Math.PI) / items.length;

        ctx.clearRect(0, 0, width, height);

        items.forEach((item, i) => {
            const angle = currentAngle + i * arc;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius - 10, angle, angle + arc); // Trừa viền 10px
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#0f172a'; // Viền ngăn cách
            ctx.lineWidth = 2;
            ctx.stroke();

            // Vẽ chữ
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = textColors[i % textColors.length];
            ctx.font = "bold 15px 'Outfit', sans-serif";
            // Dịch chữ ra xa tâm chút
            ctx.fillText(item, radius - 30, 5);
            ctx.restore();
        });

        // Vẽ tâm bánh xe (Hub)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#d97706'; // Viền cam
        ctx.stroke();

        // Icon giữa tâm
        ctx.fillStyle = '#d97706';
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", centerX, centerY);

        // Vẽ viền ngoài cùng
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#334155';
        ctx.stroke();
        
        // Viền trang trí mỏng
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();
    }

    function animate() {
        if (spinVelocity > 0.002) {
            currentAngle += spinVelocity;
            spinVelocity *= 0.985; // Ma sát
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.innerText = "Quay Lại";
            
            // Tính kết quả dựa trên kim bên PHẢI (Góc 0)
            const normalizedAngle = currentAngle % (2 * Math.PI);
            const arc = (2 * Math.PI) / items.length;
            
            // Công thức cho kim bên phải (0 rad):
            // Góc xoay của bánh xe là 'currentAngle'. 
            // Item 0 bắt đầu từ 0 đến arc.
            // Khi xoay, item 0 dời đi. Kim đứng yên tại 0.
            // Góc "chiến thắng" trên bánh xe là góc đối diện với kim sau khi xoay.
            // (2PI - normalizedAngle) % 2PI
            const winningAngle = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);
            const index = Math.floor(winningAngle / arc);
            
            const winner = items[index % items.length];
            if (window.confetti) window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            spinBtn.innerText = `Kết quả: ${winner}`;
        }
    }

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        parseItems();
        if (items.length < 2) { alert("Nhập ít nhất 2 mục!"); return; }
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.innerText = "Đang quay...";
        spinVelocity = Math.random() * 0.4 + 0.3; // Tăng lực quay
        animate();
    });

    inputArea.addEventListener('input', parseItems);
    triggerBtn.addEventListener('click', () => {
        alert("🚧 Khu vực đang được nâng cấp nên HK ẩn nó đi nhé!\n\n(Chức năng này sẽ sớm mở khóa, anh em chờ nhé!)");
    });
    const closeModal = () => { if(!isSpinning) modal.classList.remove('open'); };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    parseItems();
}


// --- 12. LỄ TRAO GIẢI MÂM XÔI VÀNG (GOLDEN BUG AWARDS) ---
function initGoldenAwards() {
    // 1. DỮ LIỆU: DANH SÁCH GIẢI THƯỞNG & NGƯỜI THẮNG
    // Bạn hãy sửa tên và lý do ở đây cho đúng với nhóm bạn nhé!
    const awards = [
        {
            title: "CHĂM CHỈ NHẤT NĂM",
            winner: "QUỲNH ANH", 
            desc: "Thành tích: Luôn là người đầu tiên có mặt trong mọi buổi họp, chuẩn bị bài vở, đầy đủ.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
        },
        {
            title: "BÁ ĐẠO NHẤT NĂM",
            winner: "THANK NGHÍA",
            desc: "Thành tích: Tổng tài chăm chỉ nhưng gia trưởng, cả nhóm phải nghe lời",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
        },
        {
            title: "LEADER TOÀN NĂNG",
            winner: "NGỌC TUYỀN",
            desc: "Thành tích: Luôn là người đứng mũi chịu sào, gánh team trong mọi dự án.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Precious"
        },
        {
            title: "TRÂU BÒ NHẤT NĂM",
            winner: "HOÀNG KHA",
            desc: "Thành tích: Siêng làm những việc không nên siêng",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian"
        },
        {
            title: "IDEA CỦA NĂM",
            winner: "TRIÊM ĐOÀN",
            desc: "Thành tích: Luôn có những ý tưởng đột phá, táo bạo, đôi khi hơi... điên.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost"
        }
    ];

    // Âm thanh vỗ tay (Nguồn ổn định từ Wikimedia)
    const clapAudio = new Audio("https://upload.wikimedia.org/wikipedia/commons/3/3a/Applause_mono_24bit_48kHz.wav");
    const drumAudio = new Audio("https://upload.wikimedia.org/wikipedia/commons/7/75/Drum_roll.ogg"); // Tiếng trống dồn

    let currentSlide = -1; // -1 là màn hình chờ

    // 2. INJECT CSS (SÂN KHẤU HOÀNH TRÁNG)
    const styleId = 'awards-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Nút kích hoạt (Hình cái cúp) */
            #awards-trigger {
                position: fixed; bottom: 20px; left: 90px; /* Nằm cạnh nút Vòng quay */
                width: 60px; height: 60px;
                background: linear-gradient(135deg, #facc15, #ca8a04);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 0 25px rgba(250, 204, 21, 0.6); z-index: 999;
                border: 3px solid rgba(255,255,255,0.2); transition: transform 0.3s;
            }
            #awards-trigger:hover { transform: scale(1.15) rotate(-10deg); }

            /* Sân khấu chính */
            #awards-stage {
                position: fixed; inset: 0;
                background: radial-gradient(circle at center, #1e1b4b 0%, #020617 80%);
                z-index: 3000; /* Cao nhất */
                display: none; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }
            #awards-stage.active { display: flex; animation: fadeStageIn 1s ease; }

            /* Hiệu ứng đèn Spotlight */
            .spotlight-beam {
                position: absolute; top: -20%; left: 50%;
                width: 200px; height: 100vh;
                background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
                transform-origin: top center;
                filter: blur(20px);
                animation: spotlightSwing 8s infinite ease-in-out alternate;
                pointer-events: none;
            }
            .spotlight-left { left: 20%; animation-delay: -2s; transform: rotate(15deg); }
            .spotlight-right { left: 80%; animation-delay: -4s; transform: rotate(-15deg); }

            /* Nội dung giải thưởng */
            .award-content {
                text-align: center; z-index: 10;
                max-width: 800px; padding: 20px;
                transform: scale(0.9); opacity: 0;
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .award-content.show { transform: scale(1); opacity: 1; }

            .award-category {
                font-family: 'Outfit', sans-serif;
                font-size: 1.5rem; letter-spacing: 4px;
                color: #facc15; text-transform: uppercase;
                margin-bottom: 1rem; text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
            }

            .award-title {
                font-family: 'JetBrains Mono', monospace;
                font-size: 3.5rem; font-weight: 800;
                background: linear-gradient(to bottom, #ffffff, #94a3b8);
                -webkit-background-clip: text; color: transparent;
                margin-bottom: 2rem;
                text-shadow: 0 10px 30px rgba(0,0,0,0.5);
                line-height: 1.2;
            }

            .winner-reveal-box {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px; padding: 3rem;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 50px rgba(250, 204, 21, 0.1);
                display: none; flex-direction: column; align-items: center;
                animation: zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .winner-reveal-box.revealed { display: flex; }

            .winner-avatar {
                width: 150px; height: 150px; border-radius: 50%;
                border: 4px solid #facc15;
                box-shadow: 0 0 30px rgba(250, 204, 21, 0.6);
                margin-bottom: 1.5rem; object-fit: cover;
                background: #0f172a;
            }

            .winner-name {
                font-size: 2.5rem; font-weight: bold; color: white;
                margin-bottom: 0.5rem;
            }

            .winner-desc {
                font-size: 1.1rem; color: #cbd5e1; font-style: italic;
            }

            /* Màn hình chờ */
            .intro-screen {
                text-align: center;
                animation: pulse 2s infinite;
            }
            .intro-title {
                font-size: 4rem; font-weight: 900; color: #facc15;
                text-shadow: 0 0 50px rgba(250, 204, 21, 0.8);
                margin-bottom: 1rem;
            }

            /* Controls */
            .stage-controls {
                position: absolute; bottom: 30px;
                display: flex; gap: 20px;
            }
            .stage-btn {
                padding: 10px 20px; background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2); color: white;
                border-radius: 30px; cursor: pointer; transition: all 0.3s;
                font-family: 'Outfit', sans-serif; text-transform: uppercase; font-size: 0.8rem;
            }
            .stage-btn:hover { background: white; color: black; }
            .stage-btn.primary { background: #facc15; color: black; font-weight: bold; border: none; }
            .stage-btn.primary:hover { box-shadow: 0 0 20px #facc15; }

            .close-stage {
                position: absolute; top: 20px; right: 20px;
                color: #64748b; cursor: pointer; padding: 10px;
            }
            .close-stage:hover { color: white; }

            @keyframes spotlightSwing {
                0% { transform: rotate(10deg) scaleX(1); opacity: 0.5; }
                100% { transform: rotate(-10deg) scaleX(1.2); opacity: 0.8; }
            }
            @keyframes fadeStageIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes zoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    // 3. INJECT HTML
    if (!document.getElementById('awards-stage')) {
        const html = `
            <div id="awards-trigger" title="Lễ Trao Giải">
                <i data-lucide="trophy" class="text-white w-8 h-8"></i>
            </div>

            <div id="awards-stage">
                <div class="close-stage"><i data-lucide="x" class="w-10 h-10"></i></div>
                
                <!-- Background Lights -->
                <div class="spotlight-beam spotlight-left"></div>
                <div class="spotlight-beam spotlight-center"></div>
                <div class="spotlight-beam spotlight-right"></div>

                <!-- Intro Screen -->
                <div id="intro-screen" class="intro-screen">
                    <div class="intro-title">THE GOLDEN BUG<br>AWARDS 2025</div>
                    <p class="text-xl text-slate-300">Chào mừng đến với đêm vinh danh những sai lầm...</p>
                    <p class="text-sm text-slate-500 mt-4">(Nhấn 'Bắt đầu' hoặc phím Mũi tên phải)</p>
                </div>

                <!-- Award Content -->
                <div id="award-container" class="award-content" style="display: none;">
                    <div class="award-category">Hạng Mục</div>
                    <div id="award-title" class="award-title">Loading...</div>
                    
                    <div id="winner-box" class="winner-reveal-box">
                        <img id="winner-img" src="" class="winner-avatar" alt="Winner">
                        <div id="winner-name" class="winner-name">???</div>
                        <div id="winner-desc" class="winner-desc">...</div>
                    </div>
                </div>

                <div class="stage-controls">
                    <button id="prev-slide" class="stage-btn">Previous</button>
                    <button id="next-slide" class="stage-btn primary">Next / Reveal</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 4. LOGIC ĐIỀU KHIỂN
    const stage = document.getElementById('awards-stage');
    const introScreen = document.getElementById('intro-screen');
    const awardContainer = document.getElementById('award-container');
    const awardTitle = document.getElementById('award-title');
    const winnerBox = document.getElementById('winner-box');
    const winnerName = document.getElementById('winner-name');
    const winnerImg = document.getElementById('winner-img');
    const winnerDesc = document.getElementById('winner-desc');
    const nextBtn = document.getElementById('next-slide');
    const prevBtn = document.getElementById('prev-slide');
    const triggerBtn = document.getElementById('awards-trigger');
    const closeBtn = document.querySelector('.close-stage');

    let state = 'intro'; // intro -> title -> winner
    
    // Mở sân khấu
    triggerBtn.addEventListener('click', () => {
        stage.classList.add('active');
        resetShow();
    });

    // Đóng sân khấu
    closeBtn.addEventListener('click', () => {
        stage.classList.remove('active');
    });

    const resetShow = () => {
        currentSlide = -1;
        state = 'intro';
        introScreen.style.display = 'block';
        awardContainer.style.display = 'none';
        nextBtn.innerText = "Bắt đầu";
    };

    const showAwardTitle = (index) => {
        state = 'title';
        introScreen.style.display = 'none';
        awardContainer.style.display = 'block';
        winnerBox.classList.remove('revealed'); // Ẩn người thắng
        awardContainer.classList.remove('show');
        
        // Cập nhật nội dung
        awardTitle.innerText = awards[index].title;
        
        // Hiệu ứng Fade In
        setTimeout(() => awardContainer.classList.add('show'), 50);
        
        // Âm thanh trống dồn (Tạo kịch tính)
        drumAudio.currentTime = 0;
        drumAudio.play().catch(() => {});
        
        nextBtn.innerText = "Công bố người thắng";
    };

    const revealWinner = (index) => {
        state = 'winner';
        const data = awards[index];
        
        winnerName.innerText = data.winner;
        winnerDesc.innerText = `"${data.desc}"`;
        winnerImg.src = data.avatar;
        
        winnerBox.classList.add('revealed');
        
        // Dừng trống, phát tiếng vỗ tay
        drumAudio.pause();
        clapAudio.currentTime = 0;
        clapAudio.play().catch(() => {});

        // Bắn pháo hoa tưng bừng
        if (window.confetti) {
            var end = Date.now() + 1000;
            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#facc15', '#ffffff'] // Vàng Gold
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#facc15', '#ffffff']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }

        nextBtn.innerText = "Giải tiếp theo >>";
    };

    // Nút Next (Logic chính)
    const handleNext = () => {
        if (state === 'intro') {
            currentSlide = 0;
            showAwardTitle(currentSlide);
        } else if (state === 'title') {
            revealWinner(currentSlide);
        } else if (state === 'winner') {
            currentSlide++;
            if (currentSlide < awards.length) {
                showAwardTitle(currentSlide);
            } else {
                alert("Hết giải rồi! Đi nhậu thôi!");
                stage.classList.remove('active');
            }
        }
    };

    const handlePrev = () => {
        if (state === 'winner') {
            // Quay lại chỉ hiện title
            showAwardTitle(currentSlide);
        } else if (state === 'title') {
            currentSlide--;
            if (currentSlide >= 0) {
                // Quay lại người thắng của giải trước
                showAwardTitle(currentSlide); // Hack xíu: hiện title trước rồi hiện winner sau cũng được
                revealWinner(currentSlide);
            } else {
                resetShow();
            }
        }
    };

    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);

    // Hỗ trợ phím mũi tên (Cho MC chuyên nghiệp)
    document.addEventListener('keydown', (e) => {
        if (!stage.classList.contains('active')) return;
        if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') stage.classList.remove('active');
    });
}

// --- 13. TRUNG TÂM GIẢI TRÍ (GAME CENTER) ---
function initGameCenter() {
    // 1. INJECT CSS
    const styleId = 'game-center-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Nút kích hoạt (Tay cầm Game) */
            #game-trigger {
                position: fixed; bottom: 20px; left: 160px; /* Xếp sau Cúp vàng */
                width: 60px; height: 60px;
                background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 0 25px rgba(139, 92, 246, 0.6); z-index: 999;
                border: 3px solid rgba(255,255,255,0.2); transition: transform 0.3s;
            }
            #game-trigger:hover { transform: scale(1.15) rotate(15deg); }

            /* Modal Game Center */
            #game-modal {
                position: fixed; inset: 0;
                background: rgba(2, 6, 23, 0.95);
                backdrop-filter: blur(20px);
                z-index: 4000; /* Cao nhất */
                display: none; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.4s ease;
            }
            #game-modal.open { display: flex; opacity: 1; }

            /* Tiêu đề */
            .game-center-title {
                font-family: 'JetBrains Mono', monospace;
                font-size: 3rem; font-weight: 900;
                text-transform: uppercase; letter-spacing: 5px;
                background: linear-gradient(to right, #c084fc, #22d3ee);
                -webkit-background-clip: text; color: transparent;
                margin-bottom: 3rem; text-shadow: 0 0 30px rgba(192, 132, 252, 0.5);
                text-align: center;
            }

            /* Container thẻ game */
            .game-cards-container {
                display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;
                width: 90%; max-width: 1200px;
            }

            /* Thẻ Game (Card) */
            .game-card {
                position: relative; width: 300px; height: 420px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px; overflow: hidden;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
                display: flex; flex-direction: column;
            }
            
            .game-card:hover {
                transform: translateY(-10px) scale(1.02);
                border-color: var(--theme-color);
                box-shadow: 0 20px 50px -10px var(--shadow-color);
            }

            /* Ảnh minh họa game (Placeholder) */
            .game-thumb {
                height: 180px; width: 100%;
                background: var(--bg-gradient);
                display: flex; align-items: center; justify-content: center;
                color: white; font-size: 4rem;
            }

            .game-info {
                padding: 20px; flex-grow: 1; display: flex; flex-direction: column;
            }

            .game-title {
                font-size: 1.5rem; font-weight: bold; color: white; margin-bottom: 10px;
                font-family: 'Outfit', sans-serif;
            }

            .game-desc {
                font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin-bottom: 20px;
                flex-grow: 1;
            }

            .play-btn {
                padding: 12px; width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--theme-color);
                color: var(--theme-color);
                border-radius: 10px; font-weight: bold; text-transform: uppercase;
                transition: all 0.3s;
            }
            .game-card:hover .play-btn {
                background: var(--theme-color);
                color: #0f172a;
                box-shadow: 0 0 20px var(--shadow-color);
            }

            /* Themes màu cho từng game */
            .theme-survival { --theme-color: #10b981; --shadow-color: rgba(16, 185, 129, 0.4); --bg-gradient: linear-gradient(135deg, #064e3b, #10b981); }
            .theme-casino { --theme-color: #f59e0b; --shadow-color: rgba(245, 158, 11, 0.4); --bg-gradient: linear-gradient(135deg, #78350f, #f59e0b); }
            .theme-monopoly { --theme-color: #3b82f6; --shadow-color: rgba(59, 130, 246, 0.4); --bg-gradient: linear-gradient(135deg, #1e3a8a, #3b82f6); }

            .close-game {
                position: absolute; top: 30px; right: 30px;
                color: #64748b; cursor: pointer; padding: 10px;
                transition: color 0.2s;
            }
            .close-game:hover { color: white; }
        `;
        document.head.appendChild(style);
    }

    // 2. INJECT HTML
    if (!document.getElementById('game-modal')) {
        const html = `
            <div id="game-trigger" title="Game Center">
                <i data-lucide="gamepad-2" class="text-white w-8 h-8"></i>
            </div>

            <div id="game-modal">
                <div class="close-game"><i data-lucide="x" class="w-10 h-10"></i></div>
                <h2 class="game-center-title">Arcade Zone</h2>
                
                <div class="game-cards-container">
                    
                    <!-- Game 1: Đảo Hoang -->
                    <div class="game-card theme-survival" onclick="selectGame('survival')">
                        <div class="game-thumb"><i data-lucide="tent-tree"></i></div>
                        <div class="game-info">
                            <h3 class="game-title">Đại Chiến Đảo Hoang</h3>
                            <p class="game-desc">Mô phỏng sinh tồn cực bựa. Drama, phản bội và những cái chết lãng xẹt đang chờ đợi.</p>
                            <button class="play-btn">Bắt đầu</button>
                        </div>
                    </div>

                    <!-- Game 2: Sòng Bài -->
                    <div class="game-card theme-casino" onclick="selectGame('casino')">
                        <div class="game-thumb"><i data-lucide="dices"></i></div>
                        <div class="game-info">
                            <h3 class="game-title">Sòng Bài Hoàng Gia</h3>
                            <p class="game-desc">Đua ngựa, Tài xỉu, Bầu cua. Nơi tình bạn rạn nứt vì tiền ảo.</p>
                            <button class="play-btn">Vào Sòng</button>
                        </div>
                    </div>

                    <!-- Game 3: Cờ Tỷ Phú -->
                    <div class="game-card theme-monopoly" onclick="selectGame('monopoly')">
                        <div class="game-thumb"><i data-lucide="landmark"></i></div>
                        <div class="game-info">
                            <h3 class="game-title">Cờ Tỷ Phú Tốc Độ</h3>
                            <p class="game-desc">Mua đất, xây nhà, thu tiền phạt. Ai sẽ là đại gia bất động sản?</p>
                            <button class="play-btn">Gieo Xúc Xắc</button>
                        </div>
                    </div>

                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 3. LOGIC ĐIỀU KHIỂN
    const modal = document.getElementById('game-modal');
    const trigger = document.getElementById('game-trigger');
    const closeBtn = document.querySelector('.close-game');

    // Mở Game Center
    triggerBtn.addEventListener('click', () => {
        alert("🚧 Khu vực đang được nâng cấp nên HK ẩn nó đi nhé!\n\n(Chức năng này sẽ sớm mở khóa, anh em chờ nhé!)");
    });

    // Đóng Game Center
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
    });

    window.selectGame = function(gameType) {
        
        // ------------------------------------------------
        // 1. GAME SINH TỒN (Survival) - File đơn
        // ------------------------------------------------
        if (gameType === 'survival') {
            const teamNames = ["Minh", "Hùng", "Lan", "Tuấn", "Hoàng"];
            
            // Hàm chạy game
            const runSurvival = () => {
                const game = new SurvivalGame(teamNames);
                window.survivalGame = game; 
                modal.classList.add('open');
                game.init(); 
            };

            // Nếu class đã tồn tại (do code gộp trong script.js hoặc đã load trước đó)
            if (typeof SurvivalGame !== 'undefined') {
                runSurvival();
            } else {
                // Nếu chưa có, thử load từ file rời (nếu bạn vẫn dùng file rời)
                // Lưu ý: Nếu bạn đã gộp code Survival vào script.js như turn trước thì không cần đoạn else này.
                console.warn("SurvivalGame Class chưa được định nghĩa.");
            }
        } 
        
        // ------------------------------------------------
        // 2. GAME CỜ TỶ PHÚ (Monopoly) - 4 File rời
        // ------------------------------------------------
        else if (gameType === 'monopoly') {
            // Kiểm tra xem hàm init đã có chưa
            if (typeof initMonopolyGame === 'function') {
                initMonopolyGame();
            } else {
                // CHƯA CÓ -> LOAD 4 FILE THEO THỨ TỰ
                // Data -> Core -> UI -> Controls
                const folder = 'games/monopoly/';
                const files = [
                    'monopoly-data.js', 
                    'monopoly-core.js', 
                    'monopoly-ui.js', 
                    'monopoly-controls.js'
                ];

                // Hàm hỗ trợ load script trả về Promise
                const loadScript = (filename) => {
                    return new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = folder + filename;
                        s.onload = () => {
                            console.log(`Đã tải: ${filename}`);
                            resolve();
                        };
                        s.onerror = () => reject(`Lỗi tải: ${filename}`);
                        document.head.appendChild(s);
                    });
                };

                // Chạy chuỗi Promise để load tuần tự
                // Phải load Data xong mới load Core, v.v...
                loadScript(files[0])
                    .then(() => loadScript(files[1]))
                    .then(() => loadScript(files[2]))
                    .then(() => loadScript(files[3]))
                    .then(() => {
                        // Load xong hết mới chạy game
                        if (typeof initMonopolyGame === 'function') {
                            initMonopolyGame();
                        } else {
                            alert("Đã tải file nhưng không tìm thấy hàm khởi tạo!");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("Không thể tải game. Kiểm tra lại đường dẫn thư mục 'games/monopoly/'");
                    });
            }
        } 
        
        else {
            alert("Trò chơi này đang được phát triển!");
        }
    };
}



































const csvData = `
    về,1477
    hk,1406
    lại,1
    tongtai,1062
    toi,938
    để,910
    nt,821
    má,790
    sao,780
    mn,765
    còn,759
    xong,753
    anti,745
    quá,730
    hong,719
    danh,717
    biệt,692
    nhma,670
    học,658
    thấy,645
    ụa,641
    đổi,638
    ròi,627
    ai,622
    dị,621
    ra,617
    dừng,599
    điiii,576
    ông,575
    mấy,557
    phải,545
    hả,541
    nên,530
    nào,524
    cấm,507
    oi,504
    mới,501
    với,499
    nè,481
    luôn,475
    bị,459
    tới,458
    hết,440
    sẽ,440
    nói,433
    như,427
    lên,423
    ủa,421
    thầy,418
    đang,405
    hay,402
    cx,393
    đúng,393
    chắc,393
    qua,390
    tổng,383
    chứ,380
    ơi,378
    kiểu,372
    thoi,365
    tài,365
    vô,364
    trong,357
    đc,350
    giờ,348
    ng,347
    qa,344
    hok,343
    mai,342
    ổng,341
    coi,332
    nữa,324
    lắm,324
    bà,324
    hơn,319
    khong,314
    môn,309
    thi,307
    tại,307
    dô,306
    th,305
    mk,304
    tính,302
    cần,300
    ngtuyen,293
    chỉ,288
    gr,286
    từ,283
    cả,282
    thêm,278
    nếu,276
    lớp,275
    nhiều,270
    ngày,270
    ta,269
    đề,268
    đồ,267
    sau,266
    không,256
    biết,253
    nghĩ,252
    chx,250
    nhớ,248
    nhà,248
    đọc,244
    file,243
    câu,239
    dẫy,239
    vs,238
    hỏi,236
    ýe,235
    tn,235
    biet,232
    gòi,232
    lần,231
    khó,229
    thiệt,228
    muốn,228
    nghe,226
    đầu,222
    vậy,220
    thử,220
    một,219
    vẫn,217
    khi,216
    khác,215
    tự,215
    gửi,214
    code,213
    thể,210
    chơi,209
    omg,207
    đoàn,207
    thôi,207
    xao,206
    chung,206
    sợ,204
    dữ,204
    bài,203
    nhóm,203
    đủ,202
    cô,200
    đặt,195
    lý,194
    chạy,194
    ms,193
    ôn,191
    đứa,191
    điểm,191
    khom,190
    bt,190
    đây,189
    hiểu,187
    nma,187
    ảnh,186
    tưởng,186
    nx,185
    theo,185
    báo,184
    dậy,184
    quên,182
    oop,182
    sáng,182
    vì,182
    ấy,180
    nay,178
    dc,178
    trước,177
    tụi,177
    nhỏ,176
    dễ,174
    ok,174
    bên,173
    lấy,173
    nghĩa,170
    lúc,170
    kia,167
    triêm,167
    hình,167
    dou,165
    kêu,165
    nhau,165
    bữa,164
    định,164
    hồi,163
    dì,162
    troi,162
    luon,161
    tr,159
    nãy,158
    gọi,158
    năm,158
    viết,157
    người,157
    ae,155
    dùng,152
    dừng lại,581
    lại điiii,576
    điiii đã,575
    này là,555
    của hk,517
    là của,505
    nt đổi,495
    danh này,494
    hk cấm,494
    cấm nt,494
    anti biệt,492
    đổi đã,490
    ý là,303
    tổng tài,279
    anti hk,242
    hk đã,196
    nt anti,192
    đã đặt,149
    có thể,145
    đặt biệt,140
    cái đó,139
    ko có,136
    gr này,128
    danh của,127
    mấy cái,126
    troi oi,119
    là cái,119
    là tui,117
    cái này,108
    có 1,101
    đồ án,95
    báo cáo,95
    hình như,84
    tui cũng,83
    cả nhà,82
    tui thấy,81
    ấy là,79
    1 cái,78
    của tui,77
    tui đi,73
    tui là,72
    cho tui,71
    nghĩa đoàn,70
    hong có,70
    ê tui,69
    bạn đã,69
    tui có,68
    thì tui,68
    có cái,67
    à à,66
    cuộc gọi,66
    ê mà,65
    chúng ta,65
    đó là,63
    tham gia,63
    tui làm,62
    triêm đoàn,59
    có j,59
    của mình,59
    tụi mk,59
    quỳnh anh,59
    nó sẽ,59
    kh có,59
    đã tham,59
    gia cuộc,59
    tui nghĩ,58
    mấy đứa,57
    ông triêm,57
    là sao,57
    tui ko,56
    là nó,56
    nó là,56
    làm cái,55
    tr oi,55
    đi học,55
    cái j,55
    cái nào,54
    có gì,54
    ngọc tuyền,53
    thể là,53
    nên là,53
    khó lói,52
    cái gr,52
    cái gì,52
    mà tui,51
    hà đăng,51
    để tui,51
    thì phải,51
    đi chơi,51
    ghim một,51
    một tin,51
    thì nó,50
    cỡ đó,50
    là 1,50
    ê nha,50
    làm gì,49
    luôn á,49
    tui cx,49
    tai sao,49
    sao lai,49
    lai anti,49
    hk the,49
    the mn,49
    google com,49
    cho nó,49
    mn đã,49
    còn lại,48
    lê ngọc,48
    cũng có,48
    đăng khôi,48
    thư ký,48
    là có,48
    cô ấy,48
    có ai,48
    1 lần,47
    đi ngủ,46
    á hả,46
    mà nó,46
    2 cái,46
    nó có,46
    chúng toi,45
    anh ấy,45
    ôn thi,44
    đã gửi,43
    chưa có,43
    có khi,43
    j đó,43
    của cô,43
    gì đó,42
    chx có,42
    của anh,42
    nghĩ là,42
    cái file,42
    mình là,42
    đã đã,42
    a2 tui,42
    nghiên cứu,41
    gửi một,41
    một file,41
    file đính,41
    đính kèm,41
    chủ tịch,41
    đâu có,41
    cũng đc,41
    lấy gốc,40
    mai quỳnh,40
    mọi người,40
    đi ăn,40
`; 


const quotes = [
    "Đây là tính năng, không phải lỗi.",
    "Hôm nay code chạy, ngày mai chưa biết.",
    "Thức đêm mới biết đêm dài, làm đồ án mới biết mình... sai ngành.",
    // "Thi xong buồn vì làm bài không được, nhưng nhìn sang cả khoa cũng thế... tự nhiên thấy vui.",
    "Đừng buồn vì mình làm không tốt, vì... có ai làm được đâu",
    "Nay OT nha.",
    "Chắc đề thi không có phần này đâu.",
    "Code chạy trên máy tui mà?",
    "Ngủ là cách debug hiệu quả nhất.",
    "Deadline là nguồn cảm hứng bất tận.",
    "kệ đi, đại đại đi."
];

const qaList = [
    { q: "Ngày thành lập group là ngày mấy?", a: "07/12/2025" },
    { q: "Group này chơi uno với nhau bao nhiêu lần rồi?", a: "3 lần" },
    { q: "Tên đầy đủ của nhóm này là gì?", a: "KidUS Unopia" },
    { q: "Trường cấp 2 cũ của NT tên gì?", a: "THCS Tân Hưng" },
    { q: "Ai là người đi sớm nhất group?", a: "Quỳnh Anh" },
    { q: "Ai là người sẽ bao nuôi cả nhóm nêu proj không sinh tiền?", a: "TongTai :3" },
    { q: "Ngày đầu chúng ta ngồi họp với nhau là ngày nào?", a: "21.12.2025" },
    { q: "Ai là người bị tuột quần trong lời kể của NT", a: "Hàm Triêm" },
    { q: "Ai là người có nhiều biệt danh nhất nhóm?", a: "Hà Khôi" },
];