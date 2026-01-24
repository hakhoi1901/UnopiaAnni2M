/**
 * MODULE 4: ĐIỀU KHIỂN & SỰ KIỆN (CONTROLS) - ASYNC SUPPORT
 * Kết nối UI, Logic và truyền tham chiếu UI vào Core.
 */

function initMonopolyGame() {
    const modal = document.getElementById('game-modal');
    modal.classList.add('open');

    // Tên thành viên
    const playerNames = ["Tuyền", "Nghĩa", "Khôi", "QAnh", "Triêm"];
    
    window.monopolyGame = new MonopolyCore(playerNames);
    const ui = new MonopolyUI(window.monopolyGame);
    
    // TRUYỀN UI VÀO CORE ĐỂ GỌI TOAST
    window.monopolyGame.uiRef = ui;
    
    ui.init();

    window.monopolyGame.onUpdate = () => {
        ui.update(window.monopolyGame);
    };

    window.monopolyGame.onEvent = (type, data) => {
        if (type === 'BUY_LAND') {
            ui.showPropertyModal(
                'BUY',
                data.tile,
                data.player,
                () => window.monopolyGame.buyProperty(data.player, data.tile),
                () => window.monopolyGame.nextTurn()
            );
        } else if (type === 'UPGRADE_LAND') {
            ui.showPropertyModal(
                'UPGRADE',
                data.tile,
                data.player,
                () => window.monopolyGame.upgradeProperty(data.player, data.tile),
                () => window.monopolyGame.nextTurn()
            );
        } else if (type === 'GAME_OVER') {
            alert(`TRÒ CHƠI KẾT THÚC! NGƯỜI CHIẾN THẮNG: ${data.winner.name}`);
        }
    };

    const rollBtn = document.getElementById('roll-btn');
    rollBtn.addEventListener('click', () => {
        rollBtn.disabled = true;
        rollBtn.classList.add('opacity-50', 'cursor-not-allowed');
        rollBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Đang gieo...';
        if(window.lucide) window.lucide.createIcons();
        
        let count = 0;
        const rollAnim = setInterval(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            ui.rotateDice('dice-1', d1);
            ui.rotateDice('dice-2', d2);
            
            count++;
            if (count > 12) {
                clearInterval(rollAnim);
                const steps = window.monopolyGame.rollDice();
                
                ui.rotateDice('dice-1', window.monopolyGame.diceResult[0]);
                ui.rotateDice('dice-2', window.monopolyGame.diceResult[1]);

                setTimeout(() => {
                    // GỌI HÀM DI CHUYỂN TỪNG BƯỚC (Async)
                    window.monopolyGame.movePlayerStepByStep(steps).then(() => {
                        rollBtn.disabled = false;
                        rollBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                        rollBtn.innerHTML = '<i data-lucide="dices"></i> Gieo Xúc Xắc';
                        if(window.lucide) window.lucide.createIcons();
                    });
                }, 500);
            }
        }, 80);
    });

    window.monopolyGame.close = () => {
        clearInterval(window.monopolyGame.gameInterval);
        modal.classList.remove('open');
    };

    window.monopolyGame.startGame();
    ui.update(window.monopolyGame);
}