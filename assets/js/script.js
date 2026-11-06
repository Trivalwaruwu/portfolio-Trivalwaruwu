
(function () {
  'use strict';

  // =====================================
  // INITIALIZATION
  // =====================================

  const root = document.documentElement;
  root.classList.add('js-enabled');


  // =====================================
  // DARK MODE & LIGHT MODE
  // =====================================

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');

  const themeColorMeta = document.querySelector(
    'meta[name="theme-color"]'
  );

  function getSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme');
      return savedTheme === 'light' ? 'light' : 'dark';
    } catch (error) {
      console.warn('Tidak dapat membaca pengaturan tema:', error);
      return 'dark';
    }
  }

  function applyTheme(theme) {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';
    const isDark = selectedTheme === 'dark';

    root.setAttribute('data-theme', selectedTheme);

    if (themeIcon) {
      themeIcon.className = isDark
        ? 'bi bi-sun-fill'
        : 'bi bi-moon-stars-fill';
    }

    if (themeText) {
      themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'
      );

      themeToggle.setAttribute('aria-pressed', String(!isDark));
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        isDark ? '#101827' : '#f3f6ff'
      );
    }

    try {
      localStorage.setItem('portfolio-theme', selectedTheme);
    } catch (error) {
      console.warn('Tidak dapat menyimpan pengaturan tema:', error);
    }
  }

  applyTheme(getSavedTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      applyTheme(newTheme);
    });
  }


  // =====================================
  // CURRENT YEAR
  // =====================================

  const year = document.getElementById('currentYear');

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // =====================================
  // MOBILE NAVIGATION
  // =====================================

  const nav = document.getElementById('mainNav');

  if (nav && window.bootstrap) {
    nav.querySelectorAll('a.nav-link, a.btn-nav').forEach((link) => {
      link.addEventListener('click', function () {
        if (nav.classList.contains('show')) {
          window.bootstrap.Collapse
            .getOrCreateInstance(nav)
            .hide();
        }
      });
    });
  }


  // =====================================
  // ANIMASI KARTU SAAT MASUK HOME
  // =====================================

  const homeSection =
    document.querySelector('#home') ||
    document.querySelector('.hero-section');

  const lanyard = document.querySelector('.lanyard-swing');

  if (
    homeSection &&
    lanyard &&
    'IntersectionObserver' in window
  ) {
    let homeWasVisible = false;
    let dropTimer = null;

    function playLanyardDrop() {
      // Hentikan timer animasi sebelumnya jika ada
      if (dropTimer) {
        clearTimeout(dropTimer);
      }

      // Hapus kelas agar animasi dapat diputar ulang
      lanyard.classList.remove('is-dropping');

      // Paksa browser membaca ulang posisi elemen
      void lanyard.offsetWidth;

      // Jalankan animasi jatuh
      lanyard.classList.add('is-dropping');

      // Setelah jatuh, kembali ke animasi goyang
      dropTimer = setTimeout(function () {
        lanyard.classList.remove('is-dropping');
        dropTimer = null;
      }, 950);
    }

    const homeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !homeWasVisible) {
            homeWasVisible = true;
            playLanyardDrop();
          }

          if (!entry.isIntersecting) {
            homeWasVisible = false;
          }
        });
      },
      {
        threshold: 0.35
      }
    );

    homeObserver.observe(homeSection);

  } else if (lanyard) {
    // Jika browser tidak mendukung IntersectionObserver,
    // kartu tetap menggunakan animasi goyang biasa.
    lanyard.classList.remove('is-dropping');
  }


  // =====================================
  // SCROLL REVEAL ANIMATION
  // =====================================

  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });

  } else {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });
  }


  // =====================================
  // ACTIVE NAVIGATION ON SCROLL
  // =====================================

  const sections = document.querySelectorAll('main section[id]');

  const navLinks = document.querySelectorAll(
    '.site-nav .nav-link'
  );

  if (
    'IntersectionObserver' in window &&
    sections.length &&
    navLinks.length
  ) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => {
            const isActive =
              link.getAttribute('href') === '#' + entry.target.id;

            link.classList.toggle('active', isActive);
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px'
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }


  // =====================================
  // PDF CERTIFICATE PREVIEW
  // =====================================

  async function renderCertificates() {
    const canvases = document.querySelectorAll(
      '.certificate-pdf-preview canvas[data-pdf]'
    );

    if (!canvases.length) {
      return;
    }

    const pdfjs = window.pdfjsLib;

    if (!pdfjs) {
      canvases.forEach((canvas) => {
        const message = canvas.parentElement.querySelector(
          '.pdf-preview-message'
        );

        if (message) {
          message.textContent =
            'PDF.js gagal dimuat. Klik Lihat PDF.';
        }
      });

      return;
    }

    pdfjs.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    for (const canvas of canvases) {
      const box = canvas.parentElement;

      const message = box.querySelector(
        '.pdf-preview-message'
      );

      try {
        const pdf = await pdfjs.getDocument(
          canvas.dataset.pdf
        ).promise;

        const page = await pdf.getPage(1);

        const original = page.getViewport({
          scale: 1
        });

        const availableWidth = Math.max(
          box.clientWidth - 24,
          100
        );

        const availableHeight = Math.max(
          box.clientHeight - 24,
          100
        );

        const scale = Math.min(
          availableWidth / original.width,
          availableHeight / original.height
        );

        const viewport = page.getViewport({
          scale: scale
        });

        const ratio = Math.min(
          window.devicePixelRatio || 1,
          2
        );

        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);

        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';

        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas tidak dapat digunakan.');
        }

        await page.render({
          canvasContext: context,
          viewport: viewport,
          transform: ratio !== 1
            ? [ratio, 0, 0, ratio, 0, 0]
            : null
        }).promise;

        canvas.hidden = false;

        if (message) {
          message.remove();
        }

      } catch (error) {
        console.error('Gagal menampilkan sertifikat:', error);

        if (message) {
          message.textContent =
            'Preview gagal dimuat. Klik Lihat PDF.';
        }
      }
    }
  }


  // =====================================
  // LOAD PDF CERTIFICATES
  // =====================================

  if (document.readyState === 'complete') {
    renderCertificates();
  } else {
    window.addEventListener(
      'load',
      renderCertificates,
      { once: true }
    );
  }

})();
