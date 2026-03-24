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

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling for Menu Links
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

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animation for Services Cards
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar animación inicial a cards
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Hero Carousel Logic
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDots = document.querySelectorAll('.dot');
    let currentSlide = 1; // Start at Slide 1 (Track index 1)
    let carouselInterval;
    let isTransitioning = false; // Guard for rapid clicks

    function showSlide(index, animate = true) {
        if (!carouselTrack || (animate && isTransitioning)) return;
        
        if (animate) isTransitioning = true;
        carouselTrack.style.transition = animate ? 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' : 'none';
        
        const slideWidthPercent = window.innerWidth <= 768 ? 95 : 90;
        const offsetPercent = window.innerWidth <= 768 ? 2.5 : 5;
        
        carouselTrack.style.transform = `translate3d(calc(${offsetPercent}% - ${index} * ${slideWidthPercent}%), 0, 0)`;

        // Update dots (Slides 1, 2, 3 are track indices 1, 2, 3)
        let dotIndex = index - 1;
        if (index === 0) dotIndex = 2; // Clone of S3
        if (index === 4) dotIndex = 0; // Clone of S1
        
        carouselDots.forEach(dot => dot.classList.remove('active'));
        if (carouselDots[dotIndex]) carouselDots[dotIndex].classList.add('active');
        currentSlide = index;
    }

    // Seamless Jump Logic
    if (carouselTrack) {
        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentSlide === 0) {
                showSlide(3, false); // Jump to real S3
            } else if (currentSlide === 4) {
                showSlide(1, false); // Jump to real S1
            }
        });
    }

    function startCarousel() {
        if (carouselSlides.length > 0) {
            carouselInterval = setInterval(() => {
                if (currentSlide < 4) {
                    showSlide(currentSlide + 1);
                }
            }, 5000);
        }
    }

    if (carouselSlides.length > 0) {
        startCarousel();
        carouselDots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => {
                if (isTransitioning || dotIndex + 1 === currentSlide) return;
                clearInterval(carouselInterval);
                showSlide(dotIndex + 1);
                startCarousel();
            });
        });
    }

    // Form Submission to n8n Webhook
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
                    alert('Hubo un error al intentar enviar el mensaje. Por favor intenta de nuevo.');
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

    // --- Real-Time Dragging Functionality for Carousel ---
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let dragDistance = 0;
    let animationFrameId = null;
    const carouselContainer = document.querySelector('.carousel-container');

    if (carouselContainer) {
        carouselContainer.style.cursor = 'grab';

        const getX = (e) => e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const getY = (e) => e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        let startY = 0;

        const handleDragStart = (e) => {
            if (isTransitioning) return;
            if (e.type === 'mousedown') e.preventDefault(); 
            
            // Invisible Snap - Move user from clones to real slides before drag begins
            if (currentSlide === 0) showSlide(3, false);
            if (currentSlide === 4) showSlide(1, false);

            clearInterval(carouselInterval);
            startX = getX(e);
            startY = getY(e);
            isDragging = true;
            carouselContainer.style.cursor = 'grabbing';
            carouselContainer.classList.add('no-transition');
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            
            currentX = getX(e);
            const currentY = getY(e);
            dragDistance = currentX - startX;
            const dragY = Math.abs(currentY - startY);

            // Prevent scroll only if dragging horizontally
            if (Math.abs(dragDistance) > dragY) {
                if (e.cancelable) e.preventDefault();
            } else if (Math.abs(dragDistance) < 5) {
                // Not a clear horizontal drag yet
                return;
            }

            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!carouselTrack) return;
                
                const slideWidthPercent = window.innerWidth <= 768 ? 95 : 90;
                const offsetPercent = window.innerWidth <= 768 ? 2.5 : 5;

                carouselTrack.style.setProperty('transform', `translate3d(calc(${offsetPercent}% - ${currentSlide} * ${slideWidthPercent}% + ${dragDistance}px), 0, 0)`, 'important');
            });
        };

        const handleDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            carouselContainer.style.cursor = 'grab';
            carouselContainer.classList.remove('no-transition');

            const threshold = 80; // Optimized threshold

            if (dragDistance < -threshold && currentSlide < 4) {
                showSlide(currentSlide + 1);
            } else if (dragDistance > threshold && currentSlide > 0) {
                showSlide(currentSlide - 1);
            } else {
                showSlide(currentSlide);
            }
            
            startCarousel();
            dragDistance = 0;
        };

        carouselContainer.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        carouselContainer.addEventListener('touchstart', handleDragStart, { passive: false });
        carouselContainer.addEventListener('touchmove', handleDragMove, { passive: false });
        carouselContainer.addEventListener('touchend', handleDragEnd);
    }

    // --- Hero Carousel Arrow Navigation ---
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTransitioning || currentSlide <= 0) return;
            clearInterval(carouselInterval);
            showSlide(currentSlide - 1);
            startCarousel();
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTransitioning || currentSlide >= 4) return;
            clearInterval(carouselInterval);
            showSlide(currentSlide + 1);
            startCarousel();
        });
    }

    // --- Responsive Re-Snap ---
    window.addEventListener('resize', () => {
        showSlide(currentSlide, false);
    });

});

