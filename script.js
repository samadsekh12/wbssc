// ----- Elements -----
const container = document.getElementById("playerContainer");
const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPause");
const backBtn = document.getElementById("back");
const fwdBtn = document.getElementById("forward");
const muteBtn = document.getElementById("mute");
const volumeSlider = document.getElementById("volume");
const progress = document.getElementById("progress");
const speed = document.getElementById("speed");
const ccBtn = document.getElementById("cc");
const fsBtn = document.getElementById("fullscreen");
const curTime = document.getElementById("currentTime");
const durTime = document.getElementById("duration");
const playlistEl = document.getElementById("playlist");

// ----- State -----
let currentIndex = 0;
let trackEl = null;

// Build playlist from DOM <li> items that include <video> previews
const PLAYLIST = [...playlistEl.querySelectorAll(".item")].map((li, i) => {
  return {
    index: i,
    el: li,
    title: li.dataset.title || `Item ${i + 1}`,
    mp4: li.dataset.srcMp4 || "",
    webm: li.dataset.srcWebm || "",
    poster: li.dataset.poster || "",
    track: li.dataset.track || "",
    lang: li.dataset.lang || "en",
  };
});

// ----- Helpers -----
function fmt(t) {
  if (!Number.isFinite(t)) return "00:00";
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  const m = Math.floor((t / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(t / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function setActive(idx) {
  PLAYLIST.forEach((item, i) => {
    item.el.classList.toggle("active", i === idx);
    item.el.setAttribute("aria-selected", i === idx ? "true" : "false");
  });
}

function attachTrack(src, lang = "en") {
  if (trackEl) {
    try { trackEl.remove(); } catch {}
    trackEl = null;
  }
  if (!src) {
    ccBtn.disabled = true;
    ccBtn.textContent = "CC";
    return;
  }
  trackEl = document.createElement("track");
  trackEl.kind = "subtitles";
  trackEl.label = "Subtitles";
  trackEl.srclang = lang;
  trackEl.src = src;
  trackEl.default = false;
  video.appendChild(trackEl);
  ccBtn.disabled = false;
  // Ensure track object is ready
  video.textTracks && [...video.textTracks].forEach(t => (t.mode = "disabled"));
}

function toggleCaptions() {
  const tracks = video.textTracks;
  if (!tracks || tracks.length === 0) return;
  const track = tracks[0];
  const showing = track.mode === "showing";
  track.mode = showing ? "disabled" : "showing";
  ccBtn.textContent = showing ? "CC" : "CC✓";
  ccBtn.setAttribute("aria-pressed", (!showing).toString());
}

function loadVideo(idx, autoplay = true) {
  const item = PLAYLIST[idx];
  if (!item) return;

  currentIndex = idx;
  // Set poster
  video.poster = item.poster || "";

  // Swap sources
  video.pause();
  video.removeAttribute("src");
  // Remove existing <source> children
  [...video.querySelectorAll("source")].forEach(s => s.remove());

  if (item.mp4) {
    const s = document.createElement("source");
    s.src = item.mp4;
    s.type = "video/mp4";
    video.appendChild(s);
  }
  if (item.webm) {
    const s = document.createElement("source");
    s.src = item.webm;
    s.type = "video/webm";
    video.appendChild(s);
  }

  // Tracks
  attachTrack(item.track, item.lang);

  // Reset UI and load
  progress.value = 0;
  curTime.textContent = "00:00";
  durTime.textContent = "00:00";
  playPauseBtn.textContent = "▶️";

  video.load();
  setActive(idx);
  if (autoplay) video.play().catch(() => {});
}

// ----- Init playlist interactions -----
PLAYLIST.forEach((item, idx) => {
  const li = item.el;
  // Click to play
  li.addEventListener("click", () => loadVideo(idx, true));
  // Keyboard activation
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      loadVideo(idx, true);
    }
  });
});

// ----- Controls events -----
playPauseBtn.addEventListener("click", () => {
  if (video.paused) video.play();
  else video.pause();
});

video.addEventListener("play", () => (playPauseBtn.textContent = "⏸️"));
video.addEventListener("pause", () => (playPauseBtn.textContent = "▶️"));

backBtn.addEventListener("click", () => {
  video.currentTime = Math.max(0, video.currentTime - 10);
});

fwdBtn.addEventListener("click", () => {
  const d = isFinite(video.duration) ? video.duration : Infinity;
  video.currentTime = Math.min(d, video.currentTime + 10);
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
});
video.addEventListener("volumechange", () => {
  muteBtn.textContent = video.muted || video.volume === 0 ? "🔇" : "🔈";
  volumeSlider.value = String(video.muted ? 0 : video.volume);
});

volumeSlider.addEventListener("input", () => {
  video.volume = Number(volumeSlider.value);
  video.muted = video.volume === 0;
});

speed.addEventListener("change", () => {
  video.playbackRate = Number(speed.value);
});

fsBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await container.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
});

ccBtn.addEventListener("click", toggleCaptions);

// ----- Time & progress -----
video.addEventListener("loadedmetadata", () => {
  durTime.textContent = fmt(video.duration);
  progress.max = isFinite(video.duration) ? video.duration : 0;
});

video.addEventListener("timeupdate", () => {
  curTime.textContent = fmt(video.currentTime);
  if (isFinite(video.duration)) {
    progress.value = video.currentTime;
  }
});

progress.addEventListener("input", () => {
  video.currentTime = Number(progress.value);
});

// Auto-advance to next item
video.addEventListener("ended", () => {
  const next = currentIndex + 1;
  if (next < PLAYLIST.length) {
    loadVideo(next, true);
  } else {
    video.currentTime = 0;
    video.pause();
  }
});

// ----- Keyboard shortcuts (Space/K, arrows, F/M/C, 0–9) -----
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  if (typing) return;

  switch (e.key.toLowerCase()) {
    case " ":
    case "k":
      e.preventDefault();
      video.paused ? video.play() : video.pause();
      break;
    case "arrowleft":
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
      break;
    case "arrowright":
      e.preventDefault();
      video.currentTime = Math.min(
        isFinite(video.duration) ? video.duration : Infinity,
        video.currentTime + 5
      );
      break;
    case "arrowup":
      e.preventDefault();
      video.volume = Math.min(1, video.volume + 0.05);
      video.muted = false;
      break;
    case "arrowdown":
      e.preventDefault();
      video.volume = Math.max(0, video.volume - 0.05);
      video.muted = video.volume === 0;
      break;
    case "f":
      e.preventDefault();
      if (!document.fullscreenElement) container.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
      break;
    case "m":
      e.preventDefault();
      video.muted = !video.muted;
      break;
    case "c":
      e.preventDefault();
      toggleCaptions();
      break;
    default:
      if (e.key >= "0" && e.key <= "9" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const pct = Number(e.key) / 10;
        if (isFinite(video.duration)) video.currentTime = video.duration * pct;
      }
  }
});

// ----- Boot -----
if (PLAYLIST.length > 0) {
  // Load first item without autoplay
  loadVideo(0, false);
  video.volume = 1;
}
