document.addEventListener('DOMContentLoaded', () => {
    // ==================== THEME TOGGLE ====================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('aae-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateToggleLabel(savedTheme);

    function updateToggleLabel(theme) {
        if (!themeToggle) return;
        const label = themeToggle.querySelector('.toggle-label');
        if (label) {
            const icon = label.querySelector('i');
            if (theme === 'dark') {
                if (icon) icon.className = 'ri-sun-line';
                label.lastChild.textContent = ' Modo Claro';
            } else {
                if (icon) icon.className = 'ri-contrast-2-line';
                label.lastChild.textContent = ' Modo Oscuro';
            }
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('aae-theme', next);
            updateToggleLabel(next);
        });
    }

    // Menu Toggle Functionality
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // Scroll Animation for Service Cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Hero Carousel
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselDots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let carouselInterval;

    function showSlide(index) {
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        carouselDots.forEach(dot => dot.classList.remove('active'));
        carouselSlides[index].classList.add('active');
        carouselDots[index].classList.add('active');
        currentSlide = index;
    }

    function startCarousel() {
        if (carouselSlides.length > 0) {
            carouselInterval = setInterval(() => {
                showSlide((currentSlide + 1) % carouselSlides.length);
            }, 5000);
        }
    }

    if (carouselSlides.length > 0) {
        startCarousel();
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(carouselInterval);
                showSlide(index);
                startCarousel();
            });
        });
    }

    // Contact Form → n8n Webhook
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new URLSearchParams();
            formData.append('name', document.getElementById('name').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('message', document.getElementById('message').value);
            formData.append('source', 'aae_website_contact');

            fetch('https://purefocus04.app.n8n.cloud/webhook/31c786a4-60ba-4c29-a375-2a59869de2c9', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            })
            .then(() => {
                contactForm.reset();
                window.location.href = 'gracias.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al enviar. Por favor intenta de nuevo.');
            })
            .finally(() => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // --- Cookie Banner Logic ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (cookieBanner && acceptBtn && rejectBtn) {
        const consent = localStorage.getItem('aae-cookie-consent');
        if (!consent) {
            // Se muestra con un retraso de 2 segundos para mejor UX
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2000);
        }
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('aae-cookie-consent', 'accepted');
            cookieBanner.classList.remove('show');
        });
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('aae-cookie-consent', 'rejected');
            cookieBanner.classList.remove('show');
        });
    }
});
