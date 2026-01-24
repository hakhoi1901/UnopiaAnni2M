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
            isProcessing: false,
            winner: null,
            viewingItem: null,
            players: this.playersRaw.map((name, id) => ({
                id: id,
                name: name,
                hp: 100,
                sp: 100,
                inventory: [],
                status: 'normal',
                statusDuration: 0,
                isDead: false,
                isInsane: false,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`
            })),
            history: []
        };

        // --- 1. HỆ THỐNG VẬT PHẨM NÂNG CẤP (TIERED ITEM SYSTEM) ---
        // Rarity: common (xám), rare (xanh), epic (tím), legendary (vàng), cursed (đỏ)
        this.itemDB = [
            // === TIER 1: COMMON (Rác nhưng có ích) - Rate: 0.4 ===
            { 
                id: 'w_brick', name: 'Gạch Ống', type: 'weapon', rarity: 'common',
                val: 8, accuracy: 0.9, rate: 0.15, icon: 'brick-wall', 
                desc: 'Vũ khí thô sơ nhất của nhân loại. Sát thương 8. Dễ kiếm, dễ ném.' 
            },
            { 
                id: 'w_sandal', name: 'Dép Lào', type: 'weapon', rarity: 'common',
                val: 10, sp_dmg: 15, accuracy: 1.0, rate: 0.15, icon: 'footprints', 
                desc: 'Sát thương 10 + 15 SP dmg. Gây sát thương tinh thần cực lớn. Không bao giờ trượt.' 
            },
            { 
                id: 'f_water', name: 'Nước Suối Lavie', type: 'heal', rarity: 'common',
                hp: 10, sp: 15, rate: 0.15, icon: 'droplets', 
                desc: 'Hồi 10 HP, 15 SP. Một phần tất yếu của cuộc sống.' 
            },

            // === TIER 2: RARE (Đồ nghề tiêu chuẩn) - Rate: 0.3 ===
            { 
                id: 'w_keyboard', name: 'Bàn Phím Cơ', type: 'weapon', rarity: 'rare',
                val: 18, accuracy: 0.85, rate: 0.08, icon: 'keyboard', 
                desc: 'Sát thương 18. Cherry Blue Switch, tiếng ồn gây khó chịu cho nạn nhân.' 
            },
            { 
                id: 'w_bat', name: 'Gậy Bóng Chày', type: 'weapon', rarity: 'rare',
                val: 25, accuracy: 0.8, rate: 0.08, icon: 'axe', 
                desc: 'Sát thương 25. Đồ trấn phái của dân "yang hồ". Có thể trượt (80% acc).' 
            },
            { 
                id: 'f_noodle', name: 'Mì Tôm Hảo Hảo', type: 'heal', rarity: 'rare',
                hp: 25, sp: 10, rate: 0.1, icon: 'soup', 
                desc: 'Hồi 25 HP, 10 SP. Món ăn quốc dân cứu đói sinh viên.' 
            },
            { 
                id: 't_cloak', name: 'Áo Mưa Grab', type: 'passive', rarity: 'rare',
                effect: 'dodge', val: 0.4, rate: 0.08, icon: 'shirt', 
                desc: 'Bị động: 40% né tránh đòn đánh nhờ khả năng tàng hình vào đám đông.' 
            },

            // === TIER 3: EPIC (Đồ công nghệ cao/Hiếm) - Rate: 0.15 ===
            { 
                id: 'w_taser', name: 'Dùi Cui Điện', type: 'weapon', rarity: 'epic',
                val: 30, sp_dmg: 20, accuracy: 0.9, rate: 0.05, icon: 'zap', 
                desc: 'Sát thương 30 + 20 SP. Giật tê người. Hàng nóng.' 
            },
            { 
                id: 'f_coffee', name: 'Highlands Coffee', type: 'heal', rarity: 'epic',
                hp: 0, sp: 60, rate: 0.05, icon: 'coffee', 
                desc: 'Hồi 60 SP. Tỉnh táo để chạy Deadline thâu đêm.' 
            },
            { 
                id: 'f_medkit', name: 'Túi Cứu Thương PUBG', type: 'heal', rarity: 'epic',
                hp: 70, sp: 0, rate: 0.04, icon: 'briefcase-medical', 
                desc: 'Hồi 70 HP. Hồi sinh từ cõi chết.' 
            },
            { 
                id: 't_trap', name: 'Bẫy Lego', type: 'trap', rarity: 'epic',
                val: 25, rate: 0.05, icon: 'toy-brick', 
                desc: 'Rải Lego. Kẻ tiếp theo đi dẫm phải thốn tận rốn (-25 HP).' 
            },

            // === TIER 4: LEGENDARY (Phá game) - Rate: 0.05 ===
            { 
                id: 'w_nokia', name: 'Nokia 1280', type: 'weapon', rarity: 'legendary',
                val: 45, accuracy: 1.0, rate: 0.02, icon: 'phone', 
                desc: 'Vật liệu cứng nhất vũ trụ. Sát thương 45. Ném là trúng, trúng là nhập viện.' 
            },
            { 
                id: 'w_gun', name: 'Súng Lục Rulo', type: 'weapon', rarity: 'legendary',
                val: 999, accuracy: 0.3, rate: 0.02, icon: 'crosshair', 
                desc: 'Russian Roulette. 30% One-shot One-kill. 70% kẹt đạn & mất lượt.' 
            },
            { 
                id: 't_chatgpt', name: 'Tài Khoản ChatGPT Plus', type: 'special', rarity: 'legendary',
                effect: 'aoe_sp', val: 40, rate: 0.01, icon: 'bot', 
                desc: 'Kích hoạt: Dùng AI thao túng tâm lý. Trừ 40 SP toàn bộ người chơi khác.' 
            },
            
            // === TIER 5: CURSED (Đồ nguyền rủa/Chaos) - Rate: 0.1 ===
            { 
                id: 'f_expired', name: 'Cơm Tấm Hôi', type: 'heal', rarity: 'cursed',
                hp: 50, sp: -20, rate: 0.05, icon: 'skull', 
                desc: 'Hồi 50 HP nhưng đau bụng dữ dội (-20 SP & có thể mất lượt).' 
            },
            { 
                id: 'c_deadline', name: 'Deadline Gấp', type: 'chaos', rarity: 'cursed',
                rate: 0.05, icon: 'file-warning', 
                desc: 'Sử dụng: Stress cực độ. Hoán đổi HP và SP của bản thân.' 
            },
            { 
                id: 'c_bug', name: 'Con Bug "Tính Năng"', type: 'chaos', rarity: 'cursed',
                rate: 0.04, icon: 'bug', 
                desc: 'Triệu hồi Bug. Random 1 người chơi bất kỳ mất 50% HP hiện tại.' 
            }
        ];

        this.weatherTypes = [
            { name: "Nắng Đẹp", icon: "sun", color: "text-yellow-400", mod: { scavenge: 0.2, dmg: 1 } },
            { name: "Mưa Axit", icon: "cloud-drizzle", color: "text-green-400", mod: { scavenge: -0.2, dmg: 1.2 } },
            { name: "Bão Tố", icon: "cloud-lightning", color: "text-purple-400", mod: { scavenge: -0.4, dmg: 1.4 } },
            { name: "Sương Mù", icon: "cloud-fog", color: "text-slate-400", mod: { scavenge: 0, dmg: 0.8, blind: true } },
            { name: "Tuyết Rơi", icon: "snowflake", color: "text-cyan-200", mod: { scavenge: -0.1, dmg: 1.1 } }
        ];

        this.globalTrap = null; 
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

    // --- CÁC HÀM MỚI ĐỂ XỬ LÝ CHI TIẾT VẬT PHẨM ---

    viewItem(playerId, itemIndex) {
        const player = this.state.players.find(p => p.id === playerId);
        if (player && player.inventory[itemIndex]) {
            this.state.viewingItem = player.inventory[itemIndex];
            this.render(); // Render lại để hiện popup
        }
    }

    closeItemDetail() {
        this.state.viewingItem = null;
        this.render();
    }

    // --- UI RENDERING ---

    // =========================================================================
    // PHẦN GIAO DIỆN (UI/UX OVERHAUL) - GLASSMORPHISM STYLE
    // =========================================================================

    // Helper: Lấy màu sắc chủ đạo dựa trên loại Log
    getLogStyle(type) {
        const styles = {
            system:  { border: 'border-l-4 border-amber-500', bg: 'bg-amber-500/10', icon: 'sun', color: 'text-amber-200' },
            danger:  { border: 'border-l-4 border-red-500', bg: 'bg-red-500/10', icon: 'swords', color: 'text-red-200' },
            success: { border: 'border-l-4 border-emerald-500', bg: 'bg-emerald-500/10', icon: 'check-circle-2', color: 'text-emerald-200' },
            warning: { border: 'border-l-4 border-purple-500', bg: 'bg-purple-500/10', icon: 'alert-triangle', color: 'text-purple-200' },
            dead:    { border: 'border-l-4 border-gray-600', bg: 'bg-gray-800/50', icon: 'skull', color: 'text-gray-400 line-through' },
            info:    { border: 'border-l-4 border-blue-400', bg: 'bg-blue-500/10', icon: 'info', color: 'text-blue-200' },
            neutral: { border: 'border-l-4 border-slate-500', bg: 'bg-slate-700/20', icon: 'more-horizontal', color: 'text-slate-300' }
        };
        return styles[type] || styles.neutral;
    }

    render() {
        if (!this.modalElement) return;

        // Xử lý icon Lucide sau khi render
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);

        this.modalElement.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 font-sans">
                <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"></div>
                
                <div class="relative w-full max-w-7xl h-[95vh] bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
                    
                    ${this.renderHeader()}

                    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                        
                        ${this.state.viewingItem ? this.renderItemDetail(this.state.viewingItem) : ''}

                        <div class="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800/50">
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-start pb-20">
                                ${this.state.players.map(p => this.renderPlayerCard(p)).join('')}
                            </div>
                        </div>

                        <div class="w-full lg:w-[400px] xl:w-[450px] bg-black/20 border-l border-white/5 flex flex-col backdrop-blur-md">
                            <div class="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center sticky top-0 z-10">
                                <span class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <i data-lucide="radio" class="w-4 h-4 text-emerald-500 animate-pulse"></i> 
                                    Live Feed
                                </span>
                                <span class="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 font-mono">
                                    ${this.state.logs.length} events
                                </span>
                            </div>
                            
                            <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth" id="log-container">
                                ${this.renderLogs()}
                            </div>
                        </div>
                    </div>

                    <div class="relative z-20 p-4 md:p-6 bg-slate-800/80 border-t border-white/10 backdrop-blur-xl transition-all duration-300">
                        ${this.state.isGameOver ? this.renderGameOver() : this.renderActions(this.state.players[this.state.turnIndex])}
                    </div>
                </div>
            </div>
        `;
    }

    renderHeader() {
        const weather = this.state.weather || { name: 'Unknown', icon: 'help-circle', color: 'text-slate-500' };
        return `
        <div class="flex justify-between items-center px-6 py-4 bg-white/5 border-b border-white/5 select-none">
            <div class="flex items-center gap-5">
                <div class="flex flex-col">
                    <h2 class="text-2xl font-black text-white tracking-wide uppercase italic" style="text-shadow: 0 0 20px rgba(6,182,212,0.5)">
                        Survival <span class="text-cyan-400">Game</span>
                    </h2>
                </div>
                <div class="h-8 w-px bg-white/10 mx-2"></div>
                <div class="flex items-center gap-3">
                    <div class="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 flex items-center gap-2 shadow-inner">
                        <span class="text-xs text-slate-400 font-bold uppercase">Day</span>
                        <span class="text-xl font-mono font-bold text-white">${this.state.day}</span>
                    </div>
                    <div class="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 flex items-center gap-2 shadow-inner">
                        <i data-lucide="${weather.icon}" class="w-4 h-4 ${weather.color}"></i>
                        <span class="text-sm font-bold ${weather.color}">${weather.name}</span>
                    </div>
                </div>
            </div>
            <button onclick="window.survivalGame.close()" class="p-2 hover:bg-white/10 rounded-full transition-colors group">
                <i data-lucide="x" class="w-6 h-6 text-slate-500 group-hover:text-white"></i>
            </button>
        </div>`;
    }

    renderLogs() {
        if (this.state.logs.length === 0) {
            return `<div class="text-center text-slate-500 text-sm py-10 italic">Chưa có sự kiện nào...</div>`;
        }
        return this.state.logs.map(l => {
            const style = this.getLogStyle(l.type);
            return `
            <div class="relative p-3 rounded-r-lg ${style.border} ${style.bg} mb-2 animate-fadeIn transition-all hover:bg-white/5 group">
                <div class="flex justify-between items-start mb-1">
                    <div class="flex items-center gap-2">
                        <i data-lucide="${style.icon}" class="w-3 h-3 opacity-70 ${style.color}"></i>
                        <span class="text-[10px] font-mono text-slate-500">${l.time}</span>
                    </div>
                </div>
                <p class="text-sm ${style.color} leading-relaxed font-medium">
                    ${l.msg}
                </p>
            </div>`;
        }).join('');
    }

    renderPlayerCard(p) {
        // Logic xác định trạng thái hiển thị
        const isCurrent = this.state.turnIndex === p.id && !this.state.isGameOver;
        const isTargetable = !p.isDead && !isCurrent;
        
        // CSS Classes động
        const cardBase = "relative rounded-2xl p-4 transition-all duration-300 border backdrop-blur-sm group";
        const cardState = p.isDead 
            ? "border-slate-800 bg-slate-900/50 opacity-60 grayscale scale-95" // Chết
            : (isCurrent 
                ? "border-cyan-500/50 bg-cyan-900/10 shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] scale-[1.02] ring-1 ring-cyan-400/30 z-10" // Đang lượt
                : "border-white/5 bg-slate-800/40 hover:bg-slate-700/50 hover:border-white/20"); // Bình thường

        // Avatar wrapper
        const avatarBorder = p.isInsane ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : (isCurrent ? 'border-cyan-400' : 'border-white/10');

        return `
            <div class="${cardBase} ${cardState}" id="player-card-${p.id}">
                ${isCurrent ? `
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-slate-900 text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg animate-bounce z-20">
                        Current Turn
                    </div>` : ''}
                
                <div class="flex items-start gap-4">
                    <div class="relative shrink-0">
                        <img src="${p.avatar}" class="w-16 h-16 rounded-2xl border-2 ${avatarBorder} bg-slate-950 object-cover shadow-lg">
                        
                        <div class="absolute -bottom-2 -right-2 flex flex-col-reverse gap-1 items-end">
                            ${p.status === 'sleeping' ? '<div class="bg-blue-900 text-blue-200 border border-blue-500 p-1 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-sm" title="Ngủ"><i data-lucide="zzz" class="w-3 h-3"></i></div>' : ''}
                            ${p.status === 'stunned' ? '<div class="bg-orange-900 text-orange-200 border border-orange-500 p-1 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-sm" title="Choáng"><i data-lucide="zap-off" class="w-3 h-3"></i></div>' : ''}
                            ${p.isInsane ? '<div class="bg-purple-900 text-purple-200 border border-purple-500 p-1 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-sm" title="Điên"><i data-lucide="ghost" class="w-3 h-3"></i></div>' : ''}
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-white text-lg truncate leading-tight mb-1">${p.name}</h3>
                            ${p.isDead ? '<span class="text-xs font-bold text-red-500 uppercase border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">Dead</span>' : ''}
                        </div>

                        <div class="flex gap-1.5 mt-2 h-8">
                            ${p.inventory.length > 0 ? p.inventory.map((item, idx) => {
                                const rareColor = item.rarity === 'legendary' ? 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' : 
                                                  (item.rarity === 'cursed' ? 'text-red-400 border-red-500/50 bg-red-500/10' : 'text-slate-400 border-white/10 bg-black/40');
                                return `
                                <div onclick="window.survivalGame.viewItem(${p.id}, ${idx})" 
                                     class="group/item w-8 h-8 rounded-lg flex items-center justify-center border ${rareColor} cursor-pointer hover:scale-110 hover:border-white/50 transition-all relative">
                                    <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                                </div>`;
                            }).join('') : 
                            '<div class="w-full h-8 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600">Empty</div>'}
                        </div>
                    </div>
                </div>

                <div class="space-y-3 mt-4">
                    <div class="relative group/stat">
                        <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span class="text-emerald-400 flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3"></i> HP</span>
                            <span class="text-white">${p.hp}</span>
                        </div>
                        <div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <div class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out relative" style="width: ${p.hp}%">
                                <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div class="relative group/stat">
                        <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span class="text-blue-400 flex items-center gap-1"><i data-lucide="brain-circuit" class="w-3 h-3"></i> SP</span>
                            <span class="text-white">${p.sp}</span>
                        </div>
                        <div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out relative" style="width: ${p.sp}%">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderActions(actor) {
        if (this.state.isProcessing || !actor || actor.isDead) {
            return `
            <div class="flex items-center justify-center gap-3 h-16">
                <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                <span class="text-slate-500 font-mono text-sm tracking-widest uppercase">Đang xử lý đêm...</span>
            </div>`;
        }

        const targets = this.state.players.filter(p => !p.isDead && p.id !== actor.id);
        const hasSpecialItem = actor.inventory.some(i => i.type === 'special' || i.type === 'trap');

        // Styles cho button
        const btnBase = "relative px-6 py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-1 min-w-[100px] border-b-4 shadow-lg";
        
        return `
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
                
                <div class="text-slate-400 text-sm font-mono hidden lg:block">
                    COMMANDER: <span class="text-white font-bold">${actor.name}</span> <br>
                    STATUS: <span class="text-emerald-400">READY</span>
                </div>

                <div class="flex flex-wrap items-center justify-center gap-4">
                    
                    <button onclick="window.survivalGame.act('scavenge')" 
                        class="${btnBase} bg-slate-700 border-slate-900 hover:bg-slate-600 hover:border-slate-800">
                        <i data-lucide="search" class="w-6 h-6 text-emerald-400"></i>
                        <span class="text-xs uppercase tracking-wider">Tìm Đồ</span>
                    </button>

                    <button onclick="window.survivalGame.act('rest')" 
                        class="${btnBase} bg-blue-600 border-blue-800 hover:bg-blue-500 hover:border-blue-700">
                        <i data-lucide="tent" class="w-6 h-6 text-white"></i>
                        <span class="text-xs uppercase tracking-wider">Hồi Phục</span>
                    </button>

                    ${hasSpecialItem ? `
                    <button onclick="window.survivalGame.act('use_item')" 
                        class="${btnBase} bg-purple-600 border-purple-800 hover:bg-purple-500 hover:border-purple-700 animate-pulse">
                        <i data-lucide="sparkles" class="w-6 h-6 text-yellow-200"></i>
                        <span class="text-xs uppercase tracking-wider">Dùng Skill</span>
                    </button>
                    ` : ''}

                    <div class="w-px h-12 bg-white/10 mx-2 hidden md:block"></div>

                    <div class="flex items-center bg-red-500/10 p-1.5 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                        <div class="relative group">
                            <select id="target-select" class="appearance-none bg-slate-900 text-white text-sm font-bold pl-4 pr-10 py-3 rounded-xl outline-none cursor-pointer border border-transparent focus:border-red-500 hover:bg-slate-800 transition-colors">
                                ${targets.map(t => `<option value="${t.id}">${t.name} (${t.hp} HP)</option>`).join('')}
                            </select>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                        </div>
                        
                        <button onclick="window.survivalGame.act('attack', document.getElementById('target-select').value)" 
                            class="ml-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-white shadow-lg shadow-red-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border-b-4 border-red-800">
                            <span>TẤN CÔNG</span>
                            <i data-lucide="sword" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderItemDetail(item) {
        // Giữ nguyên logic hiển thị Item nhưng tinh chỉnh CSS cho mượt hơn
        const rarityColors = {
            common: 'text-slate-300 border-slate-500 from-slate-800 to-slate-900',
            rare: 'text-cyan-400 border-cyan-500 from-cyan-900/80 to-slate-900',
            epic: 'text-purple-400 border-purple-500 from-purple-900/80 to-slate-900',
            legendary: 'text-yellow-400 border-yellow-500 from-yellow-900/80 to-slate-900',
            cursed: 'text-red-500 border-red-500 from-red-900/80 to-slate-900'
        };

        const theme = rarityColors[item.rarity] || rarityColors.common;

        return `
            <div class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn" onclick="window.survivalGame.closeItemDetail()">
                <div class="w-full max-w-sm bg-gradient-to-br ${theme} border-2 rounded-2xl p-6 shadow-2xl transform scale-100 transition-all hover:scale-[1.02]" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-start mb-6">
                        <div class="p-4 rounded-xl bg-black/40 border border-white/10 shadow-inner">
                            <i data-lucide="${item.icon}" class="w-12 h-12 ${theme.split(' ')[0]}"></i>
                        </div>
                        <button onclick="window.survivalGame.closeItemDetail()" class="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <h3 class="text-3xl font-black text-white mb-2 tracking-tight">${item.name}</h3>
                    <div class="flex items-center gap-2 mb-6">
                         <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/40 text-white/80 border border-white/10">
                            ${item.type}
                        </span>
                        <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 ${theme.split(' ')[0]}">
                            ${item.rarity || 'Common'}
                        </span>
                    </div>
                    
                    <div class="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
                    
                    <p class="text-slate-200 italic mb-6 leading-relaxed font-serif opacity-90">"${item.desc}"</p>
                    
                    <div class="grid grid-cols-2 gap-3 text-xs font-mono text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5">
                        ${item.val ? `<div class="flex justify-between"><span>POWER</span> <span class="text-white font-bold">${item.val}</span></div>` : ''}
                        ${item.accuracy ? `<div class="flex justify-between"><span>ACCURACY</span> <span class="text-white font-bold">${Math.round(item.accuracy * 100)}%</span></div>` : ''}
                        ${item.sp_dmg ? `<div class="flex justify-between"><span>PSY DMG</span> <span class="text-white font-bold">${item.sp_dmg}</span></div>` : ''}
                        ${item.hp ? `<div class="flex justify-between"><span>HEAL HP</span> <span class="text-emerald-400 font-bold">+${item.hp}</span></div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}