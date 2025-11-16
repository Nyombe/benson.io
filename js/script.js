document.addEventListener('DOMContentLoaded', function () {
    // ===== SMOOTH SCROLLING FOR NAVIGATION =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== FADE-IN ANIMATIONS ON SCROLL =====
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

    // Add fade-in class to teaching and project cards
    document.querySelectorAll('.teaching-card, .project-card, .skill-path').forEach(el => {
        el.classList.add('fade-in');
    });

    // ===== ACTIVE NAV UPDATE ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
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

    // ===== MOBILE MENU TOGGLE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        const toggleNav = () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            if (isActive) {
                const firstLink = navLinks.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        };

        menuToggle.addEventListener('click', toggleNav);
        menuToggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNav();
            }
        });

        // Close menu with Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function () {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Contact form submission (Formspree integration) + loading state
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('btn-loading');
                submitBtn.disabled = true;
            }
            // allow form to submit to Formspree normally
        });
    }

    // Mobile menu toggle (defensive)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        const toggleNav = () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            if (isActive) {
                // focus first link for better keyboard flow
                const firstLink = navLinks.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        };

        menuToggle.addEventListener('click', function () {
            toggleNav();
        });

        // keyboard support: Enter or Space to toggle
        menuToggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNav();
            }
        });

        // Close mobile nav with Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            // close mobile nav if open and update aria state
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Active nav update on scroll
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-link, .nav-links a');

    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
                current = section.getAttribute('id');
            }
        });
        navAnchors.forEach(link => {
            link.classList.remove('active');
            try {
                const href = link.getAttribute('href') || '';
                if (href === `#${current}`) link.classList.add('active');
            } catch (e) { }
        });
    }

    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Portfolio filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Sticky header on scroll
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        header.classList.toggle('sticky', window.scrollY > 0);
    });
});


// (duplicate helpers removed) - year and sticky header are set inside DOMContentLoaded above

// --- Book modal handling (follow is optional) ---
const openBookModalBtn = document.getElementById('openBookModal');
const bookModal = document.getElementById('bookModal');
const closeBookModalBtn = document.getElementById('closeBookModal');
const modalOverlay = document.getElementById('modalOverlay');
const confirmFollowBtn = document.getElementById('confirmFollow');
const readSampleBtn = document.getElementById('readSample');
const openFullBtn = document.getElementById('openFull');
const bookViewer = document.getElementById('bookViewer');

function openModal() {
    if (bookModal) {
        bookModal.setAttribute('aria-hidden', 'false');
        bookModal.classList.add('open');
    }
}
function closeModal() {
    if (bookModal) {
        bookModal.setAttribute('aria-hidden', 'true');
        bookModal.classList.remove('open');
        // hide viewer when closing
        if (bookViewer) { bookViewer.style.display = 'none'; bookViewer.innerHTML = ''; }
        if (openFullBtn) openFullBtn.style.display = 'none';
        if (confirmFollowBtn) { confirmFollowBtn.disabled = false; confirmFollowBtn.textContent = 'I followed'; }
    }
}

if (openBookModalBtn) openBookModalBtn.addEventListener('click', openModal);
if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Replace this ID with your actual Google Drive file ID (the long string between /d/ and /view)
// e.g. from https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> FILE_ID
const DRIVE_FILE_ID = '1pjtHwYUsCkpk8rvSAo2Dx6jFtZa8JBLg';
const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;

// Helper: create iframe and append to bookViewer
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

// Read a small sample (no follow required)
if (readSampleBtn) {
    readSampleBtn.addEventListener('click', function () {
        if (DRIVE_FILE_ID === 'YOUR_GOOGLE_DRIVE_FILE_ID' || !DRIVE_FILE_ID) {
            // show friendly message when ID not set
            alert('Please set the Google Drive file ID in js/script.js to preview the book.');
            return;
        }
        // show a smaller, blurred preview to discourage downloads
        showIframe(drivePreview(DRIVE_FILE_ID), 340);
        // add a subtle overlay to indicate it's a sample
        bookViewer.classList.add('sample');
        // offer open full reader button (optional)
        if (openFullBtn) { openFullBtn.style.display = 'inline-block'; }
    });
}

// Open full reader (after follow or directly)
if (openFullBtn) {
    openFullBtn.addEventListener('click', function () {
        if (DRIVE_FILE_ID === 'YOUR_GOOGLE_DRIVE_FILE_ID' || !DRIVE_FILE_ID) {
            alert('Please set the Google Drive file ID in js/script.js to open the full reader.');
            return;
        }
        // show full-height reader
        showIframe(drivePreview(DRIVE_FILE_ID), 800);
        bookViewer.classList.remove('sample');
    });
}

// When user clicks "I followed", behave the same as open full reader but show thank you state
if (confirmFollowBtn) {
    confirmFollowBtn.addEventListener('click', function () {
        if (DRIVE_FILE_ID === 'YOUR_GOOGLE_DRIVE_FILE_ID' || !DRIVE_FILE_ID) {
            alert('Please set the Google Drive file ID in js/script.js to open the full reader.');
            return;
        }
        // open full reader
        showIframe(drivePreview(DRIVE_FILE_ID), 800);
        bookViewer.classList.remove('sample');
        confirmFollowBtn.textContent = 'Thank you — enjoy reading!';
        confirmFollowBtn.disabled = true;
        if (openFullBtn) openFullBtn.style.display = 'inline-block';
    });
}

// --- Navigation active state and cover flip ---
(function setActiveNav() {
    try {
        const navLinks = document.querySelectorAll('nav.nav-links a');
        const path = window.location.pathname.split('/').pop();
        navLinks.forEach(a => a.classList.remove('active'));
        if (path === 'books.html' || path === 'book.html') {
            const el = document.querySelector('nav.nav-links a[href*="books.html"]') || document.querySelector('nav.nav-links a[href*="book.html"]');
            if (el) el.classList.add('active');
        } else if (window.location.hash === '#book') {
            const el = document.querySelector('nav.nav-links a[href*="books.html"]') || document.querySelector('nav.nav-links a[href*="book.html"]');
            if (el) el.classList.add('active');
        }
    } catch (e) { /* ignore */ }
})();

(function coverFlip() {
    const covers = document.querySelector('.book-covers');
    if (!covers) return;
    covers.addEventListener('click', function () { covers.classList.toggle('flipped'); });
    covers.setAttribute('tabindex', '0');
    covers.addEventListener('keydown', function (e) { if (e.key === 'Enter') covers.classList.toggle('flipped'); });
})();