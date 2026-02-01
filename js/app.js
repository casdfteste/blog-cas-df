(function () {
  'use strict';

  const app = document.getElementById('app');
  const POSTS_PER_PAGE = 6;
  const cache = {};

  // ===== Data Loading =====
  async function loadJSON(file) {
    if (cache[file]) return cache[file];
    const res = await fetch('dados/' + file);
    if (!res.ok) throw new Error('Erro ao carregar ' + file);
    const data = await res.json();
    cache[file] = data;
    return data;
  }

  // ===== Router =====
  function getRoute() {
    const hash = location.hash.slice(1) || '/';
    return hash;
  }

  function navigate(path) {
    location.hash = path;
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    handleRoute();
  });

  async function handleRoute() {
    const route = getRoute();
    updateActiveNav(route);
    app.innerHTML = '<div class="loading">Carregando...</div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      if (route === '/') await renderHome();
      else if (route === '/sobre') await renderSobre();
      else if (route === '/sobre/presidencia') await renderSobre('presidencia');
      else if (route === '/sobre/secretaria') await renderSobre('secretaria');
      else if (route === '/sobre/conselheiros') await renderSobre('conselheiros');
      else if (route === '/sobre/comissoes') await renderSobre('comissoes');
      else if (route === '/planejamento') await renderPlanejamento();
      else if (route === '/resolucoes') await renderResolucoes();
      else if (route === '/atas') await renderAtas();
      else if (route === '/reunioes') await renderReunioes();
      else if (route === '/eleicoes') await renderEleicoes();
      else if (route === '/conferencias') await renderConferencias();
      else if (route === '/entidades') await renderEntidades();
      else if (route === '/inscricao') await renderInscricao();
      else if (route === '/contato') await renderContato();
      else if (route.startsWith('/busca/')) await renderBusca(decodeURIComponent(route.slice(7)));
      else if (route.startsWith('/post/')) await renderPost(parseInt(route.slice(6)));
      else render404();
    } catch (e) {
      app.innerHTML = '<div class="page"><p class="no-results">Erro ao carregar conteudo. Tente novamente.</p></div>';
      console.error(e);
    }
  }

  // ===== Menu =====
  function setupMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Mobile dropdowns
    document.querySelectorAll('.nav__dropdown').forEach(dd => {
      dd.querySelector('.nav__link--dropdown').addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dd.classList.toggle('open');
        }
      });
    });

    // Close menu on link click (mobile)
    document.querySelectorAll('.nav__submenu a, .nav__link:not(.nav__link--dropdown)').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.querySelectorAll('.nav__dropdown').forEach(d => d.classList.remove('open'));
      });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    function doSearch() {
      const q = searchInput.value.trim();
      if (q.length >= 2) {
        navigate('/busca/' + encodeURIComponent(q));
        searchInput.value = '';
        nav.classList.remove('open');
      }
    }
  }

  function updateActiveNav(route) {
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href) {
        const linkRoute = href.slice(1);
        if (route === linkRoute || (linkRoute !== '/' && route.startsWith(linkRoute))) {
          link.classList.add('active');
        }
      }
    });
  }

  // ===== Helpers =====
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  }

  function highlightText(text, term) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
  }

  // ===== HOME =====
  async function renderHome() {
    const posts = await loadJSON('posts.json');
    const sorted = [...posts].sort((a, b) => new Date(b.data) - new Date(a.data));
    const featured = sorted.filter(p => p.destaque).slice(0, 2);
    const recent = sorted.slice(0, 6);

    let html = `
      <section class="page">
        <div class="hero">
          <h1 class="hero__title">CAS/DF</h1>
          <p class="hero__subtitle">Conselho de Assistencia Social do Distrito Federal — Controle social, transparencia e participacao popular</p>
        </div>`;

    if (featured.length) {
      html += '<h2 class="page__title">Destaques</h2><div class="cards">';
      featured.forEach(p => { html += postCard(p); });
      html += '</div>';
    }

    html += '<h2 class="page__title">Ultimas Publicacoes</h2><div class="cards">';
    recent.forEach(p => { html += postCard(p); });
    html += '</div>';

    html += `<div class="text-center mt-2">
        <a href="#/busca/ " class="btn btn--primary">Ver todas as publicacoes</a>
      </div>`;

    html += '</section>';
    app.innerHTML = html;
  }

  function postCard(p) {
    return `
      <article class="card">
        <div class="card__body">
          <span class="card__category">${p.categoria}</span>
          <h3 class="card__title"><a href="#/post/${p.id}">${p.titulo}</a></h3>
          <p class="card__meta">${formatDate(p.data)} — ${p.autor}</p>
          <p class="card__excerpt">${p.resumo}</p>
          <a href="#/post/${p.id}" class="card__link">Ler mais →</a>
        </div>
      </article>`;
  }

  // ===== POST SINGLE =====
  async function renderPost(id) {
    const posts = await loadJSON('posts.json');
    const post = posts.find(p => p.id === id);
    if (!post) return render404();

    app.innerHTML = `
      <article class="page">
        <div class="post-single">
          <a href="#/" class="post-single__back">← Voltar para o inicio</a>
          <span class="post-single__category">${post.categoria}</span>
          <h1 class="post-single__title">${post.titulo}</h1>
          <p class="post-single__meta">${formatDate(post.data)} — ${post.autor}</p>
          <div class="post-single__content">${post.conteudo}</div>
        </div>
      </article>`;
  }

  // ===== SOBRE =====
  async function renderSobre(sub) {
    const data = await loadJSON('sobre.json');
    const active = sub || 'geral';

    let content = '';

    if (active === 'geral') {
      content = `
        <div class="info-section">
          <h2 class="info-section__title">O que e o CAS/DF</h2>
          <p class="info-section__text">${data.descricao}</p>
          <p class="info-section__text mt-1"><strong>Base legal:</strong> ${data.base_legal}</p>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Competencias</h2>
          <ul class="competencias-list">
            ${data.competencias.map(c => '<li>' + c + '</li>').join('')}
          </ul>
        </div>`;
    } else if (active === 'presidencia') {
      content = `
        <div class="info-section">
          <h2 class="info-section__title">${data.presidencia.titulo}</h2>
          <p class="info-section__text"><strong>${data.presidencia.nome}</strong></p>
          <p class="info-section__text">${data.presidencia.descricao}</p>
        </div>`;
    } else if (active === 'secretaria') {
      const sec = data.secretaria_executiva;
      content = `
        <div class="info-section">
          <h2 class="info-section__title">${sec.titulo}</h2>
          <p class="info-section__text">${sec.descricao}</p>
          <ul class="mt-1">
            <li><strong>E-mail:</strong> ${sec.contato.email}</li>
            <li><strong>Telefone:</strong> ${sec.contato.telefone}</li>
            <li><strong>Endereco:</strong> ${sec.contato.endereco}</li>
          </ul>
        </div>`;
    } else if (active === 'conselheiros') {
      content = `
        <div class="info-section">
          <h2 class="info-section__title">Representantes da Sociedade Civil</h2>
          <table class="doc-table">
            <thead><tr><th>Nome</th><th>Segmento</th><th>Tipo</th></tr></thead>
            <tbody>
              ${data.conselheiros.sociedade_civil.map(c => '<tr><td>' + c.nome + '</td><td>' + c.segmento + '</td><td>' + c.tipo + '</td></tr>').join('')}
            </tbody>
          </table>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Representantes Governamentais</h2>
          <table class="doc-table">
            <thead><tr><th>Nome</th><th>Orgao</th><th>Tipo</th></tr></thead>
            <tbody>
              ${data.conselheiros.governamental.map(c => '<tr><td>' + c.nome + '</td><td>' + c.orgao + '</td><td>' + c.tipo + '</td></tr>').join('')}
            </tbody>
          </table>
        </div>`;
    } else if (active === 'comissoes') {
      content = data.comissoes.map(c => `
        <div class="info-section">
          <h2 class="info-section__title">${c.nome} (${c.sigla})</h2>
          <p class="info-section__text">${c.descricao}</p>
        </div>`).join('');
    }

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">Sobre o CAS/DF</h1>
        <p class="page__subtitle">Informacoes institucionais do Conselho de Assistencia Social do DF</p>
        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Navegacao</p>
            <a href="#/sobre" class="sidebar__link ${active === 'geral' ? 'active' : ''}">Visao Geral</a>
            <a href="#/sobre/presidencia" class="sidebar__link ${active === 'presidencia' ? 'active' : ''}">Presidencia</a>
            <a href="#/sobre/secretaria" class="sidebar__link ${active === 'secretaria' ? 'active' : ''}">Secretaria Executiva</a>
            <a href="#/sobre/conselheiros" class="sidebar__link ${active === 'conselheiros' ? 'active' : ''}">Conselheiros</a>
            <a href="#/sobre/comissoes" class="sidebar__link ${active === 'comissoes' ? 'active' : ''}">Comissoes</a>
          </aside>
          <div>${content}</div>
        </div>
      </div>`;
  }

  // ===== PLANEJAMENTO =====
  async function renderPlanejamento() {
    const data = await loadJSON('planejamento.json');

    let objHtml = data.objetivos_estrategicos.map(obj => `
      <div class="info-section">
        <h2 class="info-section__title">${obj.objetivo}</h2>
        <ul>
          ${obj.acoes.map(a => '<li>' + a + '</li>').join('')}
        </ul>
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">Periodo: ${data.periodo}</p>

        <div class="info-section">
          <h2 class="info-section__title">Missao</h2>
          <p class="info-section__text">${data.missao}</p>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Visao</h2>
          <p class="info-section__text">${data.visao}</p>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Valores</h2>
          <ul class="valores-list">
            ${data.valores.map(v => '<li>' + v + '</li>').join('')}
          </ul>
        </div>

        <h2 class="page__title mt-2">Objetivos Estrategicos</h2>
        ${objHtml}

        <div class="info-section">
          <h2 class="info-section__title">Indicadores e Metas</h2>
          <table class="doc-table">
            <thead><tr><th>Indicador</th><th>Meta</th></tr></thead>
            <tbody>
              ${data.indicadores.map(i => '<tr><td>' + i.indicador + '</td><td>' + i.meta + '</td></tr>').join('')}
            </tbody>
          </table>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Monitoramento</h2>
          <p class="info-section__text">${data.monitoramento}</p>
        </div>
      </div>`;
  }

  // ===== RESOLUCOES =====
  async function renderResolucoes() {
    const data = await loadJSON('documentos.json');
    const res = data.resolucoes;

    let accHtml = res.anos.map(ano => `
      <div class="accordion">
        <div class="accordion__header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
          <span>${ano.ano} (${ano.documentos.length} documento${ano.documentos.length > 1 ? 's' : ''})</span>
          <span class="accordion__arrow">▼</span>
        </div>
        <div class="accordion__body">
          <table class="doc-table">
            <thead><tr><th>Numero</th><th>Titulo</th><th>Data</th><th>Link</th></tr></thead>
            <tbody>
              ${ano.documentos.map(d => `
                <tr>
                  <td>${d.numero}</td>
                  <td>${d.titulo}</td>
                  <td>${formatDate(d.data)}</td>
                  <td><a href="${d.link}" target="_blank" rel="noopener">📄 Abrir</a></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${res.titulo}</h1>
        <p class="page__subtitle">${res.descricao}</p>
        ${accHtml}
      </div>`;
  }

  // ===== ATAS =====
  async function renderAtas() {
    const data = await loadJSON('documentos.json');
    const atas = data.atas;

    let accHtml = atas.periodos.map(p => `
      <div class="accordion">
        <div class="accordion__header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
          <span>${p.periodo} (${p.documentos.length} documento${p.documentos.length > 1 ? 's' : ''})</span>
          <span class="accordion__arrow">▼</span>
        </div>
        <div class="accordion__body">
          <table class="doc-table">
            <thead><tr><th>Titulo</th><th>Data</th><th>Link</th></tr></thead>
            <tbody>
              ${p.documentos.map(d => `
                <tr>
                  <td>${d.titulo}</td>
                  <td>${formatDate(d.data)}</td>
                  <td><a href="${d.link}" target="_blank" rel="noopener">📄 Abrir</a></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${atas.titulo}</h1>
        <p class="page__subtitle">${atas.descricao}</p>
        ${accHtml}
      </div>`;
  }

  // ===== REUNIOES =====
  async function renderReunioes() {
    const data = await loadJSON('reunioes.json');

    let pautasHtml = data.pautas_recentes.map(p => `
      <div class="info-section">
        <h2 class="info-section__title">Reuniao ${p.tipo} — ${formatDate(p.data)}</h2>
        <ol class="pauta-list">
          ${p.itens.map(i => '<li>' + i + '</li>').join('')}
        </ol>
      </div>`).join('');

    let calHtml = data.calendario_2025.map(c => `
      <div class="calendar-item">
        <p class="calendar-item__month">${c.mes}</p>
        <p class="calendar-item__date">${c.data}</p>
        <span class="calendar-item__status status--${c.status.toLowerCase()}">${c.status}</span>
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">${data.descricao}</p>

        <div class="info-section">
          <h2 class="info-section__title">Informacoes Gerais</h2>
          <ul>
            <li><strong>Local:</strong> ${data.local}</li>
            <li><strong>Horario:</strong> ${data.horario}</li>
            <li><strong>Periodicidade:</strong> ${data.periodicidade}</li>
          </ul>
        </div>

        <h2 class="page__title mt-2">Pautas Recentes</h2>
        ${pautasHtml}

        <h2 class="page__title mt-2">Calendario 2025</h2>
        <div class="calendar-grid">
          ${calHtml}
        </div>

        <div class="info-section mt-2">
          <h2 class="info-section__title">Transmissao ao Vivo</h2>
          <p class="info-section__text">${data.lives.descricao}</p>
        </div>
      </div>`;
  }

  // ===== ELEICOES =====
  async function renderEleicoes() {
    const data = await loadJSON('eleicoes.json');

    let gestoesHtml = data.gestoes.map(g => `
      <div class="info-section">
        <h2 class="info-section__title">Gestao ${g.periodo}
          <span class="${g.status === 'Vigente' ? 'green-badge' : ''}">${g.status}</span>
        </h2>
        <p class="info-section__text">${g.composicao}</p>
        <ul class="mt-1">
          <li><strong>Presidente:</strong> ${g.mesa_diretora.presidente}</li>
          <li><strong>Vice-Presidente:</strong> ${g.mesa_diretora.vice_presidente}</li>
          <li><strong>Segmento da Presidencia:</strong> ${g.mesa_diretora.segmento_presidente}</li>
        </ul>
      </div>`).join('');

    let etapasHtml = data.processo_eleitoral.etapas.map((e, i) => `
      <div class="step">
        <div class="step__number">${i + 1}</div>
        <div class="step__content">
          <p class="step__title">${e}</p>
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">${data.descricao}</p>
        ${gestoesHtml}
        <div class="info-section">
          <h2 class="info-section__title">Processo Eleitoral</h2>
          <p class="info-section__text mb-1">${data.processo_eleitoral.descricao}</p>
          <div class="steps">${etapasHtml}</div>
        </div>
      </div>`;
  }

  // ===== CONFERENCIAS =====
  async function renderConferencias() {
    const data = await loadJSON('conferencias.json');

    let confHtml = data.conferencias.map(c => `
      <div class="info-section">
        <h2 class="info-section__title">${c.nome}
          <span class="${c.status === 'Realizada' ? 'green-badge' : ''}">${c.status}</span>
        </h2>
        <ul>
          <li><strong>Tema:</strong> ${c.tema}</li>
          <li><strong>Data:</strong> ${c.data}</li>
          <li><strong>Local:</strong> ${c.local}</li>
        </ul>
      </div>`).join('');

    let regHtml = '';
    if (data.regionais && data.regionais.etapas_2024) {
      regHtml = `
        <div class="info-section">
          <h2 class="info-section__title">Conferencias Regionais 2024</h2>
          <p class="info-section__text mb-1">${data.regionais.descricao}</p>
          <table class="doc-table">
            <thead><tr><th>Regiao</th><th>Data</th><th>Status</th></tr></thead>
            <tbody>
              ${data.regionais.etapas_2024.map(r => `
                <tr>
                  <td>${r.regiao}</td>
                  <td>${r.data}</td>
                  <td><span class="calendar-item__status status--${r.status.toLowerCase()}">${r.status}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    let histHtml = `
      <div class="info-section">
        <h2 class="info-section__title">Historico</h2>
        <table class="doc-table">
          <thead><tr><th>Edicao</th><th>Ano</th><th>Tema</th></tr></thead>
          <tbody>
            ${data.historico.map(h => '<tr><td>' + h.edicao + 'a</td><td>' + h.ano + '</td><td>' + h.tema + '</td></tr>').join('')}
          </tbody>
        </table>
      </div>`;

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">${data.descricao}</p>
        ${confHtml}
        ${regHtml}
        ${histHtml}
      </div>`;
  }

  // ===== ENTIDADES =====
  async function renderEntidades() {
    const data = await loadJSON('entidades.json');
    let searchTerm = '';

    function renderList(term) {
      const filtered = data.entidades.filter(e => {
        if (!term) return true;
        const t = term.toLowerCase();
        return e.nome.toLowerCase().includes(t) ||
               e.regiao.toLowerCase().includes(t) ||
               e.servicos.some(s => s.toLowerCase().includes(t));
      });

      const listEl = document.getElementById('entidadesList');
      const countEl = document.getElementById('entidadesCount');
      if (!listEl) return;

      countEl.textContent = filtered.length + ' entidade' + (filtered.length !== 1 ? 's' : '') + ' encontrada' + (filtered.length !== 1 ? 's' : '');

      if (!filtered.length) {
        listEl.innerHTML = '<div class="no-results"><p class="no-results__icon">🔍</p><p>Nenhuma entidade encontrada.</p></div>';
        return;
      }

      listEl.innerHTML = filtered.map(e => `
        <div class="entity-card">
          <p class="entity-card__name">${highlightText(e.nome, term)}
            <span class="entity-status entity-status--${e.situacao === 'Regular' ? 'regular' : 'monitoramento'}">${e.situacao}</span>
          </p>
          <div class="entity-card__info">
            <strong>Inscricao:</strong> ${e.inscricao} | <strong>Validade:</strong> ${formatDate(e.validade)} | <strong>Regiao:</strong> ${highlightText(e.regiao, term)}
          </div>
          <div class="entity-card__tags">
            ${e.servicos.map(s => '<span class="entity-tag">' + highlightText(s, term) + '</span>').join('')}
          </div>
        </div>`).join('');
    }

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">${data.descricao} Ultima atualizacao: ${formatDate(data.ultima_atualizacao)}</p>
        <div class="search-box">
          <input type="text" id="entidadesSearch" placeholder="Buscar por nome, regiao ou servico...">
        </div>
        <p id="entidadesCount" class="page__text"></p>
        <div id="entidadesList"></div>
      </div>`;

    renderList('');

    document.getElementById('entidadesSearch').addEventListener('input', (e) => {
      renderList(e.target.value.trim());
    });
  }

  // ===== INSCRICAO =====
  async function renderInscricao() {
    const data = await loadJSON('inscricao.json');

    let stepsHtml = data.passo_a_passo.map(p => `
      <div class="step">
        <div class="step__number">${p.passo}</div>
        <div class="step__content">
          <p class="step__title">${p.titulo}</p>
          <p class="step__desc">${p.descricao}</p>
        </div>
      </div>`).join('');

    let docsHtml = data.documentos_necessarios.map(d => '<li>' + d + '</li>').join('');

    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">${data.titulo}</h1>
        <p class="page__subtitle">${data.descricao}</p>

        <div class="info-section">
          <h2 class="info-section__title">Quem deve se inscrever</h2>
          <p class="info-section__text">${data.quem_deve_se_inscrever}</p>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Tipos de Inscricao</h2>
          <table class="doc-table">
            <thead><tr><th>Tipo</th><th>Descricao</th></tr></thead>
            <tbody>
              ${data.tipos_inscricao.map(t => '<tr><td><strong>' + t.tipo + '</strong></td><td>' + t.descricao + '</td></tr>').join('')}
            </tbody>
          </table>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Documentos Necessarios</h2>
          <ul class="competencias-list">${docsHtml}</ul>
        </div>

        <h2 class="page__title mt-2">Passo a Passo</h2>
        <div class="steps">${stepsHtml}</div>

        <div class="info-section mt-2">
          <h2 class="info-section__title">Prazo e Contato</h2>
          <p class="info-section__text">${data.prazo}</p>
          <ul class="mt-1">
            <li><strong>E-mail:</strong> ${data.contato.email}</li>
            <li><strong>Telefone:</strong> ${data.contato.telefone}</li>
            <li><strong>Horario:</strong> ${data.contato.horario}</li>
          </ul>
        </div>
      </div>`;
  }

  // ===== CONTATO =====
  async function renderContato() {
    app.innerHTML = `
      <div class="page">
        <h1 class="page__title">Fale Conosco</h1>
        <p class="page__subtitle">Entre em contato com o CAS/DF. Responderemos o mais breve possivel.</p>

        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Contato Direto</p>
            <div style="padding:.5rem .75rem;font-size:.85rem;color:var(--gray-600);line-height:1.7">
              <p><strong>E-mail</strong><br>cas.df@sedes.df.gov.br</p>
              <p class="mt-1"><strong>Telefone</strong><br>(61) 3223-1532</p>
              <p class="mt-1"><strong>Endereco</strong><br>SEPN 515, Bloco A, Ed. Banco do Brasil, 1o andar, Asa Norte, Brasilia/DF<br>CEP 70770-501</p>
              <p class="mt-1"><strong>Horario</strong><br>Segunda a sexta, 9h as 17h</p>
            </div>
          </aside>

          <div>
            <div class="info-section">
              <h2 class="info-section__title">Enviar Mensagem</h2>
              <form class="form" id="contactForm" action="https://formspree.io/f/cas.df@sedes.df.gov.br" method="POST">
                <div class="form__group">
                  <label class="form__label" for="nome">Nome completo *</label>
                  <input class="form__input" type="text" id="nome" name="nome" required>
                </div>
                <div class="form__group">
                  <label class="form__label" for="email">E-mail *</label>
                  <input class="form__input" type="email" id="email" name="email" required>
                </div>
                <div class="form__group">
                  <label class="form__label" for="assunto">Assunto *</label>
                  <select class="form__select" id="assunto" name="assunto" required>
                    <option value="">Selecione...</option>
                    <option value="Inscricao de Entidade">Inscricao de Entidade</option>
                    <option value="Informacoes sobre Reunioes">Informacoes sobre Reunioes</option>
                    <option value="Denuncias e Fiscalizacao">Denuncias e Fiscalizacao</option>
                    <option value="Duvidas Gerais">Duvidas Gerais</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div class="form__group">
                  <label class="form__label" for="mensagem">Mensagem *</label>
                  <textarea class="form__textarea" id="mensagem" name="mensagem" required></textarea>
                </div>
                <button type="submit" class="btn btn--primary">Enviar Mensagem</button>
                <div id="formMessage" class="form__message"></div>
              </form>
            </div>
          </div>
        </div>
      </div>`;

    // Handle form
    const form = document.getElementById('contactForm');
    const msg = document.getElementById('formMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
          form.reset();
        } else {
          throw new Error();
        }
      } catch {
        msg.className = 'form__message form__message--error';
        msg.textContent = 'Erro ao enviar mensagem. Tente novamente ou entre em contato por e-mail.';
      }
      btn.disabled = false;
      btn.textContent = 'Enviar Mensagem';
    });
  }

  // ===== BUSCA =====
  async function renderBusca(term) {
    const posts = await loadJSON('posts.json');
    const results = [];

    if (term && term.trim().length >= 2) {
      const q = term.trim().toLowerCase();

      // Search posts
      posts.forEach(p => {
        const text = (p.titulo + ' ' + p.resumo + ' ' + stripHTML(p.conteudo)).toLowerCase();
        if (text.includes(q)) {
          results.push({
            titulo: p.titulo,
            resumo: p.resumo,
            link: '#/post/' + p.id,
            tipo: 'Post'
          });
        }
      });

      // Search in other data files
      try {
        const sobre = await loadJSON('sobre.json');
        const sobreText = JSON.stringify(sobre).toLowerCase();
        if (sobreText.includes(q)) {
          results.push({ titulo: 'Sobre o CAS/DF', resumo: sobre.descricao, link: '#/sobre', tipo: 'Pagina' });
        }
      } catch {}

      try {
        const plan = await loadJSON('planejamento.json');
        const planText = JSON.stringify(plan).toLowerCase();
        if (planText.includes(q)) {
          results.push({ titulo: plan.titulo, resumo: plan.missao, link: '#/planejamento', tipo: 'Pagina' });
        }
      } catch {}

      try {
        const docs = await loadJSON('documentos.json');
        docs.resolucoes.anos.forEach(ano => {
          ano.documentos.forEach(d => {
            if ((d.titulo + ' ' + d.numero).toLowerCase().includes(q)) {
              results.push({ titulo: 'Resolucao ' + d.numero + ' — ' + d.titulo, resumo: 'Resolucao aprovada em ' + formatDate(d.data), link: '#/resolucoes', tipo: 'Documento' });
            }
          });
        });
        docs.atas.periodos.forEach(p => {
          p.documentos.forEach(d => {
            if (d.titulo.toLowerCase().includes(q)) {
              results.push({ titulo: d.titulo, resumo: 'Ata de ' + formatDate(d.data), link: '#/atas', tipo: 'Documento' });
            }
          });
        });
      } catch {}

      try {
        const ent = await loadJSON('entidades.json');
        ent.entidades.forEach(e => {
          if ((e.nome + ' ' + e.regiao + ' ' + e.servicos.join(' ')).toLowerCase().includes(q)) {
            results.push({ titulo: e.nome, resumo: 'Entidade inscrita — Regiao: ' + e.regiao, link: '#/entidades', tipo: 'Entidade' });
          }
        });
      } catch {}
    }

    let html = `
      <div class="page">
        <h1 class="page__title">Resultados da Busca</h1>
        <p class="page__subtitle">${results.length} resultado${results.length !== 1 ? 's' : ''} para "${term}"</p>`;

    if (!results.length) {
      html += '<div class="no-results"><p class="no-results__icon">🔍</p><p>Nenhum resultado encontrado. Tente termos diferentes.</p></div>';
    } else {
      html += results.map(r => `
        <div class="search-results__item">
          <span class="card__category">${r.tipo}</span>
          <h3><a href="${r.link}">${highlightText(r.titulo, term)}</a></h3>
          <p>${highlightText(r.resumo, term)}</p>
        </div>`).join('');
    }

    html += '</div>';
    app.innerHTML = html;
  }

  // ===== 404 =====
  function render404() {
    app.innerHTML = `
      <div class="page text-center" style="padding:4rem 1rem">
        <h1 style="font-size:3rem;color:var(--gray-300)">404</h1>
        <p class="page__subtitle">Pagina nao encontrada</p>
        <a href="#/" class="btn btn--primary mt-2">Voltar ao Inicio</a>
      </div>`;
  }

})();
