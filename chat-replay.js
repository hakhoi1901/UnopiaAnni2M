/**
 * MODULE: CHAT REPLAY (DÒNG CHẢY KÝ ỨC) - FETCH VERSION
 * Tự động tải dữ liệu từ file 'chat_log.txt' để xử lý file lớn.
 * Đã thêm tính năng chọn ngày bắt đầu.
 */

class ChatReplay {
    constructor() {
        this.messages = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 2; 
        this.timer = null;
        this.colorMap = {}; 
        this.container = null;
    }

    init() {
        this.container = document.getElementById('chat-embed-container');
        if (!this.container) return; 

        this.injectStyles();
        this.renderInterface();
        this.loadData(); // <--- Gọi hàm tải dữ liệu file
    }

    // --- 1. TẢI VÀ XỬ LÝ DỮ LIỆU ---
    async loadData() {
        const statusEl = document.getElementById('chat-status');
        if (statusEl) statusEl.innerText = "Đang đọc file dữ liệu...";

        try {
            // Cố gắng tải file chat_log.txt
            const response = await fetch('/analysis/chat_log.txt');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            this.parseData(text);
            
            // Cập nhật giao diện sau khi tải xong
            if (statusEl) statusEl.innerText = "Sẵn sàng phát lại.";
            
            // Cập nhật số lượng tin nhắn
            const countDisplay = this.container.querySelector('.chat-header .font-mono.border');
            if (countDisplay) countDisplay.innerText = `Total: ${this.messages.length} msgs`;

            // Cập nhật khoảng ngày cho date picker
            this.updateDatePickerRange();

        } catch (error) {
            console.error("Lỗi tải chat_log.txt:", error);
            if (statusEl) {
                statusEl.innerText = "Lỗi: Không tìm thấy file chat_log.txt";
                statusEl.classList.add('text-red-400');
            }
            
            // Dữ liệu mẫu thông báo lỗi
            const errorData = `Thời gian;Hệ Thống;Nội dung
            00:00:00;System Alert;Không tìm thấy file 'chat_log.txt'.
            00:00:01;System Alert;Vui lòng tạo file chat_log.txt cùng thư mục với file index.html.
            00:00:02;System Alert;Copy nội dung chat vào file đó và tải lại trang.`;
            this.parseData(errorData);
        }
    }

    parseData(rawText) {
        const lines = rawText.trim().split('\n');
        this.messages = []; // Reset cũ
        
        // Bỏ qua dòng tiêu đề nếu có
        let startIndex = 0;
        if (lines.length > 0 && (lines[0].includes('Thời gian') || lines[0].includes('Người gửi'))) {
            startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(';');
            if (parts.length >= 3) {
                const time = parts[0].trim();
                const sender = parts[1].trim();
                // Ghép lại nội dung phòng trường hợp trong tin nhắn có dấu chấm phẩy
                const content = parts.slice(2).join(';').trim();
                
                this.messages.push({ time, sender, content });
                
                if (!this.colorMap[sender]) {
                    this.colorMap[sender] = this.getRandomColor();
                }
            }
        }
    }

    getRandomColor() {
        const colors = ['#f472b6', '#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#f87171', '#2dd4bf'];
        return colors[Object.keys(this.colorMap).length % colors.length];
    }

    updateDatePickerRange() {
        const dateInput = document.getElementById('chat-date-picker');
        if (!dateInput || this.messages.length === 0) return;

        // Lấy ngày đầu và ngày cuối từ dữ liệu
        // Giả sử định dạng time là YYYY-MM-DD HH:mm:ss
        const firstDate = this.messages[0].time.split(' ')[0];
        const lastDate = this.messages[this.messages.length - 1].time.split(' ')[0];

        dateInput.min = firstDate;
        dateInput.max = lastDate;
        dateInput.value = firstDate;
    }

    // --- 2. GIAO DIỆN ---
    injectStyles() {
        if (document.getElementById('chat-embed-style')) return;
        const style = document.createElement('style');
        style.id = 'chat-embed-style';
        style.textContent = `
            /* Layout Chat Full Height */
            .chat-interface {
                display: flex; flex-direction: column;
                height: 100%; width: 100%;
                background: rgba(15, 23, 42, 0.6);
            }

            .chat-header {
                padding: 16px 24px;
                background: rgba(255, 255, 255, 0.03);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex; justify-content: space-between; align-items: center;
                backdrop-filter: blur(5px);
            }

            .chat-body {
                flex: 1; padding: 20px 40px;
                overflow-y: auto;
                display: flex; flex-direction: column; gap: 16px;
                scroll-behavior: smooth;
                background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 20px 20px;
            }
            
            /* Thanh cuộn đẹp */
            .chat-body::-webkit-scrollbar { width: 8px; }
            .chat-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
            .chat-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            .chat-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

            .chat-message {
                display: flex; gap: 16px;
                animation: msgSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                opacity: 0; transform: translateX(-20px);
                max-width: 80%;
            }
            
            .msg-avatar {
                width: 44px; height: 44px; border-radius: 12px;
                background: #1e293b; border: 2px solid;
                flex-shrink: 0; display: flex; align-items: center; justify-content: center;
                overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .msg-avatar img { width: 100%; height: 100%; object-fit: cover; }

            .msg-content-wrapper { display: flex; flex-direction: column; gap: 4px; }
            
            .msg-meta { font-size: 11px; opacity: 0.6; margin-left: 2px; font-family: monospace; }
            .msg-sender { font-weight: bold; font-size: 13px; margin-right: 8px; }
            
            .msg-bubble {
                padding: 12px 18px;
                border-radius: 4px 20px 20px 20px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.05);
                color: #f1f5f9;
                font-size: 15px;
                line-height: 1.5;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .chat-controls {
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.4);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex; gap: 12px; justify-content: space-between; align-items: center;
                backdrop-filter: blur(10px);
                flex-wrap: wrap;
            }

            .controls-left, .controls-right {
                display: flex; align-items: center; gap: 12px;
            }

            .ctrl-btn {
                padding: 6px 12px; border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                color: #94a3b8; font-size: 12px; font-weight: bold; font-family: monospace;
                cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
            }
            .ctrl-btn:hover { background: rgba(255, 255, 255, 0.2); color: white; }
            .ctrl-btn.active { background: #06b6d4; color: black; box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }
            
            .play-pause { 
                width: 48px; height: 48px; border-radius: 50%; 
                display: flex; align-items: center; justify-content: center; 
                background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                color: white; box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
                transition: transform 0.2s;
            }
            .play-pause:hover { transform: scale(1.1); }
            .play-pause:active { transform: scale(0.95); }

            .date-picker-wrapper {
                display: flex; align-items: center; gap: 8px;
                background: rgba(255,255,255,0.05); padding: 4px 10px; rounded-lg; border: 1px solid rgba(255,255,255,0.1);
            }
            input[type="date"] {
                background: transparent; border: none; color: #e2e8f0; font-family: monospace; font-size: 12px;
                outline: none; cursor: pointer;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                filter: invert(1); cursor: pointer;
            }

            @keyframes msgSlideIn { to { opacity: 1; transform: translateX(0); } }
        `;
        document.head.appendChild(style);
    }

    renderInterface() {
        this.container.innerHTML = `
            <div class="chat-interface">
                <div class="chat-header">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-pink-500/20 rounded-lg"><i data-lucide="history" class="text-pink-400"></i></div>
                        <div>
                            <h3 class="font-bold text-white text-base">Biên Bản Cuộc Họp</h3>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p class="text-xs text-slate-400 font-mono" id="chat-status">Đang kết nối...</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-xs text-slate-500 font-mono border border-slate-700 px-3 py-1 rounded-full">
                        Loading...
                    </div>
                </div>
                
                <div class="chat-body" id="chat-body">
                    <div class="text-center text-slate-600 text-xs italic mt-10 mb-10 opacity-50">
                        --- Bắt đầu tua ngược thời gian ---
                    </div>
                </div>

                <div class="chat-controls">
                    <div class="controls-left">
                        <div class="date-picker-wrapper">
                            <span class="text-[10px] text-slate-400 uppercase font-bold">Jump to:</span>
                            <input type="date" id="chat-date-picker" onchange="window.chatReplay.jumpToDate(this.value)">
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <div class="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                            <button class="ctrl-btn" onclick="window.chatReplay.setSpeed(1)">1x</button>
                            <button class="ctrl-btn active" onclick="window.chatReplay.setSpeed(2)">2x</button>
                            <button class="ctrl-btn" onclick="window.chatReplay.setSpeed(5)">5x</button>
                            <button class="ctrl-btn" onclick="window.chatReplay.setSpeed(10)">10x</button>
                        </div>

                        <button class="play-pause" id="chat-play-btn" onclick="window.chatReplay.togglePlay()">
                            <i data-lucide="play" fill="currentColor" class="w-5 h-5 ml-1"></i>
                        </button>
                    </div>

                    <div class="controls-right">
                        <button class="ctrl-btn bg-slate-800 text-slate-400 hover:text-white" onclick="window.chatReplay.reset()">
                            <i data-lucide="rotate-ccw" class="w-3 h-3 mr-1 inline"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- 3. LOGIC HOẠT ĐỘNG ---

    jumpToDate(dateString) {
        if (!dateString) return;
        
        // Tìm tin nhắn đầu tiên có ngày >= ngày chọn
        // Format time trong log: "2025-12-07 21:04:22"
        const index = this.messages.findIndex(m => m.time.startsWith(dateString) || m.time > dateString);
        
        if (index !== -1) {
            this.pause();
            this.currentIndex = index;
            
            const body = document.getElementById('chat-body');
            body.innerHTML = `<div class="text-center text-cyan-500/50 text-xs italic my-6 p-2 border-y border-cyan-500/20 bg-cyan-500/5">--- Nhảy tới ngày ${dateString} ---</div>`;
            
            document.getElementById('chat-status').innerText = `Đã nhảy tới ${dateString}. Nhấn Play để xem.`;
            
            // Render thử 1 tin nhắn để preview
            this.renderMessage(this.messages[index]);
            this.currentIndex++; // Tăng index để khi play thì chạy tin tiếp theo
        } else {
            alert(`Không tìm thấy tin nhắn nào sau ngày ${dateString}`);
        }
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    play() {
        if (this.messages.length === 0) {
            alert("Chưa có dữ liệu chat để phát! Hãy kiểm tra file chat_log.txt");
            return;
        }
        this.isPlaying = true;
        document.getElementById('chat-play-btn').innerHTML = `<i data-lucide="pause" fill="currentColor" class="w-5 h-5"></i>`;
        document.getElementById('chat-status').innerText = `Đang phát (Tốc độ ${this.speed}x)...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        this.loop();
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.timer);
        document.getElementById('chat-play-btn').innerHTML = `<i data-lucide="play" fill="currentColor" class="w-5 h-5 ml-1"></i>`;
        document.getElementById('chat-status').innerText = `Tạm dừng`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    reset() {
        this.pause();
        this.currentIndex = 0;
        const body = document.getElementById('chat-body');
        body.innerHTML = '<div class="text-center text-slate-600 text-xs italic mt-10 mb-10 opacity-50">--- Bắt đầu tua ngược thời gian ---</div>';
        document.getElementById('chat-status').innerText = `Đã reset.`;
    }

    setSpeed(val) {
        this.speed = val;
        const btns = document.querySelectorAll('.chat-controls .ctrl-btn');
        btns.forEach(b => {
            if (b.innerText === `${val}x`) b.classList.add('active');
            else b.classList.remove('active');
        });
        document.getElementById('chat-status').innerText = `Speed set to ${this.speed}x`;
    }

    loop() {
        if (!this.isPlaying) return;
        if (this.currentIndex >= this.messages.length) {
            this.pause();
            document.getElementById('chat-status').innerText = "Đã hết nội dung.";
            return;
        }

        const msg = this.messages[this.currentIndex];
        this.renderMessage(msg);
        this.currentIndex++;

        // Tính toán độ trễ thông minh
        const wordCount = msg.content.split(' ').length;
        const baseDelay = 600; 
        const readTime = wordCount * 50; 
        const delay = (baseDelay + readTime) / this.speed;

        this.timer = setTimeout(() => this.loop(), delay);
    }

    renderMessage(msg) {
        const container = document.getElementById('chat-body');
        const color = this.colorMap[msg.sender];
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.sender)}`;

        const div = document.createElement('div');
        div.className = 'chat-message';
        div.innerHTML = `
            <div class="msg-avatar" style="border-color: ${color}">
                <img src="${avatarUrl}" alt="${msg.sender.charAt(0)}">
            </div>
            <div class="msg-content-wrapper">
                <div class="msg-meta">
                    <span class="msg-sender" style="color: ${color}">${msg.sender}</span>
                    <span>${msg.time}</span>
                </div>
                <div class="msg-bubble" style="border-left: 3px solid ${color}">${msg.content}</div>
            </div>
        `;

        container.appendChild(div);
        
        // Auto scroll
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
}

// Khởi tạo
window.chatReplay = new ChatReplay();
document.addEventListener('DOMContentLoaded', () => {
    window.chatReplay.init();
});