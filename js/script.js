document.addEventListener('DOMContentLoaded', function () {
    console.log('Portfolio initialized');

    // 1. Theme Logic
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    htmlElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // 3. MOBILE NAVIGATION TOGGLE
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarNav = document.getElementById('navbarNav');
    if (navbarToggler && navbarNav) {
        navbarToggler.addEventListener('click', function () {
            navbarNav.classList.toggle('show');
            this.setAttribute('aria-expanded', navbarNav.classList.contains('show'));
        });
    }

    // 4. SMOOTH SCROLLING & ACTIVE LINK
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (navbarNav && navbarNav.classList.contains('show')) {
                    navbarNav.classList.remove('show');
                    if (navbarToggler) navbarToggler.setAttribute('aria-expanded', 'false');
                }
                
                const offset = 90;
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

    // 5. REVEAL ANIMATIONS (Intersection Observer)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-up, .fade-in, .project-card').forEach(el => {
        revealObserver.observe(el);
    });

    // 6. TECH NEWS FETCHING (Keeping existing logic but refined)
    const newsGrid = document.getElementById('news-grid');
    const newsError = document.getElementById('news-error');
    const NEWS_CACHE_KEY = 'tech_news_cache';
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

    async function fetchTechNews() {
        try {
            const cachedData = sessionStorage.getItem(NEWS_CACHE_KEY);
            if (cachedData) {
                const { timestamp, articles } = JSON.parse(cachedData);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    renderNews(articles);
                    return;
                }
            }

            const rssUrl = 'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en';
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.status !== 'ok') throw new Error('API returned error');

            const articles = data.items.slice(0, 6).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate).toLocaleDateString(),
                description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
                source: item.author || 'Tech News'
            }));

            sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), articles }));
            renderNews(articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            if (newsGrid) newsGrid.style.display = 'none';
            if (newsError) newsError.style.display = 'block';
        }
    }

    function renderNews(articles) {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card reveal-up';
            card.innerHTML = `
                <div class="news-img-wrap">
                    <img src="${article.thumbnail}" alt="${article.title}" class="news-img" loading="lazy">
                </div>
                <div class="news-content">
                    <div class="news-meta"><span>${article.source}</span><span>${article.pubDate}</span></div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-desc">${article.description}</p>
                    <a href="${article.link}" class="news-link" target="_blank" rel="noopener noreferrer">Read Article <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            newsGrid.appendChild(card);
            revealObserver.observe(card);
        });
    }

    fetchTechNews();

    // 7. FOOTER YEAR
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 8. BACK TO TOP
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (!backToTopBtn) return;
        if (window.scrollY > 500) backToTopBtn.classList.add('show');
        else backToTopBtn.classList.remove('show');
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 9. BOOK MODAL (Keeping existing functionality)
    const openBookModalBtn = document.getElementById('openBookModal');
    const bookModal = document.getElementById('bookModal');
    const closeBookModalBtn = document.getElementById('closeBookModal');
    const modalOverlay = document.getElementById('modalOverlay');

    if (openBookModalBtn && bookModal) {
        openBookModalBtn.addEventListener('click', () => {
            bookModal.classList.add('open');
            bookModal.setAttribute('aria-hidden', 'false');
            showIframe(drivePreview(DRIVE_FILE_ID), 400);
            if (bookViewer) bookViewer.classList.add('sample');
            if (openFullBtn) openFullBtn.style.display = 'inline-block';
        });
    }

    const closeModal = () => {
        if (bookModal) {
            bookModal.classList.remove('open');
            bookModal.setAttribute('aria-hidden', 'true');
        }
    };

    if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
});

// GLOBAL BOOK VIEWER UTILS
const DRIVE_FILE_ID = '1pjtHwYUsCkpk8rvSAo2Dx6jFtZa8JBLg';
const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;
const openFullBtn = document.getElementById('openFull');
const bookViewer = document.getElementById('bookViewer');

function showIframe(url, height = 600) {
    if (!bookViewer) return;
    bookViewer.innerHTML = `<iframe src="${url}" width="100%" height="${height}" frameborder="0" allowfullscreen></iframe>`;
    bookViewer.style.display = 'block';
}

if (openFullBtn) {
    openFullBtn.addEventListener('click', () => {
        showIframe(drivePreview(DRIVE_FILE_ID), 800);
        bookViewer.classList.remove('sample');
    });
}
