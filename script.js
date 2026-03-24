document.addEventListener('DOMContentLoaded', () => {
    // ==================== 1. TEMA Y MODO OSCURO ====================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

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
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // ==================== 4. MOTOR AVANZADO DEL CARRUSEL ====================
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDots = document.querySelectorAll('.dot');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 1; // Empezamos en la real diapositiva 1 (índice de pista 1)
    let isTransitioning = false;
    let carouselInterval;

    function showSlide(index, animate = true) {
        if (!carouselTrack || (animate && isTransitioning)) return;
        if (animate) isTransitioning = true;
        
        carouselTrack.style.transition = animate ? 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' : 'none';
        
        // El ancho de slide coincide con el CSS (90% en desktop, 95% en mobile)
        const slideWidthPercent = window.innerWidth <= 768 ? 95 : 90;
        const offsetPercent = window.innerWidth <= 768 ? 2.5 : 5;
        
        carouselTrack.style.transform = `translate3d(calc(${offsetPercent}% - ${index} * ${slideWidthPercent}%), 0, 0)`;

        // Actualizar puntos de navegación
        let dotIndex = index - 1;
        if (index === 0) dotIndex = 2; // Clon de S3
        if (index === 4) dotIndex = 0; // Clon de S1
        
        carouselDots.forEach(dot => dot.classList.remove('active'));
        if (carouselDots[dotIndex]) carouselDots[dotIndex].classList.add('active');
        currentSlide = index;
    }

    // Lógica para el bucle infinito sin saltos visuales
    if (carouselTrack) {
        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            // Si llegamos a un clon, saltamos al original instantáneamente
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

        // Control manual por Flechas
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

        // Control por Puntos
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
    let isDragging = false, startX = 0, dragDistance = 0, startY = 0;
    const container = document.querySelector('.carousel-container');

    if (container) {
        const handleStart = (e) => {
            if (isTransitioning) return;
            // Salto silencioso antes de empezar a arrastrar si estamos en clones
            if (currentSlide === 0) showSlide(3, false);
            if (currentSlide === 4) showSlide(1, false);
            
            clearInterval(carouselInterval);
            isDragging = true;
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            container.classList.add('no-transition');
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            dragDistance = x - startX;
            
            // Permitir scroll normal si el usuario mueve más hacia arriba que hacia los lados
            if (Math.abs(dragDistance) > Math.abs(y - startY)) {
                if (e.cancelable) e.preventDefault();
            } else {
                return; 
            }

            const slideWidthPercent = window.innerWidth <= 768 ? 95 : 90;
            const offsetPercent = window.innerWidth <= 768 ? 2.5 : 5;
            carouselTrack.style.transform = `translate3d(calc(${offsetPercent}% - ${currentSlide} * ${slideWidthPercent}% + ${dragDistance}px), 0, 0)`;
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            container.classList.remove('no-transition');
            
            if (Math.abs(dragDistance) > 80) { // Umbral de cambio
                dragDistance > 0 ? showSlide(currentSlide - 1) : showSlide(currentSlide + 1);
            } else {
                showSlide(currentSlide);
            }
            startCarousel();
        };

        container.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        container.addEventListener('touchstart', handleStart, { passive: false });
        container.addEventListener('touchmove', handleMove, { passive: false });
        container.addEventListener('touchend', handleEnd);
    }

    // Re-ajustar posición al cambiar tamaño de ventana
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
            }).catch(() => {
                alert('Error al enviar. Por favor intente de nuevo.');
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
