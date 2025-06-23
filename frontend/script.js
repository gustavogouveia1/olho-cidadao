document.addEventListener('DOMContentLoaded', () => {

    //==================================================
    // PARTE 1: ROLAGEM SUAVE PARA O MENU DE NAVEGAÇÃO
    //==================================================
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    //================================================================
    // PARTE 2: CARROSSEL DE CARDS (COM AUTO-SCROLL E INÉRCIA)
    //================================================================
    const cardCarousel = document.querySelector('.carousel-wrapper');
    if (cardCarousel) {
        const cardGrid = cardCarousel.querySelector('.card-grid');
        const originalCards = Array.from(cardGrid.children);

        // LÓGICA DE DUPLICAÇÃO DOS CARDS PARA O LOOP INFINITO
        if (originalCards.length > 0) {
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', true);
                cardGrid.appendChild(clone);
            });
        }
        
        const originalWidth = cardCarousel.scrollWidth / 2;
        let autoScrollInterval;

        // LÓGICA DE ROLAGEM AUTOMÁTICA (REATIVADA)
        function startAutoScroll() {
            clearInterval(autoScrollInterval); // Limpa qualquer intervalo anterior
            autoScrollInterval = setInterval(() => {
                cardCarousel.scrollLeft += 2.5; // Velocidade da rolagem automática
                if (cardCarousel.scrollLeft >= originalWidth) {
                    cardCarousel.scrollLeft -= originalWidth;
                }
            }, 25); // Intervalo em milissegundos
        }

        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }

        startAutoScroll(); // Inicia a rolagem automática
        cardCarousel.addEventListener('mouseenter', stopAutoScroll);
        cardCarousel.addEventListener('mouseleave', () => {
            if (!isDragging) {
                startAutoScroll();
            }
        });
        
        // LÓGICA PARA ARRASTAR COM O MOUSE E INÉRCIA
        let isDragging = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let velocityX = 0;
        let momentumId;

        cardCarousel.addEventListener('dragstart', (e) => e.preventDefault());

        cardCarousel.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            hasDragged = false;
            cardCarousel.classList.add('active');
            
            startX = e.pageX - cardCarousel.offsetLeft;
            scrollLeft = cardCarousel.scrollLeft;
            
            stopAutoScroll(); // Pausa a rolagem automática
            cancelAnimationFrame(momentumId); // Para qualquer animação de inércia anterior
            velocityX = 0; // Zera a velocidade ao iniciar novo arraste
        });

        cardCarousel.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const x = e.pageX - cardCarousel.offsetLeft;
            const walk = x - startX;
            if (Math.abs(walk) > 5) {
                hasDragged = true;
            }

            const prevScrollLeft = cardCarousel.scrollLeft;
            cardCarousel.scrollLeft = scrollLeft - walk;
            // Calcula a velocidade do movimento em tempo real para usar na inércia
            velocityX = cardCarousel.scrollLeft - prevScrollLeft;
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            cardCarousel.classList.remove('active');

            // --- LÓGICA DE INÉRCIA (DESACELERAÇÃO SUAVE) ---
            function momentumLoop() {
                cardCarousel.scrollLeft += velocityX; // Aplica o movimento
                velocityX *= 0.95; // Aplica atrito (fricção) para desacelerar

                // Lógica de loop infinito durante a inércia
                if (cardCarousel.scrollLeft >= originalWidth) {
                    cardCarousel.scrollLeft -= originalWidth;
                } else if (cardCarousel.scrollLeft <= 0) {
                    cardCarousel.scrollLeft += originalWidth;
                }
                
                // Continua a animação se ainda houver velocidade
                if (Math.abs(velocityX) > 0.5) {
                    momentumId = requestAnimationFrame(momentumLoop);
                } else {
                    // Quando parar, retoma o auto-scroll se o mouse não estiver em cima
                    if (!cardCarousel.matches(':hover')) {
                        startAutoScroll();
                    }
                }
            }
            // Inicia a animação de inércia ao soltar o mouse
            momentumId = requestAnimationFrame(momentumLoop);
        };
        
        window.addEventListener('mouseup', endDrag);

        cardGrid.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
            }
        });
    }

    //==================================================
    // PARTE 3: FUNCIONALIDADE DO CARROSSEL "SOBRE NÓS"
    //==================================================
    const aboutSlidesContainer = document.querySelector('.about-slides');
    const navDots = document.querySelectorAll('.nav-dot');
    if (aboutSlidesContainer && navDots.length > 0) {
        // ... (código da Parte 3 permanece o mesmo) ...
        const updateActiveDot = (activeIndex) => {
            navDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        };
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.dataset.slide, 10);
                const slideWidth = aboutSlidesContainer.clientWidth;
                aboutSlidesContainer.scrollTo({ left: slideIndex * slideWidth, behavior: 'smooth' });
            });
        });
        aboutSlidesContainer.addEventListener('scroll', () => {
            const slideWidth = aboutSlidesContainer.clientWidth;
            const currentIndex = Math.round(aboutSlidesContainer.scrollLeft / slideWidth);
            updateActiveDot(currentIndex);
        });
    }

    //==================================================
    // PARTE 5: CONTROLE DO MODAL DE DENÚNCIA
    //==================================================
    const modal = document.getElementById('report-modal');
    // Adicionado 'if' para evitar erros se o modal não estiver no HTML
    if (modal) {
        const openModalBtn = document.getElementById('open-modal-btn');
        const closeModalBtn = modal.querySelector('.close-button');

        if(openModalBtn && closeModalBtn) {
            const openModal = () => {
                modal.classList.add('show');
                document.body.classList.add('modal-open');
            };
            const closeModal = () => {
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
            };
            openModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
            closeModalBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('show')) {
                    closeModal();
                }
            });
            const reportForm = document.getElementById('report-form');
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Denúncia enviada com sucesso! (Isso é um teste, nenhum dado foi enviado).');
                closeModal();
                reportForm.reset();
            });
        }
    }
});