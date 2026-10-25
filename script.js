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
  div.style.animationDelay = '-' + randomBetween(0, 40) + 's'; // already mid-drift on load
  div.style.animationDuration = randomBetween(38, 60) + 's';
  div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="${heartPath}"/></svg>`;
  return div;
}
for (let i = 0; i < 6; ++i) bgParent.appendChild(createBgHeart(i));

// --- The book: each page is its lines (split by \n) | a small handwritten note ---
const romanticPages = [
  "Happy Birthday, Love.\n|A small book, made just for you.",

  "I build things for a living.\nSo when I wanted to tell you what you mean to me,\nI built you this.\nIt isn’t perfect, and I’m not always good with words.\nBut every line in here is meant.|Take your time with it.",

  "Four years.\nThat’s a long time to hold on to someone.\nI’m grateful for every one of them.\nNot because everything was easy,\nbut because it was us.|Four years, and I still choose us.",

  "My heart beats only for you.\nYou make ordinary days feel lighter.\nYour smile brightens my day more than anything else does.\nWith you, even the quiet parts of life\nfeel a little enchanted.|I notice it more than I say it.",

  "Words don’t always come out right when I say them aloud.\nI feel more than I manage to explain.\nYou are the poem my heart keeps reciting in silence.\nThis is me finally reading it to you.|Slowly, the way I meant it.",

  "Every love story is beautiful.\nBut ours is the one I care about most.\nIt isn’t perfect, and it doesn’t have to be.\nIt’s real, it’s ours,\nand I’m proud to be in it with you.|Because it’s ours.",

  "I know I overthink.\nSometimes a quiet moment or a short reply\nbecomes a whole story in my head.\nAnd it’s rarely a kind one.\nYou may have meant nothing by it.\nThat says more about my mind than about your heart.|You deserve more than my assumptions.",

  "I’m learning to pause before I decide what something means.\nTo ask you, instead of guessing.\nTo believe the good in you\nbefore I believe the worst in my head.\nI won’t get it right every time.|I’m working on it, and I mean it.",

  "Sometimes I don’t agree with you.\nSometimes I don’t follow what you suggest,\nbecause it doesn’t feel right to me.\nThat is never me dismissing you.\nI listen, and I think about it,\neven when I answer differently.|Disagreeing is not the same as not valuing you.",

  "Work keeps me busy, and so do my responsibilities at home.\nSo I can’t meet you as often as I’d like to.\nI miss you in the gaps.\nI wish I could give you more of my time than I can.|Not meeting is never the same as not wanting to.",

  "So please don’t read my busy days as distance.\nWhen I’m tired, occupied or quiet,\nmy love hasn’t gone anywhere.\nIt stays right where it is.\nIt doesn’t pause when life gets loud.|Steady, and yours.",

  "We have planned a future together.\nIt matters to me more than I know how to say.\nWhen I picture what comes next, you are in it.\nI want to build it with you, patiently.\nI’m not saying that lightly.|The best thing to hold onto in life is each other.",

  "In the pages of my life, you are my favorite chapter.\nI want to keep writing it with you.\nNot perfectly, but honestly.\nThrough the busy weeks, the long days,\nand the good ones we haven’t lived yet.|When I follow my heart, it leads me to you.",

  "Lucky, it’s your birthday.\nI hope this year is kind to you.\nI hope the things you want keep coming closer.\nI hope you feel celebrated today,\nand on every ordinary day after it.|Wishing you the very best today and always.",

  "Whatever I get wrong along the way,\nI want you to be sure of this.\nI choose you.\nI loved you yesterday, I love you today,\nand tomorrow I’ll choose you again.|That part never changes.",

  "Happy Birthday, Love.\nHere’s to another year of us.|Yours, always."
];
const TOTAL = romanticPages.length;

const flipBook = document.getElementById('flipBook');
const bookArea = document.getElementById('bookArea');
const flipSound = document.getElementById('flipSound'); // optional: no-op if not present
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseNote = document.getElementById('pauseNote');
const songBtn = document.getElementById('songBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const bgMusic = document.getElementById('bgMusic');

romanticPages.forEach((content, idx) => {
  const page = document.createElement('div');
  page.className = 'page' + (idx === 0 ? ' cover' : '') + (idx === TOTAL - 1 ? ' finale' : '');
  const [main, quote] = content.split('|');
  page.innerHTML = `
    <svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="${heartPath}"/></svg>
    <div class="page-text"></div>
    ${quote ? '<div class="love-quote"></div>' : ''}
    <div class="page-number">${idx + 1}/${TOTAL}</div>
  `;
  const box = page.querySelector('.page-text');
  main.split('\n').forEach((text) => {
    const line = document.createElement('span');
    line.className = 'line';
    line.textContent = text;
    box.appendChild(line);
  });
  if (quote) page.querySelector('.love-quote').textContent = quote;
  flipBook.appendChild(page);
});
const pageDivs = flipBook.querySelectorAll('.page');

let currentPage = 0;
let flipping = false;
let bookOpen = false;          // true once the opening screen has been dismissed

// =====================================================================
// Reading pace (all timing lives here: ONE timer, ONE place that starts/stops it)
// =====================================================================
// Each page needs a minimum reading time from its word count. The time left in
// the song is shared across the pages still to read, in proportion to those
// reading times, and a page is never given less than its reading time.
// If the song length can't be read (file missing/blocked), 3:30 is assumed.
const FALLBACK_SONG_SECONDS = 210;
const READ_BASE_SECONDS = 3;       // settling time on every page
const READ_PER_WORD_SECONDS = 0.26; // about 230 words a minute
const MIN_RESUME_MS = 2500;        // after a pause, always leave a moment before turning
const readSeconds = romanticPages.map((c) =>
  READ_BASE_SECONDS + READ_PER_WORD_SECONDS * c.replace('|', ' ').split(/\s+/).filter(Boolean).length);

let experienceStart = null;        // set when the book opens; wall clock used if the song can't be heard
let audioWorking = false;          // true once the song has really started playing

// Pause reasons. The book moves on only when none of them is set.
let manualPaused = false;          // pause button / Space
let hoverPaused = false;           // mouse is over the book (desktop)
let holdPaused = false;            // finger/mouse held down on the page
let hiddenPaused = false;          // tab hidden or screen locked

let autoTimer = null;
let timerStartedAt = 0;
let timerDuration = 0;
let pageRemainingMs = 0;

function songSeconds() {
  const d = bgMusic ? bgMusic.duration : NaN;
  return (Number.isFinite(d) && d > 20) ? d : FALLBACK_SONG_SECONDS;
}
function songElapsed() {
  if (audioWorking && bgMusic) return bgMusic.ended ? songSeconds() : bgMusic.currentTime;
  return experienceStart === null ? 0 : (performance.now() - experienceStart) / 1000;
}
function isPaused() {
  return manualPaused || hoverPaused || holdPaused || hiddenPaused;
}
function dwellSecondsFor(i) {
  const remaining = Math.max(songSeconds() - songElapsed(), 0);
  let total = 0;
  for (let j = i; j < TOTAL; j++) total += readSeconds[j];
  return Math.max(readSeconds[i], remaining * readSeconds[i] / total);
}

// Called when a page is shown: work out how long it gets, then (re)sync the timer.
function enterPage() {
  stopTimer(false);
  pageRemainingMs = (bookOpen && currentPage < TOTAL - 1) ? dwellSecondsFor(currentPage) * 1000 : 0;
  syncTimer();
}
function stopTimer(keepRemaining) {
  if (autoTimer === null) return;
  clearTimeout(autoTimer);
  autoTimer = null;
  if (keepRemaining) pageRemainingMs = Math.max(timerDuration - (performance.now() - timerStartedAt), 0);
}
// The single place that decides whether the timer runs.
function syncTimer() {
  const shouldRun = bookOpen && !isPaused() && currentPage < TOTAL - 1;
  if (shouldRun && autoTimer === null) {
    timerDuration = Math.max(pageRemainingMs, MIN_RESUME_MS);
    timerStartedAt = performance.now();
    autoTimer = setTimeout(onDwellDone, timerDuration);
  } else if (!shouldRun) {
    stopTimer(true);
  }
  updateControls();
}
function onDwellDone() {
  autoTimer = null;
  if (flipping) { pageRemainingMs = 300; syncTimer(); return; }
  goNext();
}

function updateControls() {
  const showPaused = bookOpen && isPaused() && currentPage < TOTAL - 1;
  pauseNote.hidden = !showPaused;
  pauseBtn.setAttribute('aria-pressed', manualPaused ? 'true' : 'false');
  pauseBtn.setAttribute('aria-label', manualPaused ? 'Resume reading' : 'Pause reading');
  prevBtn.disabled = (currentPage === 0);
  nextBtn.disabled = (currentPage === TOTAL - 1);
}

// =====================================================================
// Page turning
// =====================================================================
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
  enterPage();
}

function goNext() {
  if (bookOpen && currentPage < TOTAL - 1 && !flipping) {
    const flippingPage = currentPage;
    currentPage++;
    renderPages(flippingPage);
  }
}
function goPrev() {
  if (bookOpen && currentPage > 0 && !flipping) {
    currentPage--;
    renderPages(currentPage);
  }
}
prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

// =====================================================================
// Pause to read: button, keyboard, hover (mouse), press-and-hold (touch/pen/mouse)
// None of these touch the song.
// =====================================================================
function setManualPaused(value) {
  manualPaused = value;
  syncTimer();
}
pauseBtn.addEventListener('click', () => setManualPaused(!manualPaused));

document.addEventListener('keydown', (e) => {
  if (!bookOpen) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext();
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goPrev();
  else if ((e.key === ' ' || e.key === 'p' || e.key === 'P') && !e.target.closest('button')) {
    e.preventDefault();
    setManualPaused(!manualPaused);
  }
});

// Desktop hover: only for a real mouse (touch "hover" would stick). After clicking
// "Open your birthday book" the cursor is left resting on the book, so hover only
// counts once the mouse really moves again.
let hoverGate = null;              // {x, y} of the opening click, until the mouse moves away
bookArea.addEventListener('pointerenter', (e) => {
  if (e.pointerType === 'mouse' && !hoverGate) { hoverPaused = true; syncTimer(); }
});
bookArea.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !hoverGate) return;
  if (Math.hypot(e.clientX - hoverGate.x, e.clientY - hoverGate.y) < 15) return;
  hoverGate = null;
  hoverPaused = true;
  syncTimer();
});
bookArea.addEventListener('pointerleave', (e) => {
  if (e.pointerType === 'mouse') { hoverGate = null; hoverPaused = false; syncTimer(); }
});

// Press-and-hold on the page. A quick tap turns the page, a swipe turns it,
// and a longer press just holds the page still while it's pressed.
const HOLD_MS = 350;
const MOVE_TOLERANCE = 10;
let holdPointerId = null;
let holdStartTime = 0;
let holdStartX = 0;
let holdStartY = 0;
let holdMoved = false;
let lastPointerType = 'mouse';

function endHold() {
  if (holdPointerId === null) return;
  holdPointerId = null;
  holdPaused = false;
  syncTimer();
}
function insideBook(x, y) {
  const r = flipBook.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

flipBook.addEventListener('pointerdown', (e) => {
  if (!bookOpen || holdPointerId !== null) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  lastPointerType = e.pointerType;
  holdPointerId = e.pointerId;
  holdStartTime = performance.now();
  holdStartX = e.clientX;
  holdStartY = e.clientY;
  holdMoved = false;
  holdPaused = true;
  syncTimer();
});
flipBook.addEventListener('pointermove', (e) => {
  if (e.pointerId !== holdPointerId) return;
  if (Math.abs(e.clientX - holdStartX) > MOVE_TOLERANCE || Math.abs(e.clientY - holdStartY) > MOVE_TOLERANCE) holdMoved = true;
  if (!insideBook(e.clientX, e.clientY)) endHold(); // slid off the page: let go
});
flipBook.addEventListener('pointerup', (e) => {
  if (e.pointerId !== holdPointerId) return;
  const heldFor = performance.now() - holdStartTime;
  const dx = e.clientX - holdStartX;
  const dy = e.clientY - holdStartY;
  endHold();
  const isSwipe = e.pointerType !== 'mouse'
    && Math.abs(dx) > Math.max(40, window.innerWidth * 0.09)
    && Math.abs(dx) > Math.abs(dy) * 1.2;
  if (isSwipe) {
    if (dx > 0) goPrev(); else goNext();
  } else if (!holdMoved && heldFor < HOLD_MS) {
    // quick tap: left quarter goes back, anywhere else goes forward
    const r = flipBook.getBoundingClientRect();
    if (e.clientX < r.left + r.width * 0.25) goPrev(); else goNext();
  }
  // a longer press is just "holding to read": nothing else to do
});
flipBook.addEventListener('pointercancel', endHold);
flipBook.addEventListener('pointerleave', endHold);
flipBook.addEventListener('contextmenu', (e) => {
  if (lastPointerType !== 'mouse') e.preventDefault(); // long-press menu on phones
});

// Safety nets so the book can never stay stuck in a paused state
window.addEventListener('blur', () => { hoverPaused = false; endHold(); syncTimer(); });
document.addEventListener('pointerup', endHold);
document.addEventListener('pointercancel', endHold);
document.addEventListener('visibilitychange', () => {
  hiddenPaused = document.hidden;
  syncTimer();
  if (!document.hidden) resumeSongIfStopped();
});

// =====================================================================
// The song
// =====================================================================
const MUSIC_VOLUME = 0.5;

function playSong() {
  if (!bgMusic) return Promise.reject(new Error('No audio element'));
  bgMusic.volume = MUSIC_VOLUME;
  bgMusic.muted = false;
  let p;
  try { p = bgMusic.play(); } catch (err) { return Promise.reject(err); }
  return (p && typeof p.then === 'function') ? p : Promise.resolve();
}
function showSongBtn(text) {
  songBtn.textContent = '\u266A ' + text;
  songBtn.hidden = false;
}
function hideSongBtn() { songBtn.hidden = true; }
let songFailed = false;
let onSongLoadFailed = null;       // lets the opening tap stop waiting as soon as loading fails
function onSongFailed(err) {
  console.warn('The song could not start:', err);
  songFailed = true;
  if (bookOpen) showSongBtn('Start the song');
}
function resumeSongIfStopped() {
  if (bookOpen && audioWorking && bgMusic.paused && !bgMusic.ended) {
    playSong().catch(() => showSongBtn('Resume the song'));
  }
}

if (bgMusic) {
  bgMusic.addEventListener('playing', () => { audioWorking = true; songFailed = false; hideSongBtn(); });
  bgMusic.addEventListener('pause', () => {
    // we never pause the song ourselves; this is a phone call, a lock screen, etc.
    if (bookOpen && !bgMusic.ended) showSongBtn('Resume the song');
  });
  bgMusic.addEventListener('ended', hideSongBtn);
  const onAudioError = () => {
    audioWorking = false;
    const src = bgMusic.currentSrc || (bgMusic.querySelector('source') || {}).src;
    console.error('The song file could not be loaded:', src);
    songFailed = true;
    if (onSongLoadFailed) onSongLoadFailed('failed');
    if (bookOpen) showSongBtn('Try the song again');
  };
  bgMusic.addEventListener('error', onAudioError);
  const srcEl = bgMusic.querySelector('source');
  if (srcEl) srcEl.addEventListener('error', onAudioError); // errors fire on <source>, not <audio>
  // a missing file can fail before this script runs, so check the state as well
  if (bgMusic.networkState === 3) { songFailed = true; console.error('The song file could not be loaded:', srcEl && srcEl.src); }
}

songBtn.addEventListener('click', () => {
  if (!bgMusic) return;
  if (bgMusic.error || bgMusic.networkState === 3) bgMusic.load(); // only reload if loading failed
  playSong().then(hideSongBtn).catch(onSongFailed);
});

// One tap opens the book AND starts the song, inside the same user gesture.
function openBook(clickPoint) {
  if (bookOpen) return;
  bookOpen = true;
  hoverGate = clickPoint || null;
  experienceStart = performance.now();
  if (songFailed && !audioWorking) showSongBtn('Start the song');
  startScreen.classList.add('is-hidden');
  startScreen.setAttribute('aria-hidden', 'true');
  enterPage();
  try { nextBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}
startBtn.addEventListener('click', (e) => {
  startBtn.disabled = true;
  startBtn.textContent = 'Opening…';
  const clickPoint = { x: e.clientX, y: e.clientY };
  // play() must be called synchronously inside this click for phones to allow sound
  if (bgMusic && (bgMusic.error || bgMusic.networkState === 3)) bgMusic.load(); // retry a load that failed earlier
  const loadFailed = new Promise((resolve) => { onSongLoadFailed = resolve; });
  const started = playSong().then(() => 'playing', (err) => { onSongFailed(err); return 'failed'; });
  const patience = new Promise((resolve) => setTimeout(resolve, 6000, 'slow'));
  // open when the song is really playing, if it fails, or if it is slow to load
  Promise.race([started, loadFailed, patience]).then(() => openBook(clickPoint));
});

renderPages();
