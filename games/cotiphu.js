class MonopolyGame {
  constructor(playerNames) {
    if (!playerNames || playerNames.length < 2) {
      throw new Error('Cần ít nhất 2 người chơi');
    }
    if (playerNames.length > 6) {
      playerNames = playerNames.slice(0, 6);
    }

    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const avatars = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬', '👩‍🏫', '🧑‍🎨'];

    this.state = {
      players: playerNames.map((name, idx) => ({
        id: idx,
        name,
        money: 1500,
        position: 0,
        properties: [],
        isBankrupt: false,
        color: colors[idx],
        avatar: avatars[idx],
        jailTurns: 0
      })),
      currentPlayerIndex: 0,
      gameOver: false,
      winner: null,
      turn: 1,
      logs: [],
      isRolling: false,
      lastDice: [0, 0],
      board: this.createBoard()
    };

    this.modalElement = null;
    this.isRunning = false;
    this.autoPlayInterval = null;
  }

  createBoard() {
    return [
      // Bottom row (left to right)
      { id: 0, type: 'start', name: 'START', icon: '🎓', desc: 'Nhận 200k mỗi lượt' },
      { id: 1, type: 'property', name: 'Căn tin A', price: 100, rent: [10, 30, 90], color: '#8b4513', owner: null, level: 0 },
      { id: 2, type: 'event', name: 'Thẻ Event', icon: '🎲' },
      { id: 3, type: 'property', name: 'Quán Cafe', price: 120, rent: [12, 36, 108], color: '#8b4513', owner: null, level: 0 },
      { id: 4, type: 'tax', name: 'Đóng Học Phí', icon: '💸', amount: 100 },
      { id: 5, type: 'property', name: 'Nhà Xe', price: 200, rent: [25, 75, 225], color: '#808080', owner: null, level: 0 },
      { id: 6, type: 'property', name: 'Phòng Lab A', price: 140, rent: [14, 42, 126], color: '#00bfff', owner: null, level: 0 },
      
      // Right column (bottom to top)
      { id: 7, type: 'corner', name: 'GYM', icon: '💪', desc: 'Nghỉ ngơi' },
      { id: 8, type: 'property', name: 'Phòng Lab B', price: 160, rent: [16, 48, 144], color: '#00bfff', owner: null, level: 0 },
      { id: 9, type: 'event', name: 'Thẻ Event', icon: '🎲' },
      { id: 10, type: 'property', name: 'Thư Viện', price: 180, rent: [18, 54, 162], color: '#ff4500', owner: null, level: 0 },
      { id: 11, type: 'property', name: 'Hội Trường', price: 200, rent: [20, 60, 180], color: '#ff4500', owner: null, level: 0 },
      { id: 12, type: 'property', name: 'Kí Túc Xá', price: 220, rent: [22, 66, 198], color: '#ffd700', owner: null, level: 0 },
      { id: 13, type: 'event', name: 'Thẻ Event', icon: '🎲' },
      
      // Top row (right to left)
      { id: 14, type: 'corner', name: 'PARKING', icon: '🅿️', desc: 'Đỗ xe miễn phí' },
      { id: 15, type: 'property', name: 'Shop Văn Phòng Phẩm', price: 240, rent: [24, 72, 216], color: '#32cd32', owner: null, level: 0 },
      { id: 16, type: 'event', name: 'Thẻ Event', icon: '🎲' },
      { id: 17, type: 'property', name: 'Cửa Hàng Tiện Lợi', price: 260, rent: [26, 78, 234], color: '#32cd32', owner: null, level: 0 },
      { id: 18, type: 'tax', name: 'Phạt Vi Phạm', icon: '⚠️', amount: 150 },
      { id: 19, type: 'property', name: 'Căn tin B', price: 280, rent: [28, 84, 252], color: '#9370db', owner: null, level: 0 },
      { id: 20, type: 'property', name: 'Sân Bóng', price: 300, rent: [30, 90, 270], color: '#9370db', owner: null, level: 0 },
      
      // Left column (top to bottom)
      { id: 21, type: 'jail', name: 'TÙ', icon: '🚔', desc: 'Nghỉ 2 lượt' },
      { id: 22, type: 'property', name: 'Phòng Máy Tính', price: 320, rent: [32, 96, 288], color: '#ff1493', owner: null, level: 0 },
      { id: 23, type: 'event', name: 'ThẀ Event', icon: '🎲' },
      { id: 24, type: 'property', name: 'Phòng Hội Nghị', price: 350, rent: [35, 105, 315], color: '#ff1493', owner: null, level: 0 },
      { id: 25, type: 'property', name: 'Phòng Thí Nghiệm', price: 400, rent: [50, 150, 450], color: '#00ced1', owner: null, level: 0 },
      { id: 26, type: 'event', name: 'Thẻ Event', icon: '🎲' },
      { id: 27, type: 'luxury', name: 'Siêu Xe', icon: '🏎️', amount: 200 }
    ];
  }

  init() {
    const modal = document.getElementById('game-modal');
    if (!modal) {
      console.error('Không tìm thấy #game-modal');
      return;
    }

    this.modalElement = modal;
    this.isRunning = true;
    this.render();
    this.addLog('🎮 GAME BẮT ĐẦU! Chào mừng đến với Tỷ Phú Tốc Độ!', 'system');
    this.startAutoPlay();
  }

  close() {
    this.isRunning = false;
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    if (this.modalElement) {
      this.modalElement.classList.remove('open');
      this.modalElement.innerHTML = '';
    }
  }

  render() {
    if (!this.modalElement) return;

    const html = `
      <div class="fixed inset-0 bg-slate-950/98 backdrop-blur-sm flex items-center justify-center p-0 z-50 overflow-hidden">
        <div class="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 w-full h-full relative border-t border-white/5">
          
          <!-- Close Button -->
          <button onclick="window.monopolyGame?.close()" 
                  class="absolute top-6 right-6 z-50 w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center transition-all hover:scale-105 group">
            <i data-lucide="x" class="w-7 h-7 text-red-400 group-hover:text-red-300"></i>
          </button>

          <div class="grid grid-cols-12 gap-0 h-full">
            
            <!-- Main Game Area -->
            <div class="col-span-9 flex flex-col items-center justify-center p-8 relative">
              
              <!-- Header -->
              <div class="absolute top-6 left-6 z-10">
                <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 mb-2">
                  💰 Tỷ Phú Tốc Độ
                </h1>
                <div class="flex items-center gap-3 text-sm">
                  <span class="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 backdrop-blur">
                    Turn ${this.state.turn}
                  </span>
                  <span class="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 backdrop-blur">
                    👥 ${this.getActivePlayers().length}/${this.state.players.length} players
                  </span>
                </div>
              </div>

              <!-- Game Board -->
              ${this.renderBoard()}

              <!-- Dice Display -->
              ${this.renderDiceDisplay()}
            </div>

            <!-- Right Panel: Event Terminal -->
            <div class="col-span-3 bg-black/40 border-l border-white/10 backdrop-blur-xl flex flex-col h-full">
              
              <!-- Players Info -->
              <div class="p-6 border-b border-white/10">
                <h2 class="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2 font-mono">
                  <i data-lucide="users" class="w-5 h-5 opacity-70"></i>
                  PLAYERS
                </h2>
                <div class="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
                  ${this.state.players.map((p, idx) => this.renderPlayerCard(p, idx)).join('')}
                </div>
              </div>

              <!-- Event Logs -->
              <div class="flex-1 flex flex-col p-6 overflow-hidden">
                <h2 class="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2 font-mono">
                  <i data-lucide="terminal" class="w-5 h-5 opacity-70"></i>
                  EVENT_LOG
                </h2>
                <div id="logs-container" class="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
                  ${this.state.logs.slice(-30).map(log => this.renderLog(log)).join('')}
                </div>
              </div>
            </div>
          </div>

          ${this.state.gameOver ? this.renderGameOver() : ''}
        </div>
      </div>
    `;

    this.modalElement.innerHTML = html;
    
    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      const logsContainer = document.getElementById('logs-container');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }, 100);
  }

  renderBoard() {
    const boardSize = 560;
    const cellSize = 70;
    
    return `
      <div class="relative" style="width: ${boardSize}px; height: ${boardSize}px;">
        <!-- Board Grid -->
        <div class="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          
          <!-- Center Area -->
          <div class="absolute inset-16 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-3 opacity-20">🏢</div>
              <div class="text-2xl font-bold text-cyan-400/30 font-mono">MONOPOLY</div>
              <div class="text-sm text-emerald-400/30 font-mono mt-2">HCMC Edition</div>
            </div>
          </div>

          <!-- Cells -->
          ${this.renderBoardCells(cellSize)}
          
          <!-- Players on Board -->
          ${this.renderPlayersOnBoard(cellSize)}
        </div>
      </div>
    `;
  }

  renderBoardCells(cellSize) {
    const positions = this.calculateCellPositions(cellSize);
    
    return this.state.board.map((cell, idx) => {
      const pos = positions[idx];
      const owner = cell.owner !== null ? this.state.players[cell.owner] : null;
      
      let bgColor = 'bg-slate-800/60';
      let borderColor = 'border-white/10';
      
      if (cell.type === 'property' && owner) {
        bgColor = 'bg-slate-800/80';
        borderColor = 'border-cyan-400/40';
      } else if (cell.type === 'corner' || cell.type === 'start') {
        bgColor = 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20';
        borderColor = 'border-cyan-400/30';
      } else if (cell.type === 'jail') {
        bgColor = 'bg-red-500/10';
        borderColor = 'border-red-400/30';
      }

      return `
        <div class="absolute ${bgColor} backdrop-blur border ${borderColor} rounded-lg transition-all hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20"
             style="left: ${pos.x}px; top: ${pos.y}px; width: ${cellSize}px; height: ${cellSize}px;">
          
          ${cell.type === 'property' && owner ? `
            <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900"
                 style="background: ${owner.color};"></div>
          ` : ''}

          ${cell.type === 'property' && cell.level > 0 ? `
            <div class="absolute -top-1 -left-1 flex gap-0.5">
              ${Array(cell.level).fill(0).map(() => `
                <div class="w-2 h-3 bg-emerald-400 rounded-sm"></div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="p-1.5 h-full flex flex-col items-center justify-center text-center">
            <div class="text-xl mb-0.5">${cell.icon || this.getCellIcon(cell.type)}</div>
            <div class="text-[9px] font-bold text-cyan-300 leading-tight line-clamp-2">${cell.name}</div>
            ${cell.price ? `<div class="text-[8px] text-emerald-400 mt-0.5">${cell.price}k</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  calculateCellPositions(cellSize) {
    const positions = [];
    const gap = 2;
    
    // Bottom row (0-6): left to right
    for (let i = 0; i <= 6; i++) {
      positions.push({ x: i * (cellSize + gap), y: 7 * (cellSize + gap) });
    }
    
    // Right column (7-13): bottom to top
    for (let i = 6; i >= 0; i--) {
      positions.push({ x: 6 * (cellSize + gap), y: i * (cellSize + gap) });
    }
    
    // Top row (14-20): right to left
    for (let i = 6; i >= 0; i--) {
      positions.push({ x: i * (cellSize + gap), y: 0 });
    }
    
    // Left column (21-27): top to bottom
    for (let i = 1; i <= 7; i++) {
      positions.push({ x: 0, y: i * (cellSize + gap) });
    }
    
    return positions;
  }

  renderPlayersOnBoard(cellSize) {
    const positions = this.calculateCellPositions(cellSize);
    
    return this.state.players.map((player, idx) => {
      if (player.isBankrupt) return '';
      
      const pos = positions[player.position];
      const offset = idx * 14;
      
      return `
        <div class="absolute transition-all duration-500 ease-out flex items-center justify-center"
             style="left: ${pos.x + offset}px; top: ${pos.y + 10}px; width: 32px; height: 32px;">
          <div class="relative">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-slate-900"
                 style="background: ${player.color};">
              ${player.avatar}
            </div>
            ${idx === this.state.currentPlayerIndex && !this.state.gameOver ? `
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderDiceDisplay() {
    if (this.state.lastDice[0] === 0) return '';
    
    return `
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 items-center">
        ${this.renderDie(this.state.lastDice[0])}
        ${this.renderDie(this.state.lastDice[1])}
        <div class="ml-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold backdrop-blur">
          Total: ${this.state.lastDice[0] + this.state.lastDice[1]}
        </div>
      </div>
    `;
  }

  renderDie(value) {
    const dots = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    return `
      <div class="w-16 h-16 rounded-xl bg-white shadow-2xl p-2 ${this.state.isRolling ? 'animate-spin' : ''}">
        <div class="grid grid-cols-3 grid-rows-3 gap-1 h-full">
          ${Array(9).fill(0).map((_, i) => `
            <div class="flex items-center justify-center">
              ${dots[value]?.includes(i) ? '<div class="w-2 h-2 bg-slate-900 rounded-full"></div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderPlayerCard(player, idx) {
    const isActive = idx === this.state.currentPlayerIndex && !this.state.gameOver;
    const borderColor = isActive ? 'border-yellow-400/60' : player.isBankrupt ? 'border-red-500/30' : 'border-white/10';
    
    return `
      <div class="p-2.5 rounded-xl bg-slate-800/40 backdrop-blur border ${borderColor} transition-all ${player.isBankrupt ? 'opacity-40' : ''} relative">
        ${isActive ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>' : ''}
        
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-sm border border-slate-700"
               style="background: ${player.color};">
            ${player.avatar}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-cyan-300 truncate font-mono">${player.name}</div>
          </div>
        </div>
        
        <div class="flex items-center justify-between text-[10px]">
          <span class="text-emerald-400 font-mono">💰 ${player.money}k</span>
          <span class="text-cyan-400 font-mono">🏠 ${player.properties.length}</span>
        </div>
        
        ${player.jailTurns > 0 ? `
          <div class="mt-1 text-[9px] text-red-400 font-mono">🚔 Jail ${player.jailTurns}</div>
        ` : ''}
      </div>
    `;
  }

  renderLog(log) {
    const colors = {
      system: 'text-cyan-400 border-l-cyan-500',
      move: 'text-slate-400 border-l-slate-600',
      buy: 'text-emerald-400 border-l-emerald-500',
      rent: 'text-amber-400 border-l-amber-500',
      event: 'text-purple-400 border-l-purple-500',
      bankrupt: 'text-red-400 border-l-red-500'
    };

    return `
      <div class="pl-2 border-l-2 ${colors[log.type] || colors.move} leading-tight opacity-80">
        <span class="opacity-50">[T${log.turn}]</span> ${log.message}
      </div>
    `;
  }

  renderGameOver() {
    return `
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-40">
        <div class="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] p-12 border border-cyan-500/30 text-center max-w-md shadow-2xl shadow-cyan-500/20">
          <div class="text-8xl mb-6">👑</div>
          <h2 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-4">
            VICTORY!
          </h2>
          <p class="text-2xl text-emerald-300 mb-2 font-bold">
            ${this.state.winner.name}
          </p>
          <p class="text-lg text-cyan-400 mb-6">
            💰 ${this.state.winner.money}k | 🏠 ${this.state.winner.properties.length} properties
          </p>
          <div class="text-sm text-slate-400 mb-8">
            Tỷ Phú Tốc Độ sau ${this.state.turn} turns
          </div>
          <button onclick="window.monopolyGame?.close()" 
                  class="px-8 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition-all hover:scale-105">
            Đóng Game
          </button>
        </div>
      </div>
    `;
  }

  getCellIcon(type) {
    const icons = {
      property: '🏠',
      event: '🎲',
      tax: '💸',
      corner: '⭐',
      jail: '🚔',
      luxury: '🏎️'
    };
    return icons[type] || '❓';
  }

  // Game Logic
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isRunning || this.state.gameOver) {
        clearInterval(this.autoPlayInterval);
        return;
      }
      this.playTurn();
    }, 2500);
  }

  playTurn() {
    const player = this.state.players[this.state.currentPlayerIndex];
    
    if (player.isBankrupt) {
      this.nextPlayer();
      return;
    }

    // Handle jail
    if (player.jailTurns > 0) {
      player.jailTurns--;
      this.addLog(`${player.name} ở tù, còn ${player.jailTurns} lượt`, 'move');
      this.nextPlayer();
      return;
    }

    // Roll dice
    this.rollDice(player);
  }

  rollDice(player) {
    this.state.isRolling = true;
    this.render();

    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;
      
      this.state.lastDice = [dice1, dice2];
      this.state.isRolling = false;
      
      this.addLog(`${player.name} tung xúc xắc: ${dice1} + ${dice2} = ${total}`, 'move');
      
      // Move player
      this.movePlayer(player, total);
    }, 500);
  }

  movePlayer(player, steps) {
    const oldPos = player.position;
    player.position = (player.position + steps) % this.state.board.length;
    
    // Pass START
    if (player.position < oldPos) {
      player.money += 200;
      this.addLog(`${player.name} đi qua START, nhận 200k 💰`, 'event');
    }
    
    this.render();
    
    setTimeout(() => {
      this.handleCell(player);
    }, 600);
  }

  handleCell(player) {
    const cell = this.state.board[player.position];
    
    switch(cell.type) {
      case 'property':
        this.handleProperty(player, cell);
        break;
      case 'event':
        this.handleEvent(player);
        break;
      case 'tax':
        this.handleTax(player, cell);
        break;
      case 'jail':
        this.handleJail(player);
        break;
      case 'luxury':
        this.handleLuxury(player, cell);
        break;
      default:
        this.nextPlayer();
    }
  }

  handleProperty(player, cell) {
    if (cell.owner === null) {
      // Buy property
      if (player.money >= cell.price) {
        player.money -= cell.price;
        cell.owner = player.id;
        player.properties.push(cell.id);
        this.addLog(`${player.name} mua ${cell.name} (${cell.price}k) 🏠`, 'buy');
      } else {
        this.addLog(`${player.name} không đủ tiền mua ${cell.name}`, 'move');
      }
    } else if (cell.owner !== player.id) {
      // Pay rent
      const owner = this.state.players[cell.owner];
      const rent = cell.rent[cell.level];
      player.money -= rent;
      owner.money += rent;
      this.addLog(`${player.name} trả ${rent}k tiền thuê cho ${owner.name} 💸`, 'rent');
      
      // Upgrade property
      if (cell.level < 2 && owner.money >= cell.price * 0.5) {
        const upgradeCost = Math.floor(cell.price * 0.5);
        owner.money -= upgradeCost;
        cell.level++;
        this.addLog(`${owner.name} nâng cấp ${cell.name} lên LV${cell.level} 📈`, 'buy');
      }
      
      if (player.money < 0) {
        this.handleBankruptcy(player);
      }
    }
    
    this.nextPlayer();
  }

  handleEvent(player) {
    const events = [
      { text: 'Tìm được 100k trên đường! 💵', money: 100 },
      { text: 'Mất điện thoại, mất 80k! 📱', money: -80 },
      { text: 'Trúng học bổng 150k! 🎓', money: 150 },
      { text: 'Quên khóa xe, bị phạt 60k! 🚲', money: -60 },
      { text: 'Bán đồ cũ được 120k! 📦', money: 120 },
      { text: 'Ăn vặt hết 50k! 🍕', money: -50 }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];

player.money += event.money;
this.addLog(`${player.name} ${event.text}`, 'event');

if (player.money < 0) {
    this.handleBankruptcy(player);
}

this.nextPlayer();
}

handleTax(player, cell) {
    player.money -= cell.amount;
    this.addLog(`${player.name} đóng ${cell.amount}k ${cell.name} 💸`, 'rent');
    if (player.money < 0) {
        this.handleBankruptcy(player);
    }
    this.nextPlayer();
}

handleJail(player) {
    player.jailTurns = 2;
    player.position = 21; // Jail position
    this.addLog(`${player.name} vào tù! Nghỉ 2 lượt 🚔`, 'event');
    this.nextPlayer();
}

handleLuxury(player, cell) {
    player.money -= cell.amount;
    this.addLog(`${player.name} mua ${cell.name}, mất ${cell.amount}k 🏎️`, 'rent');
    if (player.money < 0) {
        this.handleBankruptcy(player);
    }
    this.nextPlayer();
}

handleBankruptcy(player) {
    this.addLog(`${player.name} phá sản! 💥`, 'bankrupt');
    player.isBankrupt = true;
    // Transfer properties to bank
    player.properties.forEach(propId => {
        const cell = this.state.board[propId];
        cell.owner = null;
        cell.level = 0;
    });
    player.properties = [];
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 1) {
        this.state.gameOver = true;
        this.state.winner = activePlayers[0];
        this.addLog(`${this.state.winner.name} thắng game! 🏆`, 'system');
        this.render();
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

nextPlayer() {
    do {
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    } while (this.state.players[this.state.currentPlayerIndex].isBankrupt && !this.state.gameOver);

    if (this.state.currentPlayerIndex === 0) {
        this.state.turn++;
    }
    this.state.lastDice = [0, 0];
    this.render();
}

addLog(message, type) {
    this.state.logs.push({ message, type, turn: this.state.turn });
    this.render();
}

getActivePlayers() {
    return this.state.players.filter(p => !p.isBankrupt);
}
}