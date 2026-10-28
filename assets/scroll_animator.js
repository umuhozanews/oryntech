/**
 * Universal Offline Scroll Animation Engine
 * Automatically activates scroll reveals, IntersectionObserver triggers,
 * Framer transitions, AOS animations, and continuous ticker marquees offline.
 */
(function() {
  function initScrollAnimator() {
    // 1. Setup IntersectionObserver for reveal elements
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible', 'in-view', 'aos-animate', 'framer-in-view');
          if (el.hasAttribute('data-aos')) {
            el.setAttribute('data-aos-animate', 'true');
          }
          if (el.style.opacity === '0') {
            el.style.opacity = '1';
          }
          if (el.style.transform && el.style.transform.includes('translateY')) {
            el.style.transform = 'none';
          }
        }
      });
    }, observerOptions);

    const animSelectors = [
      '[data-aos]', '[data-scroll]', '[class*="framer"]',
      '[class*="animate"]', '[class*="reveal"]', '[class*="fade"]',
      '[class*="slide"]', '[class*="wow"]', 'section', '.card', '.hero'
    ];

    document.querySelectorAll(animSelectors.join(', ')).forEach(el => {
      revealObserver.observe(el);
    });

    // 2. Ensure CSS marquees and tickers continue animating
    document.querySelectorAll('[class*="marquee"], [class*="ticker"], [class*="carousel"]').forEach(m => {
      m.style.animationPlayState = 'running';
    });

    // 3. Fallback: Force visibility for any element stuck at opacity: 0 after 1.5s
    setTimeout(() => {
      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.opacity === '0' && el.offsetHeight > 10) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
        }
      });
    }, 1500);

    console.log('[Offline Scroll Animator] Initialized and observing scroll animations.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimator);
  } else {
    initScrollAnimator();
  }
})();


// =========================================================
// NEXTECH Brand Preloader Controller & Legacy Cleanup
// =========================================================
(function() {
    // 1. Purge legacy broken framework loaders
    function purgeLegacyLoaders() {
        document.documentElement.removeAttribute('data-app-loading');
        document.documentElement.removeAttribute('data-loading');
        const legacyLoaders = document.querySelectorAll('.app-loader-shell, #app-initial-loader, .cr-legacy-loader');
        legacyLoaders.forEach(el => el.remove());
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('in', 'in-view', 'is-visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
    purgeLegacyLoaders();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', purgeLegacyLoaders);
    }

    // 2. Setup NEXTECH Custom Preloader
    function initNextechPreloader() {
        let preloader = document.getElementById('nextech-preloader');

        // Dynamically create preloader if not present in static HTML
        if (!preloader && document.body) {
            const scriptTag = document.querySelector('script[src*="scroll_animator.js"]');
            let assetBase = './assets/';
            if (scriptTag && scriptTag.getAttribute('src')) {
                const src = scriptTag.getAttribute('src');
                const lastSlash = src.lastIndexOf('/');
                assetBase = lastSlash !== -1 ? src.substring(0, lastSlash + 1) : './assets/';
            }

            preloader = document.createElement('div');
            preloader.id = 'nextech-preloader';
            preloader.setAttribute('aria-hidden', 'true');
            preloader.innerHTML = `
                <div class="nextech-preloader__bg"></div>
                <div class="nextech-preloader__grid"></div>
                <div class="nextech-preloader__stage">
                  <div class="nextech-preloader__halo">
                    <svg class="nextech-ring nextech-ring--outer" viewBox="0 0 260 260" fill="none">
                      <circle cx="130" cy="130" r="124" stroke="url(#ntRingGrad1)" stroke-width="2" stroke-linecap="round" stroke-dasharray="24 16" opacity="0.75"></circle>
                      <defs>
                        <linearGradient id="ntRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#00A3FF" />
                          <stop offset="50%" stop-color="#00539F" />
                          <stop offset="100%" stop-color="#38BDF8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <svg class="nextech-ring nextech-ring--inner" viewBox="0 0 220 220" fill="none">
                      <circle cx="110" cy="110" r="105" stroke="url(#ntRingGrad2)" stroke-width="1.5" stroke-dasharray="8 10" opacity="0.5"></circle>
                      <defs>
                        <linearGradient id="ntRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="#38BDF8" />
                          <stop offset="100%" stop-color="#00539F" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="nextech-preloader__emblem-card">
                      <img src="${assetBase}nextech-emblem-centered.png" alt="NEXTECH" class="nextech-preloader__emblem-img" />
                    </div>
                  </div>
                  <div class="nextech-preloader__identity">
                    <div class="nextech-preloader__title">NEXTECH</div>
                    <div class="nextech-preloader__subtitle">TECHNOLOGY &amp; DIGITAL SOLUTIONS</div>
                  </div>
                  <div class="nextech-preloader__progress-wrap">
                    <div class="nextech-preloader__bar-rail">
                      <div class="nextech-preloader__bar-fill" id="nextechProgressFill"></div>
                    </div>
                    <div class="nextech-preloader__details">
                      <span class="nextech-preloader__label" id="nextechStatusText">INITIALIZING SYSTEM...</span>
                      <span class="nextech-preloader__pct" id="nextechProgressCount">0%</span>
                    </div>
                  </div>
                </div>
            `;
            document.body.prepend(preloader);
        }

        if (!preloader) return;

        const fill = preloader.querySelector('#nextechProgressFill');
        const count = preloader.querySelector('#nextechProgressCount');
        const status = preloader.querySelector('#nextechStatusText');

        let progress = 0;
        let isDone = false;

        const statuses = [
            "INITIALIZING CORE...",
            "SYNCHRONIZING MODULES...",
            "CONNECTING SERVICES...",
            "RENDERING INTERFACE...",
            "EXPERIENCE READY"
        ];

        const interval = setInterval(() => {
            if (!isDone) {
                progress += Math.floor(Math.random() * 8) + 4;
                if (progress > 88) progress = 88;
            } else {
                progress += 14;
            }

            if (progress > 100) progress = 100;

            if (fill) fill.style.width = progress + '%';
            if (count) count.textContent = progress + '%';

            const step = Math.min(Math.floor((progress / 100) * statuses.length), statuses.length - 1);
            if (status) status.textContent = statuses[step];

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    preloader.classList.add('nextech-loaded');
                    if (document.body) {
                        document.body.style.overflow = '';
                    }
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 650);
                }, 180);
            }
        }, 40);

        function markDone() {
            isDone = true;
        }

        if (document.readyState === 'complete') {
            markDone();
        } else {
            window.addEventListener('load', markDone);
        }

        // Safety fallback: maximum 1.5s
        setTimeout(markDone, 1200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNextechPreloader);
    } else {
        initNextechPreloader();
    }
})();


// Dropdown hover & focus management
(function() {
  function initDropdowns() {
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
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();


// FAQ Accordion Interactivity
(function() {
  function initFaqAccordions() {
    document.querySelectorAll('.faq-accordion-item').forEach(item => {
      const btn = item.querySelector('.faq-accordion-btn');
      if (btn && !btn.dataset.faqBound) {
        btn.dataset.faqBound = 'true';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          const parent = item.closest('.faq-accordion-group');
          if (parent) {
            parent.querySelectorAll('.faq-accordion-item').forEach(other => {
              if (other !== item) {
                other.classList.remove('open');
                const ob = other.querySelector('.faq-accordion-btn');
                if (ob) ob.setAttribute('aria-expanded', 'false');
              }
            });
          }
          item.classList.toggle('open', !isOpen);
          btn.setAttribute('aria-expanded', String(!isOpen));
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqAccordions);
  } else {
    initFaqAccordions();
  }
})();
