document.addEventListener('DOMContentLoaded', () => {
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

    function nextSlide() {
        let index = (currentSlide + 1) % carouselSlides.length;
        showSlide(index);
    }

    function startCarousel() {
        if (carouselSlides.length > 0) {
            carouselInterval = setInterval(nextSlide, 5000);
        }
    }

    if (carouselSlides.length > 0) {
        // Initial start
        startCarousel();

        // Dot navigation
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(carouselInterval);
                showSlide(index);
                startCarousel(); // Restart interval after manual click
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
});
