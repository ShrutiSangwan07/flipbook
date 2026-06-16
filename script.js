 // --- Animate sparkles in the bg ---
 function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }
  const bgParent = document.getElementById('bgAnimation');
  const heartPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
  function createBgHeart(i) {
    let div = document.createElement('div');
    div.className = 'bg-heart' + (i % 2 === 1 ? ' bg-heart2' : '');
    const left = randomBetween(2, 95) + 'vw';
    const delay = randomBetween(0, 18) + 's';
    const dur = i % 2 === 0
      ? randomBetween(13, 25)
      : randomBetween(17, 29);
    div.style.left = left;
    div.style.top = randomBetween(-48, 30) + 'vh';
    div.style.animationDelay = delay;
    div.style.animationDuration = dur + 's';
    div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="${heartPath}"/></svg>`;
    return div;
  }
  function createBgSparkle(i) {
    let div = document.createElement('div');
    div.className = 'bg-sparkle';
    div.style.left = randomBetween(1, 98) + 'vw';
    div.style.top = randomBetween(-36, 60) + 'vh';
    div.style.animationDelay = randomBetween(0, 14) + 's';
    div.style.animationDuration = randomBetween(12, 17) + 's';
    div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 20 20"><polygon points="10,3 12,9 19,9.5 13.5,13.5 15,20 10,16.2 5,20 6.5,13.5 1,9.5 8,9" fill="#d291bc"/></svg>`;
    return div;
  }
  for(let i=0; i<12; ++i) bgParent.appendChild(createBgHeart(i));
  for(let i=0; i<9; ++i) bgParent.appendChild(createBgSparkle(i));

  // --- BG Music: play automatically, unmuted ---
  const bgMusic = document.getElementById('bgMusic');
  function tryPlayMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.15;
    bgMusic.muted = false;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        function resumeOnGesture() {
          bgMusic.muted = false;
          bgMusic.volume = 0.15;
          bgMusic.play().catch(()=>{});
          window.removeEventListener("touchstart", resumeOnGesture);
          window.removeEventListener("click", resumeOnGesture);
          window.removeEventListener("keydown", resumeOnGesture);
        }
        window.addEventListener("click", resumeOnGesture, { once: true });
        window.addEventListener("keydown", resumeOnGesture, { once: true });
        window.addEventListener("touchstart", resumeOnGesture, { once: true });
      });
    }
  }
  document.addEventListener("DOMContentLoaded", tryPlayMusic);
  window.addEventListener('load', tryPlayMusic);

  // Example texts and quotes
  const romanticPages = [
    "My heart beats only for you, turning each page brings us closer together.|The best thing to hold onto in life is each other.",
    "Your smile is the dawn that brightens my every day.|Every love story is beautiful, but ours is my favorite.",
    "With you, the world feels endlessly enchanted.|I loved you yesterday, love you still, always have, always will.",
    "You are the poem my heart recites in silence.|You are my today and all of my tomorrows.",
    "In the pages of life, you are my favorite chapter.|When I follow my heart, it leads me to you.",
    // ... Add more unique texts up to 100 items ...
  ];
  let pages = [];
  while(pages.length < 100) {
    let quote = romanticPages[pages.length % romanticPages.length];
    pages.push(quote);
  }

  const flipBook = document.getElementById('flipBook');
  const flipSound = document.getElementById('flipSound');

  // Create pages
  pages.forEach((content, idx) => {
    const page = document.createElement('div');
    page.className = 'page';
    const [main, quote] = content.split('|');
    page.innerHTML = `
      <svg class="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <div>${main || ''}</div>
      ${quote ? `<div class="love-quote">${quote}</div>` : ''}
      <div class="page-number">${idx + 1}/100</div>
    `;
    flipBook.appendChild(page);
  });

  let currentPage = 0;
  let flipping = false;

  function playFlipSound() {
    if (!flipSound) return;
    try {
      flipSound.currentTime = 0;
      flipSound.volume = 0.35;
      flipSound.play();
    } catch(e) {/* ignore */}
  }

  function renderPages(flipIdx = null, direction = null) {
    const pageDivs = flipBook.querySelectorAll('.page');
    pageDivs.forEach((page, idx) => {
      page.classList.remove('flipping');
      if (idx < currentPage) {
        page.classList.add('flipped');
        page.style.zIndex = idx;
      } else {
        page.classList.remove('flipped');
        page.style.zIndex = 100 - idx;
      }
    });
    if (flipIdx !== null && direction) {
      const page = pageDivs[flipIdx];
      if (page) {
        flipping = true;
        page.classList.add('flipping');
        setTimeout(() => {
          playFlipSound();
        }, 70);
        setTimeout(() => {
          page.classList.remove('flipping');
          flipping = false;
        }, 850);
      }
    }
    // Responsive: Scroll to top if needed
    if (window.innerWidth <= 700) {
      setTimeout(()=> {
        flipBook.scrollTo?.({left:0, top:0, behavior:'smooth'});
        window.scrollTo({top:0, behavior:'smooth'});
      }, 60);
    }
    document.getElementById('prevBtn').disabled = (currentPage === 0);
    document.getElementById('nextBtn').disabled = (currentPage === 100);
  }

  // Touch swipe
  let touchStartX = null;
  let touchEndX = null;

  flipBook.addEventListener('touchstart', function(e){
    if(e.touches.length === 1){
      touchStartX = e.touches[0].clientX;
    }
  }, {passive:true});
  flipBook.addEventListener('touchmove', function(e){
    if(e.touches.length === 1){
      touchEndX = e.touches[0].clientX;
    }
  }, {passive:true});
  flipBook.addEventListener('touchend', function(e){
    if(touchStartX !== null && touchEndX !== null && !flipping){
      let dx = touchEndX - touchStartX;
      // only register as swipe if the distance is greater than 30px or 9vw
      if(Math.abs(dx) > Math.max(30, window.innerWidth*0.09)){
        if(dx > 0 && currentPage > 0){
          document.getElementById('prevBtn').click();
        } else if(dx < 0 && currentPage < 100){
          document.getElementById('nextBtn').click();
        }
      }
    }
    touchStartX = null;
    touchEndX = null;
  }, {passive:true});

  document.getElementById('prevBtn').onclick = function() {
    if (currentPage > 0 && !flipping) {
      let flippingPage = currentPage - 1;
      currentPage--;
      renderPages(flippingPage, "prev");
    }
  };
  document.getElementById('nextBtn').onclick = function() {
    if (currentPage < 100 && !flipping) {
      let flippingPage = currentPage;
      currentPage++;
      renderPages(flippingPage, "next");
    }
  };

  flipBook.onclick = (e) => {
    let el = e.target.closest('.page');
    if (!el || flipping) return;
    const pageDivs = flipBook.querySelectorAll('.page');
    const idx = Array.from(pageDivs).indexOf(el);
    if (el.classList.contains('flipped')) {
      if (currentPage > 0 && idx === currentPage - 1) {
        document.getElementById('prevBtn').click();
      }
    } else {
      if (currentPage < 100 && idx === currentPage) {
        document.getElementById('nextBtn').click();
      }
    }
  };

  // Keyboard shortcut navigation
  document.addEventListener('keydown', function(e) {
    if (flipping) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      document.getElementById('nextBtn').click();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      document.getElementById('prevBtn').click();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderPages();
  });

  // Responsive: adjust heights
  function adjustFlipBookHeight() {
    const cont = document.querySelector('.book-container');
    if (!cont) return;
    let winH = window.innerHeight;
    cont.style.maxHeight = (winH - 10) + "px";
  }
  window.addEventListener('resize', adjustFlipBookHeight, {passive:true});
  document.addEventListener('DOMContentLoaded', adjustFlipBookHeight);

  // Prevent unwanted scrolling on mobile/touch
  document.body.addEventListener('touchmove', function(e){
    let allow = false;
    let node = e.target;
    while (node) {
      if (node.classList && node.classList.contains('flip-book')) {
        allow = true;
        break;
      }
      node = node.parentElement;
    }
    if (!allow) e.preventDefault();
  }, { passive: false });

  // Prevent pinch zoom
  document.addEventListener('gesturestart', function(e){
    e.preventDefault();
  });
