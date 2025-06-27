document.addEventListener('DOMContentLoaded', () => {
    const reportList = document.querySelector('.report-list');
    if (!reportList) return;

    const modal = createDetailsModal();
    const modalFields = {
        title: modal.querySelector('#modal-title'),
        status: modal.querySelector('#modal-status'),
        description: modal.querySelector('#modal-description'),
        location: modal.querySelector('#modal-location'),
        occurrence_date: modal.querySelector('#modal-occurrence_date'),
        created_at: modal.querySelector('#modal-created_at'),
        attachment_url: modal.querySelector('#modal-attachment_url')
    };

    function loadAndRenderReports() {
        console.log('🔄 Buscando dados da API...');
        fetch('http://127.0.0.1:8000/api/reports', { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error(`Erro ao buscar relatórios (status ${res.status})`);
                return res.json();
            })
            .then(data => {
                renderReportsList(data);
            })
            .catch(err => {
                console.error('🚫 Erro ao carregar os relatórios:', err);
                reportList.innerHTML = `<li>Erro ao carregar. Verifique a API e o console.</li>`;
            });
    }

    function renderReportsList(data) {
        reportList.innerHTML = '';
        if (data.length === 0) {
            reportList.innerHTML = '<li>Nenhuma denúncia encontrada.</li>';
            return;
        }

        data.forEach(report => {
            const li = document.createElement('li');
            li.className = 'report-item';
            li.dataset.protocol = report.unique_protocol;

            li.innerHTML = `
                <div class="report-info">
                    <span class="material-symbols-outlined report-icon">description</span>
                    <div class="report-details">
                        <p class="report-name">${report.title}</p>
                        <p class="report-subtitle">${report.unique_protocol} • ${report.status}</p>
                    </div>
                </div>
                <div class="report-actions">
                    <button type="button" class="btn btn-analyze" data-protocol="${report.unique_protocol}">Detalhes</button>
                    <button type="button" class="btn btn-approve">Aprovar</button>
                    <button type="button" class="btn btn-reject">Rejeitar</button>
                </div>
            `;
            reportList.appendChild(li);
        });
    }

    async function fetchAndShowDetails(protocol) {
        modal.style.display = 'flex';
        modalFields.title.textContent = 'Carregando...';
        modalFields.description.textContent = '';

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/reports/${protocol}`);
            if (!response.ok) throw new Error('Denúncia não encontrada');
            const data = await response.json();

            modalFields.title.textContent = `Protocolo: ${data.unique_protocol || 'Indisponível'}`;
            modalFields.status.textContent = data.status || '-';
            modalFields.description.textContent = data.description || '-';
            modalFields.location.textContent = data.location || '-';
            modalFields.occurrence_date.textContent = data.occurrence_date
                ? new Date(data.occurrence_date).toLocaleDateString('pt-BR')
                : '-';
            modalFields.created_at.textContent = data.created_at
                ? new Date(data.created_at).toLocaleString('pt-BR')
                : '-';

            if (data.anexo_url) {
                modalFields.attachment_url.href = data.anexo_url;
                modalFields.attachment_url.textContent = 'Abrir Anexo';
                modalFields.attachment_url.style.display = 'inline';
            } else {
                modalFields.attachment_url.textContent = 'Sem anexo';
                modalFields.attachment_url.removeAttribute('href');
                modalFields.attachment_url.style.display = 'inline';
            }

        } catch (error) {
            console.error('🚫 Erro ao buscar detalhes:', error);
            modalFields.title.textContent = 'Erro ao carregar detalhes';
            modalFields.description.textContent = error.message;
        }
    }

    reportList.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-analyze');
        if (button) {
            const protocol = button.dataset.protocol;
            fetchAndShowDetails(protocol);
        }
    });

    function createDetailsModal() {
        const modalElement = document.createElement('div');
        modalElement.className = 'modal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2 id="modal-title"></h2>
                <p><strong>Status:</strong> <span id="modal-status" style="font-weight: bold;"></span></p>
                <p><strong>Descrição:</strong> <span id="modal-description"></span></p>
                <p><strong>Localização:</strong> <span id="modal-location"></span></p>
                <p><strong>Data do ocorrido:</strong> <span id="modal-occurrence_date"></span></p>
                <p><strong>Enviado em:</strong> <span id="modal-created_at"></span></p>
                <p><strong>Anexo:</strong> <a id="modal-attachment_url" target="_blank" style="color: #4CAF50; text-decoration: underline;"></a></p>
            </div>
        `;
        document.body.appendChild(modalElement);

        modalElement.querySelector('.close-button').addEventListener('click', () => {
            modalElement.style.display = 'none';
        });

        return modalElement;
    }

    // Inicializa o carregamento
    loadAndRenderReports();
});
