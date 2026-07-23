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
    const ACCESS_KEY = "2760ce59-26c7-49a8-92c8-3d281246788e";

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

    // 8. Interactive Budget Estimator Lógica (COP/USD y Suma Total)
    let currentCurrency = 'COP';

    function updateCurrencyDisplay() {
        const inputs = document.querySelectorAll('#cotizador input[data-cost-cop]');
        inputs.forEach(input => {
            const cardContent = input.nextElementSibling;
            if (cardContent) {
                const priceTextEl = cardContent.querySelector('.option-price-text');
                if (priceTextEl) {
                    const isCheckbox = input.type === 'checkbox';
                    const prefix = isCheckbox ? '+' : '';
                    if (currentCurrency === 'COP') {
                        const val = parseInt(input.getAttribute('data-cost-cop')).toLocaleString('es-CO');
                        priceTextEl.textContent = `${prefix}$${val} COP`;
                    } else {
                        const val = parseInt(input.getAttribute('data-cost-usd')).toLocaleString('en-US');
                        priceTextEl.textContent = `${prefix}$${val} USD`;
                    }
                }
            }
        });
    }

    function calculateTotal() {
        let total = 0;
        const checkedInputs = document.querySelectorAll('#cotizador input:checked');
        
        checkedInputs.forEach(input => {
            if (currentCurrency === 'COP') {
                total += parseInt(input.getAttribute('data-cost-cop'));
            } else {
                total += parseInt(input.getAttribute('data-cost-usd'));
            }
        });

        // Calcular rango (-10% y +10%)
        const minVal = Math.round(total * 0.9);
        const maxVal = Math.round(total * 1.1);

        const resultPriceEl = document.getElementById('estimated-range');
        if (resultPriceEl) {
            if (currentCurrency === 'COP') {
                const minFormatted = minVal.toLocaleString('es-CO');
                const maxFormatted = maxVal.toLocaleString('es-CO');
                resultPriceEl.textContent = `$${minFormatted} - $${maxFormatted} COP`;
            } else {
                const minFormatted = minVal.toLocaleString('en-US');
                const maxFormatted = maxVal.toLocaleString('en-US');
                resultPriceEl.textContent = `$${minFormatted} - $${maxFormatted} USD`;
            }
        }
    }

    // Manejo de eventos de cambio en las opciones
    const allInputs = document.querySelectorAll('#cotizador input');
    allInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.type === 'radio') {
                const radios = document.querySelectorAll(`#cotizador input[name="${input.name}"]`);
                radios.forEach(r => {
                    r.closest('.option-card').classList.remove('active');
                });
                if (input.checked) {
                    input.closest('.option-card').classList.add('active');
                }
            } else if (input.type === 'checkbox') {
                if (input.checked) {
                    input.closest('.option-card').classList.add('active');
                } else {
                    input.closest('.option-card').classList.remove('active');
                }
            }
            calculateTotal();
        });
    });

    // Manejo del switch selector de divisa
    const btnCOP = document.getElementById('btn-currency-cop');
    const btnUSD = document.getElementById('btn-currency-usd');

    if (btnCOP && btnUSD) {
        btnCOP.addEventListener('click', () => {
            currentCurrency = 'COP';
            btnCOP.classList.add('active');
            btnUSD.classList.remove('active');
            updateCurrencyDisplay();
            calculateTotal();
        });

        btnUSD.addEventListener('click', () => {
            currentCurrency = 'USD';
            btnUSD.classList.add('active');
            btnCOP.classList.remove('active');
            updateCurrencyDisplay();
            calculateTotal();
        });
    }

    // Botón de solicitar propuesta formal y autollenado
    const btnRequestQuote = document.getElementById('btn-request-quote');
    const textareaMessage = document.getElementById('form-message');
    const contactSection = document.getElementById('contacto');
    const formNameInput = document.getElementById('form-name');

    if (btnRequestQuote) {
        btnRequestQuote.addEventListener('click', () => {
            const baseProject = document.querySelector('#cotizador input[name="project_base"]:checked');
            const baseProjectName = baseProject ? baseProject.closest('.option-card').querySelector('h4').textContent : '';
            
            const selectedAddons = [];
            const checkedAddons = document.querySelectorAll('#cotizador input[type="checkbox"]:checked');
            checkedAddons.forEach(chk => {
                selectedAddons.push(chk.closest('.option-card').querySelector('h4').textContent);
            });

            const rangeText = document.getElementById('estimated-range').textContent;

            // Autocompletar la selección en el dropdown del formulario
            if (selectService) {
                if (baseProjectName.includes('Básica')) {
                    selectService.value = 'Desarrollo a la Medida';
                } else if (baseProjectName.includes('Empresarial')) {
                    selectService.value = 'Aplicaciones Web/Escritorio';
                } else {
                    selectService.value = 'Otro';
                }
            }

            // Autocompletar el campo de mensaje
            if (textareaMessage) {
                let addonsList = selectedAddons.length > 0 ? selectedAddons.join(', ') : 'Ninguno';
                textareaMessage.value = `Hola Vórtice Digital, estoy interesado en iniciar un proyecto.
Calculé mi presupuesto estimado con su cotizador interactivo:
- Proyecto Base: ${baseProjectName}
- Módulos adicionales seleccionados: ${addonsList}
- Rango de presupuesto estimado: ${rangeText}

Por favor, contáctenme para agendar la llamada inicial y definir detalles del desarrollo.`;
            }

            // Desplazamiento suave al formulario y foco en el input del nombre
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    if (formNameInput) formNameInput.focus();
                }, 800);
            }
        });
    }

    // 9. FAQ Accordion Lógica
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Cerrar otros acordeones abiertos primero (comportamiento clásico)
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Alternar el estado del acordeón seleccionado
            if (isActive) {
                faqItem.classList.remove('active');
                faqAnswer.style.maxHeight = '0';
                question.setAttribute('aria-expanded', 'false');
            } else {
                faqItem.classList.add('active');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 10. Animación de "Vórtice" Interactivo en Canvas (Hero Background)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let center = { x: 0, y: 0 };
        const particles = [];
        const particleCount = 85; // Cantidad óptima para rendimiento móvil y desktop
        let mouse = { x: null, y: null, radius: 140 };

        function resize() {
            const parent = canvas.closest('.hero-section');
            if (parent) {
                width = canvas.width = parent.offsetWidth;
                height = canvas.height = parent.offsetHeight;
                
                // Centrar el vórtice sobre el elemento visual en desktop, o en el centro en móviles
                if (window.innerWidth > 1024) {
                    center.x = width * 0.72;
                    center.y = height * 0.52;
                } else {
                    center.x = width * 0.5;
                    center.y = height * 0.72;
                }
            }
        }
        
        resize();
        window.addEventListener('resize', resize);

        // Interactividad con el mouse
        const heroSection = canvas.closest('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });

            heroSection.addEventListener('mouseleave', () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        class Particle {
            constructor() {
                this.reset();
                // Distribuir el radio inicial aleatoriamente para evitar que todos empiecen en el mismo punto
                this.radius = Math.random() * (Math.max(width, height) * 0.4) + 10;
            }

            reset() {
                this.angle = Math.random() * Math.PI * 2;
                this.radius = Math.random() * (Math.max(width, height) * 0.3) + 20;
                this.speed = (Math.random() * 0.002 + 0.0008); // Velocidad orbital
                this.spiralSpeed = (Math.random() * 0.15 - 0.05); // Espiral lento hacia afuera/adentro
                this.size = Math.random() * 2 + 0.6;
                this.opacity = Math.random() * 0.45 + 0.15;
                this.color = `rgba(255, 255, 255, ${this.opacity})`;
            }

            update() {
                this.angle += this.speed;
                this.radius += this.spiralSpeed;

                // Resetear si se alejan demasiado o colapsan en el centro
                if (this.radius < 15 || this.radius > Math.max(width, height) * 0.5) {
                    this.reset();
                    this.radius = Math.random() * 40 + 15;
                }

                let targetX = center.x + Math.cos(this.angle) * this.radius;
                let targetY = center.y + Math.sin(this.angle) * this.radius;

                // Reacción al ratón (empuje sutil)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = targetX - mouse.x;
                    const dy = targetY - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        targetX += (dx / dist) * force * 25;
                        targetY += (dy / dist) * force * 25;
                    }
                }

                this.x = targetX;
                this.y = targetY;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Inicializar partículas
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Conexiones de constelación entre partículas cercanas
        function drawConnections() {
            const maxDistance = 75;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < maxDistance) {
                        const alpha = (1 - dist / maxDistance) * 0.10;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            requestAnimationFrame(animate);
        }

        animate();
    }

    // 11. AI Agent Client-side Interface Logic (Vorti Chat Window)
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    let chatHistory = [];

    // Toggle Chat Window
    if (chatToggleBtn && chatWindow) {
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                scrollToBottom();
            }
        });
    }

    if (chatCloseBtn && chatWindow) {
        chatCloseBtn.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });
    }

    // Scroll chat area to bottom
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Add Message to DOM
    function appendMessage(sender, text) {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'outgoing' : 'incoming'}`;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = text;

        messageDiv.appendChild(textDiv);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();

        // Save locally to session history
        chatHistory.push({ sender: sender, text: text });
    }

    // Show/Remove Typing Indicator
    let typingIndicatorEl = null;
    function showTypingIndicator() {
        if (!chatMessages) return;
        if (typingIndicatorEl) return;

        typingIndicatorEl = document.createElement('div');
        typingIndicatorEl.className = 'message incoming typing-indicator-container';
        typingIndicatorEl.innerHTML = `
            <div class="message-text typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatMessages.appendChild(typingIndicatorEl);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        if (typingIndicatorEl && chatMessages) {
            chatMessages.removeChild(typingIndicatorEl);
            typingIndicatorEl = null;
        }
    }

    // Send Message to API
    async function sendMessage(text) {
        if (!text.trim()) return;

        appendMessage('user', text);
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(0, -1)
                })
            });

            const data = await response.json();
            removeTypingIndicator();

            if (response.ok && data.response) {
                // Convertir negritas markdown (**texto**) a etiquetas HTML strong
                let formattedResponse = data.response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Convertir saltos de línea a <br>
                formattedResponse = formattedResponse.replace(/\n/g, '<br>');
                appendMessage('bot', formattedResponse);
            } else {
                appendMessage('bot', 'Lo siento, tuve un problema al conectarme con mi motor de lenguaje. Por favor, vuelve a intentarlo más tarde o escríbenos directamente a WhatsApp.');
            }
        } catch (error) {
            console.error('Error al comunicarse con Vorti backend:', error);
            removeTypingIndicator();
            appendMessage('bot', 'No pude conectar con el servidor de inteligencia artificial. Revisa tu conexión a internet o intenta más tarde.');
        }
    }

    // Form Submit
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value;
            chatInput.value = '';
            sendMessage(text);
        });
    }

    // Quick suggestions clicks
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            sendMessage(query);
            
            const suggestionsArea = document.getElementById('chat-suggestions');
            if (suggestionsArea) {
                suggestionsArea.style.display = 'none';
            }
        });
    });

    // Inicializar cálculo inicial
    calculateTotal();
});
