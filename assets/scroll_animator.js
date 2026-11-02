/**
 * Creiden / OrynTech Master Experience & Animation Engine
 * Delivers 100% authentic Creiden experience:
 * 1. Initial branded preloader (pulsing brand mark + progress bar track)
 * 2. Staggered hero typography entrance (word masking reveal)
 * 3. Hero rotating typewriter tagline & blinking cursor
 * 4. Hero watermark mouse-parallax depth
 * 5. Physics-based custom interactive dual cursor (.hover / .view)
 * 6. High-precision IntersectionObserver scroll reveals & delays
 * 7. AI Build Rescue radar sweep animation
 * 8. Process steps progress line & sequential elevation
 * 9. Animated numerical counters (Impact in Numbers)
 * 10. Interactive testimonial slider & tab switching
 * 11. Fixed navbar glassmorphism & yellow underline slide-in
 * 12. Animated hamburger-to-X mobile drawer
 * 13. Seamless infinite logo marquees
 * 14. Top loading bar page transitions
 */

(function () {
  'use strict';

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. Initial Branded Preloader Lifecycle
  // =========================================================================
  const minPreloaderTime = 700; // ms
  const preloaderStart = Number(document.documentElement.getAttribute('data-app-loading-at') || Date.now());
  let preloaderDismissed = false;

  function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    const loader = document.getElementById('app-initial-loader');
    if (!loader || isReducedMotion) {
      if (loader) loader.style.display = 'none';
      document.documentElement.removeAttribute('data-app-loading');
      document.documentElement.removeAttribute('data-app-loading-at');
      document.body.style.overflow = '';
      triggerEntranceExperience();
      return;
    }

    loader.classList.add('is-exiting');
    setTimeout(() => {
      loader.style.display = 'none';
      document.documentElement.removeAttribute('data-app-loading');
      document.documentElement.removeAttribute('data-app-loading-at');
      document.body.style.overflow = '';
      triggerEntranceExperience();
    }, 450);
  }

  function schedulePreloaderDismiss() {
    const elapsed = Date.now() - preloaderStart;
    const remaining = Math.max(0, minPreloaderTime - elapsed);
    setTimeout(dismissPreloader, remaining);
  }

  if (document.readyState === 'complete') {
    schedulePreloaderDismiss();
  } else {
    window.addEventListener('load', schedulePreloaderDismiss);
    // Hard fallback so preloader never hangs under any network condition
    setTimeout(dismissPreloader, 1800);
  }

  // =========================================================================
  // 2. Hero Typography Entrance & Staggered Reveal
  // =========================================================================
  function triggerEntranceExperience() {
    if (isReducedMotion) {
      document.querySelectorAll('.split-word, .reveal, .process-step-reveal').forEach(el => {
        el.classList.add('in', 'in-view', 'is-visible');
      });
      return;
    }

    // A. Staggered reveal of hero headline and tagline words
    const heroWords = document.querySelectorAll('.hero-headline .split-word, .hero-tagline .split-word');
    heroWords.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('in');
      }, 70 + 70 * index);
    });

    // B. Staggered reveal of hero lead and CTA buttons
    const heroReveals = document.querySelectorAll('#top .reveal');
    const delayOffset = 70 + 70 * (heroWords.length || 3);
    heroReveals.forEach((el, index) => {
      const customDelay = el.getAttribute('data-delay');
      const extraMs = customDelay ? parseInt(customDelay, 10) * 80 : index * 80;
      setTimeout(() => {
        el.classList.add('in', 'in-view', 'is-visible');
      }, delayOffset + extraMs);
    });

    // C. Activate typewriter after hero tagline settles
    setTimeout(initHeroTyping, delayOffset + 600);
  }

  // =========================================================================
  // 3. Hero Tagline Rotating Typewriter & Blinking Cursor
  // =========================================================================
  function initHeroTyping() {
    if (isReducedMotion) return;

    const cursor = document.querySelector('.hero-typing-cursor');
    if (!cursor) return;

    // Make cursor visible and start blinking
    cursor.style.opacity = '1';
    let cursorVisible = true;
    const blinkInterval = setInterval(() => {
      cursorVisible = !cursorVisible;
      cursor.style.opacity = cursorVisible ? '1' : '0';
    }, 450);

    // Parent container of the typing word
    const typingSpan = cursor.closest('.split-word') || cursor.parentElement;
    if (!typingSpan) return;

    // Locate or create the text target span
    let textNode = null;
    for (let node of typingSpan.childNodes) {
      if (node !== cursor && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)) {
        textNode = node;
        break;
      }
    }

    const phrases = [
      'Trust',
      'Scalable Platforms',
      'Digital Solutions',
      'Real Partnerships'
    ];

    let phraseIdx = 0;
    let charIdx = phrases[0].length;
    let isDeleting = false;
    let pauseTimer = null;

    function setText(str) {
      if (!textNode) return;
      if (textNode.nodeType === Node.TEXT_NODE) {
        textNode.nodeValue = str;
      } else {
        // Element node, set text content but preserve cursor
        const innerSpan = textNode.querySelector('span') || textNode;
        innerSpan.textContent = str;
      }
    }

    function tick() {
      const currentPhrase = phrases[phraseIdx];

      if (isDeleting) {
        charIdx--;
        setText(currentPhrase.substring(0, charIdx));
        if (charIdx <= 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          pauseTimer = setTimeout(tick, 300);
          return;
        }
        pauseTimer = setTimeout(tick, 40);
      } else {
        charIdx++;
        setText(currentPhrase.substring(0, charIdx));
        if (charIdx >= currentPhrase.length) {
          isDeleting = true;
          pauseTimer = setTimeout(tick, 2600); // 2.6s pause on completed word
          return;
        }
        pauseTimer = setTimeout(tick, 45);
      }
    }

    // Start typing cycle after initial pause
    pauseTimer = setTimeout(() => {
      isDeleting = true;
      tick();
    }, 2400);
  }

  // =========================================================================
  // 4. Hero Watermark Mouse Parallax
  // =========================================================================
  function initHeroParallax() {
    if (isReducedMotion) return;
    const heroSection = document.getElementById('top');
    if (!heroSection) return;

    const rightMark = heroSection.querySelector('div[style*="right:-100px"]');
    const leftMark = heroSection.querySelector('div[style*="left:-80px"]');
    if (!rightMark && !leftMark) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isMoving = false;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateMarks);
      }
    }, { passive: true });

    function updateMarks() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (rightMark) {
        rightMark.style.transform = `translate3d(${currentX * -32}px, ${currentY * -32}px, 0)`;
      }
      if (leftMark) {
        leftMark.style.transform = `translate3d(${currentX * 22}px, ${currentY * 22}px, 0)`;
      }

      if (Math.abs(targetX - currentX) > 0.005 || Math.abs(targetY - currentY) > 0.005) {
        requestAnimationFrame(updateMarks);
      } else {
        isMoving = false;
      }
    }
  }

  // =========================================================================
  // 5. Physics-Based Custom Interactive Dual Cursor
  // =========================================================================
  function initCustomCursor() {
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 800px)').matches;
    let dot = document.getElementById('cursorDot');
    let ring = document.getElementById('cursorRing');

    if (isTouch || isReducedMotion) {
      if (dot) dot.style.display = 'none';
      if (ring) ring.style.display = 'none';
      return;
    }

    if (!dot || !ring) {
      // Create if absent
      if (!ring) {
        ring = document.createElement('div');
        ring.id = 'cursorRing';
        ring.className = 'cursor-ring';
        ring.setAttribute('aria-hidden', 'true');
        ring.setAttribute('role', 'presentation');
        document.body.appendChild(ring);
      }
      if (!dot) {
        dot = document.createElement('div');
        dot.id = 'cursorDot';
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        dot.setAttribute('role', 'presentation');
        document.body.appendChild(dot);
      }
    }

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let initialized = false;
    let rafId = null;

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(mouseX - ringX) > 0.05 || Math.abs(mouseY - ringY) > 0.05) {
        rafId = requestAnimationFrame(renderRing);
      } else {
        rafId = null;
      }
    }

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!initialized) {
        ringX = mouseX;
        ringY = mouseY;
        initialized = true;
        ring.style.opacity = '1';
        dot.style.opacity = '1';
      }

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      if (!rafId) {
        rafId = requestAnimationFrame(renderRing);
      }
    }, { passive: true });

    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, input, textarea, select, .site-nav__brand, .site-nav__link, .case-card, .logo-marquee-module__tf3V_a__logoItem');
      ring.classList.remove('hover', 'view');

      if (target) {
        const cursorMode = target.getAttribute('data-cursor');
        if (cursorMode === 'view') {
          ring.classList.add('view');
        } else {
          ring.classList.add('hover');
        }
      }
    });

    document.addEventListener('mouseleave', () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (initialized) {
        ring.style.opacity = '1';
        dot.style.opacity = '1';
      }
    });
  }

  // =========================================================================
  // 6. Comprehensive IntersectionObserver Scroll Reveal Engine
  // =========================================================================
  function initScrollReveals() {
    if (isReducedMotion) {
      document.querySelectorAll('.reveal, .split-word, .process-step-reveal, .home-rescue').forEach(el => {
        el.classList.add('in', 'in-view', 'is-visible');
      });
      return;
    }

    // Wire process line bar if present
    const processLine = document.querySelector('.process-step-reveal.origin-left, .process-line-bar');
    if (processLine) {
      processLine.classList.add('process-line-bar');
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('in', 'in-view', 'is-visible');

          // A. Trigger child split-words with stagger
          el.querySelectorAll('.split-word:not(.in)').forEach((sw, i) => {
            setTimeout(() => sw.classList.add('in'), 55 * i);
          });

          // B. AI Build Rescue diagonal sweep
          if (el.classList.contains('home-rescue')) {
            const sweep = el.querySelector('.home-rescue__sweep');
            if (sweep) sweep.classList.add('is-running');
          }

          // C. Process connecting bar
          if (el.classList.contains('process-line-bar')) {
            el.classList.add('in');
          }

          // D. Animated numerical stats
          if (el.classList.contains('stat-item') || el.hasAttribute('data-stat-to')) {
            animateCounter(el);
          }

          observer.unobserve(el);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    // Observe all reveal candidates
    document.querySelectorAll('.reveal:not(.in), .process-step-reveal:not(.in), .home-rescue, .process-line-bar, [data-stat-to]').forEach(el => {
      observer.observe(el);
    });

    // Also observe stat numbers in Impact in Numbers
    document.querySelectorAll('section[aria-labelledby*="partner"] .reveal, section .grid div h3, section div.stats-grid').forEach(el => {
      observer.observe(el);
    });

    // Parallax on scroll
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const factor = parseFloat(el.getAttribute('data-parallax') || '') || 0.15;
        el.style.transform = `translate3d(0, ${scrollY * factor}px, 0)`;
      });
    }, { passive: true });
  }

  // Number count-up animation
  function animateCounter(container) {
    const numEl = container.querySelector('[data-stat-value]') || container.querySelector('span.font-bold') || container;
    const target = parseInt(container.getAttribute('data-stat-to') || numEl.getAttribute('data-stat-to') || numEl.textContent.replace(/\D/g, ''), 10);
    if (!target || isNaN(target)) return;

    const suffix = numEl.textContent.replace(/[0-9]/g, '') || '+';
    const duration = 1600;
    const startTime = performance.now();

    function updateCount(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * target);
      numEl.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        numEl.textContent = target + suffix;
      }
    }
    requestAnimationFrame(updateCount);
  }

  // =========================================================================
  // 7. Interactive Testimonials Tabs & Slider
  // =========================================================================
  function initTestimonialsSlider() {
    const section = document.querySelector('section[aria-labelledby="testimonials-heading"]');
    if (!section) return;

    const track = section.querySelector('.flex.touch-pan-y') || section.querySelector('[role="region"] .flex');
    const buttons = section.querySelectorAll('button[aria-label*="View quote"], button[id^="testimonial-tab-"]');
    const articles = section.querySelectorAll('article[id^="testimonial-panel-"]');
    if (buttons.length === 0 || (!track && articles.length === 0)) return;

    let currentIndex = 0;
    let autoPlayTimer = null;

    // Ensure all articles are visible inside the flex track
    articles.forEach(art => {
      art.style.display = 'block';
      art.style.opacity = '1';
      art.style.transform = 'none';
    });

    if (track) {
      track.style.transition = 'transform 0.55s cubic-bezier(0.2, 0, 0, 1)';
      track.style.willChange = 'transform';
    }

    function showQuote(index) {
      currentIndex = index;

      // 1. Move the flex track horizontally
      if (track) {
        track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      }

      // 2. Update tab buttons
      buttons.forEach((btn, i) => {
        if (i === index) {
          btn.className = 'h-2.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-320 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-creiden-blue/35 w-9 bg-creiden-charcoal';
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.className = 'h-2.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-320 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-creiden-blue/35 w-2.5 bg-creiden-charcoal/25 hover:bg-creiden-charcoal/40';
          btn.setAttribute('aria-selected', 'false');
        }
      });
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        showQuote(i);
        restartAutoPlay();
      });
    });

    // Touch swipe support for mobile
    if (track) {
      let touchStartX = 0;
      let touchEndX = 0;
      track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            showQuote((currentIndex + 1) % buttons.length);
          } else {
            showQuote((currentIndex - 1 + buttons.length) % buttons.length);
          }
          restartAutoPlay();
        }
      }, { passive: true });
    }

    function restartAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        showQuote((currentIndex + 1) % buttons.length);
      }, 6500);
    }

    section.addEventListener('mouseenter', () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    });
    section.addEventListener('mouseleave', restartAutoPlay);

    // Initial show
    showQuote(0);
    restartAutoPlay();
  }

  // =========================================================================
  // 8. Sticky Navigation Glassmorphism & Header Interactions
  // =========================================================================
  function initNavigation() {
    const siteNav = document.getElementById('siteNav');
    if (!siteNav) return;

    function handleScroll() {
      if (window.scrollY > 20) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile Hamburger Drawer Toggle
    const burger = document.querySelector('.site-nav__burger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burger && mobileMenu) {
      burger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.setAttribute('aria-hidden', String(isOpen));
        mobileMenu.classList.toggle('is-open', !isOpen);
        siteNav.classList.toggle('site-nav--menu-open', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          burger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.classList.remove('is-open');
          siteNav.classList.remove('site-nav--menu-open');
          document.body.style.overflow = '';
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
          burger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.classList.remove('is-open');
          siteNav.classList.remove('site-nav--menu-open');
          document.body.style.overflow = '';
        }
      });
    }

    // Mega-menu hover & focus management
    document.querySelectorAll('.site-nav__links li.relative').forEach(li => {
      const link = li.querySelector('.site-nav__link--has-mega');
      if (link) {
        li.addEventListener('mouseenter', () => {
          li.classList.add('dropdown-open');
          link.setAttribute('aria-expanded', 'true');
        });
        li.addEventListener('mouseleave', () => {
          li.classList.remove('dropdown-open');
          link.setAttribute('aria-expanded', 'false');
        });
        link.addEventListener('focus', () => {
          li.classList.add('dropdown-open');
          link.setAttribute('aria-expanded', 'true');
        });
        li.addEventListener('focusout', (e) => {
          if (!li.contains(e.relatedTarget)) {
            li.classList.remove('dropdown-open');
            link.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  // =========================================================================
  // 9. Seamless Infinite Logo Marquees
  // =========================================================================
  function initMarquees() {
    document.querySelectorAll('.logo-marquee-module__tf3V_a__container').forEach(container => {
      container.classList.add('auto-scroll');
    });
  }

  // =========================================================================
  // 10. SPA-like Internal Page Navigation Transitions
  // =========================================================================
  function initPageTransitions() {
    let topBar = document.getElementById('site-top-loader');
    if (!topBar) {
      topBar = document.createElement('div');
      topBar.id = 'site-top-loader';
      document.body.appendChild(topBar);
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore external, hash links, mailto, tel, target="_blank"
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        e.ctrlKey || e.metaKey || e.shiftKey
      ) {
        return;
      }

      // Check if same origin / internal link
      const isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../') ||
                         href.includes(window.location.hostname);
      if (!isInternal) return;

      // Trigger sleek progress bar across top
      topBar.classList.remove('is-done');
      topBar.classList.add('is-active');
    });
  }

  // =========================================================================
  // Initialization Orchestrator
  // =========================================================================
  function initAll() {
    initNavigation();
    initCustomCursor();
    initHeroParallax();
    initScrollReveals();
    initTestimonialsSlider();
    initMarquees();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
