/**
 * MODULE 4: ĐIỀU KHIỂN & SỰ KIỆN (EVENTS)
 * Kết nối UI và Logic game.
 */

function initMonopolyGame() {
    const modal = document.getElementById('game-modal');
    modal.classList.add('open');

    // 1. Khởi tạo
    // Giả lập lấy tên từ hệ thống chính hoặc dùng tên mặc định
    const playerNames = ["Trưởng Nhóm", "Dev Frontend", "Dev Backend", "Tester"];
    
    window.monopolyGame = new MonopolyCore(playerNames);
    const ui = new MonopolyUI(window.monopolyGame);
    
    // 2. Setup Giao diện
    ui.init();

    // 3. Kết nối Callback từ Core sang UI
    window.monopolyGame.onUpdate = () => {
        ui.update(window.monopolyGame);
    };

    window.monopolyGame.onEvent = (type, data) => {
        if (type === 'BUY_LAND') {
            ui.showActionModal(
                "CƠ HỘI ĐẦU TƯ", 
                `Bạn muốn mua <b>${data.tile.name}</b> với giá <span class="text-emerald-400">$${data.tile.price}</span> không?`,
                () => window.monopolyGame.buyProperty(data.player, data.tile), // Yes
                () => window.monopolyGame.nextTurn() // No
            );
        } else if (type === 'UPGRADE_LAND') {
            const cost = Math.floor(data.tile.price * 0.5);
            ui.showActionModal(
                "NÂNG CẤP NHÀ",
                `Nâng cấp <b>${data.tile.name}</b> lên cấp ${data.tile.level + 1}? Giá: <span class="text-amber-400">$${cost}</span>`,
                () => window.monopolyGame.upgradeProperty(data.player, data.tile),
                () => window.monopolyGame.nextTurn()
            );
        } else if (type === 'GAME_OVER') {
            alert(`TRÒ CHƠI KẾT THÚC! NGƯỜI CHIẾN THẮNG: ${data.winner.name}`);
        }
    };

    // 4. Bắt sự kiện nút bấm
    const rollBtn = document.getElementById('roll-btn');
    rollBtn.addEventListener('click', () => {
        // Disable nút để tránh spam
        rollBtn.disabled = true;
        rollBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Hiệu ứng đổ xí ngầu giả (Animation)
        let count = 0;
        const rollAnim = setInterval(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            document.querySelectorAll('.dice')[0].innerText = d1;
            document.querySelectorAll('.dice')[1].innerText = d2;
            count++;
            if (count > 10) {
                clearInterval(rollAnim);
                // Chạy logic thật
                const steps = window.monopolyGame.rollDice();
                setTimeout(() => {
                    window.monopolyGame.movePlayer(steps);
                    // Enable lại nút sau khi xử lý xong (Logic nextTurn sẽ gọi update UI)
                    rollBtn.disabled = false;
                    rollBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }, 500);
            }
        }, 100);
    });

    // 5. Thêm nút đóng vào instance (để nút X trên header gọi được)
    window.monopolyGame.close = () => {
        clearInterval(window.monopolyGame.gameInterval);
        modal.classList.remove('open');
    };

    // Start Timer
    window.monopolyGame.startGame();
    ui.update(window.monopolyGame); // Render lần đầu
}

// Cập nhật hàm selectGame trong script.js chính để gọi initMonopolyGame
// (Bạn cần sửa file script.js chính: if (gameType === 'monopoly') initMonopolyGame();)