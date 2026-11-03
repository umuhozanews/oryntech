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
  // =========================================================================
  // 11. FAQ Accordions Interactive Engine
  // =========================================================================
  function initFaqAccordions() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('button[aria-controls]');
      if (!btn) return;

      const panelId = btn.getAttribute('aria-controls');
      if (!panelId) return;

      const panel = document.getElementById(panelId) || document.querySelector('#' + CSS.escape(panelId));
      if (!panel) return;

      // Check if it's an accordion item (has faq in id, or panel has role="region" or grid class)
      const isFaq = panelId.includes('faq') || panel.getAttribute('role') === 'region' || panel.classList.contains('grid');
      if (!isFaq) return;

      e.preventDefault();
      const isCurrentlyExpanded = btn.getAttribute('aria-expanded') === 'true';
      const willExpand = !isCurrentlyExpanded;

      // Close sibling accordions in the same container for clean presentation
      const container = btn.closest('.reveal') ? btn.closest('.reveal').parentElement : btn.parentElement.parentElement;
      if (container && willExpand) {
        container.querySelectorAll('button[aria-controls]').forEach(sibBtn => {
          if (sibBtn !== btn && sibBtn.getAttribute('aria-expanded') === 'true') {
            sibBtn.setAttribute('aria-expanded', 'false');
            const sibPanelId = sibBtn.getAttribute('aria-controls');
            const sibPanel = document.getElementById(sibPanelId);
            if (sibPanel) {
              sibPanel.classList.remove('grid-rows-[1fr]');
              sibPanel.classList.add('grid-rows-[0fr]');
              sibPanel.style.gridTemplateRows = '0fr';
            }
            const sibSvg = sibBtn.querySelector('svg');
            if (sibSvg) {
              sibSvg.style.transform = 'rotate(0deg)';
            }
            const sibCircle = sibBtn.querySelector('.rounded-full');
            if (sibCircle) {
              sibCircle.classList.remove('bg-[#00539F]', 'text-white');
              sibCircle.classList.add('bg-bg-2', 'text-fg-2');
              sibCircle.style.backgroundColor = '';
              sibCircle.style.color = '';
              sibCircle.style.borderColor = '';
            }
          }
        });
      }

      // Toggle target button
      btn.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
      if (willExpand) {
        panel.classList.remove('grid-rows-[0fr]');
        panel.classList.add('grid-rows-[1fr]');
        panel.style.gridTemplateRows = '1fr';
      } else {
        panel.classList.remove('grid-rows-[1fr]');
        panel.classList.add('grid-rows-[0fr]');
        panel.style.gridTemplateRows = '0fr';
      }

      // Rotate plus/minus icon
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        svg.style.transform = willExpand ? 'rotate(45deg)' : 'rotate(0deg)';
      }

      // Toggle active circle background
      const circle = btn.querySelector('.rounded-full');
      if (circle) {
        circle.style.transition = 'background-color 0.25s, color 0.25s, border-color 0.25s';
        if (willExpand) {
          circle.classList.remove('bg-bg-2', 'text-fg-2');
          circle.classList.add('bg-[#00539F]', 'text-white');
          circle.style.backgroundColor = '#00539F';
          circle.style.color = '#ffffff';
          circle.style.borderColor = '#00539F';
        } else {
          circle.classList.remove('bg-[#00539F]', 'text-white');
          circle.classList.add('bg-bg-2', 'text-fg-2');
          circle.style.backgroundColor = '';
          circle.style.color = '';
          circle.style.borderColor = '';
        }
      }
    });
  }

  // =========================================================================
  // 12. Interactive Cookie Consent & Preferences Engine
  // =========================================================================
  function initCookieConsent() {
    const STORAGE_KEY = 'oryntech_cookie_consent';

    function getConsent() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    function setConsent(choice, analytics) {
      try {
        const data = {
          choice: choice,
          analytics: analytics !== false,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem('creiden_cookie_consent', JSON.stringify({
          choice: choice === 'accepted' ? 'allow' : 'reject',
          analyticsAllowed: analytics !== false
        }));
      } catch (e) {}
      updateCookiesPageControls();
    }

    function checkAndShowBanner() {
      const consent = getConsent();
      if (consent && consent.choice) return;
      if (document.getElementById('oryntech-cookie-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'oryntech-cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie consent');
      banner.className = 'transition-all duration-500 ease-out';
      banner.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;z-index:999999;margin-left:auto;margin-right:auto;max-width:860px;border-radius:16px;border:1px solid rgba(255,255,255,0.15);background:rgba(9,13,22,0.95);padding:20px;box-shadow:0 20px 40px rgba(0,0,0,0.5);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;transform:translateY(24px);box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;color:#fff;';
      banner.innerHTML = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1 pr-2">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h4 class="text-sm font-bold text-white tracking-wide">Cookie & Privacy Preferences</h4>
            </div>
            <p class="text-xs sm:text-[13px] leading-relaxed text-gray-300">
              We use essential cookies for technical operations and analytics to improve our digital products. You can accept all or customize preferences anytime. Read our <a href="/en/cookies.html" class="text-[#00539F] underline hover:text-white transition-colors" style="color:#60a5fa;">Cookie Policy</a>.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button id="oryn-cookie-reject-btn" type="button" class="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-gray-300 border border-white/20 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" style="cursor:pointer;">
              Essential Only
            </button>
            <button id="oryn-cookie-accept-btn" type="button" class="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-[#00539F] hover:bg-[#003d75] rounded-xl shadow-md transition-colors cursor-pointer" style="cursor:pointer;background-color:#00539F;">
              Accept All
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      requestAnimationFrame(() => {
        setTimeout(() => {
          banner.style.opacity = '1';
          banner.style.transform = 'translateY(0)';
        }, 150);
      });

      const acceptBtn = banner.querySelector('#oryn-cookie-accept-btn');
      const rejectBtn = banner.querySelector('#oryn-cookie-reject-btn');

      function dismissBanner(choice, analytics) {
        setConsent(choice, analytics);
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(24px)';
        setTimeout(() => banner.remove(), 400);
      }

      if (acceptBtn) acceptBtn.addEventListener('click', () => dismissBanner('accepted', true));
      if (rejectBtn) rejectBtn.addEventListener('click', () => dismissBanner('essential', false));
    }

    function openPreferencesModal() {
      const existing = document.getElementById('oryntech-cookie-modal');
      if (existing) existing.remove();

      const current = getConsent() || { choice: 'essential', analytics: false };
      const isAnalyticsOn = current.analytics !== false;

      const modal = document.createElement('div');
      modal.id = 'oryntech-cookie-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'cookie-modal-title');
      modal.className = 'fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300';
      modal.innerHTML = `
        <div class="relative w-full max-w-[540px] rounded-2xl border border-white/15 bg-[#090d16] p-6 shadow-2xl text-left" style="background:#090d16;color:#ffffff;">
          <div class="flex items-center justify-between pb-4 border-b border-white/10" style="border-bottom:1px solid rgba(255,255,255,0.1);">
            <h3 id="cookie-modal-title" class="text-lg font-bold text-white" style="color:#ffffff;">Cookie Preferences</h3>
            <button id="oryn-modal-close-btn" type="button" class="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" aria-label="Close" style="cursor:pointer;background:none;border:none;color:#9ca3af;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="py-4 flex flex-col gap-4 text-sm text-gray-300">
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5" style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:10px;">
              <div>
                <p class="font-semibold text-white" style="margin:0;color:#fff;">Strictly Necessary Cookies</p>
                <p class="text-xs text-gray-400 mt-0.5" style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Required for core website security, authentication & navigation.</p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" style="padding:4px 10px;font-size:12px;background:rgba(16,185,129,0.2);color:#6ee7b7;border-radius:6px;">Always Active</span>
            </div>
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5" style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,0.05);border-radius:12px;">
              <div style="padding-right:12px;">
                <p class="font-semibold text-white" style="margin:0;color:#fff;">Analytics & Performance</p>
                <p class="text-xs text-gray-400 mt-0.5" style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Helps us understand visitor engagement to improve OrynTech products.</p>
              </div>
              <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
                <input type="checkbox" id="oryn-analytics-toggle" ${isAnalyticsOn ? 'checked' : ''} style="opacity:0;width:0;height:0;">
                <span id="oryn-toggle-slider" style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${isAnalyticsOn ? '#00539F' : '#374151'};border-radius:24px;transition:0.3s;"></span>
                <span id="oryn-toggle-knob" style="position:absolute;height:18px;width:18px;left:${isAnalyticsOn ? '22px' : '3px'};bottom:3px;background-color:white;border-radius:50%;transition:0.3s;"></span>
              </label>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10" style="display:flex;justify-content:flex-end;gap:12px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
            <button id="oryn-modal-save-btn" type="button" class="px-6 py-2.5 text-xs font-bold text-white bg-[#00539F] hover:bg-[#003d75] rounded-xl transition-colors cursor-pointer" style="padding:10px 24px;background:#00539F;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">
              Save Preferences
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const toggle = modal.querySelector('#oryn-analytics-toggle');
      const slider = modal.querySelector('#oryn-toggle-slider');
      const knob = modal.querySelector('#oryn-toggle-knob');
      if (toggle && slider && knob) {
        toggle.addEventListener('change', () => {
          if (toggle.checked) {
            slider.style.backgroundColor = '#00539F';
            knob.style.left = '22px';
          } else {
            slider.style.backgroundColor = '#374151';
            knob.style.left = '3px';
          }
        });
      }

      modal.querySelector('#oryn-modal-close-btn').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });

      modal.querySelector('#oryn-modal-save-btn').addEventListener('click', () => {
        const analytics = toggle ? toggle.checked : false;
        setConsent(analytics ? 'accepted' : 'essential', analytics);
        modal.remove();
        showToast('Cookie preferences saved successfully.');
      });
    }

    function updateCookiesPageControls() {
      const consent = getConsent();
      const statusBadge = document.getElementById('cookie-status-badge');
      if (statusBadge) {
        if (consent && consent.choice === 'accepted') {
          statusBadge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:9999px;font-size:12px;font-weight:700;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> All Cookies Accepted</span>';
        } else if (consent && consent.choice === 'essential') {
          statusBadge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:9999px;font-size:12px;font-weight:700;background:rgba(6,182,212,0.15);color:#06b6d4;border:1px solid rgba(6,182,212,0.3);">Essential Cookies Only</span>';
        } else {
          statusBadge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:9999px;font-size:12px;font-weight:700;background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">Not Configured</span>';
        }
      }
    }

    function showToast(msg) {
      let toast = document.getElementById('oryn-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'oryn-toast';
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1000002;padding:12px 20px;border-radius:12px;background:#00539F;color:#ffffff;font-size:13px;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,0.3);transition:all 0.3s ease;transform:translateY(12px);opacity:0;';
        document.body.appendChild(toast);
      }
      toast.innerText = msg;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
      }, 3000);
    }

    // Connect footer "Cookie Preferences" button & cookie policy page buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const text = btn.textContent.trim().toLowerCase();

      if (text === 'cookie preferences' || text === 'customize preferences' || btn.id === 'cookie-page-customize') {
        e.preventDefault();
        openPreferencesModal();
      } else if (btn.id === 'cookie-page-accept-all') {
        e.preventDefault();
        setConsent('accepted', true);
        showToast('All cookies accepted.');
      } else if (btn.id === 'cookie-page-essential-only') {
        e.preventDefault();
        setConsent('essential', false);
        showToast('Essential cookies configured.');
      }
    });

    checkAndShowBanner();
    updateCookiesPageControls();
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
    initFaqAccordions();
    initCookieConsent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
