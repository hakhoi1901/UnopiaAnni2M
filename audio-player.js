/**
 * AUDIO PLAYER MODULE - OCEAN THEME
 * Tự động tạo giao diện và xử lý logic phát nhạc.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayer();
});

function initAudioPlayer() {
    // 1. CẤU HÌNH PLAYLIST
    const playlist = [
        {
            title: "Đường tôi chở em về", 
            artist: "buitruonglinh",
            src: "./audio/duongtoichoemve_buitruonglinh.mp3", 
            icon: "music"
        },
        {
            title: "Nhạc Nền 2",
            artist: "My Playlist",
            src: "./audio/nhac2.mp3",
            icon: "headphones"
        },
        {
            title: "Nhạc Nền 3",
            artist: "My Playlist",
            src: "./audio/nhac3.mp3",
            icon: "waves"
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audio = new Audio();
    audio.loop = true; 

    audio.addEventListener('error', (e) => {
        console.warn("Lỗi tải file âm thanh:", audio.src);
        const trackTitle = document.getElementById('track-title');
        if(trackTitle) {
            trackTitle.innerText = "Không tìm thấy file!";
            trackTitle.style.color = "#f87171"; 
        }
    });

    // 2. INJECT CSS
    const style = document.createElement('style');
    style.textContent = `
        #ocean-player {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            background: rgba(2, 6, 23, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(34, 211, 238, 0.2);
            border-radius: 16px;
            padding: 16px;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
        }
        
        #ocean-player.minimized {
            width: 60px;
            height: 60px;
            padding: 0;
            border-radius: 50%;
            cursor: pointer;
            overflow: hidden;
            background: rgba(2, 6, 23, 0.95);
            border: 2px solid rgba(34, 211, 238, 0.5);
        }

        #ocean-player.minimized .player-controls,
        #ocean-player.minimized .player-info,
        #ocean-player.minimized .volume-container,
        #ocean-player.minimized .minimize-btn {
            display: none !important;
        }

        #ocean-player.minimized .player-header {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #ocean-player.minimized .player-icon-container {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            margin: 0;
            background: transparent;
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .player-icon-container {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            transition: all 0.3s ease;
        }

        .playing-anim {
            animation: pulse-glow 2s infinite;
        }

        .player-info {
            flex-grow: 1;
            overflow: hidden;
        }

        .track-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .track-artist {
            font-size: 0.75rem;
            color: #94a3b8;
        }

        .player-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 12px;
        }

        .ctrl-btn {
            background: none;
            border: none;
            color: #cbd5e1;
            cursor: pointer;
            transition: color 0.2s;
            padding: 4px;
        }
        .ctrl-btn:hover { color: #22d3ee; }
        
        .play-btn {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .play-btn:hover {
            background: rgba(34, 211, 238, 0.2);
            color: #22d3ee;
            transform: scale(1.05);
        }

        .volume-container {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        input[type=range] {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            appearance: none;
            outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            background: #22d3ee;
            border-radius: 50%;
            cursor: pointer;
        }

        .minimize-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            color: #64748b;
            cursor: pointer;
            padding: 4px;
            z-index: 10;
        }
        .minimize-btn:hover { color: white; }

        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
        }
    `;
    document.head.appendChild(style);

    // 3. TẠO HTML
    const playerContainer = document.createElement('div');
    playerContainer.id = 'ocean-player';
    playerContainer.title = "Click để mở rộng"; 
    playerContainer.innerHTML = `
        <button class="minimize-btn" id="min-btn" title="Thu nhỏ"><i data-lucide="minus"></i></button>
        
        <div class="player-header">
            <div class="player-icon-container" id="player-icon-box">
                <i data-lucide="music" id="track-icon"></i>
            </div>
            <div class="player-info">
                <div class="track-title" id="track-title">Loading...</div>
                <div class="track-artist" id="track-artist">Select a vibe</div>
            </div>
        </div>

        <div class="player-controls">
            <button class="ctrl-btn" id="prev-btn"><i data-lucide="skip-back"></i></button>
            <button class="ctrl-btn play-btn" id="play-btn"><i data-lucide="play" fill="currentColor"></i></button>
            <button class="ctrl-btn" id="next-btn"><i data-lucide="skip-forward"></i></button>
        </div>

        <div class="volume-container">
            <i data-lucide="volume-2" class="w-4 h-4 text-slate-400"></i>
            <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="0.5">
        </div>
    `;
    document.body.appendChild(playerContainer);

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 4. XỬ LÝ LOGIC
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const playerIconBox = document.getElementById('player-icon-box');
    const minBtn = document.getElementById('min-btn');
    const player = document.getElementById('ocean-player');

    function loadTrack(index) {
        const track = playlist[index];
        trackTitle.innerText = track.title;
        trackArtist.innerText = track.artist;
        audio.src = track.src;
        audio.volume = volumeSlider.value;
        playerIconBox.innerHTML = `<i data-lucide="${track.icon || 'music'}"></i>`;
        lucide.createIcons();
        trackTitle.style.color = "#fff";
    }

    function togglePlay() {
        if (isPlaying) {
            // Trường hợp đang hát -> Bấm để Tạm dừng
            audio.pause();
            playBtn.innerHTML = `<i data-lucide="play" fill="currentColor"></i>`;
            playerIconBox.classList.remove('playing-anim');
            isPlaying = false;
            lucide.createIcons(); // Vẽ icon Play ngay
        } else {
            // Trường hợp đang dừng -> Bấm để Hát
            audio.play().then(() => {
                // Chỉ vẽ icon Pause KHI nhạc thực sự bắt đầu chạy
                playBtn.innerHTML = `<i data-lucide="pause" fill="currentColor"></i>`;
                playerIconBox.classList.add('playing-anim');
                isPlaying = true;
                lucide.createIcons(); // Vẽ icon Pause tại đây
            }).catch(error => {
                console.warn("Autoplay blocked:", error);
                if(error.name === 'NotSupportedError') {
                    console.error("Format nhạc không được hỗ trợ hoặc đường dẫn sai.");
                }
            });
        }
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if(isPlaying) {
             isPlaying = false; 
             togglePlay();
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if(isPlaying) {
             isPlaying = false;
             togglePlay();
        }
    }

    // Event Listeners
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // Nút thu nhỏ
    minBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        player.classList.add('minimized');
    });

    // Click vào player để mở rộng lại
    player.addEventListener('click', () => {
        if (player.classList.contains('minimized')) {
            player.classList.remove('minimized');
        }
    });

    loadTrack(currentTrackIndex);
}