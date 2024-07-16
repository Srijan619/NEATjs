document.addEventListener('DOMContentLoaded', () => {
    const currentTrack = document.getElementById('track-title');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const trackList = document.getElementById('track-list');
    const progressContainer = document.getElementById('progress-container');
    let sound;
    let currentTrackIndex = null;

    const fetchTracks = async () => {
        const response = await fetch('http://localhost:3000/api/tracks');
        const tracks = await response.json();
        return tracks;
    };

    progressContainer.addEventListener('click', (event) => {
        const { clientX } = event;
        const { left, width } = progressContainer.getBoundingClientRect();
        const clickPosition = (clientX - left) / width;
        const newTime = clickPosition * sound.duration();
        sound.seek(newTime);
        updateProgress();
    });

    function updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const seek = sound.seek() || 0;
        const duration = sound.duration();
        progressBar.style.width = ((seek / duration) * 100) + '%';

        document.getElementById('current-time').textContent = formatTime(seek);
        if (sound.playing()) {
            requestAnimationFrame(updateProgress);
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const updateTrackList = (tracks) => {
        trackList.innerHTML = '';
        tracks.forEach((track, index) => {
            const trackItem = document.createElement('li');
            trackItem.textContent = track.relativePath;
            trackItem.addEventListener('click', () => {
                currentTrackIndex = index;
                if (sound) sound.unload();
                sound = new Howl({
                    src: [track.path],
                    html5: true, // Force HTML5 Audio to ensure the audio file can stream
                    onplay: () => {
                        const duration = sound.duration();
                        document.getElementById('end-time').textContent = formatTime(duration);
                        requestAnimationFrame(updateProgress);
                    },
                    onend: () => {
                        document.getElementById('play-pause').textContent = 'Play';
                    }
                });
                currentTrack.textContent = track.name;
                sound.play();
                playButton.style.display = 'none';
                pauseButton.style.display = 'inline-block';
                highlightPlayingTrack(index);
            });
            trackList.appendChild(trackItem);
        });
    };

    const highlightPlayingTrack = (index) => {
        const trackItems = trackList.querySelectorAll('li');
        trackItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    };

    playButton.addEventListener('click', () => {
        if (sound) {
            sound.play();
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            highlightPlayingTrack(currentTrackIndex);
        }
    });

    pauseButton.addEventListener('click', () => {
        if (sound) {
            sound.pause();
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    });

    fetchTracks().then(updateTrackList);

    // Shortcuts
    document.addEventListener("keydown", handleKeyShortcut);

    function handleKeyShortcut(e) {
        if (e.code === 'keyR') {
            // Handle replay
            console.log("sounf", sound)
        }
    }
});
