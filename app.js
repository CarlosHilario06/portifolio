const video = document.querySelector('#video');
const intro = document.querySelector('#intro');
const about = document.querySelector('#about');
const workTitle = document.querySelector('#work-title');
let targetTime = 0;
let scheduled = false;
let metadataReady = false;
let viewportWidth = innerWidth;

const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => value * value * (3 - 2 * value);

function updateCaption(element, time, start, full, fade, end) {
  const enter = start === 0 ? 1 : ease(clamp((time - start) / (full - start)));
  const leave = ease(clamp((time - fade) / (end - fade)));
  const opacity = enter * (1 - leave);
  element.style.opacity = opacity;
  element.style.transform = `translate3d(0, ${(1 - enter) * 18 - leave * 14}px, 0)`;
  element.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
  element.setAttribute('aria-hidden', opacity <= 0.001 ? 'true' : 'false');
}

function updateCaptions(time) {
  // Seconds in the source video: wide shot, notebook close-up, floating projects.
  // Scroll position drives the entire sequence identically in either direction.
  updateCaption(intro, time, 0, 0, 0.85, 1.10);
  updateCaption(about, time, 1.10, 1.30, 1.55, 1.85);
  updateCaption(workTitle, time, 3.50, 3.80, 4.30, 4.65);
}

// Keep just the newest scroll target while the decoder is seeking.
function seekToTarget() {
  if (!metadataReady || video.readyState < 1 || video.seeking) return;
  if (Math.abs(video.currentTime - targetTime) > 0.001) {
    video.currentTime = targetTime;
  }
}

function update() {
  scheduled = false;
  const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / distance));
  // Stay inside the final frame instead of seeking beyond the video.
  targetTime = progress * Math.max(0, (video.duration || 0) - 0.001);
  updateCaptions(targetTime);
  seekToTarget();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(update);
}

video.addEventListener('loadedmetadata', () => {
  metadataReady = Number.isFinite(video.duration);
  schedule();
});
video.addEventListener('loadeddata', schedule);
video.addEventListener('canplay', schedule);
video.addEventListener('seeked', seekToTarget);
video.addEventListener('play', () => video.pause());
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', () => {
  // Preserve the current moment when rotating the phone or resizing the window.
  if (innerWidth !== viewportWidth) {
    viewportWidth = innerWidth;
    const end = Math.max(0, (video.duration || 0) - 0.001);
    const progress = end ? targetTime / end : 0;
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: progress * distance, behavior: 'instant' });
  }
  schedule();
});
window.visualViewport?.addEventListener('resize', schedule);
addEventListener('pageshow', schedule);
video.pause();
if (video.readyState >= 1) metadataReady = Number.isFinite(video.duration);
schedule();
