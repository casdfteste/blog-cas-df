/**
 * Blog CAS/DF - Aplicacao Principal
 * Conselho de Assistencia Social do Distrito Federal
 * Versao: 2.0
 */

// ===== CONSTANTES E CONFIGURACAO =====
const CONFIG = {
    siteName: 'Blog CAS DF',
    adminPassword: 'casdf2025',
    storageKeys: {
        posts: 'casdf_posts',
        categories: 'casdf_categories',
        settings: 'casdf_settings'
    },
    president: {
        name: 'Coracy Coelho Chavante',
        term: '2025-2027'
    }
};

// ===== CATEGORIAS PADRAO =====
const DEFAULT_CATEGORIES = {
    'noticias': { name: 'Noticias', color: '#06b6d4' },
    'reunioes': { name: 'Reunioes', color: '#1e3a8a' },
    'resolucoes': { name: 'Resolucoes', color: '#16a34a' },
    'editais': { name: 'Editais', color: '#f97316' },
    'eventos': { name: 'Eventos', color: '#8b5cf6' }
};

// ===== POSTS DE EXEMPLO =====
const SAMPLE_POSTS = [
    {
        id: 1,
        title: 'CAS/DF realiza 340a Reuniao Ordinaria',
        category: 'reunioes',
        date: '2025-06-20',
        excerpt: 'A 340a Reuniao Ordinaria do CAS/DF discutiu importantes questoes sobre o Sistema Unico de Assistencia Social no Distrito Federal.',
        content: 'A 340a Reuniao Ordinaria do CAS/DF foi realizada com a presenca de conselheiros representantes do governo e da sociedade civil. Na pauta, foram discutidas questoes relacionadas ao Sistema Unico de Assistencia Social (SUAS) no Distrito Federal, incluindo a aprovacao de novas resolucoes e o acompanhamento de politicas publicas de assistencia social.\n\nEntre os principais pontos discutidos estiveram:\n- Analise de processos de inscricao de entidades\n- Acompanhamento do Plano Decenal de Assistencia Social\n- Deliberacoes sobre o funcionamento das comissoes tematicas\n- Informes da Secretaria Executiva',
        author: 'Secretaria Executiva CAS/DF'
    },
    {
        id: 2,
        title: 'Nova resolucao sobre criterios de inscricao de entidades',
        category: 'resolucoes',
        date: '2025-06-18',
        excerpt: 'Aprovada resolucao que estabelece novos criterios para inscricao e renovacao de entidades de assistencia social.',
        content: 'O Conselho de Assistencia Social do Distrito Federal aprovou em plenaria a nova resolucao que estabelece criterios atualizados para inscricao e renovacao de entidades de assistencia social.\n\nA resolucao visa simplificar o processo de inscricao, mantendo os requisitos de qualidade e conformidade com a legislacao vigente. Entre as principais mudancas estao:\n- Digitalizacao completa do processo de inscricao\n- Novos prazos para analise de documentacao\n- Criterios mais claros para renovacao automatica\n- Maior transparencia no acompanhamento dos processos',
        author: 'Comissao de Normas CAS/DF'
    },
    {
        id: 3,
        title: 'Edital para Conferencia Distrital de Assistencia Social',
        category: 'editais',
        date: '2025-06-15',
        excerpt: 'Publicado edital para realizacao da proxima Conferencia Distrital de Assistencia Social do DF.',
        content: 'Foi publicado o edital de convocacao para a Conferencia Distrital de Assistencia Social do Distrito Federal. O evento reunira representantes do poder publico, trabalhadores do SUAS e usuarios dos servicos socioassistenciais.\n\nA conferencia tem como objetivo:\n- Avaliar a situacao atual da assistencia social no DF\n- Propor diretrizes para a politica de assistencia social\n- Eleger delegados para a Conferencia Nacional\n\nAs inscricoes podem ser realizadas atraves do site oficial do CAS/DF ou presencialmente na Secretaria Executiva.',
        author: 'Comissao Organizadora'
    }
];

// ===== ESTADO DA APLICACAO =====
let state = {
    currentSection: 'home',
    currentSubSection: null,
    posts: [],
    categories: {},
    isAdmin: false,
    searchResults: []
};

// ===== GERENCIAMENTO DE DADOS (LOCALSTORAGE) =====
const DataManager = {
    getPosts() {
        const stored = localStorage.getItem(CONFIG.storageKeys.posts);
        if (stored) {
            return JSON.parse(stored);
        }
        this.savePosts(SAMPLE_POSTS);
        return SAMPLE_POSTS;
    },

    savePosts(posts) {
        localStorage.setItem(CONFIG.storageKeys.posts, JSON.stringify(posts));
        state.posts = posts;
    },

    addPost(post) {
        const posts = this.getPosts();
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        post.id = newId;
        post.date = post.date || new Date().toISOString().split('T')[0];
        posts.unshift(post);
        this.savePosts(posts);
        return post;
    },

    updatePost(postId, updatedData) {
        const posts = this.getPosts();
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedData };
            this.savePosts(posts);
            return posts[index];
        }
        return null;
    },

    deletePost(postId) {
        const posts = this.getPosts();
        const filtered = posts.filter(p => p.id !== postId);
        this.savePosts(filtered);
        return filtered;
    },

    getCategories() {
        const stored = localStorage.getItem(CONFIG.storageKeys.categories);
        if (stored) {
            return JSON.parse(stored);
        }
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
    },

    saveCategories(categories) {
        localStorage.setItem(CONFIG.storageKeys.categories, JSON.stringify(categories));
        state.categories = categories;
    },

    searchPosts(query) {
        const posts = this.getPosts();
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return [];

        return posts.filter(post => {
            return post.title.toLowerCase().includes(searchTerm) ||
                   post.excerpt.toLowerCase().includes(searchTerm) ||
                   (post.content && post.content.toLowerCase().includes(searchTerm));
        });
    }
};

// ===== UTILITARIOS =====
const Utils = {
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    },

    getCategoryName(categoryKey) {
        const categories = DataManager.getCategories();
        return categories[categoryKey]?.name || 'Geral';
    },

    getCategoryColor(categoryKey) {
        const categories = DataManager.getCategories();
        return categories[categoryKey]?.color || '#6b7280';
    },

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ===== SISTEMA DE NOTIFICACOES =====
const Notifications = {
    show(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    info(message) { this.show(message, 'info'); },
    warning(message) { this.show(message, 'warning'); }
};

// ===== SISTEMA DE MODAL =====
const Modal = {
    show(content, title = '') {
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${Utils.sanitizeHTML(title)}</h2>
                    <button class="modal-close" onclick="Modal.close()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) Modal.close();
        });

        setTimeout(() => modal.classList.add('active'), 10);
    },

    close() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
};

// ===== NAVEGACAO =====
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
    }
}

function updateActiveNav(section) {
    document.querySelectorAll('.nav-links > li > a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[onclick="showSection('${section}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function showSection(section) {
    console.log('Mostrando secao:', section);
    state.currentSection = section;
    state.currentSubSection = null;
    updateActiveNav(section);

    const content = document.getElementById('mainContent');
    if (!content) {
        console.error('Elemento mainContent nao encontrado!');
        return;
    }

    try {
        let htmlContent = '';

        switch(section) {
            case 'home':
                htmlContent = getHomeContent();
                break;
            case 'sobre':
                htmlContent = getSobreContent();
                break;
            case 'planejamento':
                htmlContent = getPlanejamentoContent();
                break;
            case 'resolucoes':
                htmlContent = getResolucoesContent();
                break;
            case 'atas':
                htmlContent = getAtasContent();
                break;
            case 'reunioes':
                htmlContent = getReuniaoesContent();
                break;
            case 'eleicoes':
                htmlContent = getEleicoesContent();
                break;
            case 'conferencias':
                htmlContent = getConferenciasContent();
                break;
            case 'entidades':
                htmlContent = getEntidadesContent();
                break;
            case 'inscricao':
                htmlContent = getInscricaoContent();
                break;
            case 'contato':
                htmlContent = getContatoContent();
                break;
            default:
                htmlContent = getPlaceholderContent(section);
        }

        content.innerHTML = htmlContent;

    } catch (error) {
        console.error('Erro ao carregar secao:', error);
        content.innerHTML = `<div class="text-center p-4"><h2 style="color: red;">Erro ao carregar secao: ${section}</h2><p>Detalhes: ${error.message}</p></div>`;
    }

    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('mobile-open');
    }
}

function showSubSection(section, subsection) {
    console.log('Mostrando subsecao:', section, subsection);
    state.currentSection = section;
    state.currentSubSection = subsection;

    const content = document.getElementById('mainContent');
    if (!content) return;

    content.innerHTML = getSubSectionContent(section, subsection);

    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('mobile-open');
    }
}

// ===== CONTEUDO DAS SECOES =====
function getHomeContent() {
    const posts = DataManager.getPosts();

    let postsHtml = '';
    posts.forEach(post => {
        const categoryColor = Utils.getCategoryColor(post.category);
        postsHtml += `
            <div class="post-card" onclick="openPost(${post.id})">
                <div class="post-meta">
                    <span class="post-category" style="background: ${categoryColor}">${Utils.getCategoryName(post.category)}</span>
                    <span>${Utils.formatDate(post.date)}</span>
                </div>
                <div class="post-title">${Utils.sanitizeHTML(post.title)}</div>
                <div class="post-excerpt">${Utils.sanitizeHTML(post.excerpt)}</div>
            </div>
        `;
    });

    if (posts.length === 0) {
        postsHtml = `
            <div class="placeholder-content" style="grid-column: 1/-1;">
                <h3>Nenhum post publicado</h3>
                <p class="placeholder-text">Clique em "Adicionar Post" para criar o primeiro post do blog.</p>
            </div>
        `;
    }

    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${posts.length}</div>
                <div class="stat-label">Posts Publicados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(DataManager.getCategories()).length}</div>
                <div class="stat-label">Categorias</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">340</div>
                <div class="stat-label">Reunioes Realizadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">150+</div>
                <div class="stat-label">Entidades Inscritas</div>
            </div>
        </div>
    `;

    return `
        <h1 class="page-title">Blog CAS DF - Ultimas Noticias</h1>
        ${statsHtml}
        <div class="admin-help">
            <h4>Area de Posts e Noticias</h4>
            <p><strong>Como usar:</strong> Esta e a pagina inicial onde aparecerao todas as noticias, deliberacoes e informacoes importantes do CAS/DF.</p>
        </div>
        <div class="admin-buttons mb-2">
            <button class="admin-btn success" onclick="showAddPostForm()">+ Adicionar Post</button>
            <button class="admin-btn secondary" onclick="showManageCategories()">Gerenciar Categorias</button>
        </div>
        <div class="posts-grid">${postsHtml}</div>
    `;
}

function getSobreContent() {
    return `
        <h1 class="page-title">Sobre o CAS/DF</h1>
        <div class="admin-help">
            <h4>Secao Institucional</h4>
            <p>Esta secao contem informacoes sobre a estrutura, composicao e organizacao do CAS/DF.</p>
            <p><strong>Presidente Atual:</strong> ${CONFIG.president.name} (Gestao ${CONFIG.president.term})</p>
        </div>
        <div class="placeholder-content">
            <h3>Informacoes Institucionais</h3>
            <p class="placeholder-text">Selecione uma das opcoes no menu "SOBRE" para visualizar:</p>
            <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: center;">
                <h3 style="margin-bottom: 1rem;">PRESIDENCIA ATUAL</h3>
                <h4 style="margin-bottom: 0.5rem; color: #eab308;">${CONFIG.president.name}</h4>
                <p style="opacity: 0.9;">Presidente do CAS/DF</p>
                <p style="opacity: 0.9;">Mandato: ${CONFIG.president.term}</p>
            </div>
            <div class="admin-buttons">
                <button class="admin-btn" onclick="showSubSection('sobre', 'presidencia')" style="background: #1e3a8a;">Presidencia</button>
                <button class="admin-btn" onclick="showSubSection('sobre', 'secretaria')" style="background: #3b82f6;">Secretaria</button>
                <button class="admin-btn" onclick="showSubSection('sobre', 'conselheiros-sc')" style="background: #16a34a;">Conselheiros SC</button>
                <button class="admin-btn" onclick="showSubSection('sobre', 'comissoes')" style="background: #f97316;">Comissoes</button>
            </div>
        </div>
    `;
}

function getPlanejamentoContent() {
    return `
        <h1 class="page-title">Planejamento Estrategico Institucional</h1>
        <div class="admin-help">
            <h4>Planejamento Estrategico CAS/DF ${CONFIG.president.term}</h4>
            <p>Esta secao contem o Plano Estrategico Institucional (PEI) do CAS/DF e documentos relacionados.</p>
        </div>
        <div class="placeholder-content">
            <h3>PEI ${CONFIG.president.term}</h3>
            <p class="placeholder-text">Documentos do Planejamento Estrategico Institucional</p>
            <div class="admin-buttons mt-2">
                <button class="admin-btn" onclick="showSubSection('planejamento', 'pei-2025-2027')">Ver PEI Completo</button>
                <button class="admin-btn secondary" onclick="showSubSection('planejamento', 'objetivos')">Objetivos Estrategicos</button>
                <button class="admin-btn secondary" onclick="showSubSection('planejamento', 'indicadores')">Indicadores e Metas</button>
            </div>
        </div>
    `;
}

function getResolucoesContent() {
    return `
        <h1 class="page-title">Resolucoes do CAS/DF</h1>
        <div class="admin-help">
            <h4>Documentos Normativos</h4>
            <p>Aqui ficam organizadas todas as resolucoes do CAS/DF por ano, alem do Regimento Interno.</p>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="showResolucoesTab('2025')">2025</button>
            <button class="tab-btn" onclick="showResolucoesTab('2024')">2024</button>
            <button class="tab-btn" onclick="showResolucoesTab('2023')">2023</button>
            <button class="tab-btn" onclick="showResolucoesTab('anteriores')">Anteriores</button>
            <button class="tab-btn" onclick="showResolucoesTab('regimento')">Regimento Interno</button>
        </div>
        <div id="resolucoesContent" class="placeholder-content">
            <h3>Resolucoes 2025</h3>
            <p class="placeholder-text">Lista de resolucoes aprovadas em 2025 sera exibida aqui.</p>
        </div>
    `;
}

function getAtasContent() {
    return `
        <h1 class="page-title">Atas das Reunioes</h1>
        <div class="admin-help">
            <h4>Registro das Reunioes</h4>
            <p>Atas das reunioes plenarias e de comissoes organizadas por periodos.</p>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="showAtasTab('2025')">2025</button>
            <button class="tab-btn" onclick="showAtasTab('2024')">2024</button>
            <button class="tab-btn" onclick="showAtasTab('2023')">2023</button>
            <button class="tab-btn" onclick="showAtasTab('anteriores')">2010-2022</button>
        </div>
        <div id="atasContent" class="placeholder-content">
            <h3>Atas 2025</h3>
            <p class="placeholder-text">Lista de atas das reunioes de 2025 sera exibida aqui.</p>
        </div>
    `;
}

function getReuniaoesContent() {
    return `
        <h1 class="page-title">Reunioes do CAS DF</h1>
        <div class="admin-help">
            <h4>Informacoes sobre Reunioes</h4>
            <p>Secao dedicada as reunioes: pautas, calendario, transmissoes ao vivo e registro fotografico.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card" onclick="showSubSection('reunioes', 'ordinarias')" style="cursor:pointer">
                <div class="stat-number">340</div>
                <div class="stat-label">Reunioes Ordinarias</div>
            </div>
            <div class="stat-card" onclick="showSubSection('reunioes', 'calendario')" style="cursor:pointer">
                <div class="stat-number">12</div>
                <div class="stat-label">Reunioes em 2025</div>
            </div>
            <div class="stat-card" onclick="showSubSection('reunioes', 'lives')" style="cursor:pointer">
                <div class="stat-number">50+</div>
                <div class="stat-label">Lives Realizadas</div>
            </div>
        </div>
        <div class="admin-buttons mt-2">
            <button class="admin-btn" onclick="showSubSection('reunioes', 'ordinarias')">Ver Pautas</button>
            <button class="admin-btn secondary" onclick="showSubSection('reunioes', 'calendario')">Calendario</button>
            <button class="admin-btn secondary" onclick="showSubSection('reunioes', 'lives')">Lives</button>
            <button class="admin-btn secondary" onclick="showSubSection('reunioes', 'fotos')">Fotos</button>
        </div>
    `;
}

function getEleicoesContent() {
    return `
        <h1 class="page-title">Eleicao Sociedade Civil</h1>
        <div class="admin-help">
            <h4>Processo Eleitoral</h4>
            <p>Documentos e informacoes sobre as eleicoes dos representantes da sociedade civil no CAS/DF.</p>
        </div>
        <div class="placeholder-content">
            <h3>Historico Eleitoral</h3>
            <p class="placeholder-text">Documentos das eleicoes organizados por gestao.</p>
            <div class="admin-buttons mt-2">
                <button class="admin-btn" onclick="showSubSection('eleicoes', '2024-2026')">Gestao 2024-2026</button>
                <button class="admin-btn secondary" onclick="showSubSection('eleicoes', '2022-2024')">2022-2024</button>
                <button class="admin-btn secondary" onclick="showSubSection('eleicoes', '2020-2022')">2020-2022</button>
            </div>
        </div>
    `;
}

function getConferenciasContent() {
    return `
        <h1 class="page-title">Conferencias de Assistencia Social</h1>
        <div class="admin-help">
            <h4>Conferencias de Assistencia Social</h4>
            <p>Documentos e registros das conferencias regionais, distrital e participacao nas conferencias nacionais.</p>
        </div>
        <div class="placeholder-content">
            <h3>Sistema de Conferencias</h3>
            <p class="placeholder-text">Documentos e registros organizados por tipo de conferencia.</p>
            <div class="admin-buttons mt-2">
                <button class="admin-btn" onclick="showSubSection('conferencias', 'regionais')">Conferencias Regionais</button>
                <button class="admin-btn secondary" onclick="showSubSection('conferencias', 'distrital')">Conferencia Distrital</button>
                <button class="admin-btn secondary" onclick="showSubSection('conferencias', 'nacional')">Conferencia Nacional</button>
            </div>
        </div>
    `;
}

function getEntidadesContent() {
    return `
        <h1 class="page-title">Entidades Inscritas no CAS/DF</h1>
        <div class="admin-help">
            <h4>Entidades de Assistencia Social Inscritas</h4>
            <p>Consulte aqui todas as entidades de assistencia social devidamente inscritas no CAS/DF.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">150+</div>
                <div class="stat-label">Entidades Ativas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">25</div>
                <div class="stat-label">Em Analise</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">31</div>
                <div class="stat-label">Regioes Atendidas</div>
            </div>
        </div>
        <div class="placeholder-content">
            <h3>Registro de Entidades</h3>
            <p class="placeholder-text">Base de dados das entidades inscritas e em processo de analise.</p>
            <div class="admin-buttons">
                <button class="admin-btn" onclick="exportEntidades()">Exportar Lista</button>
                <button class="admin-btn secondary" onclick="showSection('inscricao')">Nova Inscricao</button>
            </div>
        </div>
    `;
}

function getInscricaoContent() {
    return `
        <h1 class="page-title">Procedimentos para Inscricao no CAS/DF</h1>
        <div class="admin-help">
            <h4>Inscricao de Entidades de Assistencia Social</h4>
            <p>Processo completo de inscricao de entidades no Conselho de Assistencia Social do DF.</p>
        </div>
        <div class="placeholder-content">
            <h3>Sistema de Inscricao Digital</h3>
            <p class="placeholder-text">Processo 100% digital para inscricao e renovacao de entidades.</p>
            <div class="admin-buttons">
                <button class="admin-btn success" onclick="showSubSection('inscricao', 'formulario')">Iniciar Inscricao</button>
                <button class="admin-btn secondary" onclick="showSubSection('inscricao', 'passo-a-passo')">Ver Procedimentos</button>
                <button class="admin-btn secondary" onclick="showSubSection('inscricao', 'documentos')">Documentos Necessarios</button>
            </div>
        </div>
    `;
}

function getContatoContent() {
    return `
        <h1 class="page-title">Contate-nos</h1>
        <div class="admin-help">
            <h4>Canal de Comunicacao</h4>
            <p>Entre em contato conosco atraves das informacoes abaixo.</p>
        </div>
        <div class="contact-container">
            <div class="contact-form">
                <h3>Formulario de Contato</h3>
                <form onsubmit="handleContactSubmit(event)">
                    <div class="form-group">
                        <label for="contactName">Nome Completo *</label>
                        <input type="text" id="contactName" name="name" required placeholder="Digite seu nome completo">
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">E-mail *</label>
                        <input type="email" id="contactEmail" name="email" required placeholder="Digite seu melhor e-mail">
                    </div>
                    <div class="form-group">
                        <label for="contactPhone">Telefone</label>
                        <input type="tel" id="contactPhone" name="phone" placeholder="(61) 99999-9999">
                    </div>
                    <div class="form-group">
                        <label for="contactSubject">Assunto</label>
                        <input type="text" id="contactSubject" name="subject" placeholder="Sobre o que voce gostaria de falar?">
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">Mensagem *</label>
                        <textarea id="contactMessage" name="message" required placeholder="Digite sua mensagem aqui..."></textarea>
                    </div>
                    <button type="submit" class="contact-submit-btn">Enviar Mensagem</button>
                </form>
            </div>
            <div class="contact-info">
                <h3>Informacoes de Contato</h3>
                <div class="contact-detail">
                    <span>&#x1F3E2;</span>
                    <div><strong>Endereco:</strong><br>SEPN 511, Bloco C, Ed. Bittar IV, 4o andar<br>Asa Norte, Brasilia/DF<br>CEP: 70750-543</div>
                </div>
                <div class="contact-detail">
                    <span>&#x1F4DE;</span>
                    <div><strong>Telefone:</strong><br>(61) 2017-4260</div>
                </div>
                <div class="contact-detail">
                    <span>&#x2709;</span>
                    <div><strong>E-mail:</strong><br>cas.df@sedes.df.gov.br</div>
                </div>
                <div class="contact-detail">
                    <span>&#x1F550;</span>
                    <div><strong>Horario de Funcionamento:</strong><br>Segunda a Sexta: 8h as 18h</div>
                </div>
                <div class="contact-detail">
                    <span>&#x1F464;</span>
                    <div><strong>Presidente:</strong><br>${CONFIG.president.name}</div>
                </div>
            </div>
        </div>
    `;
}

function getPlaceholderContent(section) {
    return `
        <h1 class="page-title">${section.toUpperCase()}</h1>
        <div class="admin-help">
            <h4>Secao em Desenvolvimento</h4>
            <p>Esta secao sera preenchida com conteudo especifico.</p>
        </div>
        <div class="placeholder-content">
            <h3>Conteudo em Preparacao</h3>
            <p class="placeholder-text">Esta secao esta sendo preparada e sera atualizada em breve.</p>
        </div>
    `;
}

function getSubSectionContent(section, subsection) {
    const title = getSubSectionTitle(section, subsection);
    return `
        <h1 class="page-title">${title}</h1>
        <div class="admin-help">
            <h4>Conteudo a ser Preenchido</h4>
            <p><strong>Secao:</strong> ${section.toUpperCase()}</p>
            <p><strong>Subsecao:</strong> ${subsection}</p>
        </div>
        <div class="placeholder-content">
            <h3>[TITULO DA SECAO]</h3>
            <p class="placeholder-text">[CONTEUDO SERA ADICIONADO AQUI PELA ADMINISTRACAO]</p>
            <div class="admin-buttons">
                <button class="admin-btn secondary" onclick="showSection('${section}')">Voltar para ${section.toUpperCase()}</button>
            </div>
        </div>
    `;
}

function getSubSectionTitle(section, subsection) {
    const titles = {
        'sobre': {
            'presidencia': 'Presidencia do CAS/DF',
            'secretaria': 'Secretaria Executiva',
            'conselheiros-sc': 'Conselheiros da Sociedade Civil',
            'conselheiros-gov': 'Conselheiros do Governo',
            'comissoes': 'Comissoes do CAS/DF'
        },
        'planejamento': {
            'pei-2025-2027': 'PEI 2025-2027',
            'objetivos': 'Objetivos Estrategicos',
            'indicadores': 'Indicadores e Metas',
            'monitoramento': 'Monitoramento'
        },
        'reunioes': {
            'ordinarias': 'Reunioes Ordinarias (Pautas)',
            'calendario': 'Calendario de Reunioes',
            'lives': 'Lives do CAS DF',
            'fotos': 'Album de Fotos'
        },
        'inscricao': {
            'passo-a-passo': 'Passo a Passo para Inscricao',
            'documentos': 'Documentos Necessarios',
            'formulario': 'Formulario de Inscricao Online',
            'acompanhar': 'Acompanhar Status da Inscricao'
        },
        'conferencias': {
            'regionais': 'Conferencias Regionais',
            'distrital': 'Conferencia Distrital',
            'nacional': 'Conferencia Nacional',
            'fotos': 'Fotos das Conferencias'
        },
        'eleicoes': {
            '2024-2026': 'Gestao 2024-2026',
            '2022-2024': 'Gestao 2022-2024',
            '2020-2022': 'Gestao 2020-2022',
            '2018-2020': 'Gestao 2018-2020',
            '2016-2018': 'Gestao 2016-2018'
        }
    };

    return (titles[section] && titles[section][subsection]) ? titles[section][subsection] : section + ' - ' + subsection;
}

// ===== FUNCOES DE POSTS =====
function openPost(postId) {
    const posts = DataManager.getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        Notifications.error('Post nao encontrado');
        return;
    }

    const content = `
        <div class="post-meta mb-2">
            <span class="post-category" style="background: ${Utils.getCategoryColor(post.category)}">${Utils.getCategoryName(post.category)}</span>
            <span style="margin-left: 1rem; color: #6b7280;">${Utils.formatDate(post.date)}</span>
        </div>
        <p class="mb-2"><strong>Autor:</strong> ${Utils.sanitizeHTML(post.author || 'CAS/DF')}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
        <div style="white-space: pre-wrap; line-height: 1.8;">
            ${Utils.sanitizeHTML(post.content || post.excerpt)}
        </div>
        <div class="admin-buttons mt-3">
            <button class="admin-btn" onclick="editPost(${post.id})">Editar Post</button>
            <button class="admin-btn danger" onclick="confirmDeletePost(${post.id})">Excluir Post</button>
        </div>
    `;

    Modal.show(content, post.title);
}

function showAddPostForm() {
    const categories = DataManager.getCategories();
    let categoryOptions = '';
    Object.keys(categories).forEach(key => {
        categoryOptions += `<option value="${key}">${categories[key].name}</option>`;
    });

    const content = `
        <form onsubmit="handleAddPost(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="postTitle">Titulo do Post *</label>
                    <input type="text" id="postTitle" name="title" required placeholder="Digite o titulo">
                </div>
                <div class="form-group">
                    <label for="postCategory">Categoria *</label>
                    <select id="postCategory" name="category" required>
                        ${categoryOptions}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="postDate">Data</label>
                    <input type="date" id="postDate" name="date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="postAuthor">Autor</label>
                    <input type="text" id="postAuthor" name="author" placeholder="Nome do autor" value="CAS/DF">
                </div>
            </div>
            <div class="form-group">
                <label for="postExcerpt">Resumo *</label>
                <textarea id="postExcerpt" name="excerpt" required placeholder="Digite um breve resumo do post" style="min-height: 80px;"></textarea>
            </div>
            <div class="form-group">
                <label for="postContent">Conteudo Completo</label>
                <textarea id="postContent" name="content" placeholder="Digite o conteudo completo do post" style="min-height: 200px;"></textarea>
            </div>
            <div class="admin-buttons">
                <button type="submit" class="admin-btn success">Publicar Post</button>
                <button type="button" class="admin-btn secondary" onclick="Modal.close()">Cancelar</button>
            </div>
        </form>
    `;

    Modal.show(content, 'Adicionar Novo Post');
}

function handleAddPost(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const post = {
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('date'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content') || formData.get('excerpt'),
        author: formData.get('author') || 'CAS/DF'
    };

    DataManager.addPost(post);
    Modal.close();
    Notifications.success('Post publicado com sucesso!');
    showSection('home');
}

function editPost(postId) {
    const posts = DataManager.getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        Notifications.error('Post nao encontrado');
        return;
    }

    const categories = DataManager.getCategories();
    let categoryOptions = '';
    Object.keys(categories).forEach(key => {
        const selected = key === post.category ? 'selected' : '';
        categoryOptions += `<option value="${key}" ${selected}>${categories[key].name}</option>`;
    });

    const content = `
        <form onsubmit="handleEditPost(event, ${post.id})">
            <div class="form-row">
                <div class="form-group">
                    <label for="postTitle">Titulo do Post *</label>
                    <input type="text" id="postTitle" name="title" required value="${Utils.sanitizeHTML(post.title)}">
                </div>
                <div class="form-group">
                    <label for="postCategory">Categoria *</label>
                    <select id="postCategory" name="category" required>
                        ${categoryOptions}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="postDate">Data</label>
                    <input type="date" id="postDate" name="date" value="${post.date}">
                </div>
                <div class="form-group">
                    <label for="postAuthor">Autor</label>
                    <input type="text" id="postAuthor" name="author" value="${Utils.sanitizeHTML(post.author || 'CAS/DF')}">
                </div>
            </div>
            <div class="form-group">
                <label for="postExcerpt">Resumo *</label>
                <textarea id="postExcerpt" name="excerpt" required style="min-height: 80px;">${Utils.sanitizeHTML(post.excerpt)}</textarea>
            </div>
            <div class="form-group">
                <label for="postContent">Conteudo Completo</label>
                <textarea id="postContent" name="content" style="min-height: 200px;">${Utils.sanitizeHTML(post.content || '')}</textarea>
            </div>
            <div class="admin-buttons">
                <button type="submit" class="admin-btn success">Salvar Alteracoes</button>
                <button type="button" class="admin-btn secondary" onclick="Modal.close()">Cancelar</button>
            </div>
        </form>
    `;

    Modal.show(content, 'Editar Post');
}

function handleEditPost(event, postId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const updatedData = {
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('date'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content') || formData.get('excerpt'),
        author: formData.get('author')
    };

    DataManager.updatePost(postId, updatedData);
    Modal.close();
    Notifications.success('Post atualizado com sucesso!');
    showSection('home');
}

function confirmDeletePost(postId) {
    if (confirm('Tem certeza que deseja excluir este post? Esta acao nao pode ser desfeita.')) {
        DataManager.deletePost(postId);
        Modal.close();
        Notifications.success('Post excluido com sucesso!');
        showSection('home');
    }
}

// ===== GERENCIAMENTO DE CATEGORIAS =====
function showManageCategories() {
    const categories = DataManager.getCategories();

    let categoriesHtml = '';
    Object.keys(categories).forEach(key => {
        categoriesHtml += `
            <div class="flex-between mb-2 p-2" style="background: #f8f9fa; border-radius: 8px;">
                <div class="flex gap-2" style="align-items: center;">
                    <span style="width: 20px; height: 20px; background: ${categories[key].color}; border-radius: 4px; display: inline-block;"></span>
                    <strong>${categories[key].name}</strong>
                    <small style="color: #6b7280;">(${key})</small>
                </div>
            </div>
        `;
    });

    const content = `
        <div class="mb-3">
            <h4>Categorias Existentes</h4>
            ${categoriesHtml}
        </div>
        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e5e7eb;">
        <h4 class="mb-2">Adicionar Nova Categoria</h4>
        <form onsubmit="handleAddCategory(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="catKey">Chave (sem espacos)</label>
                    <input type="text" id="catKey" name="key" required placeholder="ex: capacitacao" pattern="[a-z0-9-]+">
                </div>
                <div class="form-group">
                    <label for="catName">Nome</label>
                    <input type="text" id="catName" name="name" required placeholder="ex: Capacitacao">
                </div>
            </div>
            <div class="form-group">
                <label for="catColor">Cor</label>
                <input type="color" id="catColor" name="color" value="#1e3a8a" style="width: 100px; height: 40px; cursor: pointer;">
            </div>
            <div class="admin-buttons">
                <button type="submit" class="admin-btn success">Adicionar Categoria</button>
                <button type="button" class="admin-btn secondary" onclick="Modal.close()">Fechar</button>
            </div>
        </form>
    `;

    Modal.show(content, 'Gerenciar Categorias');
}

function handleAddCategory(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const key = formData.get('key').toLowerCase().trim();
    const name = formData.get('name').trim();
    const color = formData.get('color');

    const categories = DataManager.getCategories();

    if (categories[key]) {
        Notifications.error('Ja existe uma categoria com esta chave!');
        return;
    }

    categories[key] = { name, color };
    DataManager.saveCategories(categories);

    Notifications.success('Categoria adicionada com sucesso!');
    showManageCategories();
}

// ===== FUNCOES DE BUSCA =====
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        Notifications.warning('Digite algo para buscar');
        return;
    }

    const results = DataManager.searchPosts(query);

    if (results.length === 0) {
        Notifications.info(`Nenhum resultado encontrado para "${query}"`);
        return;
    }

    let resultsHtml = '';
    results.forEach(post => {
        resultsHtml += `
            <div class="search-result-item" onclick="Modal.close(); openPost(${post.id})">
                <div class="post-meta mb-1">
                    <span class="post-category" style="background: ${Utils.getCategoryColor(post.category)}">${Utils.getCategoryName(post.category)}</span>
                    <span style="margin-left: 1rem;">${Utils.formatDate(post.date)}</span>
                </div>
                <strong>${Utils.sanitizeHTML(post.title)}</strong>
                <p style="color: #6b7280; font-size: 0.9rem; margin-top: 0.5rem;">${Utils.sanitizeHTML(post.excerpt.substring(0, 100))}...</p>
            </div>
        `;
    });

    const content = `
        <p class="mb-2"><strong>${results.length}</strong> resultado(s) encontrado(s) para "<strong>${Utils.sanitizeHTML(query)}</strong>"</p>
        <div class="search-results">
            ${resultsHtml}
        </div>
    `;

    Modal.show(content, 'Resultados da Busca');
}

// ===== FUNCOES AUXILIARES =====
function handleContactSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject') || 'Sem assunto';

    Notifications.success(`Mensagem enviada com sucesso! Obrigado, ${name}!`);
    event.target.reset();
}

function exportEntidades() {
    Notifications.info('Funcionalidade de exportacao sera implementada em breve.');
}

function showLogin() {
    const password = prompt('Digite a senha de acesso:');
    if (password === CONFIG.adminPassword) {
        state.isAdmin = true;
        Notifications.success('Acesso administrativo liberado!');
    } else if (password !== null) {
        Notifications.error('Senha incorreta!');
    }
}

function showResolucoesTab(tab) {
    document.querySelectorAll('.tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('resolucoesContent');
    content.innerHTML = `
        <h3>Resolucoes ${tab === 'regimento' ? '- Regimento Interno' : tab}</h3>
        <p class="placeholder-text">Conteudo das resolucoes ${tab} sera exibido aqui.</p>
    `;
}

function showAtasTab(tab) {
    document.querySelectorAll('.tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('atasContent');
    content.innerHTML = `
        <h3>Atas ${tab}</h3>
        <p class="placeholder-text">Lista de atas de ${tab} sera exibida aqui.</p>
    `;
}

// ===== INICIALIZACAO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog CAS/DF iniciando...');

    // Carregar dados iniciais
    state.posts = DataManager.getPosts();
    state.categories = DataManager.getCategories();

    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('Elemento mainContent nao encontrado!');
        return;
    }

    // Configurar busca com Enter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Carregar pagina inicial
    try {
        showSection('home');
        console.log('Pagina inicial carregada com sucesso');
    } catch (error) {
        console.error('Erro ao carregar pagina inicial:', error);
    }

    console.log('Blog CAS/DF carregado completamente!');
});

// Exportar funcoes para uso global
window.showSection = showSection;
window.showSubSection = showSubSection;
window.toggleMobileMenu = toggleMobileMenu;
window.openPost = openPost;
window.showAddPostForm = showAddPostForm;
window.handleAddPost = handleAddPost;
window.editPost = editPost;
window.handleEditPost = handleEditPost;
window.confirmDeletePost = confirmDeletePost;
window.showManageCategories = showManageCategories;
window.handleAddCategory = handleAddCategory;
window.performSearch = performSearch;
window.handleContactSubmit = handleContactSubmit;
window.exportEntidades = exportEntidades;
window.showLogin = showLogin;
window.showResolucoesTab = showResolucoesTab;
window.showAtasTab = showAtasTab;
window.Modal = Modal;
window.Notifications = Notifications;

console.log('Script carregado - Aguardando DOM...');
