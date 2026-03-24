document.addEventListener('DOMContentLoaded', () => {
    // ==================== 1. TEMA Y MODO OSCURO ====================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('aae-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    if (themeToggle) updateToggleLabel(savedTheme);

    function updateToggleLabel(theme) {
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

    // ==================== 2. MENÚ DESPLEGABLE ====================
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

    // ==================== 3. NAVEGACIÓN Y ANIMACIONES ====================
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
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // ==================== 4. MOTOR AVANZADO DEL CARRUSEL ====================
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDots = document.querySelectorAll('.dot');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 1; // Empezamos en la real diapositiva 1
    let isTransitioning = false;
    let carouselInterval;

    function showSlide(index, animate = true) {
        if (!carouselTrack || (animate && isTransitioning)) return;
        if (animate) isTransitioning = true;
        
        carouselTrack.style.transition = animate ? 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' : 'none';
        
        const slideWidth = window.innerWidth <= 768 ? 95 : 90;
        const offset = window.innerWidth <= 768 ? 2.5 : 5;
        
        carouselTrack.style.transform = `translate3d(calc(${offset}% - ${index} * ${slideWidth}%), 0, 0)`;

        // Actualizar Dots
        let dotIndex = index - 1;
        if (index === 0) dotIndex = 2;
        if (index === 4) dotIndex = 0;
        
        carouselDots.forEach(dot => dot.classList.remove('active'));
        if (carouselDots[dotIndex]) carouselDots[dotIndex].classList.add('active');
        
        currentSlide = index;
    }

    // Salto Invisible para Bucle Infinito
    if (carouselTrack) {
        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentSlide === 0) showSlide(3, false);
            if (currentSlide === 4) showSlide(1, false);
        });
    }

    function startCarousel() {
        carouselInterval = setInterval(() => {
            if (currentSlide < 4) showSlide(currentSlide + 1);
        }, 5000);
    }

    if (carouselSlides.length > 0) {
        startCarousel();
        // Flechas
        const prevBtn = document.querySelector('.carousel-nav.prev');
        const nextBtn = document.querySelector('.carousel-nav.next');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (isTransitioning || currentSlide <= 0) return;
            clearInterval(carouselInterval);
            showSlide(currentSlide - 1);
            startCarousel();
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (isTransitioning || currentSlide >= 4) return;
            clearInterval(carouselInterval);
            showSlide(currentSlide + 1);
            startCarousel();
        });

        carouselDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (isTransitioning || i + 1 === currentSlide) return;
                clearInterval(carouselInterval);
                showSlide(i + 1);
                startCarousel();
            });
        });
    }

    // ==================== 5. DRAG & TOUCH (1:1) ====================
    let isDragging = false, startX = 0, dragDist = 0;
    const container = document.querySelector('.carousel-container');

    if (container) {
        const handleStart = (e) => {
            if (isTransitioning) return;
            if (currentSlide === 0) showSlide(3, false);
            if (currentSlide === 4) showSlide(1, false);
            clearInterval(carouselInterval);
            isDragging = true;
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            container.classList.add('no-transition');
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            dragDist = x - startX;
            const slideWidth = window.innerWidth <= 768 ? 95 : 90;
            const offset = window.innerWidth <= 768 ? 2.5 : 5;
            carouselTrack.style.transform = `translate3d(calc(${offset}% - ${currentSlide} * ${slideWidth}% + ${dragDist}px), 0, 0)`;
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            container.classList.remove('no-transition');
            if (Math.abs(dragDist) > 80) {
                dragDist > 0 ? showSlide(currentSlide - 1) : showSlide(currentSlide + 1);
            } else {
                showSlide(currentSlide);
            }
            startCarousel();
        };

        container.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        container.addEventListener('touchstart', handleStart, {passive: true});
        container.addEventListener('touchmove', handleMove, {passive: true});
        container.addEventListener('touchend', handleEnd);
    }

    window.addEventListener('resize', () => showSlide(currentSlide, false));

    // ==================== 6. FORMULARIO Y COOKIES ====================
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new URLSearchParams(new FormData(contactForm));
            formData.append('source', 'aae_website_contact');

            fetch('https://purefocus04.app.n8n.cloud/webhook/31c786a4-60ba-4c29-a375-2a59869de2c9', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            }).then(() => {
                window.location.href = 'gracias.html';
            }).finally(() => {
                submitBtn.innerText = 'Enviar Solicitud';
                submitBtn.disabled = false;
            });
        });
    }

    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('aae-cookie-consent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
        document.getElementById('accept-cookies').addEventListener('click', () => {
            localStorage.setItem('aae-cookie-consent', 'accepted');
            cookieBanner.classList.remove('show');
        });
    }
});
