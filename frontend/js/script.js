// ===============================================
// 1) ROLAGEM SUAVE PARA LINKS INTERNOS
// ===============================================
document.querySelectorAll('header nav a[href^="#"]').forEach(link => {
  if (link.getAttribute('href') === '#' || link.id === 'open-modal-btn') return;
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===============================================
// 2) CARROSSEL DE CARDS
// ===============================================
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

// ===============================================
// 3) CARROSSEL SOBRE NÓS
// ===============================================
const about = document.querySelector('.about-slides');
const dots = document.querySelectorAll('.nav-dot');
if (about && dots.length) {
  const update = index => dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = +dot.dataset.slide;
      about.scrollTo({ left: idx * about.clientWidth, behavior: 'smooth' });
    });
  });
  about.addEventListener('scroll', () => {
    const idx = Math.round(about.scrollLeft / about.clientWidth);
    update(idx);
  });
}

// // ===============================================
// // 4) MODAL E FORMULÁRIO DE DENÚNCIA
// // ===============================================
// const modal = document.getElementById('report-modal');
// const openBtn = document.getElementById('open-modal-btn');
// const closeBtn = modal?.querySelector('.close-button');
// const form = document.getElementById('report-form');

// let csrfToken = null;

// async function getCsrf() {
//   try {
//     const stored = localStorage.getItem('csrf_token');
//     if (stored) { csrfToken = stored; return; }
//     const res = await fetch('http://127.0.0.1:8000/api/csrf-token');
//     const data = await res.json();
//     csrfToken = data.csrf_token;
//     localStorage.setItem('csrf_token', csrfToken);
//   } catch {
//     alert('Erro ao obter CSRF. Recarregue.');
//   }
// }

// getCsrf();

// if (modal && openBtn && closeBtn && form) {

//   // Cria elementos de feedback se não existirem
//   const successMsg = document.getElementById('success-message') || createFeedback('success-message');
//   const errorMsg = document.getElementById('error-message') || createFeedback('error-message');
//   const protocolDisplay = document.getElementById('protocol-display') || createProtocol();
//   const errorList = document.getElementById('error-list') || createErrorList();

//   function createFeedback(id) {
//     const el = document.createElement('div');
//     el.id = id;
//     el.classList.add('hidden');
//     form.insertAdjacentElement('afterend', el);
//     return el;
//   }

//   function createProtocol() {
//     const el = document.createElement('div');
//     el.id = 'protocol-display';
//     form.insertAdjacentElement('afterend', el);
//     return el;
//   }

//   function createErrorList() {
//     const el = document.createElement('ul');
//     el.id = 'error-list';
//     form.insertAdjacentElement('afterend', el);
//     return el;
//   }

//   function openModal() {
//     modal.classList.add('show');
//     document.body.classList.add('modal-open');
//   }

//   function closeModal() {
//     modal.classList.remove('show');
//     document.body.classList.remove('modal-open');
//   }

//   openBtn.addEventListener('click', e => {
//     e.preventDefault();
//     openModal();
//   });

//   closeBtn.addEventListener('click', closeModal);

//   modal.addEventListener('click', e => {
//     if (e.target === modal) closeModal();
//   });

//   window.addEventListener('keydown', e => {
//     if (e.key === 'Escape') closeModal();
//   });

//   // 🚫 Listener de SUBMIT: único, fora do openModal.
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     console.log('✅ Submit interceptado, bloqueado e processando...');

//     const data = new FormData(form);

//     try {
//       const res = await fetch('http://127.0.0.1:8000/api/report', {
//         method: 'POST',
//         body: data
//       });

//       const result = await res.json();
//       console.log('Resposta do servidor:', result);

//       if (res.ok) {
//         protocolDisplay.innerText = 'Protocolo: ' + result.unique_protocol;
//         successMsg.textContent = 'Denúncia enviada com sucesso!';
//         successMsg.classList.remove('hidden');
//         errorMsg.classList.add('hidden');
//         errorList.innerHTML = '';
//         form.reset();
//         form.classList.add('hidden');
//       } else {
//         errorMsg.textContent = 'Erro ao enviar:';
//         errorMsg.classList.remove('hidden');
//         successMsg.classList.add('hidden');
//         errorList.innerHTML = '';
//         if (result.errors) {
//           Object.values(result.errors).flat().forEach(msg => {
//             const li = document.createElement('li');
//             li.textContent = msg;
//             errorList.appendChild(li);
//           });
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       errorMsg.textContent = 'Erro de rede.';
//       errorMsg.classList.remove('hidden');
//       successMsg.classList.add('hidden');
//     }
//   });
// }
