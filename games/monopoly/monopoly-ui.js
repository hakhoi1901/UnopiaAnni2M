/**
 * MODULE 3: GIAO DIỆN (VIEW) - ENHANCED EDITION
 * Thiết kế Boardgame hiện đại, Token Avatar, 3D Dice và hiệu ứng dòng tiền.
 */

class MonopolyUI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.container = document.getElementById('game-modal');
        this.boardEl = null;
        this.prevMoney = {}; // Theo dõi tiền để hiện hiệu ứng bay
        this.playerIcons = ['crown', 'zap', 'ghost', 'heart', 'star']; // Icon đại diện cho từng player
    }

    init() {
        // 1. INJECT STYLE (CSS Nâng cao)
        const styleId = 'monopoly-enhanced-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* --- BOARD STYLES --- */
                .tile-card {
                    display: flex; flex-direction: column; 
                    height: 100%; width: 100%;
                    border-radius: 6px; overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: #0f172a;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    position: relative;
                    transition: transform 0.2s;
                }
                .tile-header { height: 25%; width: 100%; transition: filter 0.2s; }
                .tile-body { height: 75%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 2px 4px; }
                
                /* Corner Tiles */
                .tile-corner { 
                    height: 100%; width: 100%; 
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #1e293b; border-radius: 12px;
                    border: 2px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                }
                .tile-corner-icon { opacity: 0.2; position: absolute; transform: scale(3) rotate(-15deg); }
                
                /* Level Icons */
                .level-icon { filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
                .level-glow { filter: drop-shadow(0 0 8px #facc15); animation: pulse 2s infinite; }

                /* --- TOKEN AVATARS --- */
                .player-token {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    border: 2px solid white;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    font-weight: bold;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    z-index: 10;
                }
                .player-token.active-turn {
                    transform: scale(1.3) translateY(-10px);
                    z-index: 50;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.6);
                    border-color: #facc15;
                }
                .token-badge {
                    width: 12px; height: 12px; border-radius: 50%;
                    position: absolute; bottom: -2px; right: -2px;
                    border: 1px solid white;
                }

                /* --- FLOATING TEXT --- */
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
                }
                .float-money {
                    position: absolute; font-weight: 900; font-size: 14px;
                    pointer-events: none; z-index: 100;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    animation: floatUp 1.5s ease-out forwards;
                }

                /* --- 3D DICE --- */
                .dice-wrapper { perspective: 600px; width: 60px; height: 60px; }
                .dice-cube {
                    width: 100%; height: 100%;
                    position: relative; transform-style: preserve-3d;
                    transition: transform 0.5s ease-out;
                }
                .dice-face {
                    position: absolute; width: 60px; height: 60px;
                    background: white; border-radius: 10px;
                    border: 1px solid #ccc;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px; font-weight: bold; color: #333;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
                }
                .df-1 { transform: translateZ(30px); }
                .df-2 { transform: rotateY(180deg) translateZ(30px); }
                .df-3 { transform: rotateY(-90deg) translateZ(30px); }
                .df-4 { transform: rotateY(90deg) translateZ(30px); }
                .df-5 { transform: rotateX(-90deg) translateZ(30px); }
                .df-6 { transform: rotateX(90deg) translateZ(30px); }
                
                .shake-animation { animation: shake 0.5s infinite; }
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    25% { transform: translate(-1px, -2px) rotate(-1deg); }
                    50% { transform: translate(-3px, 0px) rotate(1deg); }
                    75% { transform: translate(3px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -1px) rotate(-1deg); }
                }

                /* --- CENTER BACKGROUND --- */
                .center-bg {
                    background-image: radial-gradient(#334155 1px, transparent 1px), radial-gradient(#334155 1px, transparent 1px);
                    background-position: 0 0, 10px 10px;
                    background-size: 20px 20px;
                    opacity: 0.3;
                }
            `;
            document.head.appendChild(style);
        }

        // 2. MAIN HTML STRUCTURE
        this.container.innerHTML = `
            <div class="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
                <!-- Top Info Bar -->
                <div class="w-full max-w-6xl flex justify-between items-center mb-4 bg-slate-900/90 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <div class="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-amber-500/20">
                                <i data-lucide="landmark" class="w-6 h-6 text-slate-900"></i>
                            </div>
                            <h1 class="text-2xl font-black text-white tracking-widest font-mono">MONOPOLY</h1>
                        </div>
                        <div class="h-8 w-px bg-white/10 mx-2"></div>
                        <div id="phase-badge" class="px-4 py-1.5 bg-blue-600/20 border border-blue-500 rounded-full text-xs font-bold uppercase text-blue-400 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            Giai đoạn 1
                        </div>
                        <div class="font-mono text-xl text-slate-400" id="timer">00:00</div>
                    </div>
                    <button onclick="window.monopolyGame.close()" class="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group">
                        <i data-lucide="x" class="w-5 h-5 text-slate-400 group-hover:text-red-400"></i>
                    </button>
                </div>

                <!-- Main Layout -->
                <div class="flex gap-6 w-full max-w-7xl h-[85vh]">
                    
                    <!-- LEFT: Board Game -->
                    <div class="relative flex-1 aspect-square bg-slate-900 rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden p-1 ring-1 ring-white/10">
                        <!-- Grid 7x7 -->
                        <div id="monopoly-board" class="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full relative z-10">
                            <!-- JS render 24 ô -->
                        </div>
                        
                        <!-- Center Area -->
                        <div class="absolute inset-[14.28%] bg-slate-950/95 flex flex-col items-center justify-center p-6 border border-white/5 rounded-xl z-50 shadow-inner overflow-hidden">
                            <div class="absolute inset-0 center-bg"></div> <!-- Doodle BG -->
                            
                            <div class="relative z-10 w-full flex flex-col items-center">
                                <div class="text-slate-500 text-xs uppercase font-bold tracking-widest mb-4">Lượt của</div>
                                
                                <div id="current-player-display" class="flex items-center gap-3 mb-8 scale-110">
                                    <!-- Avatar & Name injected here -->
                                </div>

                                <!-- 3D Dice Area -->
                                <div id="dice-area" class="flex gap-6 justify-center mb-8">
                                    <div class="dice-wrapper"><div class="dice-cube" id="dice-1">
                                        <div class="dice-face df-1">1</div><div class="dice-face df-2">2</div><div class="dice-face df-3">3</div>
                                        <div class="dice-face df-4">4</div><div class="dice-face df-5">5</div><div class="dice-face df-6">6</div>
                                    </div></div>
                                    <div class="dice-wrapper"><div class="dice-cube" id="dice-2">
                                        <div class="dice-face df-1">1</div><div class="dice-face df-2">2</div><div class="dice-face df-3">3</div>
                                        <div class="dice-face df-4">4</div><div class="dice-face df-5">5</div><div class="dice-face df-6">6</div>
                                    </div></div>
                                </div>

                                <button id="roll-btn" class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-2xl font-black text-xl shadow-lg shadow-emerald-900/50 hover:-translate-y-1 transition-all active:scale-95 border-b-4 border-emerald-800 active:border-b-0 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <i data-lucide="dices"></i> Gieo Xúc Xắc
                                </button>
                            </div>
                            
                            <!-- Logs -->
                            <div id="mono-logs" class="w-full h-32 mt-6 overflow-y-auto bg-black/40 rounded-lg p-3 font-mono text-[11px] text-slate-300 border border-white/5 shadow-inner custom-scrollbar relative z-10"></div>
                        </div>
                    </div>

                    <!-- RIGHT: Dashboard -->
                    <div class="w-80 bg-slate-900 rounded-3xl border border-white/10 flex flex-col shadow-2xl overflow-hidden">
                        <div class="p-4 border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-slate-400 text-xs">
                            Bảng Xếp Hạng
                        </div>
                        <div class="flex-1 p-4 overflow-y-auto space-y-3" id="player-list">
                            <!-- Render Player Cards Here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL ACTION (SPLIT VIEW) -->
            <div id="action-modal" class="fixed inset-0 z-[60] bg-black/90 hidden flex items-center justify-center backdrop-blur-md animate-fadeIn">
                <div class="bg-slate-900 rounded-3xl max-w-2xl w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[400px]">
                    
                    <!-- LEFT: VISUAL -->
                    <div id="modal-visual" class="w-full md:w-5/12 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        <div class="absolute inset-0 opacity-10 pattern-grid"></div>
                        <div id="modal-icon-container" class="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 border-4 border-white/20 shadow-2xl">
                            <!-- Icon here -->
                        </div>
                        <h3 id="modal-title-left" class="text-2xl font-black text-white text-center uppercase leading-none">...</h3>
                        <p id="modal-group-name" class="text-xs font-bold opacity-60 mt-2 uppercase tracking-widest">...</p>
                    </div>

                    <!-- RIGHT: DATA & ACTIONS -->
                    <div class="w-full md:w-7/12 p-8 flex flex-col relative">
                        <h4 id="modal-action-title" class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Hành động</h4>
                        
                        <div id="modal-content" class="flex-1">
                            <!-- Dynamic Content -->
                        </div>

                        <div class="flex gap-3 mt-6 pt-4 border-t border-white/10" id="modal-buttons">
                            <!-- Buttons -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if(window.lucide) window.lucide.createIcons();
        this.boardEl = document.getElementById('monopoly-board');
        this.renderBoardGrid();
    }

    renderBoardGrid() {
        const map = window.MonopolyData.MAP;
        const posMap = [
            {r:1, c:1}, {r:1, c:2}, {r:1, c:3}, {r:1, c:4}, {r:1, c:5}, {r:1, c:6}, {r:1, c:7},
            {r:2, c:7}, {r:3, c:7}, {r:4, c:7}, {r:5, c:7}, {r:6, c:7},
            {r:7, c:7}, {r:7, c:6}, {r:7, c:5}, {r:7, c:4}, {r:7, c:3}, {r:7, c:2}, {r:7, c:1},
            {r:6, c:1}, {r:5, c:1}, {r:4, c:1}, {r:3, c:1}, {r:2, c:1}
        ];

        map.forEach((tile, i) => {
            const pos = posMap[i];
            const el = document.createElement('div');
            el.id = `tile-${i}`;
            
            // Layout chung
            el.style.gridRow = pos.r;
            el.style.gridColumn = pos.c;

            if (tile.type === 'LAND' || tile.type === 'START' || tile.type === 'TAX') {
                // THE PROPERTY CARD LOOK
                el.className = `tile-card group relative cursor-pointer hover:scale-105 hover:z-20`;
                
                // Color Header (25%)
                const header = document.createElement('div');
                header.className = `tile-header ${tile.color}`;
                el.appendChild(header);

                // Body (75%)
                const body = document.createElement('div');
                body.className = `tile-body bg-slate-900`;
                body.innerHTML = `
                    <div class="text-[9px] font-bold text-center leading-tight uppercase px-1 pt-1 text-slate-300 group-hover:text-white">${tile.name}</div>
                    
                    <div class="flex flex-col items-center gap-1 w-full">
                        <!-- Icon Level -->
                        <div id="level-icon-${i}" class="h-4 flex items-center justify-center"></div>
                        
                        <!-- Price -->
                        ${tile.price ? `<div class="text-[10px] font-mono text-emerald-400 font-bold">$${tile.price}</div>` : ''}
                    </div>
                `;
                el.appendChild(body);

                // Owner Overlay (Mờ)
                const overlay = document.createElement('div');
                overlay.id = `owner-overlay-${i}`;
                overlay.className = "absolute inset-0 bg-transparent transition-colors duration-300 pointer-events-none";
                el.appendChild(overlay);

            } else {
                // CORNER / EVENT TILES (Big Icon)
                el.className = `tile-corner group cursor-pointer hover:border-white/50`;
                el.innerHTML = `
                    <div class="tile-corner-icon text-white/10"><i data-lucide="${tile.icon}"></i></div>
                    <div class="relative z-10 flex flex-col items-center text-center p-1">
                        <i data-lucide="${tile.icon}" class="w-6 h-6 ${tile.color.replace('bg-', 'text-')} mb-1 drop-shadow-lg"></i>
                        <div class="text-[9px] font-black uppercase text-white leading-tight">${tile.name}</div>
                    </div>
                `;
                // Add Jail Overlay if needed
                if (tile.type === 'JAIL') {
                    const bars = document.createElement('div');
                    bars.className = "absolute inset-0 flex justify-evenly pointer-events-none opacity-30";
                    bars.innerHTML = `<div class="w-1 h-full bg-slate-400"></div>`.repeat(4);
                    el.appendChild(bars);
                }
            }

            // TOKEN CONTAINER (Chung cho tất cả)
            const tokenContainer = document.createElement('div');
            tokenContainer.id = `tokens-${i}`;
            tokenContainer.className = "absolute inset-0 flex items-center justify-center pointer-events-none z-30";
            el.appendChild(tokenContainer);

            this.boardEl.appendChild(el);
        });
        
        if(window.lucide) window.lucide.createIcons();
    }

    update(game) {
        // 1. UPDATE TIMER & PHASE
        const min = Math.floor(game.timeElapsed / 60).toString().padStart(2, '0');
        const sec = (game.timeElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${min}:${sec}`;
        
        const phase = game.getCurrentPhase();
        const badge = document.getElementById('phase-badge');
        badge.innerHTML = `<span class="w-2 h-2 rounded-full ${phase.name === 'SUDDEN DEATH' ? 'bg-red-500 animate-ping' : 'bg-blue-400'}"></span> ${phase.name}`;
        badge.className = `px-4 py-1.5 border rounded-full text-xs font-bold uppercase flex items-center gap-2 ${phase.name === 'SUDDEN DEATH' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-blue-600/20 border-blue-500 text-blue-400'}`;

        // 2. UPDATE PLAYERS LIST (DASHBOARD)
        const pList = document.getElementById('player-list');
        // Tìm người giàu nhất để tính progress bar
        const maxMoney = Math.max(...game.players.map(p => p.money)) || 1;

        pList.innerHTML = game.players.map((p, i) => {
            const iconName = this.playerIcons[i % this.playerIcons.length];
            const progress = Math.max(0, (p.money / maxMoney) * 100);
            
            // Check Money Change for Floating Text
            if (this.prevMoney[p.id] !== undefined && this.prevMoney[p.id] !== p.money) {
                const diff = p.money - this.prevMoney[p.id];
                this.spawnFloatingText(diff, p.id); // Gọi hàm tạo text bay
            }
            this.prevMoney[p.id] = p.money;

            return `
            <div class="relative bg-white/5 border ${game.turnIndex === i ? 'border-amber-400 bg-amber-400/5' : 'border-white/5'} rounded-xl p-3 transition-all">
                ${p.isJailed ? '<div class="absolute inset-0 bg-[url(https://www.transparenttextures.com/patterns/diagonal-stripes.png)] opacity-30 rounded-xl z-20 pointer-events-none"></div>' : ''}
                ${p.isBankrupt ? '<div class="absolute inset-0 bg-slate-950/80 rounded-xl z-30 flex items-center justify-center grayscale"><span class="text-red-500 font-black -rotate-12 border-2 border-red-500 px-2 uppercase text-xs">Phá Sản</span></div>' : ''}
                
                <div class="flex items-center gap-3 relative z-10">
                    <div class="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg shrink-0" style="background-color: ${p.color}">
                        <i data-lucide="${iconName}" class="w-5 h-5 text-white"></i>
                        <div id="float-anchor-${p.id}" class="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <span class="font-bold text-sm text-white truncate">${p.name}</span>
                            <span class="font-mono text-emerald-400 font-bold text-sm">$${p.money}</span>
                        </div>
                        <!-- Money Progress Bar -->
                        <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');

        // 3. UPDATE CENTER TURN DISPLAY
        const currP = game.getCurrentPlayer();
        const currIcon = this.playerIcons[game.turnIndex % this.playerIcons.length];
        const centerDisplay = document.getElementById('current-player-display');
        centerDisplay.innerHTML = `
            <div class="w-12 h-12 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white animate-bounce" style="background-color: ${currP.color}">
                <i data-lucide="${currIcon}" class="w-6 h-6"></i>
            </div>
            <div class="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg">${currP.name}</div>
        `;

        // 4. UPDATE BOARD TOKENS
        game.board.forEach((tile, i) => {
            const playersHere = game.players.filter(p => p.position === i && !p.isBankrupt);
            const tokenContainer = document.getElementById(`tokens-${i}`);
            
            // Logic Stacking: Active Player on Top + Big
            let html = '';
            playersHere.forEach(p => {
                const isActive = (game.turnIndex === p.id);
                const icon = this.playerIcons[p.id % this.playerIcons.length];
                const zIndex = isActive ? 50 : 10;
                const scale = isActive ? 'scale-125 -translate-y-2' : 'scale-90 opacity-90';
                
                html += `
                    <div class="player-token ${scale}" style="background-color: ${p.color}; z-index: ${zIndex}">
                        <i data-lucide="${icon}" class="w-4 h-4"></i>
                    </div>
                `;
            });
            tokenContainer.innerHTML = html;

            // Update Ownership Visuals
            if (tile.type === 'LAND') {
                const overlay = document.getElementById(`owner-overlay-${i}`);
                const levelIcon = document.getElementById(`level-icon-${i}`);
                
                if (typeof tile.owner === 'number') {
                    const ownerColor = game.players[tile.owner].color;
                    overlay.style.backgroundColor = ownerColor;
                    overlay.style.opacity = "0.2"; // Phủ màu mờ
                    document.getElementById(`tile-${i}`).style.borderColor = ownerColor;

                    // Update Level Icon
                    let iconName = "tent"; // Lv1
                    let iconColor = "text-white/70";
                    if (tile.level === 2) { iconName = "home"; iconColor = "text-white"; }
                    if (tile.level === 3) { iconName = "building-2"; iconColor = "text-yellow-400 level-glow"; }
                    
                    levelIcon.innerHTML = `<i data-lucide="${iconName}" class="w-3 h-3 ${iconColor}"></i>`;
                } else {
                    overlay.style.backgroundColor = "transparent";
                    document.getElementById(`tile-${i}`).style.borderColor = "rgba(255,255,255,0.1)";
                    levelIcon.innerHTML = "";
                }
            }
        });

        // 5. UPDATE DICE (Chỉ xoay mặt, không thay số)
        const d1 = game.diceResult[0] || 1;
        const d2 = game.diceResult[1] || 1;
        this.rotateDice('dice-1', d1);
        this.rotateDice('dice-2', d2);

        // 6. UPDATE LOGS (Colored)
        const logBox = document.getElementById('mono-logs');
        logBox.innerHTML = game.logs.map(l => {
            // Phân tích màu dựa trên nội dung log (Hack nhẹ vì core log chưa có type)
            let colorClass = "text-slate-300";
            if (l.msg.includes("thuê")) colorClass = "text-red-400";
            if (l.msg.includes("mua")) colorClass = "text-emerald-400";
            if (l.msg.includes("Phạt") || l.msg.includes("tù")) colorClass = "text-orange-400";
            
            return `<div class="mb-1.5 border-l-2 border-white/10 pl-2">
                <span class="opacity-40 text-[9px] mr-1">${l.time}</span> 
                <span class="${colorClass}">${l.msg}</span>
            </div>`
        }).join('');
        
        if(window.lucide) window.lucide.createIcons();
    }

    // Xoay xúc xắc 3D
    rotateDice(elementId, value) {
        const el = document.getElementById(elementId);
        if (!el) return;
        // Map value to rotation (X, Y)
        const rotations = {
            1: [0, 0],      // Front
            2: [0, 180],    // Back
            3: [0, -90],    // Right
            4: [0, 90],     // Left
            5: [-90, 0],    // Top
            6: [90, 0]      // Bottom
        };
        const [rx, ry] = rotations[value];
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    // Tạo text bay (Floating Text)
    spawnFloatingText(amount, playerId) {
        const anchor = document.getElementById(`float-anchor-${playerId}`);
        if (!anchor) return;

        const el = document.createElement('div');
        const isPositive = amount >= 0;
        el.innerText = isPositive ? `+$${amount}` : `-$${Math.abs(amount)}`;
        el.className = `float-money ${isPositive ? 'text-emerald-400' : 'text-red-500'}`;
        
        anchor.appendChild(el);
        
        // Tự xóa sau animation
        setTimeout(() => el.remove(), 1500);
    }

    // Modal Mua/Nâng cấp (Split Layout)
    showPropertyModal(type, tile, player, onConfirm, onCancel) {
        const modal = document.getElementById('action-modal');
        const modalTitleLeft = document.getElementById('modal-title-left');
        const modalGroupName = document.getElementById('modal-group-name');
        const modalVisual = document.getElementById('modal-visual');
        const modalIconContainer = document.getElementById('modal-icon-container');
        const modalContent = document.getElementById('modal-content');
        const modalButtons = document.getElementById('modal-buttons');

        modal.classList.remove('hidden');

        const isUpgrade = type === 'UPGRADE';
        const cost = isUpgrade ? Math.floor(tile.price * 0.5) : tile.price;
        const currentLevel = tile.level || 0;
        
        // 1. Setup Left Visual
        modalTitleLeft.innerText = tile.name;
        modalGroupName.innerText = isUpgrade ? "NÂNG CẤP CƠ SỞ" : "ĐẦU TƯ BẤT ĐỘNG SẢN";
        
        // Đổi màu nền theo nhóm đất
        const colorClass = tile.color ? tile.color.replace('bg-', '') : 'slate-500';
        modalVisual.className = `w-full md:w-5/12 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-${colorClass}/80 to-slate-900`;
        
        modalIconContainer.innerHTML = `<i data-lucide="${isUpgrade ? 'arrow-up-circle' : 'key'}" class="w-10 h-10 text-white"></i>`;

        // 2. Setup Right Data (So sánh Trước -> Sau)
        // Lấy thông tin level hiện tại và tiếp theo
        const curInfo = tile.levels[currentLevel];
        const nextInfo = tile.levels[currentLevel + 1];

        modalContent.innerHTML = `
            <div class="flex items-center justify-between gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 mb-4">
                <div class="text-center opacity-50">
                    <div class="text-[10px] uppercase">Hiện tại</div>
                    <div class="font-bold text-sm">${curInfo.name}</div>
                    <div class="text-xs font-mono">$${curInfo.rent} phạt</div>
                </div>
                
                <i data-lucide="arrow-right" class="w-6 h-6 text-white/20"></i>
                
                <div class="text-center">
                    <div class="text-[10px] uppercase text-emerald-400 font-bold">Nâng cấp</div>
                    <div class="font-black text-lg text-white">${nextInfo.name}</div>
                    <div class="text-sm font-mono text-emerald-400 font-bold">$${nextInfo.rent} phạt</div>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Chi phí đầu tư:</span>
                    <span class="text-amber-400 font-bold text-lg">$${cost}</span>
                </div>
                <div class="flex justify-between text-xs pt-2 border-t border-white/10">
                    <span class="text-slate-500">Ví tiền sau mua:</span>
                    <span class="text-white font-mono">$${player.money - cost}</span>
                </div>
            </div>
        `;

        // 3. Buttons
        modalButtons.innerHTML = '';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = "flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1";
        confirmBtn.innerHTML = `CHỐT ĐƠN <span class="block text-[9px] font-normal opacity-80">Còn $${player.money - cost}</span>`;
        confirmBtn.onclick = () => { modal.classList.add('hidden'); onConfirm(); };

        if (player.money < cost) {
            confirmBtn.disabled = true;
            confirmBtn.className = "flex-1 py-3 bg-slate-700 text-slate-500 font-bold rounded-xl cursor-not-allowed";
            confirmBtn.innerHTML = "KHÔNG ĐỦ TIỀN";
        }

        const cancelBtn = document.createElement('button');
        cancelBtn.className = "px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all";
        cancelBtn.innerText = "BỎ QUA";
        cancelBtn.onclick = () => { modal.classList.add('hidden'); onCancel(); };

        modalButtons.appendChild(cancelBtn);
        modalButtons.appendChild(confirmBtn);

        if(window.lucide) window.lucide.createIcons();
    }
}