/**
 * Chennai Girls Higher Secondary School — Saidapet, Chennai
 * Pure Vanilla JavaScript Interactions, Validation & GSAP Animations
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. Page Loader Dismissal & Dynamic Year
     ------------------------------------------------------------------------ */
  const loader = document.getElementById('page-loader');
  const yearEl = document.getElementById('current-year');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function hideLoader() {
    if (loader && !loader.classList.contains('is-hidden')) {
      loader.classList.add('is-hidden');
    }
  }

  window.addEventListener('load', () => {
    window.setTimeout(hideLoader, 240);
  });
  // Safety fallback in case external fonts/resources take longer
  window.setTimeout(hideLoader, 1600);

  /* ------------------------------------------------------------------------
     2. Image Load Fallback Handling (Zero-Broken-Image Policy)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.img-fallback-box img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
      img.style.pointerEvents = 'none';
    });
  });

  /* ------------------------------------------------------------------------
     3. Sticky Header, Back-to-Top & Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const backToTopBtn = document.getElementById('back-to-top');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function onScrollUpdate() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 36);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', scrollY > 480);
    }
  }

  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  onScrollUpdate();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  function closeMobileDrawer() {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileDrawer.hidden = true;
  }

  function openMobileDrawer() {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileDrawer.hidden = false;
  }

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileDrawer.hidden) {
        closeMobileDrawer();
        mobileToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Smooth Scrolling & Active Navigation Highlighting
     ------------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav .mobile-nav-link');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      closeMobileDrawer();

      const headerOffset = header ? header.offsetHeight : 74;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset + 2;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const matches = link.getAttribute('href') === `#${activeId}`;
              link.classList.toggle('active', matches);
            });
          }
        });
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: 0.01,
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------------
     5. Animated Counters (Editable Placeholders)
     ------------------------------------------------------------------------ */
  const counterElements = document.querySelectorAll('.counter-value[data-target]');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach((el) => {
      const target = Number(el.getAttribute('data-target')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = `${current}${suffix}`;
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          el.textContent = `${target}${suffix}`;
        }
      }

      window.requestAnimationFrame(tick);
    });
  }

  const countersStrip = document.querySelector('.counters-strip');
  if (countersStrip && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    counterObserver.observe(countersStrip);
  } else {
    animateCounters();
  }

  /* ------------------------------------------------------------------------
     6. Subtle 3D Tilt Effect on Academic Cards
     ------------------------------------------------------------------------ */
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (!prefersReducedMotion && !isTouchDevice) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-y * 6).toFixed(2);
        const rotateY = (x * 6).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. School Gallery Filter & Lightbox Preview
     ------------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeLightboxIndex = 0;
  let lastFocusedTrigger = null;

  function getVisibleTriggers() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.is-hidden) .gallery-trigger'));
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';
      filterButtons.forEach((other) => {
        const isCurrent = other === btn;
        other.classList.toggle('active', isCurrent);
        other.setAttribute('aria-selected', String(isCurrent));
      });

      galleryItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;
        item.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });

  function showLightboxAt(index) {
    const triggers = getVisibleTriggers();
    if (!triggers.length || !lightboxImg || !lightboxCaption) return;
    activeLightboxIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[activeLightboxIndex];
    const innerImg = trigger.querySelector('img');
    const src = (innerImg && (innerImg.currentSrc || innerImg.src)) || trigger.getAttribute('data-src') || '';
    const caption = trigger.getAttribute('data-caption') || '';
    lightboxImg.src = src;
    lightboxImg.alt = innerImg ? innerImg.alt : caption;
    lightboxCaption.textContent = caption;
  }

  function openLightbox(trigger) {
    if (!lightboxModal) return;
    const triggers = getVisibleTriggers();
    const index = triggers.indexOf(trigger);
    lastFocusedTrigger = trigger;
    showLightboxAt(index >= 0 ? index : 0);
    lightboxModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  document.querySelectorAll('.gallery-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => showLightboxAt(activeLightboxIndex - 1));
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => showLightboxAt(activeLightboxIndex + 1));
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (event) => {
      if (event.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!lightboxModal || lightboxModal.hidden) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      showLightboxAt(activeLightboxIndex - 1);
    } else if (event.key === 'ArrowRight') {
      showLightboxAt(activeLightboxIndex + 1);
    }
  });

  /* ------------------------------------------------------------------------
     8. Contact Form Client-Side Validation (Frontend Demonstration Only)
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) {
      input.classList.toggle('is-invalid', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameVal = (document.getElementById('contact-name')?.value || '').trim();
      const phoneVal = (document.getElementById('contact-phone')?.value || '').trim();
      const emailVal = (document.getElementById('contact-email')?.value || '').trim();
      const messageVal = (document.getElementById('contact-message')?.value || '').trim();

      let hasError = false;

      if (nameVal.length < 2) {
        setFieldError('contact-name', 'error-name', 'Please enter your full name (at least 2 characters).');
        hasError = true;
      } else {
        setFieldError('contact-name', 'error-name', '');
      }

      const cleanDigits = phoneVal.replace(/\D/g, '');
      if (cleanDigits.length < 10 || cleanDigits.length > 15) {
        setFieldError('contact-phone', 'error-phone', 'Please enter a valid phone number (10 to 15 digits).');
        hasError = true;
      } else {
        setFieldError('contact-phone', 'error-phone', '');
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(emailVal)) {
        setFieldError('contact-email', 'error-email', 'Please enter a valid email address.');
        hasError = true;
      } else {
        setFieldError('contact-email', 'error-email', '');
      }

      if (messageVal.length < 10) {
        setFieldError('contact-message', 'error-message', 'Please enter a message of at least 10 characters.');
        hasError = true;
      } else {
        setFieldError('contact-message', 'error-message', '');
      }

      if (!formFeedback) return;

      formFeedback.hidden = false;
      if (hasError) {
        formFeedback.className = 'form-feedback is-error';
        formFeedback.innerHTML =
          '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Please review the highlighted fields above and try again.';
        return;
      }

      formFeedback.className = 'form-feedback is-success';
      formFeedback.innerHTML =
        `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <strong>Enquiry Noted:</strong> Thank you, ${escapeHtml(nameVal)}. For prompt assistance with admissions or school visits, please call the school office directly at <a href="tel:+914424744678">+91 44 2474 4678</a>.`;
      contactForm.reset();
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------------
     9. GSAP & ScrollTrigger Animations
     ------------------------------------------------------------------------ */
  function initAnimations() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined') {
      return;
    }

    const { gsap } = window;
    if (typeof window.ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    // Hero Entrance & Modern Image Reveal
    const heroTl = gsap.timeline({ delay: 0.18 });
    heroTl
      .from('.hero-image-reveal', {
        clipPath: 'inset(6% 6% 6% 6%)',
        scale: 1.07,
        duration: 1.15,
        ease: 'power3.out',
        clearProps: 'clipPath,transform',
      })
      .from(
        '.hero-kicker',
        { y: 18, opacity: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
        '-=0.75'
      )
      .from(
        '.hero-title',
        { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' },
        '-=0.45'
      )
      .from(
        '.hero-subtitle',
        { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', clearProps: 'transform,opacity' },
        '-=0.45'
      )
      .from(
        '.hero-actions .btn',
        { y: 16, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity' },
        '-=0.35'
      );

    // Subtle Floating Hero Decorative Geometry
    gsap.to('.decor-ring-1', {
      y: -14,
      rotation: 8,
      duration: 5.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.decor-ring-2', {
      y: 12,
      x: -8,
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    if (typeof window.ScrollTrigger === 'undefined') {
      return;
    }

    // Hero Background Subtle Parallax
    gsap.to('.hero-bg-img', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Directional Section Reveals
    gsap.utils.toArray('.gs-reveal-up').forEach((el) => {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      });
    });

    gsap.utils.toArray('.gs-reveal-left').forEach((el) => {
      gsap.from(el, {
        x: -28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          once: true,
        },
      });
    });

    gsap.utils.toArray('.gs-reveal-right').forEach((el) => {
      gsap.from(el, {
        x: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          once: true,
        },
      });
    });

    // Staggered Card Groups per Grid Container
    document
      .querySelectorAll('.academics-grid, .facilities-grid, .achievements-grid, .pillars-grid')
      .forEach((grid) => {
        const cards = grid.querySelectorAll('.gs-stagger-card');
        if (!cards.length) return;
        gsap.from(cards, {
          y: 26,
          opacity: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            once: true,
          },
        });
      });
  }

  initAnimations();
})();
