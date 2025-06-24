document.addEventListener('DOMContentLoaded', () => {

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
  const carousel = document.querySelector('.carousel-wrapper');
  if (carousel) {
    const grid = carousel.querySelector('.card-grid');
    const originalCards = [...grid.children];
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', true);
      grid.appendChild(clone);
    });

    const originalWidth = carousel.scrollWidth / 2;
    let autoScroll = setInterval(scroll, 25);

    function scroll() {
      carousel.scrollLeft += 2.5;
      if (carousel.scrollLeft >= originalWidth) {
        carousel.scrollLeft -= originalWidth;
      }
    }

    let dragging = false, startX, scrollLeft, velocity = 0, rafId;

    carousel.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      clearInterval(autoScroll);
      cancelAnimationFrame(rafId);
    });

    carousel.addEventListener('mousemove', e => {
      if (!dragging) return;
      const x = e.pageX - carousel.offsetLeft;
      const walk = x - startX;
      const prev = carousel.scrollLeft;
      carousel.scrollLeft = scrollLeft - walk;
      velocity = carousel.scrollLeft - prev;
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      momentum();
    });

    carousel.addEventListener('mouseenter', () => clearInterval(autoScroll));
    carousel.addEventListener('mouseleave', () => { if (!dragging) autoScroll = setInterval(scroll, 25); });

    function momentum() {
      carousel.scrollLeft += velocity;
      velocity *= 0.95;
      if (carousel.scrollLeft >= originalWidth) carousel.scrollLeft -= originalWidth;
      if (carousel.scrollLeft <= 0) carousel.scrollLeft += originalWidth;
      if (Math.abs(velocity) > 0.5) rafId = requestAnimationFrame(momentum);
      else autoScroll = setInterval(scroll, 25);
    }
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

  // ===============================================
  // 4) MODAL E FORMULÁRIO DE DENÚNCIA
  // ===============================================
  const modal = document.getElementById('report-modal');
  const openBtn = document.getElementById('open-modal-btn');
  const closeBtn = modal?.querySelector('.close-button');
  const form = document.getElementById('report-form');

  let csrfToken = null;

  async function getCsrf() {
    try {
      const stored = localStorage.getItem('csrf_token');
      if (stored) { csrfToken = stored; return; }
      const res = await fetch('http://127.0.0.1:8000/api/csrf-token');
      const data = await res.json();
      csrfToken = data.csrf_token;
      localStorage.setItem('csrf_token', csrfToken);
    } catch {
      alert('Erro ao obter CSRF. Recarregue.');
    }
  }

  getCsrf();

  if (modal && openBtn && closeBtn && form) {
    const successMsg = document.getElementById('success-message') || createFeedback('success-message');
    const errorMsg = document.getElementById('error-message') || createFeedback('error-message');
    const protocolDisplay = document.getElementById('protocol-display') || createProtocol();
    const errorList = document.getElementById('error-list') || createErrorList();
    // const submitAnotherBtn = document.getElementById('submit-another-btn') || createAnotherBtn();

    function createFeedback(id) {
      const el = document.createElement('div');
      el.id = id;
      el.classList.add('hidden');
      form.insertAdjacentElement('afterend', el);
      return el;
    }

    function createProtocol() {
      const el = document.createElement('div');
      el.id = 'protocol-display';
      form.insertAdjacentElement('afterend', el);
      return el;
    }

    function createErrorList() {
      const el = document.createElement('ul');
      el.id = 'error-list';
      form.insertAdjacentElement('afterend', el);
      return el;
    }

    // function createAnotherBtn() {
    //   const btn = document.createElement('button');
    //   btn.id = 'submit-another-btn';
    //   btn.textContent = 'Enviar outra denúncia';
    //   btn.classList.add('submit-button');
    //   protocolDisplay.insertAdjacentElement('afterend', btn);
    //   btn.addEventListener('click', () => {
    //     successMsg.classList.add('hidden');
    //     form.classList.remove('hidden');
    //   });
    //   return btn;
    // }

    function openModal() {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
    }

    function closeModal() {
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
    }

    openBtn.addEventListener('click', e => { e.preventDefault(); openModal(); });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    form.addEventListener('submit', async e => {
  e.preventDefault();

  // Cria FormData com os campos do form
  const data = new FormData(form);

  try {
    const res = await fetch('http://127.0.0.1:8000/api/report', {
      method: 'POST',
      body: data
    });

    const result = await res.json();
    if (res.ok) {
      protocolDisplay.innerText = 'Protocolo: ' + result.unique_protocol;
      successMsg.textContent = 'Denúncia enviada com sucesso!';
      successMsg.classList.remove('hidden');
      form.reset();
      form.classList.add('hidden');
    } else {
      // Mostra erros de validação se houver
      errorMsg.textContent = 'Erro ao enviar:';
      errorMsg.classList.remove('hidden');
      errorList.innerHTML = '';
      if (result.errors) {
        Object.values(result.errors).flat().forEach(msg => {
          const li = document.createElement('li');
          li.textContent = msg;
          errorList.appendChild(li);
        });
      }
    }
  } catch {
    errorMsg.textContent = 'Erro de rede.';
    errorMsg.classList.remove('hidden');
  }
});
  }
});
