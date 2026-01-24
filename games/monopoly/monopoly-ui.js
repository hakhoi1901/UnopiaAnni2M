/**
 * MODULE 3: GIAO DIỆN (VIEW)
 * Render bàn cờ, token người chơi và các modal tương tác.
 */

class MonopolyUI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.container = document.getElementById('game-modal');
        this.boardEl = null;
    }

    init() {
        this.container.innerHTML = `
            <div class="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
                <!-- Top Info Bar -->
                <div class="w-full max-w-6xl flex justify-between items-center mb-4 bg-slate-900/80 p-4 rounded-xl border border-white/10">
                    <div class="flex items-center gap-4">
                        <h1 class="text-2xl font-black text-amber-400 tracking-widest">MONOPOLY <span class="text-xs text-white bg-red-600 px-2 rounded">STUDENT</span></h1>
                        <div id="phase-badge" class="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase">Giai đoạn 1</div>
                        <div class="font-mono text-xl" id="timer">00:00</div>
                    </div>
                    <button onclick="window.monopolyGame.close()" class="p-2 hover:bg-white/10 rounded-full"><i data-lucide="x"></i></button>
                </div>

                <!-- Main Layout -->
                <div class="flex gap-6 w-full max-w-7xl h-[85vh]">
                    
                    <!-- LEFT: Board Game -->
                    <div class="relative flex-1 aspect-square bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl overflow-hidden p-2">
                        <div id="monopoly-board" class="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full">
                            <!-- JS sẽ render 24 ô vào đây -->
                        </div>
                        
                        <!-- Center Area (Dice & Info) -->
                        <div class="absolute inset-[14.28%] bg-slate-950 flex flex-col items-center justify-center p-8 border border-white/5 rounded-lg">
                            <div class="text-center mb-8">
                                <div class="text-slate-400 text-sm uppercase mb-2">Lượt của</div>
                                <div id="current-turn-name" class="text-3xl font-black text-white mb-4">...</div>
                                <div id="dice-area" class="flex gap-4 justify-center mb-6">
                                    <div class="dice w-16 h-16 bg-white text-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg">?</div>
                                    <div class="dice w-16 h-16 bg-white text-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg">?</div>
                                </div>
                                <button id="roll-btn" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform">GIEO XÚC XẮC</button>
                            </div>
                            
                            <!-- Logs nhỏ -->
                            <div id="mono-logs" class="w-full h-32 overflow-y-auto bg-black/40 rounded-lg p-2 font-mono text-xs text-slate-300 border border-white/5"></div>
                        </div>
                    </div>

                    <!-- RIGHT: Player List -->
                    <div class="w-80 bg-slate-900 rounded-xl border border-white/10 p-4 flex flex-col gap-4 overflow-y-auto" id="player-list">
                        <!-- Render Player Cards Here -->
                    </div>
                </div>
            </div>

            <!-- Modal Action (Mua đất) -->
            <div id="action-modal" class="fixed inset-0 z-[60] bg-black/80 hidden flex items-center justify-center backdrop-blur-sm">
                <div class="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-amber-500/30 shadow-2xl transform scale-100 transition-all text-center">
                    <h3 id="modal-title" class="text-2xl font-bold text-white mb-4">MUA ĐẤT?</h3>
                    <div id="modal-content" class="mb-6 text-slate-300">...</div>
                    <div class="flex gap-4 justify-center" id="modal-buttons">
                        <!-- Buttons injected here -->
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
        // Mapping index (0-23) to Grid positions (Row/Col)
        // Top: Row 1, Col 1->7 (Index 0-6)
        // Right: Col 7, Row 2->6 (Index 7-11)
        // Bottom: Row 7, Col 7->1 (Index 12-18)
        // Left: Col 1, Row 6->2 (Index 19-23)
        
        const posMap = [
            {r:1, c:1}, {r:1, c:2}, {r:1, c:3}, {r:1, c:4}, {r:1, c:5}, {r:1, c:6}, {r:1, c:7}, // Top
            {r:2, c:7}, {r:3, c:7}, {r:4, c:7}, {r:5, c:7}, {r:6, c:7}, // Right
            {r:7, c:7}, {r:7, c:6}, {r:7, c:5}, {r:7, c:4}, {r:7, c:3}, {r:7, c:2}, {r:7, c:1}, // Bottom
            {r:6, c:1}, {r:5, c:1}, {r:4, c:1}, {r:3, c:1}, {r:2, c:1} // Left
        ];

        map.forEach((tile, i) => {
            const pos = posMap[i];
            const el = document.createElement('div');
            el.className = `relative border border-slate-700 rounded flex flex-col items-center justify-between p-1 text-[10px] uppercase font-bold text-center select-none ${tile.color || 'bg-slate-800'}`;
            el.style.gridRow = pos.r;
            el.style.gridColumn = pos.c;
            el.id = `tile-${i}`;
            
            // Icon/Text content
            let content = `<div class="mt-1 truncate w-full px-1">${tile.name}</div>`;
            if (tile.price) content += `<div class="bg-black/40 px-1 rounded text-white">$${tile.price}</div>`;
            if (tile.icon && window.lucide) content += `<i data-lucide="${tile.icon}" class="w-4 h-4 mt-1 opacity-80"></i>`;
            
            // House Level Indicator (Dots)
            content += `<div class="flex gap-0.5 mt-auto mb-1 h-1 w-full justify-center" id="level-indicator-${i}"></div>`;

            // Player Token Container
            content += `<div class="absolute inset-0 flex items-center justify-center gap-1 flex-wrap p-2 pointer-events-none" id="tokens-${i}"></div>`;

            el.innerHTML = content;
            this.boardEl.appendChild(el);
        });
        if(window.lucide) window.lucide.createIcons();
    }

    update(game) {
        // 1. Update Timer & Phase
        const min = Math.floor(game.timeElapsed / 60).toString().padStart(2, '0');
        const sec = (game.timeElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${min}:${sec}`;
        
        const phase = game.getCurrentPhase();
        const badge = document.getElementById('phase-badge');
        badge.innerText = phase.name;
        badge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase ${phase.name === 'SUDDEN DEATH' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`;

        // 2. Update Players List
        const pList = document.getElementById('player-list');
        pList.innerHTML = game.players.map((p, i) => `
            <div class="p-3 rounded-lg border flex items-center justify-between ${p.isBankrupt ? 'opacity-50 grayscale bg-slate-950' : (game.turnIndex === i ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5')}">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style="background-color: ${p.color}">
                        ${p.name.charAt(0)}
                    </div>
                    <div>
                        <div class="font-bold text-sm ${p.isBankrupt ? 'line-through' : ''}">${p.name}</div>
                        ${p.isJailed ? '<span class="text-xs text-red-400">Đang thi lại...</span>' : ''}
                    </div>
                </div>
                <div class="font-mono text-emerald-400 font-bold">$${p.money}</div>
            </div>
        `).join('');

        // 3. Update Turn Info
        const currP = game.getCurrentPlayer();
        document.getElementById('current-turn-name').innerText = currP.name;
        document.getElementById('current-turn-name').style.color = currP.color;

        // 4. Update Logs
        const logBox = document.getElementById('mono-logs');
        logBox.innerHTML = game.logs.map(l => `<div class="mb-1"><span class="opacity-50">[${l.time}]</span> ${l.msg}</div>`).join('');
        logBox.scrollTop = 0;

        // 5. Update Board Tokens & Ownership
        game.board.forEach((tile, i) => {
            // Ownership border
            const el = document.getElementById(`tile-${i}`);
            
            // FIX: Kiểm tra tile.owner phải là số (ID người chơi) thì mới vẽ viền
            if (typeof tile.owner === 'number') {
                const ownerColor = game.players[tile.owner].color;
                el.style.borderColor = ownerColor;
                el.style.borderWidth = "3px";
                
                // House levels
                const indicators = document.getElementById(`level-indicator-${i}`);
                indicators.innerHTML = Array(tile.level).fill(`<div class="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>`).join('');
            } else {
                // Nếu không có chủ (hoặc reset), trả về viền mặc định
                el.style.borderColor = ""; 
                el.style.borderWidth = "1px";
                const indicators = document.getElementById(`level-indicator-${i}`);
                if (indicators) indicators.innerHTML = "";
            }

            // Tokens
            const tokenContainer = document.getElementById(`tokens-${i}`);
            tokenContainer.innerHTML = game.players
                .filter(p => p.position === i && !p.isBankrupt)
                .map(p => `<div class="w-4 h-4 rounded-full border border-white shadow-md transform transition-all" style="background-color: ${p.color};"></div>`)
                .join('');
        });

        // 6. Dice Visuals
        const diceEls = document.querySelectorAll('.dice');
        if (diceEls.length > 0) {
            diceEls[0].innerText = game.diceResult[0] || '?';
            diceEls[1].innerText = game.diceResult[1] || '?';
        }
    }

    showActionModal(title, msg, onConfirm, onCancel) {
        const modal = document.getElementById('action-modal');
        const titleEl = document.getElementById('modal-title');
        const contentEl = document.getElementById('modal-content');
        const btnsEl = document.getElementById('modal-buttons');

        titleEl.innerText = title;
        contentEl.innerHTML = msg;
        btnsEl.innerHTML = '';

        const yesBtn = document.createElement('button');
        yesBtn.className = "px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white";
        yesBtn.innerText = "CHỐT ĐƠN";
        yesBtn.onclick = () => { modal.classList.add('hidden'); onConfirm(); };
        btnsEl.appendChild(yesBtn);

        if (onCancel) {
            const noBtn = document.createElement('button');
            noBtn.className = "px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-bold text-white";
            noBtn.innerText = "BỎ QUA";
            noBtn.onclick = () => { modal.classList.add('hidden'); onCancel(); };
            btnsEl.appendChild(noBtn);
        }

        modal.classList.remove('hidden');
    }
}