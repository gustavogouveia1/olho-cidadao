// frontend/script.js

// Garante que o script só roda depois que o HTML estiver totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    let reportForm, successMessage, errorMessage, errorList, submitAnotherBtn, protocolDisplay;

    // ==================================================
    // PARTE 1: ROLAGEM SUAVE PARA O MENU DE NAVEGAÇÃO
    // ==================================================
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    navLinks.forEach(link => {
        // Se o link é apenas "#" ou é o botão que abre o modal, pule a lógica de smooth scroll
        if (link.getAttribute('href') === '#' || link.id === 'open-modal-btn') {
            return; // Pula para o próximo link no loop
        }

        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href'); // Deve ser algo como "#sobre-nos"
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ================================================================
    // PARTE 2: CARROSSEL DE CARDS (COM AUTO-SCROLL E INÉRCIA)
    // ================================================================
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
            velocityX = cardCarousel.scrollLeft - prevScrollLeft;
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            cardCarousel.classList.remove('active');

            // --- LÓGICA DE INÉRCIA (DESACELERAÇÃO SUAVE) ---
            function momentumLoop() {
                cardCarousel.scrollLeft += velocityX;
                velocityX *= 0.95;

                if (cardCarousel.scrollLeft >= originalWidth) {
                    cardCarousel.scrollLeft -= originalWidth;
                } else if (cardCarousel.scrollLeft <= 0) {
                    cardCarousel.scrollLeft += originalWidth;
                }
                
                if (Math.abs(velocityX) > 0.5) {
                    momentumId = requestAnimationFrame(momentumLoop);
                } else {
                    if (!cardCarousel.matches(':hover')) {
                        startAutoScroll();
                    }
                }
            }
            momentumId = requestAnimationFrame(momentumLoop);
        };
        
        window.addEventListener('mouseup', endDrag);

        cardGrid.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
            }
        });
    }

    // ==================================================
    // PARTE 3: FUNCIONALIDADE DO CARROSSEL "SOBRE NÓS"
    // ==================================================
    const aboutSlidesContainer = document.querySelector('.about-slides');
    const navDots = document.querySelectorAll('.nav-dot');
    if (aboutSlidesContainer && navDots.length > 0) {
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

    // ==================================================
    // PARTE 4: CONTROLE DO MODAL DE DENÚNCIA E SUBMISSÃO DE FORMULÁRIO (API)
    // ==================================================
    // Get references to HTML elements
    // Ajuste o ID do modal no HTML de 'report-modal' para 'reportModal'
    const modal = document.getElementById('report-modal');
    // Adicionado 'if' para evitar erros se o modal não estiver no HTML
    if (modal) {
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = modal.querySelector('.close-button');

    if(openModalBtn && closeModalBtn) {
        reportForm = document.getElementById('report-form');
        successMessage = document.getElementById('success-message');
        errorMessage = document.getElementById('error-message');
        errorList = document.getElementById('error-list');
        submitAnotherBtn = document.getElementById('submit-another-btn');
        protocolDisplay = document.getElementById('protocol-display');

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
            reportForm = document.getElementById('report-form');
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Denúncia enviada com sucesso! (Isso é um teste, nenhum dado foi enviado).');
                closeModal();
                reportForm.reset();
            });
        }
    }


    // --- Form Submission Logic ---
    let csrfToken = null; // Variável para armazenar o token CSRF

    // Função para buscar o token CSRF do Laravel API
    async function fetchCsrfToken() {
        try {
            // Verifica se o token já está armazenado no localStorage
            let storedToken = localStorage.getItem('csrf_token');
            if (storedToken) {
                csrfToken = storedToken; // Usa o token armazenado
                console.log('CSRF Token loaded from localStorage:', csrfToken);
                return;
            }

            // Se o token não estiver no localStorage, faz a requisição
            const response = await fetch('http://127.0.0.1:8000/api/csrf-token');
            const data = await response.json();
            csrfToken = data.csrf_token;

            // Armazena o token no localStorage para reutilizar em futuras requisições
            localStorage.setItem('csrf_token', csrfToken);
            console.log('CSRF Token fetched and saved:', csrfToken);
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
            alert('Não foi possível inicializar a aplicação. Por favor, recarregue a página.');
        }
    }

    // Função para buscar o token CSRF quando a página carregar
    fetchCsrfToken();

    if (reportForm) { // Verifica se o formulário existe
        reportForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Limpa mensagens anteriores
            errorMessage.classList.add('hidden');
            errorList.innerHTML = '';
            successMessage.classList.add('hidden');
            document.querySelectorAll('.error-message').forEach(el => el.innerText = '');

            if (!csrfToken) {
                alert('Token CSRF não disponível. Por favor, tente novamente ou recarregue a página.');
                return;
            }

            const formData = new FormData(this);
            // NÃO adicione _token ao formData se você for enviar no cabeçalho X-CSRF-TOKEN
            // formData.append('_token', csrfToken); // Este é para formulários tradicionais HTML, não API via header

            try {
                // VERIFIQUE A URL DA SUA API LARAVEL PARA SUBMISSÃO DE REPORTS
                // Se a rota está em backend/routes/api.php, a URL é /api/report
                // Se está em backend/routes/web.php sem prefixo, a URL é /report
                const response = await fetch('http://127.0.0.1:8000/api/report', { // Exemplo: Laravel serve /report
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken // Envia o token CSRF no cabeçalho
                    }
                });

                const data = await response.json(); // Analisa a resposta JSON

                if (response.ok) { // Status HTTP 2xx (Sucesso)
                    protocolDisplay.innerText = data.unique_protocol;
                    successMessage.classList.remove('hidden');
                    reportForm.reset(); // Limpa os campos do formulário
                    reportForm.classList.add('hidden'); // Esconde o formulário
                } else { // Status HTTP 4xx ou 5xx (Erro)
                    errorMessage.classList.remove('hidden');
                    let msg = 'Ocorreu um erro desconhecido. Por favor, tente novamente.';

                    if (response.status === 422 && data.errors) {
                        // Erros de validação do Laravel
                        for (const field in data.errors) {
                            const fieldErrorDiv = document.getElementById(`${field}_error`);
                            if (fieldErrorDiv) {
                                fieldErrorDiv.innerText = data.errors[field].join(', ');
                            }
                            data.errors[field].forEach(err => {
                                const li = document.createElement('li');
                                li.innerText = err;
                                errorList.appendChild(li);
                            });
                        }
                        msg = 'Falha na validação. Verifique os campos acima.';
                    } else if (data.message) {
                        msg = data.message;
                    }

                    if (errorList.children.length === 0) {
                        const li = document.createElement('li');
                        li.innerText = msg;
                        errorList.appendChild(li);
                    }
                }
            } catch (error) {
                console.error('Erro de rede ou inesperado:', error);
                errorMessage.classList.remove('hidden');
                errorList.innerHTML = '<li>Ocorreu um problema ao enviar sua denúncia. Verifique sua conexão com a internet e tente novamente.</li>';
            }
        });
    }

    if (submitAnotherBtn) { // Verifica se o botão existe
        submitAnotherBtn.addEventListener('click', () => {
            successMessage.classList.add('hidden');
            reportForm.classList.remove('hidden');
            document.querySelectorAll('.error-message').forEach(el => el.innerText = '');
        });
    }
});