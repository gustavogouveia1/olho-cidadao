// Este script é responsável por buscar todos os relatórios e renderizá-los na página de admin.

document.addEventListener('DOMContentLoaded', () => {
    const reportList = document.querySelector('.report-list');
    const modal = document.getElementById('details-modal');

    /**
     * Formata uma data ISO (ex: "2025-06-24T19:44:02.000000Z") para o formato dd/mm/aaaa.
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adicionado timeZone para consistência
    }

    /**
     * Função principal para buscar e renderizar a lista de relatórios.
     */
    async function loadReports() {
        try {
            // IMPORTANTE: Ajuste esta URL para o endpoint da sua API que retorna a LISTA de relatórios.
            const response = await fetch('http://127.0.0.1:8000/api/reports');
            if (!response.ok) {
                throw new Error('Falha ao carregar os relatórios da API.');
            }
            const reports = await response.json();

            // Limpa a mensagem "Carregando..."
            reportList.innerHTML = '';

            if (reports.length === 0) {
                reportList.innerHTML = '<li>Nenhum relatório encontrado.</li>';
                return;
            }

            // Cria o HTML para cada relatório e insere na lista
            reports.forEach(report => {
                // Como não há 'title', usamos um trecho da descrição.
                const title = report.description.substring(0, 50) + (report.description.length > 50 ? '...' : '');

                const reportItemHTML = `
                    <li class="report-item" data-protocol="${report.unique_protocol}">
                        <div class="report-info">
                            <span class="material-symbols-outlined report-icon">flag</span>
                            <div class="report-details">
                                <p class="report-title">${title}</p>
                                <p class="report-created-at">Enviado em: ${formatDate(report.created_at)}</p>
                            </div>
                        </div>
                        <div class="report-status">
                            <span class="status-badge status-${report.status.toLowerCase().replace('!', '')}">${report.status}</span>
                        </div>
                        <div class="report-actions">
                            <button class="btn-icon btn-details" title="Ver Detalhes">
                                <span class="material-symbols-outlined">open_in_full</span>
                            </button>
                            <button class="btn btn-approve">Approve</button>
                            <button class="btn btn-analyze">Analyze</button>
                            <button class="btn btn-reject">Reject</button>
                        </div>
                    </li>
                `;
                reportList.insertAdjacentHTML('beforeend', reportItemHTML);
            });

        } catch (error) {
            console.error(error);
            reportList.innerHTML = `<li>Erro ao carregar relatórios. Verifique a conexão com a API.</li>`;
        }
    }

    // --- LÓGICA DO MODAL (usando Delegação de Eventos) ---

    // Mapeia os campos do modal para preenchimento fácil
    const modalFields = {
        title: document.getElementById('modal-title'),
        description: document.getElementById('modal-description'),
        location: document.getElementById('modal-location'),
        occurrence_date: document.getElementById('modal-occurrence-date'),
        created_at: document.getElementById('modal-created-at')
    };

    // Adiciona UM evento de clique na lista inteira (mais eficiente)
    reportList.addEventListener('click', (event) => {
        const detailsButton = event.target.closest('.btn-details');

        if (detailsButton) {
            const reportItem = detailsButton.closest('.report-item');
            const protocolId = reportItem.dataset.protocol;
            
            openModalWithDetails(protocolId);
        }
    });

    function openModalWithDetails(protocolId) {
        const modalBody = document.getElementById('modal-body');
        
        modal.style.display = 'block';
        modalBody.style.display = 'none';
        modalFields.title.textContent = 'Buscando detalhes...';

        // Chama a função que já existe no seu `check-handler.js`
        fetchReportDetails(protocolId)
            .then(data => {
                // Sua API não tem 'title', então usamos a descrição completa aqui também.
                modalFields.title.textContent = data.description.substring(0, 50) + '...';
                modalFields.description.textContent = data.description;
                modalFields.location.textContent = data.location;
                modalFields.occurrence_date.textContent = formatDate(data.occurrence_date);
                modalFields.created_at.textContent = formatDate(data.created_at);
                modalBody.style.display = 'block';
            })
            .catch(error => {
                console.error(error);
                modalFields.title.textContent = 'Erro ao carregar';
                modalFields.description.textContent = error.message;
                modalBody.style.display = 'block';
            });
    }

    // Fecha o modal
    const closeBtn = document.querySelector('.close-button');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });

    // Inicia o processo carregando a lista de relatórios
    loadReports();
});