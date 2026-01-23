/**
 * SURVIVAL GAME - ĐẠI CHIẾN ĐẢO HOANG (ADVANCED EDITION)
 * Logic: Turn-based Strategy + Deep Item System + Chaos RNG
 */

class SurvivalGame {
    constructor(playerNames) {
        // Đảm bảo đủ 5 slot (Thêm Bot nếu thiếu)
        this.playersRaw = [...playerNames];
        while (this.playersRaw.length < 5) {
            this.playersRaw.push(`Bot ${this.playersRaw.length + 1}`);
        }
        if (this.playersRaw.length > 5) this.playersRaw = this.playersRaw.slice(0, 5);

        // Khởi tạo State
        this.state = {
            day: 1,
            turnIndex: 0,
            weather: null,
            logs: [],
            isGameOver: false,
            isProcessing: false, // <--- FIX: Cờ khóa hành động khi đang chuyển cảnh
            winner: null,
            players: this.playersRaw.map((name, id) => ({
                id: id,
                name: name,
                hp: 100,
                sp: 100,
                inventory: [],
                status: 'normal', // normal, sleeping, stunned, invisible
                statusDuration: 0, // Đếm ngược lượt hiệu ứng
                isDead: false,
                isInsane: false,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`
            })),
            history: []
        };

        // --- 1. MA TRẬN VẬT PHẨM (EXPANDED ITEM DB) ---
        // rate: Tỉ lệ nhặt được (càng thấp càng hiếm)
        this.itemDB = [
            // --- NHÓM A: VŨ KHÍ (OFFENSE) ---
            { 
                id: 'w_sandal', name: 'Dép Lào Huyền Thoại', type: 'weapon', 
                val: 10, sp_dmg: 15, accuracy: 1.0, rate: 0.2, icon: 'footprints', 
                desc: 'Sát thương 10. Trừ 15 SP địch (Gây ức chế cực mạnh). Luôn trúng.' 
            },
            { 
                id: 'w_bat', name: 'Gậy Bóng Chày', type: 'weapon', 
                val: 25, accuracy: 0.8, rate: 0.15, icon: 'axe', 
                desc: 'Sát thương 25. Có 20% đánh trượt. Cẩn thận gãy gậy.' 
            },
            { 
                id: 'w_gun', name: 'Súng Lục (1 Viên)', type: 'weapon', 
                val: 999, accuracy: 0.3, rate: 0.05, icon: 'crosshair', 
                desc: 'Russian Roulette. 30% One-shot One-kill. 70% trượt & mất lượt.' 
            },
            { 
                id: 'w_paintball', name: 'Súng Sơn', type: 'weapon', 
                val: 5, sp_dmg: 30, accuracy: 0.9, rate: 0.15, icon: 'spray-can', 
                desc: 'Sát thương thấp nhưng làm nhục đối thủ (-30 SP).' 
            },
            { 
                id: 'w_keyboard', name: 'Bàn Phím Cơ', type: 'weapon', 
                val: 15, accuracy: 0.85, rate: 0.15, icon: 'keyboard', 
                desc: 'Sát thương 15. Gõ "Anh hùng bàn phím" vào đầu đối thủ.' 
            },

            // --- NHÓM B: HỒI PHỤC (SURVIVAL) ---
            { 
                id: 'f_noodle', name: 'Mì Tôm Hảo Hảo', type: 'heal', 
                hp: 20, sp: 10, rate: 0.25, icon: 'utensils', 
                desc: 'Hồi 20 HP, 10 SP. Món ăn quốc dân.' 
            },
            { 
                id: 'f_expired', name: 'Mì Tôm Hết Hạn', type: 'heal', 
                hp: 40, sp: 0, rate: 0.15, icon: 'skull', 
                desc: 'Hồi 40 HP nhưng 30% bị Tào Tháo đuổi (Mất lượt sau).' 
            },
            { 
                id: 'f_coffee', name: 'Cà Phê Đen Đá', type: 'heal', 
                hp: 0, sp: 50, rate: 0.15, icon: 'coffee', 
                desc: 'Hồi 50 SP. Tỉnh táo tàu để chạy deadline sinh tồn.' 
            },
            { 
                id: 'f_medkit', name: 'Hộp Cứu Thương', type: 'heal', 
                hp: 60, sp: 0, rate: 0.05, icon: 'briefcase-medical', 
                desc: 'Hồi 60 HP. Hàng hiếm.' 
            },

            // --- NHÓM C: CHIẾN THUẬT (TACTICAL) ---
            { 
                id: 't_cloak', name: 'Áo Mưa Rách', type: 'passive', 
                effect: 'dodge', val: 0.5, rate: 0.1, icon: 'shirt', 
                desc: 'Bị động: 50% né tránh mọi đòn đánh.' 
            },
            { 
                id: 't_horn', name: 'Loa Phóng Thanh', type: 'special', 
                effect: 'aoe_sp', val: 15, rate: 0.1, icon: 'megaphone', 
                desc: 'Hét vào mặt tất cả mọi người. Trừ 15 SP toàn bản đồ.' 
            },
            { 
                id: 't_trap', name: 'Bẫy Lego', type: 'trap', 
                val: 20, rate: 0.15, icon: 'lego', 
                desc: 'Rải Lego ra sàn. Kẻ tiếp theo hành động sẽ dẫm phải (-20 HP).' 
            },

            // --- NHÓM D: HỖN MANG (CHAOS/RNG) ---
            { 
                id: 'c_box', name: 'Hộp Mèo Schrödinger', type: 'chaos', 
                rate: 0.05, icon: 'box', 
                desc: 'Mở ra: 50% Hồi Full HP/SP, 50% Nổ tung còn 1 HP.' 
            },
            { 
                id: 'c_uno', name: 'Thẻ Uno Reverse', type: 'passive', 
                effect: 'reflect', rate: 0.05, icon: 'refresh-ccw', 
                desc: 'Bị động: Phản lại 100% sát thương cho kẻ tấn công (1 lần).' 
            },
            { 
                id: 'c_poison', name: 'Thuốc Độc Dược A', type: 'chaos', 
                rate: 0.05, icon: 'flask-conical', 
                desc: 'Uống vào: Hoán đổi chỉ số HP và SP cho nhau.' 
            }
        ];

        this.weatherTypes = [
            { name: "Nắng Đẹp", icon: "sun", color: "text-yellow-400", mod: { scavenge: 0.2, dmg: 1 } },
            { name: "Bão Tố", icon: "cloud-lightning", color: "text-purple-400", mod: { scavenge: -0.3, dmg: 1.3 } },
            { name: "Sương Mù", icon: "cloud-fog", color: "text-slate-400", mod: { scavenge: 0, dmg: 0, blind: true } }
        ];

        this.globalTrap = null; // Bẫy toàn cục (Lego)
        this.modalElement = document.getElementById('game-modal');
    }

    init() {
        if (!this.modalElement) return;
        this.startDay();
    }

    startDay() {
        this.state.history = [];
        this.globalTrap = null;
        this.state.isProcessing = false; // <--- FIX: Mở khóa hành động ngày mới
        
        // Reset status đầu ngày (trừ stunned nếu còn lượt)
        this.state.players.forEach(p => {
            if (!p.isDead) {
                if (p.status === 'sleeping') p.status = 'normal';
                if (p.status === 'stunned') {
                    p.statusDuration--;
                    if (p.statusDuration <= 0) {
                        p.status = 'normal';
                        this.log(`${p.name} đã tỉnh táo trở lại.`, 'info');
                    }
                }
            }
        });

        this.state.weather = this.weatherTypes[Math.floor(Math.random() * this.weatherTypes.length)];
        this.log(`BÌNH MINH NGÀY ${this.state.day}: Thời tiết ${this.state.weather.name}`, 'system');
        
        // <--- FIX: Bắt đầu tìm từ 0 thay vì -1 để tránh lỗi undefined array index
        this.state.turnIndex = this.getNextAliveIndex(0); 
        this.render();
    }

    close() {
        this.modalElement.classList.remove('open');
    }

    // --- LOGIC HÀNH ĐỘNG ---

    act(actionType, targetId = null) {
        // <--- FIX: Chặn click khi đang xử lý chuyển ngày hoặc game over
        if (this.state.isGameOver || this.state.isProcessing) return;

        const actor = this.state.players[this.state.turnIndex];
        
        // Check Stun (Mất lượt)
        if (actor.status === 'stunned') {
            this.log(`🚫 ${actor.name} đang bị đau bụng (hoặc choáng), không thể hành động!`, 'warning');
            this.nextTurn();
            return;
        }

        // Check Bẫy Lego (Người hành động đầu tiên dính)
        if (this.globalTrap && this.globalTrap.ownerId !== actor.id) {
            actor.hp -= this.globalTrap.val;
            this.log(`🦶 Ouch! ${actor.name} dẫm phải Bẫy Lego của ${this.globalTrap.ownerName}. -${this.globalTrap.val} HP.`, 'danger');
            this.globalTrap = null; // Bẫy đã kích hoạt
            if (actor.hp <= 0) {
                this.checkVitality();
                this.nextTurn();
                return;
            }
        }

        this.state.history.push({ actorId: actor.id, action: actionType, targetId: targetId });

        // Xử lý logic từng hành động
        switch (actionType) {
            case 'scavenge': this.handleScavenge(actor); break;
            case 'rest': this.handleRest(actor); break;
            case 'attack': this.handleAttack(actor, targetId); break;
            case 'use_item': this.handleUseItem(actor); break;
        }

        this.checkVitality();
        this.nextTurn();
    }

    handleScavenge(actor) {
        const chance = Math.random() + this.state.weather.mod.scavenge;
        
        if (chance > 0.5) {
            // Weighted Random Drop (Vật phẩm hiếm khó ra hơn)
            const totalRate = this.itemDB.reduce((sum, item) => sum + item.rate, 0);
            let random = Math.random() * totalRate;
            let item = this.itemDB[0];
            
            for (const it of this.itemDB) {
                random -= it.rate;
                if (random <= 0) {
                    item = it;
                    break;
                }
            }

            // Inventory Limit: 3 slot (Giới hạn cứng để tăng chiến thuật)
            if (actor.inventory.length >= 3) {
                const dropped = actor.inventory.shift();
                this.log(`${actor.name} vứt bỏ [${dropped.name}] để nhặt đồ mới.`, 'neutral');
            }
            
            actor.inventory.push(item);
            this.log(`${actor.name} tìm thấy <span class="text-yellow-300 font-bold">[${item.name}]</span>!`, 'success');
        } else if (chance < 0.2) {
            const dmg = 10;
            actor.hp -= dmg;
            this.log(`⚠️ ${actor.name} trượt chân té xuống hố. -${dmg} HP.`, 'danger');
        } else {
            this.log(`${actor.name} lục lọi thùng rác nhưng chỉ thấy vỏ kẹo.`, 'neutral');
        }
    }

    handleRest(actor) {
        // Tự động dùng đồ ăn nếu có
        const foodIdx = actor.inventory.findIndex(i => i.type === 'heal');
        let bonusText = "";
        
        if (foodIdx > -1) {
            const food = actor.inventory[foodIdx];
            actor.inventory.splice(foodIdx, 1);
            
            // Xử lý Mì tôm hết hạn
            if (food.id === 'f_expired') {
                if (Math.random() < 0.3) {
                    actor.status = 'stunned';
                    actor.statusDuration = 1;
                    bonusText = ` Nhưng mì hết hạn, ${actor.name} bị Tào Tháo đuổi (Mất lượt sau)!`;
                }
            }
            
            // Xử lý Hộp Mèo Schrödinger (Chaos)
            if (food.id === 'c_box') {
                if (Math.random() < 0.5) {
                    actor.hp = 100; actor.sp = 100;
                    this.log(`😺 ${actor.name} mở hộp mèo: Nhận được phước lành! Full HP/SP.`, 'success');
                } else {
                    actor.hp = 1;
                    this.log(`💣 ${actor.name} mở hộp mèo: BÙM! Chỉ còn 1 HP.`, 'danger');
                }
                return; // Kết thúc hành động đặc biệt này
            }

            // Xử lý Thuốc độc (Chaos)
            if (food.id === 'c_poison') {
                const temp = actor.hp; actor.hp = actor.sp; actor.sp = temp;
                this.log(`🧪 ${actor.name} uống thuốc lạ. HP và SP bị hoán đổi!`, 'warning');
                return;
            }

            actor.hp = Math.min(100, actor.hp + food.hp);
            actor.sp = Math.min(100, actor.sp + (food.sp || 0));
            this.log(`${actor.name} dùng [${food.name}]. Hồi phục sức lực.${bonusText}`, 'info');
        } else {
            actor.status = 'sleeping';
            actor.hp = Math.min(100, actor.hp + 10);
            actor.sp = Math.min(100, actor.sp + 10);
            this.log(`${actor.name} chợp mắt nghỉ ngơi. (+10 HP/SP)`, 'info');
        }
    }

    handleAttack(actor, targetId) {
        if (this.state.weather.mod.blind) {
            this.log(`🌫️ Sương mù quá dày, ${actor.name} đánh đấm vào không khí.`, 'neutral');
            return;
        }

        const target = this.state.players.find(p => p.id == targetId);
        
        // 1. Check UNO Reverse (Phản đòn)
        const unoIdx = target.inventory.findIndex(i => i.id === 'c_uno');
        if (unoIdx > -1) {
            target.inventory.splice(unoIdx, 1); // Mất thẻ sau khi dùng
            actor.hp -= 20; // Phản damage
            this.log(`🔄 Ú ÒA! ${target.name} dùng [Thẻ Uno Reverse]! ${actor.name} tự đấm vào mặt mình (-20 HP).`, 'warning');
            return;
        }

        // 2. Check Áo Mưa Rách (Né tránh)
        const cloak = target.inventory.find(i => i.id === 't_cloak');
        if (cloak && Math.random() < cloak.val) { // val = 0.5
            this.log(`💨 ${actor.name} lao vào nhưng ${target.name} né cực nghệ nhờ [Áo Mưa Rách]!`, 'warning');
            return;
        }

        // 3. Tính toán Sát thương & Vũ khí
        let baseDmg = 10;
        let weapon = null;
        const weaponIdx = actor.inventory.findIndex(i => i.type === 'weapon');
        
        if (weaponIdx > -1) {
            weapon = actor.inventory[weaponIdx];
            baseDmg += weapon.val;
        }

        // Check Accuracy (Súng lục có thể trượt)
        if (weapon && weapon.accuracy && Math.random() > weapon.accuracy) {
            this.log(`🔫 ${actor.name} bóp cò nhưng súng bị kẹt đạn/bắn trượt! Quê quá.`, 'neutral');
            return;
        }

        // Critical Logic (Prisoner's Dilemma)
        let isCrit = false;
        if (target.status === 'sleeping') {
            isCrit = true;
            baseDmg *= 1.5;
        }

        // Apply Weather Modifier
        baseDmg = Math.floor(baseDmg * this.state.weather.mod.dmg);
        target.hp -= baseDmg;

        let msg = `${actor.name} tấn công ${target.name}`;
        if (weapon) msg += ` bằng [${weapon.name}]`;
        if (isCrit) msg += ` (ĐÁNH LÉN CHÍ MẠNG!)`;
        msg += `. Gây ${baseDmg} sát thương.`;

        // Hiệu ứng phụ của vũ khí
        if (weapon && weapon.sp_dmg) {
            target.sp -= weapon.sp_dmg;
            msg += ` Trừ thêm ${weapon.sp_dmg} SP.`;
        }

        this.log(msg, 'danger');
    }

    handleUseItem(actor) {
        // Logic dùng các item đặc biệt (Special) như Loa, Bẫy
        const specialIdx = actor.inventory.findIndex(i => i.type === 'special' || i.type === 'trap');
        if (specialIdx === -1) {
            this.log(`${actor.name} lục túi nhưng không có đồ chơi công nghệ nào.`, 'neutral');
            return;
        }

        const item = actor.inventory[specialIdx];
        actor.inventory.splice(specialIdx, 1);

        if (item.id === 't_horn') { // Loa
            this.state.players.forEach(p => {
                if (p.id !== actor.id && !p.isDead) p.sp -= item.val;
            });
            this.log(`📢 ${actor.name} dùng [Loa Phóng Thanh] hát Karaoke. Tất cả người khác bị tra tấn tinh thần (-${item.val} SP).`, 'warning');
        } 
        else if (item.id === 't_trap') { // Bẫy
            this.globalTrap = { ownerId: actor.id, ownerName: actor.name, val: item.val };
            this.log(`🧱 ${actor.name} đã rải [Bẫy Lego] ra sàn nhà...`, 'warning');
        }
    }

    // --- HỆ THỐNG PHỤ TRỢ ---

    nextTurn() {
        const aliveCount = this.state.players.filter(p => !p.isDead).length;
        const actionsToday = this.state.history.length;

        if (actionsToday >= aliveCount) {
            this.endDayResolution();
        } else {
            this.state.turnIndex = this.getNextAliveIndex(this.state.turnIndex + 1);
            this.render();
        }
    }

    getNextAliveIndex(start) {
        let idx = start;
        let loop = 0;
        while (loop < 5) {
            if (idx >= 5) idx = 0;
            if (!this.state.players[idx].isDead) return idx;
            idx++;
            loop++;
        }
        return -1;
    }

    checkVitality() {
        this.state.players.forEach(p => {
            if (!p.isDead && p.hp <= 0) {
                p.hp = 0; p.isDead = true;
                this.log(`💀 ${p.name} đã bị loại khỏi cuộc chơi!`, 'dead');
            }
            if (!p.isDead && !p.isInsane && p.sp <= 0) {
                p.isInsane = true; p.sp = 0;
                this.log(`🤪 ${p.name} đã phát điên (SP = 0)!`, 'warning');
            }
        });

        const survivors = this.state.players.filter(p => !p.isDead);
        if (survivors.length <= 1) {
            this.state.isGameOver = true;
            this.state.winner = survivors[0] || null;
            if (this.state.winner && window.confetti) {
                window.confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
            }
            this.render();
        }
    }

    endDayResolution() {
        this.state.isProcessing = true; // <--- FIX: Bật cờ xử lý, khóa nút bấm
        this.log(`--- ĐÊM NGÀY ${this.state.day} ---`, 'system');
        this.render(); // Render lại để ẩn nút
        
        // 1. Prisoner's Dilemma: Team Building
        const resters = this.state.history.filter(h => h.action === 'rest').map(h => this.state.players[h.actorId]);
        if (resters.length >= 2) {
            this.log(`✨ ${resters.map(p => p.name).join(', ')} cùng nghỉ ngơi. Tình đồng chí lên cao (+10 SP).`, 'success');
            resters.forEach(p => { if(!p.isDead) p.sp = Math.min(100, p.sp + 10); });
        }

        // 2. Curse Effects
        this.state.players.forEach(p => {
            if (!p.isDead && p.inventory.some(i => i.id === 'cursed_radio')) {
                p.sp -= 10;
                this.log(`📻 [Radio Hỏng] rè rè bên tai ${p.name} cả đêm. -10 SP.`, 'warning');
            }
        });

        this.checkVitality();

        if (!this.state.isGameOver) {
            this.state.day++;
            setTimeout(() => this.startDay(), 2500);
        } else {
            this.render();
        }
    }

    log(msg, type) {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        this.state.logs.unshift({ msg, type, time });
        this.render();
    }

    // --- RENDER UI (GIỮ NGUYÊN LAYOUT DASHBOARD ĐẸP) ---
    render() {
        if (!this.modalElement) return;

        const typeColors = {
            system: 'text-amber-400 font-bold',
            info: 'text-blue-300',
            success: 'text-emerald-400',
            warning: 'text-orange-400',
            danger: 'text-red-400',
            dead: 'text-gray-500 line-through',
            neutral: 'text-slate-300'
        };

        const currentPlayer = this.state.players[this.state.turnIndex];

        this.modalElement.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
                
                <div class="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                    
                    <!-- HEADER -->
                    <div class="flex justify-between items-center px-6 py-4 bg-white/5 border-b border-white/5">
                        <div class="flex items-center gap-4">
                            <div class="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
                                <i data-lucide="tent-tree" class="w-6 h-6 text-emerald-400"></i>
                            </div>
                            <div>
                                <h2 class="text-xl font-black text-white tracking-wider font-mono">ISLAND WAR <span class="text-cyan-400 text-sm">PRO</span></h2>
                                <p class="text-xs text-slate-400 uppercase tracking-widest">Day ${this.state.day} • ${this.state.weather ? this.state.weather.name : '...'}</p>
                            </div>
                        </div>
                        <button onclick="window.survivalGame.close()" class="p-2 hover:bg-red-500/20 rounded-full transition-colors group">
                            <i data-lucide="x" class="w-6 h-6 text-slate-500 group-hover:text-red-400"></i>
                        </button>
                    </div>

                    <!-- BODY -->
                    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        
                        <!-- Player Grid -->
                        <div class="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                            ${this.state.players.map(p => this.renderPlayerCard(p)).join('')}
                        </div>

                        <!-- Terminal Log -->
                        <div class="w-full lg:w-96 bg-black/40 border-l border-white/5 flex flex-col font-mono text-xs">
                            <div class="p-3 bg-white/5 border-b border-white/5 text-slate-500 uppercase font-bold tracking-widest flex justify-between">
                                <span>>>> Event Log</span>
                                <span class="animate-pulse">_</span>
                            </div>
                            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="log-container">
                                ${this.state.logs.map(l => `
                                    <div class="flex gap-2">
                                        <span class="text-slate-600 shrink-0">[${l.time}]</span>
                                        <span class="${typeColors[l.type]}">${l.msg}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- ACTION BAR -->
                    <div class="p-6 bg-slate-800/50 border-t border-white/5 backdrop-blur-xl">
                        ${this.state.isGameOver ? this.renderGameOver() : this.renderActions(currentPlayer)}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    renderPlayerCard(p) {
        const isCurrent = this.state.turnIndex === p.id && !this.state.isGameOver;
        const statusColor = p.isDead ? 'border-slate-700 bg-slate-800/50 opacity-50 grayscale' : 
                           (isCurrent ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] transform scale-[1.02]' : 
                           'border-white/10 bg-white/5');

        return `
            <div class="relative rounded-2xl border p-4 transition-all duration-300 ${statusColor}">
                ${isCurrent ? '<div class="absolute -top-3 left-4 px-2 py-0.5 bg-cyan-500 text-slate-900 text-[10px] font-bold uppercase rounded tracking-wider animate-bounce">Lượt Của Bạn</div>' : ''}
                
                <div class="flex items-center gap-3 mb-3">
                    <img src="${p.avatar}" class="w-12 h-12 rounded-full border-2 ${p.isInsane ? 'border-purple-500' : 'border-white/20'} bg-slate-700">
                    <div class="min-w-0">
                        <div class="font-bold text-white truncate text-lg">${p.name}</div>
                        <!-- Inventory Icons -->
                        <div class="flex gap-1 mt-1 overflow-x-auto">
                            ${p.inventory.length > 0 ? p.inventory.map(i => `
                                <div class="w-6 h-6 rounded bg-black/40 flex items-center justify-center border border-white/10" title="${i.name}: ${i.desc}">
                                    <i data-lucide="${i.icon}" class="w-3 h-3 text-yellow-400"></i>
                                </div>
                            `).join('') : '<span class="text-[10px] text-slate-500">Túi rỗng</span>'}
                        </div>
                    </div>
                </div>

                <!-- Status Icons -->
                <div class="absolute top-4 right-4 flex gap-1">
                    ${p.status === 'sleeping' ? '<span title="Đang ngủ (Dễ bị đánh lén)">💤</span>' : ''}
                    ${p.status === 'stunned' ? '<span title="Choáng/Đau bụng (Mất lượt)">💫</span>' : ''}
                    ${p.isInsane ? '<span title="Điên loạn">🤪</span>' : ''}
                </div>

                <!-- Stats -->
                <div class="space-y-2 mt-2">
                    <div>
                        <div class="flex justify-between text-[10px] font-bold text-emerald-400 mb-1">
                            <span>HP</span> <span>${p.hp}/100</span>
                        </div>
                        <div class="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 transition-all duration-500" style="width: ${p.hp}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[10px] font-bold text-blue-400 mb-1">
                            <span>SP</span> <span>${p.sp}/100</span>
                        </div>
                        <div class="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${p.sp}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderActions(actor) {
        // <--- FIX: Nếu đang xử lý (isProcessing) hoặc chết thì không hiện nút
        if (this.state.isProcessing || !actor || actor.isDead) return '<div class="text-center text-slate-500 font-mono animate-pulse">Đang xử lý sự kiện đêm...</div>';

        const targets = this.state.players.filter(p => !p.isDead && p.id !== actor.id);
        const hasSpecialItem = actor.inventory.some(i => i.type === 'special' || i.type === 'trap');

        return `
            <div class="flex flex-wrap items-center justify-center gap-4 animate-fadeInUp">
                <div class="text-white font-mono mr-4 hidden md:block">Lượt của <span class="text-cyan-400 font-bold text-xl">${actor.name}</span>:</div>
                
                <button onclick="window.survivalGame.act('scavenge')" class="group relative px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-all hover:-translate-y-1 shadow-lg shadow-emerald-900/40 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
                    <div class="flex items-center gap-2">
                        <i data-lucide="search" class="w-5 h-5"></i> <span>Tìm Đồ</span>
                    </div>
                </button>

                <button onclick="window.survivalGame.act('rest')" class="group relative px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all hover:-translate-y-1 shadow-lg shadow-blue-900/40 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
                    <div class="flex items-center gap-2">
                        <i data-lucide="tent" class="w-5 h-5"></i> <span>Nghỉ/Dùng Đồ</span>
                    </div>
                </button>

                ${hasSpecialItem ? `
                <button onclick="window.survivalGame.act('use_item')" class="group relative px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-all hover:-translate-y-1 shadow-lg shadow-purple-900/40 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
                    <div class="flex items-center gap-2">
                        <i data-lucide="sparkles" class="w-5 h-5"></i> <span>Dùng Special</span>
                    </div>
                </button>
                ` : ''}

                <div class="w-px h-10 bg-white/10 mx-2"></div>

                <div class="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                    <select id="target-select" class="bg-transparent text-white text-sm font-bold px-3 outline-none cursor-pointer hover:text-red-400 transition-colors">
                        ${targets.map(t => `<option value="${t.id}">Mục tiêu: ${t.name}</option>`).join('')}
                    </select>
                    <button onclick="window.survivalGame.act('attack', document.getElementById('target-select').value)" class="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-all shadow-lg shadow-red-900/40 ml-2 flex items-center gap-2">
                        <i data-lucide="swords" class="w-5 h-5"></i> TẤN CÔNG
                    </button>
                </div>
            </div>
        `;
    }

    renderGameOver() {
        return `
            <div class="flex flex-col items-center justify-center gap-4 animate-bounce-slow">
                <div class="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-lg">
                    ${this.state.winner ? `👑 VUA ĐẢO HOANG: ${this.state.winner.name} 👑` : '💀 TẤT CẢ ĐÃ HY SINH 💀'}
                </div>
                <button onclick="window.survivalGame.close()" class="text-sm text-slate-400 hover:text-white underline underline-offset-4">Đóng trò chơi</button>
            </div>
        `;
    }
}