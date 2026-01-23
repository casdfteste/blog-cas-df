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
        settings: 'casdf_settings',
        atas: 'casdf_atas',
        resolucoes: 'casdf_resolucoes',
        comissoes: 'casdf_comissoes'
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

// ===== ATAS DE EXEMPLO =====
const SAMPLE_ATAS = [
    {
        id: 1,
        numero: '340',
        tipo: 'ordinaria',
        data: '2025-06-20',
        ano: '2025',
        descricao: '340a Reuniao Ordinaria do CAS/DF',
        participantes: 'Conselheiros titulares e suplentes',
        pauta: 'Aprovacao de inscricoes de entidades, informes da Secretaria Executiva, deliberacoes sobre o SUAS-DF',
        arquivo: null
    },
    {
        id: 2,
        numero: '339',
        tipo: 'ordinaria',
        data: '2025-05-15',
        ano: '2025',
        descricao: '339a Reuniao Ordinaria do CAS/DF',
        participantes: 'Conselheiros titulares e suplentes',
        pauta: 'Analise de processos, aprovacao de resolucoes, planejamento de conferencias',
        arquivo: null
    },
    {
        id: 3,
        numero: '338',
        tipo: 'ordinaria',
        data: '2025-04-10',
        ano: '2025',
        descricao: '338a Reuniao Ordinaria do CAS/DF',
        participantes: 'Conselheiros titulares e suplentes',
        pauta: 'Posse dos novos conselheiros, eleicao da mesa diretora',
        arquivo: null
    },
    {
        id: 4,
        numero: '337',
        tipo: 'ordinaria',
        data: '2024-12-12',
        ano: '2024',
        descricao: '337a Reuniao Ordinaria do CAS/DF',
        participantes: 'Conselheiros titulares e suplentes',
        pauta: 'Balanco anual, aprovacao do calendario 2025',
        arquivo: null
    }
];

// ===== RESOLUCOES DE EXEMPLO =====
const SAMPLE_RESOLUCOES = [
    {
        id: 1,
        numero: '45',
        ano: '2025',
        data: '2025-06-18',
        titulo: 'Resolucao que estabelece criterios para inscricao de entidades',
        ementa: 'Dispoe sobre os criterios e procedimentos para inscricao e renovacao de inscricao de entidades de assistencia social no CAS/DF.',
        tipo: 'normativa',
        arquivo: null
    },
    {
        id: 2,
        numero: '44',
        ano: '2025',
        data: '2025-05-20',
        titulo: 'Resolucao sobre o calendario de reunioes 2025',
        ementa: 'Aprova o calendario de reunioes ordinarias e extraordinarias do CAS/DF para o exercicio de 2025.',
        tipo: 'administrativa',
        arquivo: null
    },
    {
        id: 3,
        numero: '43',
        ano: '2025',
        data: '2025-04-15',
        titulo: 'Resolucao de composicao das Comissoes Tematicas',
        ementa: 'Define a composicao das comissoes tematicas permanentes do CAS/DF para a gestao 2025-2027.',
        tipo: 'administrativa',
        arquivo: null
    },
    {
        id: 4,
        numero: '38',
        ano: '2024',
        data: '2024-11-20',
        titulo: 'Resolucao sobre o Plano Decenal de Assistencia Social',
        ementa: 'Aprova diretrizes para acompanhamento do Plano Decenal de Assistencia Social do DF.',
        tipo: 'normativa',
        arquivo: null
    },
    {
        id: 5,
        numero: '35',
        ano: '2024',
        data: '2024-08-15',
        titulo: 'Resolucao sobre capacitacao de conselheiros',
        ementa: 'Institui o Programa de Capacitacao Continuada para conselheiros do CAS/DF.',
        tipo: 'normativa',
        arquivo: null
    }
];

// ===== COMISSOES =====
const COMISSOES_DATA = [
    {
        id: 1,
        nome: 'Comissao de Normas',
        sigla: 'CN',
        descricao: 'Responsavel pela analise e elaboracao de normas, resolucoes e pareceres tecnicos do CAS/DF.',
        atribuicoes: [
            'Analisar e emitir parecer sobre projetos de resolucoes',
            'Elaborar minutas de normas e regulamentos',
            'Revisar o Regimento Interno',
            'Acompanhar a legislacao de assistencia social'
        ],
        coordenador: 'A definir',
        membros: []
    },
    {
        id: 2,
        nome: 'Comissao de Inscricao de Entidades',
        sigla: 'CIE',
        descricao: 'Responsavel pela analise dos processos de inscricao e renovacao de entidades de assistencia social.',
        atribuicoes: [
            'Analisar pedidos de inscricao de entidades',
            'Verificar documentacao e requisitos legais',
            'Realizar visitas tecnicas quando necessario',
            'Emitir parecer sobre renovacao de inscricoes'
        ],
        coordenador: 'A definir',
        membros: []
    },
    {
        id: 3,
        nome: 'Comissao de Politica de Assistencia Social',
        sigla: 'CPAS',
        descricao: 'Responsavel pelo acompanhamento e avaliacao da politica de assistencia social no DF.',
        atribuicoes: [
            'Acompanhar a execucao da politica de assistencia social',
            'Analisar relatorios de gestao',
            'Propor diretrizes para o SUAS no DF',
            'Monitorar indicadores sociais'
        ],
        coordenador: 'A definir',
        membros: []
    },
    {
        id: 4,
        nome: 'Comissao de Financas e Orcamento',
        sigla: 'CFO',
        descricao: 'Responsavel pelo acompanhamento e fiscalizacao dos recursos do Fundo de Assistencia Social.',
        atribuicoes: [
            'Acompanhar a execucao orcamentaria do FAS-DF',
            'Analisar prestacoes de contas',
            'Emitir parecer sobre o orcamento da assistencia social',
            'Fiscalizar a aplicacao dos recursos'
        ],
        coordenador: 'A definir',
        membros: []
    },
    {
        id: 5,
        nome: 'Comissao de Comunicacao',
        sigla: 'CCOM',
        descricao: 'Responsavel pela divulgacao das acoes do CAS/DF e comunicacao com a sociedade.',
        atribuicoes: [
            'Elaborar estrategias de comunicacao',
            'Gerenciar redes sociais e site',
            'Organizar eventos e conferencias',
            'Promover a participacao social'
        ],
        coordenador: 'A definir',
        membros: []
    }
];

// ===== ESTADO DA APLICACAO =====
let state = {
    currentSection: 'home',
    currentSubSection: null,
    posts: [],
    categories: {},
    atas: [],
    resolucoes: [],
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
    },

    // ===== ATAS =====
    getAtas() {
        const stored = localStorage.getItem(CONFIG.storageKeys.atas);
        if (stored) {
            return JSON.parse(stored);
        }
        this.saveAtas(SAMPLE_ATAS);
        return SAMPLE_ATAS;
    },

    saveAtas(atas) {
        localStorage.setItem(CONFIG.storageKeys.atas, JSON.stringify(atas));
        state.atas = atas;
    },

    addAta(ata) {
        const atas = this.getAtas();
        const newId = atas.length > 0 ? Math.max(...atas.map(a => a.id)) + 1 : 1;
        ata.id = newId;
        atas.unshift(ata);
        this.saveAtas(atas);
        return ata;
    },

    updateAta(ataId, updatedData) {
        const atas = this.getAtas();
        const index = atas.findIndex(a => a.id === ataId);
        if (index !== -1) {
            atas[index] = { ...atas[index], ...updatedData };
            this.saveAtas(atas);
            return atas[index];
        }
        return null;
    },

    deleteAta(ataId) {
        const atas = this.getAtas();
        const filtered = atas.filter(a => a.id !== ataId);
        this.saveAtas(filtered);
        return filtered;
    },

    getAtasByYear(ano) {
        const atas = this.getAtas();
        return atas.filter(a => a.ano === ano);
    },

    // ===== RESOLUCOES =====
    getResolucoes() {
        const stored = localStorage.getItem(CONFIG.storageKeys.resolucoes);
        if (stored) {
            return JSON.parse(stored);
        }
        this.saveResolucoes(SAMPLE_RESOLUCOES);
        return SAMPLE_RESOLUCOES;
    },

    saveResolucoes(resolucoes) {
        localStorage.setItem(CONFIG.storageKeys.resolucoes, JSON.stringify(resolucoes));
        state.resolucoes = resolucoes;
    },

    addResolucao(resolucao) {
        const resolucoes = this.getResolucoes();
        const newId = resolucoes.length > 0 ? Math.max(...resolucoes.map(r => r.id)) + 1 : 1;
        resolucao.id = newId;
        resolucoes.unshift(resolucao);
        this.saveResolucoes(resolucoes);
        return resolucao;
    },

    updateResolucao(resolucaoId, updatedData) {
        const resolucoes = this.getResolucoes();
        const index = resolucoes.findIndex(r => r.id === resolucaoId);
        if (index !== -1) {
            resolucoes[index] = { ...resolucoes[index], ...updatedData };
            this.saveResolucoes(resolucoes);
            return resolucoes[index];
        }
        return null;
    },

    deleteResolucao(resolucaoId) {
        const resolucoes = this.getResolucoes();
        const filtered = resolucoes.filter(r => r.id !== resolucaoId);
        this.saveResolucoes(filtered);
        return filtered;
    },

    getResolucoesByYear(ano) {
        const resolucoes = this.getResolucoes();
        return resolucoes.filter(r => r.ano === ano);
    },

    // ===== COMISSOES =====
    getComissoes() {
        return COMISSOES_DATA;
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

// ===== GALERIA DE FOTOS =====
const GALLERY_PHOTOS = [
    {
        id: 1,
        src: 'assets/images/gallery/reuniao-01.jpg',
        title: 'Reuniao Plenaria do CAS/DF',
        description: 'Conselheiros reunidos para deliberacao de pautas importantes',
        category: 'reunioes'
    },
    {
        id: 2,
        src: 'assets/images/gallery/conferencia-01.jpg',
        title: 'Conferencia Distrital de Assistencia Social',
        description: 'Participantes da conferencia debatendo politicas publicas',
        category: 'conferencias'
    },
    {
        id: 3,
        src: 'assets/images/gallery/capacitacao-01.jpg',
        title: 'Capacitacao de Conselheiros',
        description: 'Formacao continuada para conselheiros do CAS/DF',
        category: 'capacitacao'
    },
    {
        id: 4,
        src: 'assets/images/gallery/visita-01.jpg',
        title: 'Visita Tecnica a Entidade',
        description: 'Comissao de Inscricao em visita tecnica',
        category: 'visitas'
    },
    {
        id: 5,
        src: 'assets/images/gallery/posse-01.jpg',
        title: 'Posse dos Novos Conselheiros',
        description: 'Cerimonia de posse da nova gestao 2025-2027',
        category: 'eventos'
    },
    {
        id: 6,
        src: 'assets/images/gallery/comunidade-01.jpg',
        title: 'Acao na Comunidade',
        description: 'CAS/DF presente nas acoes comunitarias',
        category: 'acoes'
    }
];

// ===== CONTEUDO DAS SECOES =====
function getHomeContent() {
    const posts = DataManager.getPosts();

    // Hero Banner humanizado
    const heroBanner = `
        <div class="hero-banner">
            <div class="hero-content">
                <h1 class="hero-title">Construindo Juntos uma Assistencia Social mais Humana</h1>
                <p class="hero-subtitle">O CAS/DF trabalha para garantir direitos e promover a dignidade de todas as pessoas em situacao de vulnerabilidade social no Distrito Federal.</p>
                <div class="hero-buttons">
                    <button class="hero-btn primary" onclick="showSection('sobre')">Conheca o CAS/DF</button>
                    <button class="hero-btn secondary" onclick="showSection('inscricao')">Inscreva sua Entidade</button>
                </div>
            </div>
            <div class="hero-image">
                <div class="hero-icon">&#x1F91D;</div>
            </div>
        </div>
    `;

    // Cards de destaque humanizados
    const featureCards = `
        <div class="features-section">
            <h2 class="section-title">Como Podemos Ajudar</h2>
            <div class="features-grid">
                <div class="feature-card" onclick="showSection('inscricao')">
                    <div class="feature-icon">&#x1F4DD;</div>
                    <h3>Inscricao de Entidades</h3>
                    <p>Cadastre sua organizacao de assistencia social e faca parte da rede de protecao social do DF.</p>
                </div>
                <div class="feature-card" onclick="showSection('reunioes')">
                    <div class="feature-icon">&#x1F465;</div>
                    <h3>Participacao Social</h3>
                    <p>Acompanhe as reunioes do conselho e participe das decisoes sobre politicas publicas.</p>
                </div>
                <div class="feature-card" onclick="showSection('resolucoes')">
                    <div class="feature-icon">&#x1F4DC;</div>
                    <h3>Resolucoes e Normas</h3>
                    <p>Acesse todas as resolucoes e documentos normativos do CAS/DF.</p>
                </div>
                <div class="feature-card" onclick="showSection('conferencias')">
                    <div class="feature-icon">&#x1F3DB;</div>
                    <h3>Conferencias</h3>
                    <p>Participe das conferencias de assistencia social e contribua com propostas.</p>
                </div>
            </div>
        </div>
    `;

    // Estatisticas com visual moderno
    const statsHtml = `
        <div class="social-banner">
            <h2>Numeros que Representam Nosso Compromisso</h2>
            <p class="mb-3">Trabalhando diariamente pela protecao social no Distrito Federal</p>
            <div class="stats-grid">
                <div class="stat-card glass">
                    <div class="stat-number">${posts.length}</div>
                    <div class="stat-label">Publicacoes</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-number">340</div>
                    <div class="stat-label">Reunioes Realizadas</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-number">150+</div>
                    <div class="stat-label">Entidades Inscritas</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-number">31</div>
                    <div class="stat-label">Regioes Atendidas</div>
                </div>
            </div>
        </div>
    `;

    // Posts com design melhorado
    let postsHtml = '';
    posts.forEach(post => {
        const categoryColor = Utils.getCategoryColor(post.category);
        postsHtml += `
            <div class="post-card modern" onclick="openPost(${post.id})">
                <div class="post-image-placeholder">
                    <span>&#x1F4F0;</span>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-category" style="background: ${categoryColor}">${Utils.getCategoryName(post.category)}</span>
                        <span class="post-date">${Utils.formatDate(post.date)}</span>
                    </div>
                    <div class="post-title">${Utils.sanitizeHTML(post.title)}</div>
                    <div class="post-excerpt">${Utils.sanitizeHTML(post.excerpt)}</div>
                    <div class="post-read-more">Ler mais <span>&#x2192;</span></div>
                </div>
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

    // Secao de galeria preview
    const galleryPreview = `
        <div class="gallery-section">
            <h2 class="section-title">Galeria de Fotos</h2>
            <p class="section-subtitle">Momentos que retratam nosso trabalho pela assistencia social</p>
            <div class="gallery-grid">
                ${GALLERY_PHOTOS.slice(0, 4).map(photo => `
                    <div class="gallery-item" onclick="openGalleryPhoto(${photo.id})">
                        <div class="gallery-placeholder">
                            <span>&#x1F4F7;</span>
                            <small>${photo.title}</small>
                        </div>
                        <div class="gallery-overlay">
                            <h4>${photo.title}</h4>
                            <p>${photo.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-3">
                <button class="admin-btn" onclick="showSubSection('reunioes', 'fotos')" style="background: var(--primary-purple);">Ver Todas as Fotos</button>
            </div>
        </div>
    `;

    // Quote inspiracional
    const quoteSection = `
        <div class="quote-card">
            <div class="quote-icon">&#x201C;</div>
            <blockquote>
                A assistencia social e direito do cidadao e dever do Estado. Juntos, construimos uma sociedade mais justa e solidaria.
            </blockquote>
            <cite>- CAS/DF, pela garantia de direitos socioassistenciais</cite>
        </div>
    `;

    // Links rapidos
    const quickAccess = `
        <div class="quick-access-section">
            <h2 class="section-title">Acesso Rapido</h2>
            <div class="quick-access-grid">
                <a href="javascript:void(0)" onclick="showSection('atas')" class="quick-access-card">
                    <span class="quick-icon">&#x1F4CB;</span>
                    <span>Atas das Reunioes</span>
                </a>
                <a href="javascript:void(0)" onclick="showSection('resolucoes')" class="quick-access-card">
                    <span class="quick-icon">&#x1F4DC;</span>
                    <span>Resolucoes</span>
                </a>
                <a href="javascript:void(0)" onclick="showSection('entidades')" class="quick-access-card">
                    <span class="quick-icon">&#x1F3E2;</span>
                    <span>Entidades Inscritas</span>
                </a>
                <a href="javascript:void(0)" onclick="showSection('contato')" class="quick-access-card">
                    <span class="quick-icon">&#x1F4E9;</span>
                    <span>Fale Conosco</span>
                </a>
            </div>
        </div>
    `;

    return `
        ${heroBanner}
        ${featureCards}
        ${statsHtml}

        <div class="news-section">
            <div class="section-header">
                <h2 class="section-title">Ultimas Noticias</h2>
                <div class="admin-buttons">
                    <button class="admin-btn success" onclick="showAddPostForm()">+ Adicionar Post</button>
                    <button class="admin-btn secondary" onclick="showManageCategories()">Categorias</button>
                </div>
            </div>
            <div class="posts-grid modern">${postsHtml}</div>
        </div>

        ${galleryPreview}
        ${quoteSection}
        ${quickAccess}
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
    const resolucoes = DataManager.getResolucoes();
    const totalResolucoes = resolucoes.length;
    const resolucoes2025 = resolucoes.filter(r => r.ano === '2025').length;
    const resolucoes2024 = resolucoes.filter(r => r.ano === '2024').length;

    return `
        <h1 class="page-title">Resolucoes do CAS/DF</h1>
        <div class="admin-help">
            <h4>Documentos Normativos</h4>
            <p>Aqui ficam organizadas todas as resolucoes do CAS/DF por ano, alem do Regimento Interno.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalResolucoes}</div>
                <div class="stat-label">Total de Resolucoes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${resolucoes2025}</div>
                <div class="stat-label">Resolucoes 2025</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${resolucoes2024}</div>
                <div class="stat-label">Resolucoes 2024</div>
            </div>
        </div>
        <div class="admin-buttons mb-2">
            <button class="admin-btn success" onclick="showAddResolucaoForm()">+ Adicionar Resolucao</button>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="showResolucoesTab('2025')">2025</button>
            <button class="tab-btn" onclick="showResolucoesTab('2024')">2024</button>
            <button class="tab-btn" onclick="showResolucoesTab('2023')">2023</button>
            <button class="tab-btn" onclick="showResolucoesTab('anteriores')">Anteriores</button>
            <button class="tab-btn" onclick="showResolucoesTab('regimento')">Regimento Interno</button>
        </div>
        <div id="resolucoesContent">
            ${getResolucoesListHtml('2025')}
        </div>
    `;
}

function getResolucoesListHtml(ano) {
    let resolucoes;
    if (ano === 'anteriores') {
        resolucoes = DataManager.getResolucoes().filter(r => parseInt(r.ano) < 2023);
    } else if (ano === 'regimento') {
        return `
            <div class="placeholder-content">
                <h3>Regimento Interno do CAS/DF</h3>
                <p class="placeholder-text">O Regimento Interno do CAS/DF estabelece as normas de funcionamento do Conselho.</p>
                <div class="admin-buttons mt-2">
                    <button class="admin-btn" onclick="Notifications.info('Download do Regimento Interno')">Baixar Regimento Interno (PDF)</button>
                </div>
            </div>
        `;
    } else {
        resolucoes = DataManager.getResolucoesByYear(ano);
    }

    if (resolucoes.length === 0) {
        return `
            <div class="placeholder-content">
                <h3>Resolucoes ${ano}</h3>
                <p class="placeholder-text">Nenhuma resolucao cadastrada para ${ano === 'anteriores' ? 'anos anteriores' : ano}.</p>
            </div>
        `;
    }

    let html = '<div class="table-container"><table class="data-table"><thead><tr>';
    html += '<th>Numero</th><th>Data</th><th>Titulo</th><th>Tipo</th><th>Acoes</th>';
    html += '</tr></thead><tbody>';

    resolucoes.forEach(r => {
        const tipoLabel = r.tipo === 'normativa' ? 'Normativa' : 'Administrativa';
        html += `
            <tr>
                <td><strong>Res. ${r.numero}/${r.ano}</strong></td>
                <td>${Utils.formatDate(r.data)}</td>
                <td>${Utils.sanitizeHTML(r.titulo)}</td>
                <td><span class="post-category" style="background: ${r.tipo === 'normativa' ? '#16a34a' : '#3b82f6'}">${tipoLabel}</span></td>
                <td>
                    <button class="admin-btn" onclick="openResolucao(${r.id})" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Ver</button>
                    <button class="admin-btn danger" onclick="confirmDeleteResolucao(${r.id})" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Excluir</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    return html;
}

function getAtasContent() {
    const atas = DataManager.getAtas();
    const totalAtas = atas.length;
    const atas2025 = atas.filter(a => a.ano === '2025').length;
    const atas2024 = atas.filter(a => a.ano === '2024').length;

    return `
        <h1 class="page-title">Atas das Reunioes</h1>
        <div class="admin-help">
            <h4>Registro das Reunioes</h4>
            <p>Atas das reunioes plenarias e de comissoes organizadas por periodos.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalAtas}</div>
                <div class="stat-label">Total de Atas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${atas2025}</div>
                <div class="stat-label">Atas 2025</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${atas2024}</div>
                <div class="stat-label">Atas 2024</div>
            </div>
        </div>
        <div class="admin-buttons mb-2">
            <button class="admin-btn success" onclick="showAddAtaForm()">+ Adicionar Ata</button>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="showAtasTab('2025')">2025</button>
            <button class="tab-btn" onclick="showAtasTab('2024')">2024</button>
            <button class="tab-btn" onclick="showAtasTab('2023')">2023</button>
            <button class="tab-btn" onclick="showAtasTab('anteriores')">2010-2022</button>
        </div>
        <div id="atasContent">
            ${getAtasListHtml('2025')}
        </div>
    `;
}

function getAtasListHtml(ano) {
    let atas;
    if (ano === 'anteriores') {
        atas = DataManager.getAtas().filter(a => parseInt(a.ano) < 2023);
    } else {
        atas = DataManager.getAtasByYear(ano);
    }

    if (atas.length === 0) {
        return `
            <div class="placeholder-content">
                <h3>Atas ${ano === 'anteriores' ? '2010-2022' : ano}</h3>
                <p class="placeholder-text">Nenhuma ata cadastrada para ${ano === 'anteriores' ? 'este periodo' : ano}.</p>
            </div>
        `;
    }

    let html = '<div class="table-container"><table class="data-table"><thead><tr>';
    html += '<th>Reuniao</th><th>Data</th><th>Tipo</th><th>Pauta</th><th>Acoes</th>';
    html += '</tr></thead><tbody>';

    atas.forEach(a => {
        const tipoLabel = a.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria';
        html += `
            <tr>
                <td><strong>${a.numero}a Reuniao</strong></td>
                <td>${Utils.formatDate(a.data)}</td>
                <td><span class="post-category" style="background: ${a.tipo === 'ordinaria' ? '#1e3a8a' : '#f97316'}">${tipoLabel}</span></td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Utils.sanitizeHTML(a.pauta)}</td>
                <td>
                    <button class="admin-btn" onclick="openAta(${a.id})" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Ver</button>
                    <button class="admin-btn danger" onclick="confirmDeleteAta(${a.id})" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Excluir</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    return html;
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

        <!-- Informacao Importante -->
        <div style="background: linear-gradient(135deg, #dc2626, #f97316); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">&#x26A0; IMPORTANTE</h3>
            <p style="font-size: 1.1rem;"><strong>Pedidos de inscricao e outros assuntos sobre inscricao:</strong></p>
            <p>Enviar oficio pelo <strong>E-PROTOCOLO</strong></p>
        </div>

        <!-- Cards de Acesso Rapido -->
        <div class="stats-grid">
            <div class="stat-card" onclick="window.open('https://sistemas.df.gov.br/Protocolo/Login', '_blank')" style="cursor: pointer; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">&#x1F4DD;</div>
                <div class="stat-label" style="color: white; font-weight: bold;">E-PROTOCOLO</div>
                <div style="font-size: 0.8rem; opacity: 0.9;">Enviar Oficio</div>
            </div>
            <div class="stat-card" onclick="window.open('https://drive.google.com/drive/folders/1RF9ep5qRAKUfTqcCfN4PEvEitTSIHjL4?usp=sharing', '_blank')" style="cursor: pointer; background: linear-gradient(135deg, #16a34a, #22c55e); color: white;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">&#x1F4C2;</div>
                <div class="stat-label" style="color: white; font-weight: bold;">ORIENTACOES</div>
                <div style="font-size: 0.8rem; opacity: 0.9;">Modelos e Documentos</div>
            </div>
            <div class="stat-card" onclick="window.open('https://wa.me/5561983141354', '_blank')" style="cursor: pointer; background: linear-gradient(135deg, #25d366, #128c7e); color: white;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">&#x1F4F1;</div>
                <div class="stat-label" style="color: white; font-weight: bold;">WHATSAPP</div>
                <div style="font-size: 0.8rem; opacity: 0.9;">(61) 98314-1354</div>
            </div>
        </div>

        <!-- Links Detalhados -->
        <div style="background: white; border-radius: 12px; padding: 2rem; margin-top: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="color: #1e3a8a; margin-bottom: 1.5rem;">Links Importantes</h3>

            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #1e3a8a;">
                <h4 style="color: #1e3a8a; margin-bottom: 0.5rem;">&#x1F4DD; E-Protocolo GDF</h4>
                <p style="color: #6b7280; margin-bottom: 0.5rem;">Sistema para envio de oficios e documentos oficiais</p>
                <a href="https://sistemas.df.gov.br/Protocolo/Login" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500;">https://sistemas.df.gov.br/Protocolo/Login</a>
            </div>

            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #16a34a;">
                <h4 style="color: #16a34a; margin-bottom: 0.5rem;">&#x1F4C2; Orientacoes e Modelo de Plano de Acao</h4>
                <p style="color: #6b7280; margin-bottom: 0.5rem;">Documentos necessarios e modelos para inscricao</p>
                <a href="https://drive.google.com/drive/folders/1RF9ep5qRAKUfTqcCfN4PEvEitTSIHjL4?usp=sharing" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Acessar Google Drive</a>
            </div>

            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #25d366;">
                <h4 style="color: #128c7e; margin-bottom: 0.5rem;">&#x1F4F1; Contato WhatsApp - Secretaria Executiva</h4>
                <p style="color: #6b7280; margin-bottom: 0.5rem;">Tire suas duvidas pelo WhatsApp</p>
                <a href="https://wa.me/5561983141354" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500;">(61) 98314-1354</a>
            </div>
        </div>

        <!-- Submenu -->
        <div style="background: white; border-radius: 12px; padding: 2rem; margin-top: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="color: #1e3a8a; margin-bottom: 1rem;">Mais Informacoes</h3>
            <div class="admin-buttons">
                <button class="admin-btn" onclick="showSubSection('inscricao', 'passo-a-passo')">Passo a Passo</button>
                <button class="admin-btn secondary" onclick="showSubSection('inscricao', 'documentos')">Documentos Necessarios</button>
                <button class="admin-btn secondary" onclick="showSubSection('inscricao', 'acompanhar')">Acompanhar Inscricao</button>
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
    // Tratamento especial para comissoes
    if (section === 'sobre' && subsection === 'comissoes') {
        return getComissoesContent();
    }

    // Tratamento especial para galeria de fotos
    if ((section === 'reunioes' && subsection === 'fotos') ||
        (section === 'conferencias' && subsection === 'fotos')) {
        return getGalleryContent();
    }

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
    content.innerHTML = getResolucoesListHtml(tab);
}

function showAtasTab(tab) {
    document.querySelectorAll('.tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('atasContent');
    content.innerHTML = getAtasListHtml(tab);
}

// ===== FUNCOES DE ATAS =====
function showAddAtaForm() {
    const content = `
        <form onsubmit="handleAddAta(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="ataNumero">Numero da Reuniao *</label>
                    <input type="number" id="ataNumero" name="numero" required placeholder="Ex: 341">
                </div>
                <div class="form-group">
                    <label for="ataTipo">Tipo de Reuniao *</label>
                    <select id="ataTipo" name="tipo" required>
                        <option value="ordinaria">Ordinaria</option>
                        <option value="extraordinaria">Extraordinaria</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="ataData">Data da Reuniao *</label>
                    <input type="date" id="ataData" name="data" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="ataAno">Ano *</label>
                    <select id="ataAno" name="ano" required>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="ataDescricao">Descricao *</label>
                <input type="text" id="ataDescricao" name="descricao" required placeholder="Ex: 341a Reuniao Ordinaria do CAS/DF">
            </div>
            <div class="form-group">
                <label for="ataParticipantes">Participantes</label>
                <input type="text" id="ataParticipantes" name="participantes" placeholder="Ex: Conselheiros titulares e suplentes">
            </div>
            <div class="form-group">
                <label for="ataPauta">Pauta da Reuniao *</label>
                <textarea id="ataPauta" name="pauta" required placeholder="Descreva os principais pontos da pauta" style="min-height: 100px;"></textarea>
            </div>
            <div class="admin-buttons">
                <button type="submit" class="admin-btn success">Salvar Ata</button>
                <button type="button" class="admin-btn secondary" onclick="Modal.close()">Cancelar</button>
            </div>
        </form>
    `;

    Modal.show(content, 'Adicionar Nova Ata');
}

function handleAddAta(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const ata = {
        numero: formData.get('numero'),
        tipo: formData.get('tipo'),
        data: formData.get('data'),
        ano: formData.get('ano'),
        descricao: formData.get('descricao'),
        participantes: formData.get('participantes') || 'Conselheiros titulares e suplentes',
        pauta: formData.get('pauta'),
        arquivo: null
    };

    DataManager.addAta(ata);
    Modal.close();
    Notifications.success('Ata adicionada com sucesso!');
    showSection('atas');
}

function openAta(ataId) {
    const atas = DataManager.getAtas();
    const ata = atas.find(a => a.id === ataId);

    if (!ata) {
        Notifications.error('Ata nao encontrada');
        return;
    }

    const tipoLabel = ata.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria';
    const content = `
        <div class="mb-2">
            <span class="post-category" style="background: ${ata.tipo === 'ordinaria' ? '#1e3a8a' : '#f97316'}">${tipoLabel}</span>
            <span style="margin-left: 1rem; color: #6b7280;">${Utils.formatDate(ata.data)}</span>
        </div>
        <p class="mb-2"><strong>Participantes:</strong> ${Utils.sanitizeHTML(ata.participantes)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
        <h4 style="color: #1e3a8a; margin-bottom: 0.5rem;">Pauta da Reuniao</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; background: #f8f9fa; padding: 1rem; border-radius: 8px;">
            ${Utils.sanitizeHTML(ata.pauta)}
        </div>
        <div class="admin-buttons mt-3">
            <button class="admin-btn" onclick="Notifications.info('Download da ata em PDF')">Baixar PDF</button>
            <button class="admin-btn danger" onclick="confirmDeleteAta(${ata.id})">Excluir Ata</button>
        </div>
    `;

    Modal.show(content, `${ata.numero}a Reuniao ${tipoLabel} - ${ata.ano}`);
}

function confirmDeleteAta(ataId) {
    if (confirm('Tem certeza que deseja excluir esta ata? Esta acao nao pode ser desfeita.')) {
        DataManager.deleteAta(ataId);
        Modal.close();
        Notifications.success('Ata excluida com sucesso!');
        showSection('atas');
    }
}

// ===== FUNCOES DE RESOLUCOES =====
function showAddResolucaoForm() {
    const content = `
        <form onsubmit="handleAddResolucao(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="resNumero">Numero da Resolucao *</label>
                    <input type="number" id="resNumero" name="numero" required placeholder="Ex: 46">
                </div>
                <div class="form-group">
                    <label for="resAno">Ano *</label>
                    <select id="resAno" name="ano" required>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="resData">Data de Aprovacao *</label>
                    <input type="date" id="resData" name="data" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="resTipo">Tipo *</label>
                    <select id="resTipo" name="tipo" required>
                        <option value="normativa">Normativa</option>
                        <option value="administrativa">Administrativa</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="resTitulo">Titulo da Resolucao *</label>
                <input type="text" id="resTitulo" name="titulo" required placeholder="Ex: Resolucao que estabelece...">
            </div>
            <div class="form-group">
                <label for="resEmenta">Ementa *</label>
                <textarea id="resEmenta" name="ementa" required placeholder="Dispoe sobre..." style="min-height: 100px;"></textarea>
            </div>
            <div class="admin-buttons">
                <button type="submit" class="admin-btn success">Salvar Resolucao</button>
                <button type="button" class="admin-btn secondary" onclick="Modal.close()">Cancelar</button>
            </div>
        </form>
    `;

    Modal.show(content, 'Adicionar Nova Resolucao');
}

function handleAddResolucao(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const resolucao = {
        numero: formData.get('numero'),
        ano: formData.get('ano'),
        data: formData.get('data'),
        tipo: formData.get('tipo'),
        titulo: formData.get('titulo'),
        ementa: formData.get('ementa'),
        arquivo: null
    };

    DataManager.addResolucao(resolucao);
    Modal.close();
    Notifications.success('Resolucao adicionada com sucesso!');
    showSection('resolucoes');
}

function openResolucao(resolucaoId) {
    const resolucoes = DataManager.getResolucoes();
    const res = resolucoes.find(r => r.id === resolucaoId);

    if (!res) {
        Notifications.error('Resolucao nao encontrada');
        return;
    }

    const tipoLabel = res.tipo === 'normativa' ? 'Normativa' : 'Administrativa';
    const content = `
        <div class="mb-2">
            <span class="post-category" style="background: ${res.tipo === 'normativa' ? '#16a34a' : '#3b82f6'}">${tipoLabel}</span>
            <span style="margin-left: 1rem; color: #6b7280;">Aprovada em ${Utils.formatDate(res.data)}</span>
        </div>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
        <h4 style="color: #1e3a8a; margin-bottom: 0.5rem;">Ementa</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; background: #f8f9fa; padding: 1rem; border-radius: 8px;">
            ${Utils.sanitizeHTML(res.ementa)}
        </div>
        <div class="admin-buttons mt-3">
            <button class="admin-btn" onclick="Notifications.info('Download da resolucao em PDF')">Baixar PDF</button>
            <button class="admin-btn danger" onclick="confirmDeleteResolucao(${res.id})">Excluir Resolucao</button>
        </div>
    `;

    Modal.show(content, `Resolucao No ${res.numero}/${res.ano} - ${res.titulo}`);
}

function confirmDeleteResolucao(resolucaoId) {
    if (confirm('Tem certeza que deseja excluir esta resolucao? Esta acao nao pode ser desfeita.')) {
        DataManager.deleteResolucao(resolucaoId);
        Modal.close();
        Notifications.success('Resolucao excluida com sucesso!');
        showSection('resolucoes');
    }
}

// ===== FUNCOES DE COMISSOES =====
function getComissoesContent() {
    const comissoes = DataManager.getComissoes();

    let comissoesHtml = '';
    comissoes.forEach(c => {
        comissoesHtml += `
            <div class="post-card" onclick="openComissao(${c.id})" style="cursor: pointer;">
                <div class="post-meta">
                    <span class="post-category" style="background: #1e3a8a;">${c.sigla}</span>
                </div>
                <div class="post-title">${c.nome}</div>
                <div class="post-excerpt">${c.descricao}</div>
            </div>
        `;
    });

    return `
        <h1 class="page-title">Comissoes do CAS/DF</h1>
        <div class="admin-help">
            <h4>Comissoes Tematicas Permanentes</h4>
            <p>O CAS/DF possui comissoes tematicas permanentes responsaveis pela analise e acompanhamento de temas especificos da assistencia social.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${comissoes.length}</div>
                <div class="stat-label">Comissoes Ativas</div>
            </div>
        </div>
        <div class="posts-grid mt-2">
            ${comissoesHtml}
        </div>
    `;
}

function openComissao(comissaoId) {
    const comissoes = DataManager.getComissoes();
    const comissao = comissoes.find(c => c.id === comissaoId);

    if (!comissao) {
        Notifications.error('Comissao nao encontrada');
        return;
    }

    let atribuicoesHtml = '<ul style="margin-left: 1.5rem;">';
    comissao.atribuicoes.forEach(attr => {
        atribuicoesHtml += `<li style="margin-bottom: 0.5rem;">${Utils.sanitizeHTML(attr)}</li>`;
    });
    atribuicoesHtml += '</ul>';

    const content = `
        <div class="mb-2">
            <span class="post-category" style="background: #1e3a8a; font-size: 0.9rem; padding: 0.3rem 0.8rem;">${comissao.sigla}</span>
        </div>
        <p style="color: #6b7280; margin-bottom: 1rem;">${Utils.sanitizeHTML(comissao.descricao)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
        <h4 style="color: #1e3a8a; margin-bottom: 0.5rem;">Atribuicoes</h4>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            ${atribuicoesHtml}
        </div>
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 1rem; border-radius: 8px;">
            <p><strong>Coordenador(a):</strong> ${comissao.coordenador}</p>
        </div>
    `;

    Modal.show(content, comissao.nome);
}

// ===== FUNCOES DE GALERIA =====
function openGalleryPhoto(photoId) {
    const photo = GALLERY_PHOTOS.find(p => p.id === photoId);

    if (!photo) {
        Notifications.error('Foto nao encontrada');
        return;
    }

    const content = `
        <div class="gallery-modal">
            <div class="gallery-photo-container">
                <div class="gallery-placeholder-large">
                    <span style="font-size: 5rem;">&#x1F4F7;</span>
                    <p style="margin-top: 1rem; color: var(--text-gray);">Imagem: ${Utils.sanitizeHTML(photo.title)}</p>
                </div>
            </div>
            <div class="gallery-info mt-2">
                <p class="mb-1"><strong>Categoria:</strong> ${Utils.sanitizeHTML(photo.category)}</p>
                <p>${Utils.sanitizeHTML(photo.description)}</p>
            </div>
            <div class="admin-buttons mt-2">
                <button class="admin-btn secondary" onclick="Modal.close()">Fechar</button>
            </div>
        </div>
    `;

    Modal.show(content, photo.title);
}

function getGalleryContent() {
    return `
        <h1 class="page-title">Galeria de Fotos</h1>
        <div class="admin-help">
            <h4>Album de Fotos do CAS/DF</h4>
            <p>Registros fotograficos de reunioes, conferencias, capacitacoes e eventos do Conselho.</p>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="showGalleryTab('todos')">Todas</button>
            <button class="tab-btn" onclick="showGalleryTab('reunioes')">Reunioes</button>
            <button class="tab-btn" onclick="showGalleryTab('conferencias')">Conferencias</button>
            <button class="tab-btn" onclick="showGalleryTab('eventos')">Eventos</button>
        </div>

        <div class="gallery-section" style="box-shadow: none; padding: 0; margin-top: 1rem;">
            <div class="gallery-grid" id="galleryGrid">
                ${GALLERY_PHOTOS.map(photo => `
                    <div class="gallery-item" onclick="openGalleryPhoto(${photo.id})" data-category="${photo.category}">
                        <div class="gallery-placeholder">
                            <span>&#x1F4F7;</span>
                            <small>${photo.title}</small>
                        </div>
                        <div class="gallery-overlay">
                            <h4>${photo.title}</h4>
                            <p>${photo.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="admin-help mt-3">
            <h4>Adicionar Fotos</h4>
            <p>Para adicionar novas fotos, coloque os arquivos na pasta <code>assets/images/gallery/</code> e atualize o codigo.</p>
        </div>
    `;
}

function showGalleryTab(category) {
    document.querySelectorAll('.tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        if (category === 'todos' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
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
// Atas
window.showAddAtaForm = showAddAtaForm;
window.handleAddAta = handleAddAta;
window.openAta = openAta;
window.confirmDeleteAta = confirmDeleteAta;
// Resolucoes
window.showAddResolucaoForm = showAddResolucaoForm;
window.handleAddResolucao = handleAddResolucao;
window.openResolucao = openResolucao;
window.confirmDeleteResolucao = confirmDeleteResolucao;
// Comissoes
window.openComissao = openComissao;
// Galeria
window.openGalleryPhoto = openGalleryPhoto;
window.showGalleryTab = showGalleryTab;

console.log('Script carregado - Aguardando DOM...');
