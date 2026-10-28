/**
 * Creiden / OrynTech Universal Animation & Interactivity Engine
 * Delivers 100% authentic scroll reveals, glassmorphism fixed navbar,
 * marquee scrolling, split-word title animations, and mobile drawer menu.
 */

(function () {
  'use strict';

  function initSiteInteractions() {
    // -----------------------------------------------------------------
    // 1. Fixed Navbar Glassmorphism on Scroll (.site-nav.scrolled)
    // -----------------------------------------------------------------
    const siteNav = document.getElementById('siteNav');
    function updateNavScroll() {
      if (!siteNav) return;
      if (window.scrollY > 20) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNavScroll, { passive: true });
    updateNavScroll();

    // -----------------------------------------------------------------
    // 2. IntersectionObserver for .reveal, .split-word & .home-rescue
    // -----------------------------------------------------------------
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('in', 'in-view', 'is-visible');
          
          // Trigger home-rescue sweep animation
          if (el.classList.contains('home-rescue')) {
            const sweep = el.querySelector('.home-rescue__sweep');
            if (sweep) sweep.classList.add('is-running');
          }
          
          // Find any inner split-word and reveal
          el.querySelectorAll('.split-word').forEach(sw => sw.classList.add('in'));

          // Once revealed, unobserve to keep rendered state
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    // Observe all reveals and split-words
    document.querySelectorAll('.reveal, .split-word, .home-rescue, [data-parallax]').forEach(el => {
      revealObserver.observe(el);
    });

    // Ensure hero elements already in view immediately get '.in'
    setTimeout(() => {
      document.querySelectorAll('#top .reveal, #top .split-word').forEach(el => {
        el.classList.add('in', 'in-view', 'is-visible');
      });
    }, 60);

    // -----------------------------------------------------------------
    // 3. Mobile Navigation Drawer Toggle
    // -----------------------------------------------------------------
    const burger = document.querySelector('.site-nav__burger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burger && mobileMenu) {
      burger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.setAttribute('aria-hidden', String(isOpen));
        mobileMenu.classList.toggle('is-open', !isOpen);
        if (siteNav) {
          siteNav.classList.toggle('site-nav--menu-open', !isOpen);
        }
        document.body.classList.toggle('overflow-hidden', !isOpen);
      });

      // Close mobile menu on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          burger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.classList.remove('is-open');
          if (siteNav) siteNav.classList.remove('site-nav--menu-open');
          document.body.classList.remove('overflow-hidden');
        });
      });
    }

    // -----------------------------------------------------------------
    // 4. Dropdown Hover & Focus Management for Desktop Nav
    // -----------------------------------------------------------------
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

    // -----------------------------------------------------------------
    // 5. Continuous Logo Marquee Auto-Scroll
    // -----------------------------------------------------------------
    document.querySelectorAll('.logo-marquee-module__tf3V_a__container').forEach(container => {
      container.classList.add('auto-scroll');
    });

    console.log('[Creiden Engine] Fully initialized: fixed navbar, scroll reveals, case-card interactions.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteInteractions);
  } else {
    initSiteInteractions();
  }
})();
