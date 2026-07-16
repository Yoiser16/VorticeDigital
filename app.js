/* --------------------------------------------------------------------------
   INTERACTION LOGIC - VÓRTICE DIGITAL
-------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Header Scroll Behavior
    const header = document.querySelector('.main-header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            // Toggle icon inside button
            const icon = menuToggle.querySelector('i');
            if (mainNav.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });

        // Close menu when clicking nav links
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
            });
        });
    }

    // 3. Navigation Active Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.btn-nav)');

    const highlightNavLink = () => {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', highlightNavLink);

    // 4. Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Card Hover Radial Glow Effect (MouseMove tracking)
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // 6. Connect "Saber Más" links to Form Dropdown selection
    const cardLinks = document.querySelectorAll('.card-link');
    const selectService = document.getElementById('form-service');

    cardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const serviceName = link.getAttribute('data-service');
            if (selectService && serviceName) {
                selectService.value = serviceName;
            }
        });
    });

    // 7. Contact Form Handling (Web3Forms Real Integration)
    // Para recibir correos reales, ingresa tu clave de Web3Forms aquí.
    // Obtén una clave gratis al instante en: https://web3forms.com/
    const ACCESS_KEY = "673bf15c-1b1a-46c8-9656-da770ea6c289";

    const contactForm = document.getElementById('project-contact-form');
    const formFeedback = document.getElementById('form-message-feedback');
    const submitBtn = document.getElementById('form-submit-btn');
    const phoneInputField = document.querySelector("#form-phone");

    // Inicializar intl-tel-input con banderas globales y autocanje de prefijos
    let iti;
    if (phoneInputField) {
        iti = window.intlTelInput(phoneInputField, {
            initialCountry: "co",
            preferredCountries: ["co", "us", "es", "mx"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            formFeedback.style.display = 'none';

            // Preparar los datos para el envío
            const formData = new FormData(contactForm);

            // Reemplazar con el número internacional completo formateado
            if (iti) {
                formData.set("phone", iti.getNumber());
            }

            // Agregar las claves requeridas por Web3Forms
            formData.append("access_key", ACCESS_KEY);
            formData.append("subject", "Nuevo Proyecto - Vórtice Digital");
            formData.append("from_name", "Vórtice Digital Web");

            // Si el usuario no ha configurado su clave todavía, usamos simulación para que no falle visualmente
            if (ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Enviar Mensaje <i class="fa-solid fa-paper-plane"></i>';
                    formFeedback.className = 'form-feedback success';
                    formFeedback.style.display = 'block';
                    formFeedback.innerHTML = '<strong>¡Simulación de Envío Exitosa!</strong> (Configura tu ACCESS_KEY en <code>app.js</code> para recibir correos reales en tu inbox).';
                    contactForm.reset();
                }, 1000);
                return;
            }

            // Envío real a la API de Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
                .then(async (response) => {
                    let json = await response.json();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Enviar Mensaje <i class="fa-solid fa-paper-plane"></i>';

                    if (response.status == 200) {
                        formFeedback.className = 'form-feedback success';
                        formFeedback.style.display = 'block';
                        formFeedback.innerHTML = '<strong>¡Mensaje enviado con éxito!</strong> Nos pondremos en contacto contigo en las próximas 24 horas.';
                        contactForm.reset();
                    } else {
                        console.log(response);
                        formFeedback.className = 'form-feedback error';
                        formFeedback.style.display = 'block';
                        formFeedback.innerHTML = `<strong>Error:</strong> ${json.message || 'No se pudo enviar el mensaje.'}`;
                    }
                })
                .catch(error => {
                    console.log(error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Enviar Mensaje <i class="fa-solid fa-paper-plane"></i>';
                    formFeedback.className = 'form-feedback error';
                    formFeedback.style.display = 'block';
                    formFeedback.innerHTML = '<strong>Error de red:</strong> No pudimos conectar con el servidor de correo.';
                });
        });
    }
});
