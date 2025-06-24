console.log('✅ Form-handler carregado');

const modal = document.getElementById('report-modal');
const openBtn = document.getElementById('open-modal-btn');
const closeBtn = modal?.querySelector('.close-button');
const form = document.getElementById('report-form');

const savedProtocol = localStorage.getItem('last_protocol');
if (savedProtocol) {
  const protocolDisplay = document.getElementById('protocol-display') || (() => {
    const el = document.createElement('div');
    el.id = 'protocol-display';
    form.insertAdjacentElement('afterend', el);
    return el;
  })();
  protocolDisplay.textContent = 'Último protocolo: ' + savedProtocol;
}

openBtn.addEventListener('click', e => {
  e.preventDefault();
  modal.classList.add('show');
  document.body.classList.add('modal-open');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
});

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  console.log('🚀 Submit interceptado e processamento iniciado.');

  const data = new FormData(form);

  fetch('http://127.0.0.1:8000/api/report', {
    method: 'POST',
    body: data
  })
    .then(res => res.json())
    .then(result => {
      console.log('✅ Resposta da API:', result);

      if (result.unique_protocol) {
  localStorage.setItem('last_protocol', result.unique_protocol);

 window.location.href = `${window.location.origin}/frontend/success.html?protocol=${encodeURIComponent(result.unique_protocol)}`;
}

      alert('✅ Denúncia enviada com sucesso!');
      form.reset();
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
    })
    .catch(err => {
      console.error(err);
      alert('🚫 Erro de rede: ' + err.message);
    });

  return false;
});
