const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d', { alpha: false });
const blackout = document.querySelector('#blackout');
const contact = document.querySelector('#contact');
const contactInner = contact.querySelector('.contact-inner');

// Mesmo número do ?v= no index.html. Mude os dois ao regenerar os quadros, para
// o cache do GitHub Pages não misturar imagens novas com antigas.
const ASSET_VERSION = 3;
// Fração da rolagem dedicada ao vídeo. O trecho restante dissolve o último
// quadro em preto, para o contato aparecer sobre fundo preto de verdade em vez
// de disputar espaço com as janelas flutuantes do final.
const VIDEO_SHARE = 0.82;
// Dentro desse trecho final: quando o preto fica sólido e quando o contato entra.
const BLACKOUT_FULL = 0.55;
const CONTACT_IN = 0.34;
const CONTACT_FULL = 0.74;
// Quantas imagens baixar ao mesmo tempo.
const PARALLEL_LOADS = 6;

// O vídeo virou uma sequência de imagens desenhada num canvas. Com <video>, o
// Safari do iPhone não desenha quadros de um vídeo que nunca foi reproduzido
// quando só se muda o currentTime, e a página ficava preta.
let manifest = null;
let frameSet = null;
let drawnIndex = -1;
let scrollProgress = 0;
let videoProgress = 0;
let scheduled = false;
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

// Os quadros de celular são a faixa central 405x720 do vídeo. Enquanto a tela
// for mais estreita que essa proporção, eles a cobrem com o mesmo enquadramento
// que o vídeo inteiro teria, então as posições das legendas continuam valendo.
function pickVariant() {
  const { mobile, desktop } = manifest;
  return innerWidth / innerHeight <= mobile.width / mobile.height ? mobile : desktop;
}

// Baixa primeiro quadros espaçados, que já cobrem a rolagem inteira, e depois
// preenche os intervalos. Assim dá para rolar antes de tudo terminar.
function loadOrder(count) {
  const order = [];
  const queued = new Uint8Array(count);
  for (let step = 16; step >= 1; step >>= 1) {
    for (let i = 0; i < count; i += step) {
      if (!queued[i]) { queued[i] = 1; order.push(i); }
    }
  }
  if (!queued[count - 1]) order.push(count - 1);
  return order;
}

function loadFrames(variant) {
  if (frameSet?.variant === variant) return;
  const set = { variant, images: new Array(manifest.count), order: loadOrder(manifest.count), next: 0 };
  frameSet = set;
  drawnIndex = -1;
  const pump = () => {
    if (frameSet !== set || set.next >= set.order.length) return;
    const index = set.order[set.next++];
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (frameSet !== set) return;
      set.images[index] = image;
      schedule();
      pump();
    };
    image.onerror = pump;
    image.src = `assets/frames/${variant.prefix}${String(index).padStart(3, '0')}.jpg?v=${ASSET_VERSION}`;
  };
  for (let k = 0; k < PARALLEL_LOADS; k++) pump();
}

function nearestLoaded(index) {
  const { images } = frameSet;
  for (let offset = 0; offset < images.length; offset++) {
    if (images[index - offset]) return index - offset;
    if (images[index + offset]) return index + offset;
  }
  return -1;
}

function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
  drawnIndex = -1;
}

// Equivalente a object-fit: cover centralizado.
function drawImageCover(image) {
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
}

function drawScene() {
  if (!manifest) return;
  const index = nearestLoaded(Math.round(videoProgress * (manifest.count - 1)));
  if (index < 0 || index === drawnIndex) return;
  drawImageCover(frameSet.images[index]);
  drawnIndex = index;
}

function update() {
  scheduled = false;
  const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollProgress = clamp(scrollY / distance);
  videoProgress = clamp(scrollProgress / VIDEO_SHARE);
  const lastFrameTime = manifest ? (manifest.count - 1) / manifest.fps : 0;
  const time = videoProgress * lastFrameTime;
  for (const caption of captions) drawCaption(caption, time);
  drawFinale(clamp((scrollProgress - VIDEO_SHARE) / (1 - VIDEO_SHARE)));
  drawScene();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(update);
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', () => {
  // Preserva o momento atual ao girar o celular ou redimensionar a janela.
  if (innerWidth !== viewportWidth) {
    viewportWidth = innerWidth;
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: scrollProgress * distance, behavior: 'instant' });
  }
  resizeCanvas();
  if (manifest) loadFrames(pickVariant());
  schedule();
});
window.visualViewport?.addEventListener('resize', schedule);
addEventListener('pageshow', schedule);

resizeCanvas();
schedule();
fetch(`assets/frames/manifest.json?v=${ASSET_VERSION}`)
  .then(response => response.json())
  .then(data => {
    manifest = data;
    loadFrames(pickVariant());
    schedule();
  });
