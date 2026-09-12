const video = document.querySelector('#video');
const blackout = document.querySelector('#blackout');
const contact = document.querySelector('#contact');
const contactInner = contact.querySelector('.contact-inner');

// Fração da rolagem dedicada ao vídeo. O trecho restante dissolve o último
// quadro em preto, para o contato aparecer sobre fundo preto de verdade em vez
// de disputar espaço com as janelas flutuantes do final.
const VIDEO_SHARE = 0.82;
// Dentro desse trecho final: quando o preto fica sólido e quando o contato entra.
const BLACKOUT_FULL = 0.55;
const CONTACT_IN = 0.34;
const CONTACT_FULL = 0.74;

let scrollProgress = 0;
let targetTime = 0;
let scheduled = false;
let metadataReady = false;
let viewportWidth = innerWidth;

const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => value * value * (3 - 2 * value);

// Segundos no vídeo de origem: plano aberto, close do notebook e os projetos
// flutuando. Cada legenda fica na parte do quadro que permanece preta durante
// toda a sua janela. O scroll percorre a sequência igual nos dois sentidos.
const captions = [
  { el: '#intro',      start: 0,    full: 0,    fade: 0.85, end: 1.10 },
  { el: '#about',      start: 1.10, full: 1.30, fade: 1.55, end: 1.85 },
  { el: '#work-title', start: 3.50, full: 3.80, fade: 4.30, end: 4.65 },
].map(caption => ({ ...caption, el: document.querySelector(caption.el) }));

function place(element, opacity, interactive) {
  const visible = opacity > 0.001;
  element.style.opacity = opacity;
  element.style.visibility = visible ? 'visible' : 'hidden';
  element.setAttribute('aria-hidden', visible ? 'false' : 'true');
  // Mantém os links do contato fora da navegação por teclado enquanto invisíveis.
  if (interactive) element.inert = !visible;
}

function drawCaption(caption, time) {
  const { el, start, full, fade, end } = caption;
  const enter = full === start ? 1 : ease(clamp((time - start) / (full - start)));
  const leave = ease(clamp((time - fade) / (end - fade)));
  place(el, enter * (1 - leave));
  el.style.transform = `translate3d(0, ${(1 - enter) * 18 - leave * 14}px, 0)`;
}

// O véu preto e o contato são regidos pela rolagem restante, não pelo tempo do
// vídeo, que a essa altura já chegou ao último quadro.
function drawFinale(finale) {
  blackout.style.opacity = ease(clamp(finale / BLACKOUT_FULL));
  const enter = ease(clamp((finale - CONTACT_IN) / (CONTACT_FULL - CONTACT_IN)));
  place(contact, enter, true);
  contactInner.style.transform = `translate3d(0, ${(1 - enter) * 20}px, 0)`;
}

// Guarda só o alvo mais recente enquanto o decodificador ainda está buscando.
function seekToTarget() {
  if (!metadataReady || video.readyState < 1 || video.seeking) return;
  if (Math.abs(video.currentTime - targetTime) > 0.001) {
    video.currentTime = targetTime;
  }
}

function update() {
  scheduled = false;
  const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollProgress = clamp(scrollY / distance);
  // Fica dentro do último quadro em vez de buscar além do fim do vídeo.
  const videoProgress = clamp(scrollProgress / VIDEO_SHARE);
  targetTime = videoProgress * Math.max(0, (video.duration || 0) - 0.001);
  for (const caption of captions) drawCaption(caption, targetTime);
  drawFinale(clamp((scrollProgress - VIDEO_SHARE) / (1 - VIDEO_SHARE)));
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
  // Preserva o momento atual ao girar o celular ou redimensionar a janela.
  if (innerWidth !== viewportWidth) {
    viewportWidth = innerWidth;
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: scrollProgress * distance, behavior: 'instant' });
  }
  schedule();
});
window.visualViewport?.addEventListener('resize', schedule);
addEventListener('pageshow', schedule);
video.pause();
if (video.readyState >= 1) metadataReady = Number.isFinite(video.duration);
schedule();
