const form = document.getElementById('check-form');
const protocolInput = document.getElementById('protocol');
const resultBox = document.getElementById('result');

const statusEl = document.getElementById('status');
const titleEl = document.getElementById('title');
const descriptionEl = document.getElementById('description');
const locationEl = document.getElementById('location');
const occurrenceEl = document.getElementById('occurrence_date');
const createdAtEl = document.getElementById('created_at');
const attachmentEl = document.getElementById('attachment_url');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const protocol = protocolInput.value.trim();
  if (!protocol) return alert('Informe o protocolo');

  fetch(`http://127.0.0.1:8000/api/reports/${encodeURIComponent(protocol)}`)
    .then(res => {
      if (!res.ok) throw new Error('Protocolo não encontrado');
      return res.json();
    })
    .then(data => {
      statusEl.textContent = data.status;
      titleEl.textContent = data.title;
      descriptionEl.textContent = data.description;
      locationEl.textContent = data.location;
      occurrenceEl.textContent = data.occurrence_date;
      createdAtEl.textContent = data.created_at;

      if (data.attachment_url) {
        attachmentEl.href = data.attachment_url;
        attachmentEl.textContent = 'Abrir Anexo';
      } else {
        attachmentEl.textContent = 'Sem anexo';
        attachmentEl.removeAttribute('href');
      }

      resultBox.style.display = 'block';
    })
    .catch(err => {
      console.error(err);
      alert(err.message);
    });
});

// Somente para ADMIN (listar todos)
document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.querySelector('.report-list');

  if (!reportList) return; // Só executa se estiver na página admin

  fetch('http://127.0.0.1:8000/api/reports')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar relatórios');
      return res.json();
    })
    .then(data => {
      reportList.innerHTML = ''; // limpa os <li> estáticos

      data.forEach(report => {
        const li = document.createElement('li');
        li.className = 'report-item';

        li.innerHTML = `
          <div class="report-info">
              <span class="material-symbols-outlined report-icon">description</span>
              <div class="report-details">
                  <p class="report-name">${report.title}</p>
                  <p class="report-subtitle">${report.protocol}</p>
              </div>
          </div>
          <div class="report-actions">
              <button class="btn btn-analyze">Em análise</button>
              <button class="btn btn-approve">Aprovar</button>
              <button class="btn btn-reject">Rejeitar</button>
          </div>
        `;

        reportList.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Não foi possível carregar as denúncias');
    });
});
