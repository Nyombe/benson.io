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
        if (!navbarToggler || !navbarNav) return;
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
        if (!backToTopBtn) return;
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

    // TECH NEWS FETCHING
    const newsGrid = document.getElementById('news-grid');
    const newsError = document.getElementById('news-error');
    const NEWS_CACHE_KEY = 'tech_news_cache';
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

    async function fetchTechNews() {
        try {
            // Check cache first
            const cachedData = sessionStorage.getItem(NEWS_CACHE_KEY);
            if (cachedData) {
                const { timestamp, articles } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    renderNews(articles);
                    return;
                }
            }

            // Fetch from API (RSS to JSON)
            const rssUrl = 'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en';
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.status !== 'ok') throw new Error('API returned error');

            const articles = data.items.slice(0, 6).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate).toLocaleDateString(),
                description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', // Strip HTML
                thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', // Fallback image
                source: item.author || 'Tech News'
            }));

            // Store in cache
            sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                articles
            }));

            renderNews(articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            if (newsGrid) newsGrid.style.display = 'none';
            if (newsError) newsError.style.display = 'block';
        }
    }

    function renderNews(articles) {
        if (!newsGrid) return;
        newsGrid.innerHTML = ''; // Remove skeletons

        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card fade-in';
            
            // Securely build the card using element properties to avoid XSS
            const imgWrap = document.createElement('div');
            imgWrap.className = 'news-img-wrap';
            const img = document.createElement('img');
            img.src = article.thumbnail;
            img.alt = article.title;
            img.className = 'news-img';
            img.loading = 'lazy';
            imgWrap.appendChild(img);

            const content = document.createElement('div');
            content.className = 'news-content';

            const meta = document.createElement('div');
            meta.className = 'news-meta';
            const source = document.createElement('span');
            source.textContent = article.source;
            const date = document.createElement('span');
            date.textContent = article.pubDate;
            meta.appendChild(source);
            meta.appendChild(date);

            const title = document.createElement('h3');
            title.className = 'news-title';
            title.textContent = article.title;

            const desc = document.createElement('p');
            desc.className = 'news-desc';
            desc.textContent = article.description;

            const link = document.createElement('a');
            link.href = article.link;
            link.className = 'news-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = 'Read Article <i class="fas fa-arrow-right"></i>';

            content.appendChild(meta);
            content.appendChild(title);
            content.appendChild(desc);
            content.appendChild(link);

            card.appendChild(imgWrap);
            card.appendChild(content);
            
            newsGrid.appendChild(card);
            
            // Re-observe for animation
            if (observer) observer.observe(card);
        });
    }

    // Initialize fetch
    fetchTechNews();
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
