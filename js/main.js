/**
 * THE DECORE HOUSE - Premium Event Decoration & Celebrations
 * Main JavaScript Controller (Refined Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ========================================================================
  // ========================================================================
  // 1. Navigation, Header Scroll Dynamics & Mobile Dropdown
  // ========================================================================
  const siteHeader = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');

  const handleHeaderScroll = () => {
    if (window.scrollY > 30) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Mobile Menu Toggle with Gold-Standard Body Scroll Lock (Drawer scrolls freely, background frozen)
  const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
  let savedScrollY = 0;

  const toggleMobileMenu = (open) => {
    const shouldOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    if (hamburger) {
      hamburger.classList.toggle('is-active', shouldOpen);
      hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }
    if (mobileDrawer) mobileDrawer.classList.toggle('open', shouldOpen);
    if (mobileBackdrop) mobileBackdrop.classList.toggle('open', shouldOpen);

    // Stop background scrolling when mobile menu is open, while keeping menu drawer independently scrollable
    if (shouldOpen) {
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      const restoreY = savedScrollY;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      window.scrollTo(0, restoreY);
    }
  };

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu(false);
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Prevent background touch drag while allowing menu drawer to scroll smoothly
  document.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('menu-open')) {
      if (!e.target.closest('#mobileNavDrawer')) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // CSS zoom on <html> breaks raw scroll math — compensate explicitly
  const getPageZoom = () => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom);
    return Number.isFinite(z) && z > 0 ? z : 1;
  };

  const getDocumentOffsetTop = (el) => {
    let y = 0;
    let node = el;
    while (node) {
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return y;
  };

  // Robust Smooth Section Scrolling (Desktop + Mobile, zoom-safe)
  const scrollToTarget = (targetId) => {
    if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const menuWasOpen = !!(mobileDrawer && mobileDrawer.classList.contains('open'));
    if (menuWasOpen) {
      toggleMobileMenu(false);
    }

    const doScroll = () => {
      const zoom = getPageZoom();
      const headerOffset = siteHeader ? siteHeader.offsetHeight : 70;
      const docTop = getDocumentOffsetTop(targetElement);
      // Under html { zoom }, scrollTo top must be multiplied by zoom
      const offsetPosition = (docTop - headerOffset) * zoom;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    };

    // Wait for body unlock after closing mobile drawer
    setTimeout(doScroll, menuWasOpen ? 140 : 0);
  };

  // Wire all anchor links across page, header, and mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        scrollToTarget(href);
        if (history.pushState) {
          history.pushState(null, '', href);
        }
      }
    });
  });

  // Handle URL hash on initial load (e.g. if arriving at /#contact)
  if (window.location.hash && window.location.hash.length > 1) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        scrollToTarget(window.location.hash);
      }, 350);
    });
  }

  // Active Link Highlighting on Scroll (viewport-based = zoom-safe)
  const sections = document.querySelectorAll('section[id]');
  const highlightActiveNav = () => {
    const headerHeight = siteHeader ? siteHeader.getBoundingClientRect().height : 70;
    const marker = headerHeight + 48;
    let currentId = null;

    sections.forEach(current => {
      const rect = current.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        currentId = current.id;
      }
    });

    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
      const id = link.getAttribute('href').slice(1);
      link.classList.toggle('active', id === currentId);
    });
    document.querySelectorAll('.mobile-exact-link[href^="#"]').forEach(link => {
      const id = link.getAttribute('href').slice(1);
      link.classList.toggle('active', id === currentId);
    });
  };
  window.addEventListener('scroll', highlightActiveNav, { passive: true });
  highlightActiveNav();

  // ========================================================================
  // 2. Hero Background Image Slider (Auto-changes every 4 seconds)
  // ========================================================================
  const heroSlides = document.querySelectorAll('.hero-slide');
  const sliderDots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let slideInterval = null;
  const SLIDE_DURATION = 4000; // 4 seconds

  const showSlide = (index) => {
    if (!heroSlides.length) return;
    currentSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });
  };

  const nextSlide = () => {
    showSlide(currentSlide + 1);
  };

  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  };

  const stopSlideTimer = () => {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  };

  // Clicking dots switches slide immediately and restarts the timer
  sliderDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startSlideTimer();
    });
  });

  // Mobile Touch Swipe support
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    let touchStartX = 0;
    let touchEndX = 0;

    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          showSlide(currentSlide + 1);
        } else {
          showSlide(currentSlide - 1);
        }
        startSlideTimer();
      }
    }, { passive: true });
  }

  // Initialize and start auto slide rotation immediately
  showSlide(0);
  startSlideTimer();

  // ========================================================================
  // 3. Services Carousel Navigation & 3D Tilt
  // ========================================================================
  const servicesTrack = document.querySelector('.services-track');
  const prevBtn = document.querySelector('.slider-arrow-prev');
  const nextBtn = document.querySelector('.slider-arrow-next');

  if (servicesTrack && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const cardWidth = servicesTrack.querySelector('.service-card')?.offsetWidth || 300;
      servicesTrack.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const cardWidth = servicesTrack.querySelector('.service-card')?.offsetWidth || 300;
      servicesTrack.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
    });
  }

  // 3D Tilt Effect on Service and Gallery Cards
  const applyTilt = (cards) => {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  applyTilt(document.querySelectorAll('.service-card, .gallery-item, .cinema-presentation-card, .instagram-card'));

  // ========================================================================
  // 4. GALLERY SECTION – Category Filtering, Max-4 Initial View & Show More
  // ========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryShowMoreBtn = document.getElementById('galleryShowMoreBtn');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxClose = document.getElementById('lightboxClose');

  let activeFilter = 'all';
  let isGalleryExpanded = false;
  const GALLERY_MAX_COLLAPSED = 4;
  let activeLightboxQueue = [];
  let currentLightboxIdx = 0;

  const applyGalleryVisibility = (smoothScrollOnCollapse = false) => {
    const matchingItems = [];
    galleryItems.forEach(item => {
      const category = item.dataset.category || '';
      const isMatch = activeFilter === 'all' || category.includes(activeFilter);
      if (isMatch) {
        matchingItems.push(item);
      } else {
        item.style.display = 'none';
        item.classList.add('item-collapsed');
        item.classList.remove('filtering-in', 'item-revealed');
      }
    });

    const totalMatching = matchingItems.length;

    if (totalMatching <= GALLERY_MAX_COLLAPSED) {
      matchingItems.forEach(item => {
        item.style.display = '';
        item.classList.remove('item-collapsed', 'filtering-out');
        item.classList.add('filtering-in');
      });
      if (galleryShowMoreBtn) {
        galleryShowMoreBtn.style.display = 'none';
      }
    } else {
      if (galleryShowMoreBtn) {
        galleryShowMoreBtn.style.display = 'inline-flex';
      }

      if (isGalleryExpanded) {
        matchingItems.forEach((item, idx) => {
          item.style.display = '';
          item.classList.remove('item-collapsed', 'filtering-out');
          if (idx >= GALLERY_MAX_COLLAPSED) {
            item.classList.add('item-revealed');
          } else {
            item.classList.add('filtering-in');
          }
        });

        if (galleryShowMoreBtn) {
          galleryShowMoreBtn.setAttribute('aria-expanded', 'true');
          galleryShowMoreBtn.classList.add('expanded');
          const btnText = galleryShowMoreBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Show Less Creations';
        }
      } else {
        matchingItems.forEach((item, idx) => {
          if (idx < GALLERY_MAX_COLLAPSED) {
            item.style.display = '';
            item.classList.remove('item-collapsed', 'filtering-out', 'item-revealed');
            item.classList.add('filtering-in');
          } else {
            item.style.display = 'none';
            item.classList.add('item-collapsed');
            item.classList.remove('item-revealed', 'filtering-in');
          }
        });

        if (galleryShowMoreBtn) {
          galleryShowMoreBtn.setAttribute('aria-expanded', 'false');
          galleryShowMoreBtn.classList.remove('expanded');
          const remainingCount = totalMatching - GALLERY_MAX_COLLAPSED;
          const btnText = galleryShowMoreBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = `View More Creations (${remainingCount} More)`;
        }

        if (smoothScrollOnCollapse) {
          const gallerySection = document.getElementById('gallery');
          if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  };

  // Initial display: max 4 items
  applyGalleryVisibility(false);

  // Filter Click Handling
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      activeFilter = btn.dataset.filter || 'all';
      isGalleryExpanded = false;
      applyGalleryVisibility(false);
    });
  });

  // Gallery Show More Button Click
  if (galleryShowMoreBtn) {
    galleryShowMoreBtn.addEventListener('click', () => {
      isGalleryExpanded = !isGalleryExpanded;
      applyGalleryVisibility(!isGalleryExpanded);
    });
  }

  // ========================================================================
  // INSTAGRAM SECTION – Max-4 Initial View & Show More Option
  // ========================================================================
  const instagramCards = document.querySelectorAll('.instagram-card');
  const instagramShowMoreBtn = document.getElementById('instagramShowMoreBtn');

  let isInstagramExpanded = false;
  const INSTAGRAM_MAX_COLLAPSED = 4;

  const applyInstagramVisibility = (smoothScrollOnCollapse = false) => {
    const totalCards = instagramCards.length;

    if (totalCards <= INSTAGRAM_MAX_COLLAPSED) {
      instagramCards.forEach(card => {
        card.style.display = '';
        card.classList.remove('item-collapsed');
      });
      if (instagramShowMoreBtn) {
        instagramShowMoreBtn.style.display = 'none';
      }
      return;
    }

    if (instagramShowMoreBtn) {
      instagramShowMoreBtn.style.display = 'inline-flex';
    }

    if (isInstagramExpanded) {
      instagramCards.forEach((card, idx) => {
        card.style.display = '';
        card.classList.remove('item-collapsed');
        if (idx >= INSTAGRAM_MAX_COLLAPSED) {
          card.classList.add('item-revealed');
        }
      });

      if (instagramShowMoreBtn) {
        instagramShowMoreBtn.setAttribute('aria-expanded', 'true');
        instagramShowMoreBtn.classList.add('expanded');
        const btnText = instagramShowMoreBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Show Less Moments';
      }
    } else {
      instagramCards.forEach((card, idx) => {
        if (idx < INSTAGRAM_MAX_COLLAPSED) {
          card.style.display = '';
          card.classList.remove('item-collapsed', 'item-revealed');
        } else {
          card.style.display = 'none';
          card.classList.add('item-collapsed');
          card.classList.remove('item-revealed');
        }
      });

      if (instagramShowMoreBtn) {
        instagramShowMoreBtn.setAttribute('aria-expanded', 'false');
        instagramShowMoreBtn.classList.remove('expanded');
        const remaining = totalCards - INSTAGRAM_MAX_COLLAPSED;
        const btnText = instagramShowMoreBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = `Show More Moments (${remaining} More)`;
      }

      if (smoothScrollOnCollapse) {
        const igSection = document.querySelector('.instagram-section');
        if (igSection) {
          igSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  // Initial Instagram display: max 4 items
  applyInstagramVisibility(false);

  // Instagram Show More Button Click
  if (instagramShowMoreBtn) {
    instagramShowMoreBtn.addEventListener('click', () => {
      isInstagramExpanded = !isInstagramExpanded;
      applyInstagramVisibility(!isInstagramExpanded);
    });
  }

  // Dynamic Lightbox Queue Collection
  const getActiveGalleryItems = (clickedElement) => {
    const queue = [];

    if (clickedElement && clickedElement.classList.contains('instagram-card')) {
      document.querySelectorAll('.instagram-card').forEach(ig => {
        queue.push({
          src: ig.dataset.fullsrc || ig.querySelector('img')?.src,
          title: ig.dataset.title || 'Instagram Showcase',
          category: ig.dataset.category || 'Celebration Reel',
          element: ig
        });
      });
      return queue;
    }

    galleryItems.forEach(item => {
      const category = item.dataset.category || '';
      const isMatch = activeFilter === 'all' || category.includes(activeFilter);
      if (isMatch) {
        queue.push({
          src: item.dataset.fullsrc || item.querySelector('img')?.src,
          title: item.dataset.title || item.querySelector('.gallery-item-title')?.textContent,
          category: item.dataset.sub || item.dataset.category || 'The Decore House Creation',
          element: item
        });
      }
    });

    return queue;
  };

  const updateLightboxContent = (idx) => {
    if (!activeLightboxQueue.length) return;
    currentLightboxIdx = (idx + activeLightboxQueue.length) % activeLightboxQueue.length;
    const item = activeLightboxQueue[currentLightboxIdx];

    lightboxImg.src = item.src;
    lightboxImg.alt = item.title;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = `${item.category} • (${currentLightboxIdx + 1} of ${activeLightboxQueue.length})`;
  };

  const openLightbox = (clickedItem) => {
    activeLightboxQueue = getActiveGalleryItems(clickedItem);
    const foundIdx = activeLightboxQueue.findIndex(item => item.element === clickedItem);
    currentLightboxIdx = foundIdx !== -1 ? foundIdx : 0;

    updateLightboxContent(currentLightboxIdx);
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  document.querySelectorAll('.instagram-card').forEach(ig => {
    ig.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(ig);
    });
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxContent(currentLightboxIdx - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightboxContent(currentLightboxIdx + 1);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  // ========================================================================
  // 5. CINEMATIC VIDEO SHOWCASE (Compact Card & Modal Integration)
  // ========================================================================
  const videoModal = document.getElementById('videoModal');
  const videoModalClose = document.getElementById('videoModalClose');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const playStoryBtn = document.getElementById('playStoryBtn');
  const cinemaCard = document.getElementById('cinemaCardTrigger');
  const showcaseVideo = document.getElementById('showcaseVideo');
  const cinemaPlayBtn = document.getElementById('cinemaPlayBtn');

  // Compact Showcase Card Video Playback
  if (cinemaCard && showcaseVideo) {
    const playShowcase = () => {
      showcaseVideo.play().then(() => {
        cinemaCard.classList.add('is-playing');
        showcaseVideo.controls = true;
      }).catch((err) => {
        console.warn('Video play triggered:', err);
      });
    };

    const pauseShowcase = () => {
      showcaseVideo.pause();
    };

    if (cinemaPlayBtn) {
      cinemaPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playShowcase();
      });
    }

    cinemaCard.addEventListener('click', (e) => {
      if (e.target === showcaseVideo && showcaseVideo.controls) return;
      if (showcaseVideo.paused) {
        playShowcase();
      } else {
        pauseShowcase();
      }
    });

    cinemaCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (showcaseVideo.paused) {
          playShowcase();
        } else {
          pauseShowcase();
        }
      }
    });

    showcaseVideo.addEventListener('ended', () => {
      cinemaCard.classList.remove('is-playing');
      showcaseVideo.controls = false;
      showcaseVideo.load();
    });

    showcaseVideo.addEventListener('pause', () => {
      if (!showcaseVideo.seeking && showcaseVideo.currentTime === 0) {
        cinemaCard.classList.remove('is-playing');
        showcaseVideo.controls = false;
      }
    });
  }

  // Modal Video Handling (Used by Watch Our Story button)
  const openVideoModal = () => {
    if (!videoModal) return;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (modalVideoPlayer) {
      modalVideoPlayer.currentTime = 0;
      modalVideoPlayer.play().catch(() => {});
    }
  };

  const closeVideoModal = () => {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
    }
  };

  if (playStoryBtn) {
    playStoryBtn.addEventListener('click', openVideoModal);
  }

  if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // ========================================================================
  // 6. ABOUT US PARALLAX & "KNOW MORE" MODAL
  // ========================================================================
  const aboutSection = document.getElementById('about');
  const aboutParallaxWrap = document.getElementById('aboutParallaxWrap');

  if (aboutSection && aboutParallaxWrap) {
    aboutSection.addEventListener('mousemove', (e) => {
      const rect = aboutSection.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      aboutParallaxWrap.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    });

    aboutSection.addEventListener('mouseleave', () => {
      aboutParallaxWrap.style.transform = 'translate(0, 0)';
    });
  }

  const knowMoreBtn = document.getElementById('knowMoreBtn');
  const aboutModal = document.getElementById('aboutModal');
  const aboutModalClose = document.getElementById('aboutModalClose');

  if (knowMoreBtn && aboutModal) {
    knowMoreBtn.addEventListener('click', () => {
      aboutModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (aboutModalClose && aboutModal) {
    aboutModalClose.addEventListener('click', () => {
      aboutModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ========================================================================
  // 7. WORK PROCESS – Interactive Scroll Connecting Line
  // ========================================================================
  const processTimeline = document.getElementById('processTimeline');
  const processTimelineFill = document.getElementById('processTimelineFill');

  if (processTimeline && processTimelineFill) {
    const handleProcessScroll = () => {
      const rect = processTimeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When timeline enters viewport
      if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
        const scrolled = (windowHeight * 0.8 - rect.top) / (rect.height + windowHeight * 0.4);
        const percent = Math.min(100, Math.max(10, scrolled * 100));
        processTimelineFill.style.width = `${percent}%`;
      }
    };

    window.addEventListener('scroll', handleProcessScroll, { passive: true });
    handleProcessScroll();
  }

  // Global Keyboard Navigation (Escape & Arrow Keys)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxModal?.classList.contains('active')) closeLightbox();
      if (videoModal?.classList.contains('active')) closeVideoModal();
      if (aboutModal?.classList.contains('active')) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (mobileDrawer?.classList.contains('open')) toggleMobileMenu(false);
    } else if (e.key === 'ArrowLeft' && lightboxModal?.classList.contains('active')) {
      updateLightboxContent(currentLightboxIdx - 1);
    } else if (e.key === 'ArrowRight' && lightboxModal?.classList.contains('active')) {
      updateLightboxContent(currentLightboxIdx + 1);
    }
  });

  // ========================================================================
  // 8. Booking Inquiry Form & Toast
  // ========================================================================
  const inquiryForm = document.getElementById('inquiryForm');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  const showToast = (message) => {
    if (!toastNotification) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  };

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inqName')?.value.trim();
      const phone = document.getElementById('inqPhone')?.value.trim();
      const eventType = document.getElementById('inqEvent')?.value;

      if (!name || !phone) {
        showToast('Please provide your name and phone number.');
        return;
      }

      showToast(`✨ Thank you ${name}! Our event stylist will call you shortly regarding your ${eventType || 'celebration'}.`);
      inquiryForm.reset();
    });
  }

  // ========================================================================
  // 10. Scroll-Triggered Reveal Animations
  // ========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ========================================================================
  // 11. Decor Refreshment Quotes Rotation (Compact & Elegant)
  // ========================================================================
  const decorQuotes = [
    "“Decor is the poetry of space — where every bloom, every candle, and every detail tells a story of love.”",
    "“We don't just decorate spaces, we create atmospheres that linger in the heart forever.”",
    "“Every celebration begins with a dream; our passion is bringing that dream into bloom.”",
    "“Turning your most cherished moments into unforgettable memories.”",
    "“The finest celebration is crafted in the details you feel before you even see them.”"
  ];
  let quoteIdx = 0;
  const quoteEl = document.getElementById('decorQuoteElement');

  if (quoteEl) {
    setInterval(() => {
      quoteEl.classList.add('fade-out');
      setTimeout(() => {
        quoteIdx = (quoteIdx + 1) % decorQuotes.length;
        quoteEl.textContent = decorQuotes[quoteIdx];
        quoteEl.classList.remove('fade-out');
        quoteEl.classList.add('fade-in');
        setTimeout(() => quoteEl.classList.remove('fade-in'), 450);
      }, 450);
    }, 5500);
  }

  console.log('✨ The Decore House website initialized with full interactive suites.');
});
