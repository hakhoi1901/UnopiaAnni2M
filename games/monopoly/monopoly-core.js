/**
 * MODULE 2: LOGIC CỐT LÕI (CONTROLLER)
 * Xử lý trạng thái game, logic di chuyển, kinh tế và sự kiện.
 */

class MonopolyCore {
    constructor(playerNames) {
        this.players = playerNames.map((name, i) => ({
            id: i,
            name: name,
            money: window.MonopolyData.CONFIG.START_MONEY,
            position: 0,
            color: this.getPlayerColor(i),
            isJailed: 0, // Số lượt ở tù còn lại
            properties: [], // Danh sách ID đất sở hữu
            isBankrupt: false,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}Mono`
        }));

        this.board = JSON.parse(JSON.stringify(window.MonopolyData.MAP)); // Deep copy map
        this.board.forEach(tile => {
            if (tile.type === 'LAND') {
                tile.owner = null;
                tile.level = 0; // 0: Đất, 1: Nhà C1, 2: Nhà C2, 3: Wifi
            }
        });

        this.turnIndex = 0;
        this.timeElapsed = 0; // Giây
        this.phaseIndex = 0;
        this.diceResult = [0, 0];
        this.logs = [];
        this.gameInterval = null;
        
        // Callback cập nhật UI
        this.onUpdate = null;
        this.onEvent = null; // Callback khi có sự kiện cần người chơi tương tác (Mua đất, Trả tiền...)
        this.uiRef = null; 
    }

    getPlayerColor(index) {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        return colors[index % colors.length];
    }

    startGame() {
        this.log("Trò chơi bắt đầu! Giai đoạn 1: KHỞI ĐỘNG.");
        this.gameInterval = setInterval(() => {
            this.timeElapsed++;
            this.checkPhase();
            if (this.onUpdate) this.onUpdate();
            
            if (this.timeElapsed >= window.MonopolyData.CONFIG.MAX_GAME_TIME) {
                this.endGame();
            }
        }, 1000);
    }

    checkPhase() {
        const currentPhase = window.MonopolyData.PHASES[this.phaseIndex];
        if (this.phaseIndex < window.MonopolyData.PHASES.length - 1) {
            if (this.timeElapsed >= currentPhase.endAt) {
                this.phaseIndex++;
                const nextPhase = window.MonopolyData.PHASES[this.phaseIndex];
                this.log(`⚠️ CHUYỂN GIAI ĐOẠN: ${nextPhase.name}! ${nextPhase.desc}`, 'WARNING');
                
                // Hiệu ứng đặc biệt mỗi phase
                if (nextPhase.name === "HỖN MANG") {
                    this.log("Mùa thi cử bắt đầu! Phạt nặng hơn!", 'DANGER');
                }
            }
        }
    }

    getCurrentPhase() {
        return window.MonopolyData.PHASES[this.phaseIndex];
    }

    rollDice() {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        this.diceResult = [d1, d2];
        const total = d1 + d2;
        this.log(`${this.getCurrentPlayer().name} gieo được ${d1} và ${d2}. Tổng: ${total}.`);
        return total;
    }

    async movePlayerStepByStep(steps) {
        const player = this.getCurrentPlayer();
        
        // Check tù
        if (player.isJailed > 0) {
            player.isJailed--;
            this.log(`${player.name} đang thi lại. Còn ${player.isJailed} lượt.`);
            if(this.uiRef) this.uiRef.showToast(`${player.name} đang thi lại!`, 'danger');
            this.nextTurn();
            return;
        }

        // Sudden Death cost
        const phase = this.getCurrentPhase();
        if (phase.moveCost) {
            player.money -= (phase.moveCost * steps);
            this.log(`Phí bôi trơn: -$${phase.moveCost * steps}`);
            if (player.money < 0) return this.handleBankruptcy(player);
        }

        // Di chuyển từng ô
        let stepsLeft = steps;
        // Hàm đệ quy hoặc loop với Promise delay
        for (let i = 0; i < steps; i++) {
            const oldPos = player.position;
            player.position = (player.position + 1) % 24;
            
            // Check qua cổng trường
            if (player.position === 0) {
                player.money += window.MonopolyData.CONFIG.PASS_GO_REWARD;
                this.log(`Qua Cổng Trường: +$${window.MonopolyData.CONFIG.PASS_GO_REWARD}`);
                if(this.uiRef) this.uiRef.showToast(`Nhận lương +$${window.MonopolyData.CONFIG.PASS_GO_REWARD}`, 'success');
            }

            // Cập nhật UI ngay lập tức để thấy token nhảy
            if (this.onUpdate) this.onUpdate();
            
            // Chờ 200ms trước khi nhảy bước tiếp theo
            await new Promise(r => setTimeout(r, 200));
        }

        // Đã đến nơi
        setTimeout(() => this.handleTile(player.position), 300);
    }

    handleTile(pos) {
        const tile = this.board[pos];
        const player = this.getCurrentPlayer();
        const phase = this.getCurrentPhase();

        this.log(`${player.name} đến ô: ${tile.name}`);

        switch (tile.type) {
            case 'START':
                player.money += window.MonopolyData.CONFIG.LAND_ON_GO_REWARD;
                this.log(`Đậu xe ngay cổng trường. Thưởng nóng $${window.MonopolyData.CONFIG.LAND_ON_GO_REWARD}!`);
                this.nextTurn();
                break;

            case 'LAND':
                if (!tile.owner) {
                    if (this.onEvent) this.onEvent('BUY_LAND', { player, tile });
                } else if (tile.owner === player.id) {
                    if (tile.level < phase.maxLevel) {
                        if (this.onEvent) this.onEvent('UPGRADE_LAND', { player, tile });
                    } else {
                        this.log(`Nhà ${tile.name} đã Max cấp. Chill thôi.`);
                        this.nextTurn();
                    }
                } else {
                    this.payRent(player, tile);
                }
                break;

            case 'CHANCE':
            case 'LUCK':
                this.handleRandomEvent(tile.type);
                break;

            case 'CORNER':
                if (tile.action === 'tuition') {
                    const fee = Math.floor(player.money * window.MonopolyData.CONFIG.TUITION_FEE_PERCENT);
                    player.money -= fee;
                    this.log(`Nộp học phí ${fee}$ (10% tài sản). Đau ví quá!`);
                } else {
                    this.log("Vào Căn tin uống nước miễn phí. Khỏe re.");
                }
                this.nextTurn();
                break;

            case 'JAIL':
                this.log("Vào Phòng Thi! Đình chỉ 2 lượt.");
                player.isJailed = 2;
                this.nextTurn();
                break;

            case 'TAX':
                const tax = window.MonopolyData.CONFIG.TAX_AMOUNT * phase.multiplier;
                player.money -= tax;
                this.log(`Nộp thuế GTGT: $${tax}.`);
                this.checkBalance(player);
                this.nextTurn();
                break;
        }
    }

    buyProperty(player, tile) {
        if (player.money >= tile.price) {
            player.money -= tile.price;
            tile.owner = player.id;
            tile.level = 1;
            player.properties.push(tile.id);
            this.log(`${player.name} đã mua ${tile.name} với giá $${tile.price}.`);
        } else {
            this.log("Không đủ tiền mua đất. Tiếc quá!");
        }
        this.nextTurn();
    }

    upgradeProperty(player, tile) {
        const upgradeCost = Math.floor(tile.price * 0.5);
        if (player.money >= upgradeCost) {
            player.money -= upgradeCost;
            tile.level++;
            this.log(`${player.name} nâng cấp ${tile.name} lên cấp ${tile.level}.`);
        }
        this.nextTurn();
    }

    payRent(player, tile) {
        const owner = this.players[tile.owner];
        const phase = this.getCurrentPhase();
        
        // LOGIC MỚI: Lấy tiền phạt từ mảng levels
        const levelData = tile.levels[tile.level];
        let rent = levelData.rent * phase.multiplier;
        rent = Math.floor(rent);

        this.log(`${player.name} vào ${tile.name} (${levelData.name}). Phạt: $${rent}.`);
        
        player.money -= rent;
        owner.money += rent;
        
        this.checkBalance(player);
        this.nextTurn();
    }

    handleRandomEvent(type) {
        const events = window.MonopolyData.EVENTS;
        const rand = Math.random();
        const player = this.getCurrentPlayer();

        if (type === 'CHANCE') { // Cơ hội: Buff/Debuff cá nhân
            if (rand > 0.5) {
                // Vận đỏ
                const text = events.GOOD_LUCK[Math.floor(Math.random() * events.GOOD_LUCK.length)];
                const amt = 1000 + Math.floor(Math.random() * 2000);
                player.money += amt;
                this.log(`LUCK: ${text} (+$${amt})`);
            } else {
                // Vận đen
                const subRand = Math.random();
                if (subRand < 0.3) {
                    const text = events.TO_JAIL[Math.floor(Math.random() * events.TO_JAIL.length)];
                    this.log(`BAD: ${text}`);
                    player.isJailed = 2;
                    player.position = 18; // Move to Jail
                } else {
                    const text = events.BAD_LUCK[Math.floor(Math.random() * events.BAD_LUCK.length)];
                    this.log(`BAD: ${text}`);
                    if (text.includes("Lùi")) {
                        // Di chuyển lùi (đơn giản hóa)
                        player.position = (player.position - 3 + 24) % 24; 
                        // Không kích hoạt lại ô lùi vào để tránh loop
                    }
                }
            }
        } else { // KHÍ VẬN: PVP
            if (rand > 0.5) {
                // Xin tiền (Communist)
                const text = events.PVP_COMMUNIST[Math.floor(Math.random() * events.PVP_COMMUNIST.length)];
                const amt = 500;
                let totalStolen = 0;
                this.players.forEach(p => {
                    if (p.id !== player.id && !p.isBankrupt) {
                        p.money -= amt;
                        totalStolen += amt;
                    }
                });
                player.money += totalStolen;
                this.log(`PVP: ${text} (Thu được $${totalStolen})`);
            } else {
                // Ép mua đất (Giả lập đơn giản: Bán đất rác nhất của mình cho người giàu nhất)
                const text = events.PVP_TRADE[Math.floor(Math.random() * events.PVP_TRADE.length)];
                this.log(`PVP: ${text}`);
                // Logic phức tạp này có thể code thêm sau, hiện tại trừ tiền tượng trưng
                const richGuy = this.players.reduce((prev, current) => (prev.money > current.money) ? prev : current);
                if (richGuy.id !== player.id) {
                    richGuy.money -= 2000;
                    player.money += 2000;
                    this.log(`${player.name} trấn lột $2000 của đại gia ${richGuy.name}.`);
                }
            }
        }
        this.nextTurn();
    }

    checkBalance(player) {
        if (player.money < 0) {
            this.handleBankruptcy(player);
        }
    }

    handleBankruptcy(player) {
        player.isBankrupt = true;
        this.log(`💸 ${player.name} ĐÃ PHÁ SẢN! Bị đuổi học!`, 'DANGER');
        // Trả đất về công
        this.board.forEach(tile => {
            if (tile.owner === player.id) {
                tile.owner = null;
                tile.level = 0;
            }
        });
        
        // Check win
        const survivors = this.players.filter(p => !p.isBankrupt);
        if (survivors.length === 1) {
            this.endGame(survivors[0]);
        }
    }

    nextTurn() {
        let loop = 0;
        do {
            this.turnIndex = (this.turnIndex + 1) % this.players.length;
            loop++;
        } while (this.getCurrentPlayer().isBankrupt && loop < 10);

        if (this.onUpdate) this.onUpdate();
    }

    getCurrentPlayer() {
        return this.players[this.turnIndex];
    }

    log(msg, type = 'INFO') {
        const time = new Date().toLocaleTimeString('vi-VN', {minute:'2-digit', second:'2-digit'});
        this.logs.unshift({ time, msg, type });
        if (this.onUpdate) this.onUpdate();
    }

    endGame(winner) {
        clearInterval(this.gameInterval);
        if (this.onEvent) this.onEvent('GAME_OVER', { winner });
    }
}