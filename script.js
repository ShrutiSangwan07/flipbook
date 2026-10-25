// --- A few faint, slow hearts in the background ---
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}
const bgParent = document.getElementById('bgAnimation');
const heartPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
function createBgHeart(i) {
  const div = document.createElement('div');
  div.className = 'bg-heart' + (i % 2 === 1 ? ' bg-heart2' : '');
  div.style.left = randomBetween(4, 94) + 'vw';
  // negative delay: hearts are already mid-drift when the page opens
  div.style.animationDelay = '-' + randomBetween(0, 40) + 's';
  div.style.animationDuration = randomBetween(38, 60) + 's';
  div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="${heartPath}"/></svg>`;
  return div;
}
for (let i = 0; i < 6; ++i) bgParent.appendChild(createBgHeart(i));

// --- The book: text | small handwritten line ---
const romanticPages = [
  "Happy Birthday, Lucky.|A small book, made for you. Tap to begin.",
  "I build things for a living. So when I wanted to tell you what you mean to me, I built you this.|It isn’t big, but every word of it is true.",
  "Words don’t always come out right when I say them aloud. You are the poem my heart keeps reciting in silence, and this is me finally reading it to you.|Slowly, the way I meant it.",
  "My heart beats only for you. Each page you turn is me bringing you a little closer to it.|Just stay with me for a few pages.",
  "Your smile brightens my day more than anything else does. With you, even ordinary days feel a little enchanted.|I notice it more than I say it.",
  "Every love story is beautiful, but ours is the one I care about most.|Because it’s ours.",
  "I know I overthink. Sometimes I take a quiet moment or a careless word and read it in the worst way, when you meant nothing by it.|That says more about my mind than about your heart.",
  "I’m learning to pause and ask before I assume. You deserve to be understood, not guessed at.|I’m working on it, and I mean it.",
  "Sometimes I disagree with you, or I don’t do what you suggest. It has never meant that I don’t value you.|I hear you, even when I answer differently.",
  "Work and home keep me busy, and I can’t see you as often as I’d like to.|Not meeting is never the same as not wanting to.",
  "So please don’t read my busy days as distance. When I’m occupied, my love doesn’t go anywhere. It stays exactly where it is.|Steady, and yours.",
  "We have planned a future together, and it matters to me more than I know how to say. I’m not saying that lightly.|The best thing to hold onto in life is each other.",
  "When I picture what comes next, you’re in it. In the pages of my life, you are my favorite chapter, and I want to keep writing it with you.|When I follow my heart, it leads me to you.",
  "I hope this year is kind to you, that the things you want keep coming closer, and that you feel truly celebrated, today and on every ordinary day after it.|Wishing you the very best on the 30th of October.",
  "Whatever I get wrong along the way, I want you to be sure of this: I choose you. I loved you yesterday, I love you today, and tomorrow I’ll choose you again.|That part never changes.",
  "Happy Birthday, my Lucky.|Yours, always."
];
const pages = romanticPages;
const TOTAL = pages.length;

const flipBook = document.getElementById('flipBook');
const flipSound = document.getElementById('flipSound'); // optional: no-op if not present
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

pages.forEach((content, idx) => {
  const page = document.createElement('div');
  page.className = 'page' + (idx === 0 ? ' cover' : '') + (idx === TOTAL - 1 ? ' finale' : '');
  const [main, quote] = content.split('|');
  page.innerHTML = `
    <svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="${heartPath}"/></svg>
    <p class="page-text"></p>
    ${quote ? '<div class="love-quote"></div>' : ''}
    <div class="page-number">${idx + 1}/${TOTAL}</div>
  `;
  page.querySelector('.page-text').textContent = main;
  if (quote) page.querySelector('.love-quote').textContent = quote;
  flipBook.appendChild(page);
});
const pageDivs = flipBook.querySelectorAll('.page');

let currentPage = 0;
let flipping = false;

function playFlipSound() {
  if (!flipSound) return;
  try {
    flipSound.currentTime = 0;
    flipSound.volume = 0.35;
    const p = flipSound.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* ignore */ }
}

function setStacking() {
  pageDivs.forEach((page, idx) => {
    page.classList.toggle('flipped', idx < currentPage);
    page.classList.toggle('current', idx === currentPage);
    page.style.zIndex = idx < currentPage ? idx : TOTAL - idx;
  });
}

function renderPages(flipIdx = null) {
  setStacking();
  if (flipIdx !== null && pageDivs[flipIdx]) {
    flipping = true;
    pageDivs[flipIdx].style.zIndex = TOTAL + 5; // keep the turning page on top
    setTimeout(playFlipSound, 70);
    setTimeout(() => {
      flipping = false;
      setStacking();
    }, 900);
  }
  prevBtn.disabled = (currentPage === 0);
  nextBtn.disabled = (currentPage === TOTAL - 1);
  scheduleAutoAdvance();
}

function goNext() {
  if (currentPage < TOTAL - 1 && !flipping) {
    const flippingPage = currentPage;
    currentPage++;
    renderPages(flippingPage);
  }
}
function goPrev() {
  if (currentPage > 0 && !flipping) {
    currentPage--;
    renderPages(currentPage);
  }
}
prevBtn.onclick = goPrev;
nextBtn.onclick = goNext;

// Click: left quarter of the book goes back, anywhere else goes forward
flipBook.onclick = (e) => {
  const rect = flipBook.getBoundingClientRect();
  if (e.clientX < rect.left + rect.width * 0.25) goPrev(); else goNext();
};

// Touch swipe
let touchStartX = null;
let touchEndX = null;
flipBook.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchEndX = null;
  }
}, { passive: true });
flipBook.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) touchEndX = e.touches[0].clientX;
}, { passive: true });
flipBook.addEventListener('touchend', () => {
  if (touchStartX !== null && touchEndX !== null) {
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > Math.max(30, window.innerWidth * 0.09)) {
      if (dx > 0) goPrev(); else goNext();
      // the swipe already turned the page; swallow the click that may follow
      flipBook.dataset.swiped = '1';
      setTimeout(() => { delete flipBook.dataset.swiped; }, 400);
    }
  }
  touchStartX = null;
  touchEndX = null;
}, { passive: true });
flipBook.addEventListener('click', (e) => {
  if (flipBook.dataset.swiped) e.stopImmediatePropagation();
}, true);

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext();
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goPrev();
});

// --- Music + pacing ---
// The reading pace follows the song: the time left in the song is shared across
// the pages still to read (longer pages get a little more time). Turning pages
// by hand re-balances the rest. If the song length can't be read, 4:30 is assumed.
const bgMusic = document.getElementById('bgMusic');
const MUSIC_VOLUME = 0.5;
const FALLBACK_SONG_SECONDS = 270;
const MIN_PAGE_SECONDS = 7;
const weights = pages.map(p => 60 + p.length);
let experienceStart = null;
let autoTimer = null;

function songSeconds() {
  const d = bgMusic ? bgMusic.duration : NaN;
  return (Number.isFinite(d) && d > 20) ? d : FALLBACK_SONG_SECONDS;
}
function elapsedSeconds() {
  return experienceStart === null ? 0 : (performance.now() - experienceStart) / 1000;
}
function startExperience() {
  if (experienceStart === null) {
    experienceStart = performance.now();
    scheduleAutoAdvance();
  }
}
function scheduleAutoAdvance() {
  clearTimeout(autoTimer);
  if (experienceStart === null || currentPage >= TOTAL - 1) return;
  const remaining = Math.max(songSeconds() - elapsedSeconds(), 0);
  let total = 0;
  for (let i = currentPage; i < TOTAL; i++) total += weights[i];
  const dwell = Math.max(MIN_PAGE_SECONDS, remaining * weights[currentPage] / total);
  autoTimer = setTimeout(() => {
    if (flipping) scheduleAutoAdvance(); else goNext();
  }, dwell * 1000);
}

function tryPlayMusic() {
  if (!bgMusic) return;
  bgMusic.volume = MUSIC_VOLUME;
  bgMusic.muted = false;
  const p = bgMusic.play();
  if (p && p.catch) p.catch(() => {}); // blocked: first tap/key will start it
}
function onFirstGesture() {
  window.removeEventListener('click', onFirstGesture);
  window.removeEventListener('keydown', onFirstGesture);
  window.removeEventListener('touchstart', onFirstGesture);
  tryPlayMusic();
  startExperience();
}
window.addEventListener('click', onFirstGesture);
window.addEventListener('keydown', onFirstGesture);
window.addEventListener('touchstart', onFirstGesture, { passive: true });

if (bgMusic) {
  bgMusic.addEventListener('playing', startExperience);          // autoplay worked
  bgMusic.addEventListener('loadedmetadata', scheduleAutoAdvance); // real duration known
}
document.addEventListener('DOMContentLoaded', tryPlayMusic);

renderPages();
