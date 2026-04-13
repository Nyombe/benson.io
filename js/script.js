document.addEventListener('DOMContentLoaded', function () {
    console.log('Portfolio loaded successfully');

    // MOBILE NAVIGATION TOGGLE
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarNav = document.getElementById('navbarNav'); // Targeted by ID for better reliability
    if (navbarToggler && navbarNav) {
        navbarToggler.addEventListener('click', function () {
            navbarNav.classList.toggle('show');
            this.setAttribute('aria-expanded', navbarNav.classList.contains('show'));
        });
    }

    // CLOSE MOBILE MENU ON CLICK OUTSIDE
    document.addEventListener('click', function (event) {
        const isClickInside = navbarToggler.contains(event.target) || navbarNav.contains(event.target);
        if (!isClickInside && navbarNav.classList.contains('show')) {
            navbarNav.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
        }
    });

    // SMOOTH SCROLLING (with mobile menu close)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                if (navbarNav && navbarNav.classList.contains('show')) {
                    navbarNav.classList.remove('show');
                    if (navbarToggler) navbarToggler.setAttribute('aria-expanded', 'false');
                }
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ACTIVE NAV ON SCROLL
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // FADE-IN ANIMATIONS
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // FORM SUBMISSION
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type=submit]');
            if (submitBtn) {
                submitBtn.classList.add('btn-loading');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                setTimeout(() => {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }, 5000);
            }
        });
    }

    // SET YEAR (with null check)
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // DARK MODE TOGGLE logic
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                theme = 'light';
            } else {
                theme = 'dark';
            }
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    // BACK TO TOP logic
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // BOOK MODAL
    const openBookModalBtn = document.getElementById('openBookModal');
    const bookModal = document.getElementById('bookModal');
    const closeBookModalBtn = document.getElementById('closeBookModal');
    const modalOverlay = document.getElementById('modalOverlay');

    function openModal() {
        if (bookModal) {
            bookModal.classList.add('open');
            bookModal.setAttribute('aria-hidden', 'false');
        }
    }
    function closeModal() {
        if (bookModal) {
            bookModal.classList.remove('open');
            bookModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (openBookModalBtn) {
        openBookModalBtn.addEventListener('click', function() {
            openModal();
            // Automatically load sample when opened from professional showcase
            showIframe(drivePreview(DRIVE_FILE_ID), 400);
            if (bookViewer) bookViewer.classList.add('sample');
            if (openFullBtn) openFullBtn.style.display = 'inline-block';
        });
    }
    if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
});

// BOOK VIEWER (outside DOMContentLoaded with null checks)
const openFullBtn = document.getElementById('openFull');
const bookViewer = document.getElementById('bookViewer');

const DRIVE_FILE_ID = '1pjtHwYUsCkpk8rvSAo2Dx6jFtZa8JBLg';
const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;

function showIframe(url, height = 600) {
    if (!bookViewer) return;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = '100%';
    iframe.height = String(height);
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    bookViewer.innerHTML = '';
    bookViewer.appendChild(iframe);
    bookViewer.style.display = 'block';
}

if (openFullBtn) {
    openFullBtn.addEventListener('click', function () {
        showIframe(drivePreview(DRIVE_FILE_ID), 800);
        bookViewer.classList.remove('sample');
    });
}
