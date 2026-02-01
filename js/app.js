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
    return (location.hash.slice(1) || '/');
  }

  function navigate(path) {
    location.hash = path;
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    setupBackToTop();
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
      else if (route === '/regimento') await renderRegimento();
      else if (route === '/planejamento') await renderPlanejamento();
      else if (route === '/resolucoes') await renderResolucoes();
      else if (route === '/atas') await renderAtas();
      else if (route === '/reunioes') await renderReunioes();
      else if (route === '/lives') await renderLives();
      else if (route === '/eleicoes') await renderEleicoes();
      else if (route === '/conferencias') await renderConferencias();
      else if (route === '/conferencias/regionais') await renderConferencias('regionais');
      else if (route === '/entidades') await renderEntidades();
      else if (route === '/fiscalizacao') await renderFiscalizacao();
      else if (route === '/inscricao') await renderInscricao();
      else if (route === '/contato') await renderContato();
      else if (route === '/admin' || route.startsWith('/admin/')) {
        const sub = route === '/admin' ? 'dashboard' : route.slice(7);
        if (window.__renderAdmin) window.__renderAdmin(app, sub);
        else render404();
      }
      else if (route.startsWith('/busca/')) await renderBusca(decodeURIComponent(route.slice(7)));
      else if (route.startsWith('/post/')) await renderPost(parseInt(route.slice(6)));
      else render404();
    } catch (e) {
      app.innerHTML = '<div class="page"><div class="no-results"><p class="no-results__icon">⚠️</p><p>Erro ao carregar conteudo. Tente novamente.</p></div></div>';
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

    document.querySelectorAll('.nav__dropdown').forEach(dd => {
      dd.querySelector('.nav__link--dropdown').addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dd.classList.toggle('open');
        }
      });
    });

    document.querySelectorAll('.nav__submenu a, .nav__link:not(.nav__link--dropdown)').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.querySelectorAll('.nav__dropdown').forEach(d => d.classList.remove('open'));
      });
    });

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

    function doSearch() {
      const q = searchInput.value.trim();
      if (q.length >= 2) {
        navigate('/busca/' + encodeURIComponent(q));
        searchInput.value = '';
        nav.classList.remove('open');
      }
    }
  }

  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function updateActiveNav(route) {
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.remove('active');
      const dr = link.getAttribute('data-route');
      if (dr) {
        if (route === dr || (dr !== '/' && route.startsWith(dr))) {
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

  function shortDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  function breadcrumb(items) {
    return '<nav class="page__breadcrumb">' +
      items.map((item, i) => {
        if (i === items.length - 1) return '<strong>' + item.label + '</strong>';
        return '<a href="' + item.href + '">' + item.label + '</a>';
      }).join(' <span>/</span> ') +
      '</nav>';
  }

  function shareButtons(title, url) {
    const encoded = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url || location.href);
    return '<div class="post-single__share">' +
      '<span>Compartilhar:</span>' +
      '<a class="share-btn share-btn--fb" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '" target="_blank" rel="noopener" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>' +
      '<a class="share-btn share-btn--wa" href="https://wa.me/?text=' + encoded + '%20' + encodedUrl + '" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>' +
      '<a class="share-btn share-btn--tw" href="https://twitter.com/intent/tweet?text=' + encoded + '&url=' + encodedUrl + '" target="_blank" rel="noopener" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>' +
      '</div>';
  }

  // ===== HOME =====
  async function renderHome() {
    const posts = await loadJSON('posts.json');
    const sobre = await loadJSON('sobre.json');
    const entidades = await loadJSON('entidades.json');
    const docs = await loadJSON('documentos.json');
    const reunioes = await loadJSON('reunioes.json');

    const sorted = [...posts].sort((a, b) => new Date(b.data) - new Date(a.data));
    const featured = sorted.filter(p => p.destaque).slice(0, 2);
    const totalRes = docs.resolucoes.anos.reduce((sum, a) => sum + a.documentos.length, 0);
    const proxReuniao = reunioes.calendario_2025.find(c => c.status === 'Agendada');

    let html = '<section class="page fade-in">';

    // Hero
    html += `
      <div class="hero">
        <div class="hero__content">
          <span class="hero__badge">SUAS — Sistema Unico de Assistencia Social</span>
          <h1 class="hero__title">Conselho de Assistencia Social do Distrito Federal</h1>
          <p class="hero__text">Orgao colegiado deliberativo, normativo, fiscalizador e permanente. Controle social, transparencia e participacao popular na politica de assistencia social do DF.</p>
          <div class="hero__actions">
            <a href="#/sobre" class="hero__btn hero__btn--primary">Conheca o CAS/DF</a>
            <a href="#/inscricao" class="hero__btn hero__btn--outline">Inscricao de Entidades</a>
          </div>
        </div>
      </div>`;

    // Stats
    html += `
      <div class="stats">
        <div class="stat">
          <div class="stat__number">${entidades.total}</div>
          <div class="stat__label">Entidades Inscritas</div>
        </div>
        <div class="stat">
          <div class="stat__number">${totalRes}</div>
          <div class="stat__label">Resolucoes Publicadas</div>
        </div>
        <div class="stat">
          <div class="stat__number">${sobre.comissoes.length}</div>
          <div class="stat__label">Comissoes Tematicas</div>
        </div>
        <div class="stat">
          <div class="stat__number">${proxReuniao ? proxReuniao.data.split('/')[0] + '/' + proxReuniao.data.split('/')[1] : '—'}</div>
          <div class="stat__label">Proxima Reuniao</div>
        </div>
      </div>`;

    // Featured posts
    if (featured.length) {
      html += '<div class="section-title"><h2>Destaques</h2></div>';
      html += '<div class="cards">';
      featured.forEach(p => { html += postCard(p, true); });
      html += '</div>';
    }

    // Recent posts
    html += '<div class="section-title"><h2>Ultimas Publicacoes</h2><a href="#/busca/ " class="section-title__link">Ver todas →</a></div>';
    html += '<div class="cards">';
    sorted.slice(0, 6).forEach(p => { html += postCard(p, false); });
    html += '</div>';

    html += '</section>';
    app.innerHTML = html;
  }

  function postCard(p, withCover) {
    let html = '<article class="card">';
    if (withCover) {
      html += '<div class="card__cover">⚖️</div>';
    }
    html += `
        <div class="card__body">
          <span class="card__category">${p.categoria}</span>
          <h3 class="card__title"><a href="#/post/${p.id}">${p.titulo}</a></h3>
          <p class="card__meta">${formatDate(p.data)} — ${p.autor}</p>
          <p class="card__excerpt">${p.resumo}</p>
          <a href="#/post/${p.id}" class="card__link">Ler mais →</a>
        </div>
      </article>`;
    return html;
  }

  // ===== POST SINGLE =====
  async function renderPost(id) {
    const posts = await loadJSON('posts.json');
    const post = posts.find(p => p.id === id);
    if (!post) return render404();

    const url = location.href;

    app.innerHTML = `
      <article class="page fade-in">
        <div class="post-single">
          <div class="post-single__cover">
            <div class="post-single__cover-content">
              <span class="post-single__category">${post.categoria}</span>
              <h1 style="font-size:1.5rem;font-weight:700">${post.titulo}</h1>
            </div>
          </div>
          <div class="post-single__body">
            ${breadcrumb([{href:'#/', label:'Inicio'}, {href:'#/', label:'Posts'}, {label: post.titulo.slice(0,50) + '...'}])}
            <a href="#/" class="post-single__back">← Voltar ao inicio</a>
            <p class="post-single__meta">${formatDate(post.data)} — ${post.autor}</p>
            <div class="post-single__content">${post.conteudo}</div>
            ${shareButtons(post.titulo, url)}
          </div>
        </div>
      </article>`;
  }

  // ===== SOBRE =====
  async function renderSobre(sub) {
    const data = await loadJSON('sobre.json');
    const active = sub || 'geral';

    const bc = [{href:'#/', label:'Inicio'}, {href:'#/sobre', label:'Sobre o CAS/DF'}];
    const subLabels = {presidencia:'Presidencia', secretaria:'Secretaria Executiva', conselheiros:'Conselheiros', comissoes:'Comissoes'};
    if (sub) bc.push({label: subLabels[sub]});

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
          <p class="info-section__text mt-1">${data.presidencia.descricao}</p>
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
            <tbody>${data.conselheiros.sociedade_civil.map(c => '<tr><td>' + c.nome + '</td><td>' + c.segmento + '</td><td>' + c.tipo + '</td></tr>').join('')}</tbody>
          </table>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Representantes Governamentais</h2>
          <table class="doc-table">
            <thead><tr><th>Nome</th><th>Orgao</th><th>Tipo</th></tr></thead>
            <tbody>${data.conselheiros.governamental.map(c => '<tr><td>' + c.nome + '</td><td>' + c.orgao + '</td><td>' + c.tipo + '</td></tr>').join('')}</tbody>
          </table>
        </div>`;
    } else if (active === 'comissoes') {
      content = data.comissoes.map(c => `
        <div class="info-section">
          <h2 class="info-section__title">${c.nome} <span class="badge badge--blue">${c.sigla}</span></h2>
          <p class="info-section__text">${c.descricao}</p>
        </div>`).join('');
    }

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb(bc)}
        <div class="page__header">
          <h1 class="page__title">Sobre o CAS/DF</h1>
          <p class="page__subtitle">Informacoes institucionais do Conselho de Assistencia Social do Distrito Federal</p>
        </div>
        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Navegacao</p>
            <a href="#/sobre" class="sidebar__link ${active === 'geral' ? 'active' : ''}">Visao Geral</a>
            <a href="#/sobre/presidencia" class="sidebar__link ${active === 'presidencia' ? 'active' : ''}">Presidencia</a>
            <a href="#/sobre/secretaria" class="sidebar__link ${active === 'secretaria' ? 'active' : ''}">Secretaria Executiva</a>
            <a href="#/sobre/conselheiros" class="sidebar__link ${active === 'conselheiros' ? 'active' : ''}">Composicao / Conselheiros</a>
            <a href="#/sobre/comissoes" class="sidebar__link ${active === 'comissoes' ? 'active' : ''}">Comissoes Tematicas</a>
            <a href="#/regimento" class="sidebar__link">Regimento Interno</a>
          </aside>
          <div>${content}</div>
        </div>
      </div>`;
  }

  // ===== REGIMENTO INTERNO =====
  async function renderRegimento() {
    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {href:'#/sobre', label:'Sobre o CAS/DF'}, {label:'Regimento Interno'}])}
        <div class="page__header">
          <h1 class="page__title">Regimento Interno do CAS/DF</h1>
          <p class="page__subtitle">Normas de organizacao e funcionamento do Conselho de Assistencia Social do DF</p>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Sobre o Regimento</h2>
          <p class="info-section__text">O Regimento Interno do CAS/DF estabelece as normas de organizacao, funcionamento e procedimentos do Conselho de Assistencia Social do Distrito Federal, em conformidade com a Lei Distrital n. 4.176/2008 e a legislacao federal aplicavel.</p>
          <p class="info-section__text mt-1">O regimento disciplina:</p>
          <ul class="competencias-list mt-1">
            <li>Composicao e mandato dos conselheiros</li>
            <li>Competencias do plenario, da mesa diretora e das comissoes</li>
            <li>Periodicidade e quorum das reunioes</li>
            <li>Processo de votacao e deliberacao</li>
            <li>Procedimentos de inscricao de entidades</li>
            <li>Disposicoes sobre eleicao da mesa diretora</li>
          </ul>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Download</h2>
          <p class="info-section__text">O texto completo do Regimento Interno esta disponivel para consulta e download.</p>
          <p class="mt-1"><a href="#" class="btn btn--primary" target="_blank">Baixar Regimento Interno (PDF)</a></p>
        </div>
      </div>`;
  }

  // ===== PLANEJAMENTO =====
  async function renderPlanejamento() {
    const data = await loadJSON('planejamento.json');

    let objHtml = data.objetivos_estrategicos.map(obj => `
      <div class="info-section">
        <h2 class="info-section__title">${obj.objetivo}</h2>
        <ul>${obj.acoes.map(a => '<li>' + a + '</li>').join('')}</ul>
      </div>`).join('');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Planejamento Estrategico'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">Periodo: ${data.periodo}</p>
        </div>
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
          <ul class="valores-list">${data.valores.map(v => '<li>' + v + '</li>').join('')}</ul>
        </div>
        <div class="section-title mt-2"><h2>Objetivos Estrategicos</h2></div>
        ${objHtml}
        <div class="info-section">
          <h2 class="info-section__title">Indicadores e Metas</h2>
          <table class="doc-table">
            <thead><tr><th>Indicador</th><th>Meta</th></tr></thead>
            <tbody>${data.indicadores.map(i => '<tr><td>' + i.indicador + '</td><td>' + i.meta + '</td></tr>').join('')}</tbody>
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

    let accHtml = res.anos.map((ano, i) => `
      <div class="accordion">
        <div class="accordion__header${i === 0 ? ' open' : ''}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
          <span>${ano.ano} (${ano.documentos.length} documento${ano.documentos.length > 1 ? 's' : ''})</span>
          <span class="accordion__arrow">▼</span>
        </div>
        <div class="accordion__body${i === 0 ? ' open' : ''}">
          <table class="doc-table">
            <thead><tr><th>Numero</th><th>Titulo</th><th>Data</th><th>Link</th></tr></thead>
            <tbody>${ano.documentos.map(d => `<tr><td>${d.numero}</td><td>${d.titulo}</td><td>${shortDate(d.data)}</td><td><a href="${d.link}" target="_blank" rel="noopener">Abrir PDF</a></td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Resolucoes do CAS/DF'}])}
        <div class="page__header">
          <h1 class="page__title">${res.titulo}</h1>
          <p class="page__subtitle">${res.descricao}</p>
        </div>
        ${accHtml}
      </div>`;
  }

  // ===== ATAS =====
  async function renderAtas() {
    const data = await loadJSON('documentos.json');
    const atas = data.atas;

    let accHtml = atas.periodos.map((p, i) => `
      <div class="accordion">
        <div class="accordion__header${i === 0 ? ' open' : ''}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
          <span>${p.periodo} (${p.documentos.length} documento${p.documentos.length > 1 ? 's' : ''})</span>
          <span class="accordion__arrow">▼</span>
        </div>
        <div class="accordion__body${i === 0 ? ' open' : ''}">
          <table class="doc-table">
            <thead><tr><th>Titulo</th><th>Data</th><th>Link</th></tr></thead>
            <tbody>${p.documentos.map(d => `<tr><td>${d.titulo}</td><td>${shortDate(d.data)}</td><td><a href="${d.link}" target="_blank" rel="noopener">Abrir PDF</a></td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Atas de Reunioes'}])}
        <div class="page__header">
          <h1 class="page__title">${atas.titulo}</h1>
          <p class="page__subtitle">${atas.descricao}</p>
        </div>
        ${accHtml}
      </div>`;
  }

  // ===== REUNIOES =====
  async function renderReunioes() {
    const data = await loadJSON('reunioes.json');

    let pautasHtml = data.pautas_recentes.map(p => `
      <div class="info-section">
        <h2 class="info-section__title">Reuniao ${p.tipo} — ${formatDate(p.data)}</h2>
        <ol class="pauta-list">${p.itens.map(i => '<li>' + i + '</li>').join('')}</ol>
      </div>`).join('');

    let calHtml = data.calendario_2025.map(c => `
      <div class="calendar-item">
        <p class="calendar-item__month">${c.mes}</p>
        <p class="calendar-item__date">${c.data}</p>
        <span class="calendar-item__status status--${c.status.toLowerCase()}">${c.status}</span>
      </div>`).join('');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Reunioes do CAS/DF'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}</p>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Informacoes Gerais</h2>
          <ul>
            <li><strong>Local:</strong> ${data.local}</li>
            <li><strong>Horario:</strong> ${data.horario}</li>
            <li><strong>Periodicidade:</strong> ${data.periodicidade}</li>
          </ul>
        </div>
        <div class="section-title mt-2"><h2>Pautas Recentes</h2></div>
        ${pautasHtml}
        <div class="section-title mt-2"><h2>Calendario 2025</h2></div>
        <div class="calendar-grid">${calHtml}</div>
        <div class="info-section mt-2">
          <h2 class="info-section__title">Transmissao ao Vivo</h2>
          <p class="info-section__text">${data.lives.descricao}</p>
          <p class="mt-1"><a href="#/lives" class="btn btn--primary">Ver Lives do CAS/DF</a></p>
        </div>
      </div>`;
  }

  // ===== LIVES =====
  async function renderLives() {
    const data = await loadJSON('reunioes.json');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Lives do CAS/DF'}])}
        <div class="page__header">
          <h1 class="page__title">Lives do CAS/DF</h1>
          <p class="page__subtitle">Transmissoes ao vivo das reunioes e eventos do Conselho de Assistencia Social do DF. Acompanhe pelo YouTube e Facebook.</p>
        </div>
        <div class="live-card">
          <div class="live-card__embed">
            <p style="text-align:center;padding:2rem;color:var(--gray-400)">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:.5rem;display:block;margin-left:auto;margin-right:auto"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              As transmissoes ao vivo serao exibidas aqui.<br>
              Acompanhe tambem pelo canal do YouTube.
            </p>
          </div>
          <div class="live-card__body">
            <h3 class="live-card__title">Proxima transmissao</h3>
            <p class="live-card__meta">${data.lives.descricao}</p>
          </div>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Como assistir</h2>
          <ul>
            <li><strong>YouTube:</strong> Acesse o canal do CAS/DF no YouTube para assistir as reunioes ao vivo e gravadas</li>
            <li><strong>Facebook:</strong> As transmissoes tambem sao realizadas pela pagina do CAS/DF no Facebook</li>
            <li><strong>Presencial:</strong> As reunioes sao abertas ao publico no auditorio da SEDES</li>
          </ul>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Calendario de Reunioes</h2>
          <p class="info-section__text">As reunioes ordinarias acontecem na ${data.periodicidade.toLowerCase()}, as ${data.horario}.</p>
          <p class="mt-1"><a href="#/reunioes" class="btn btn--primary">Ver calendario completo</a></p>
        </div>
      </div>`;
  }

  // ===== ELEICOES =====
  async function renderEleicoes() {
    const data = await loadJSON('eleicoes.json');

    let gestoesHtml = data.gestoes.map(g => `
      <div class="info-section">
        <h2 class="info-section__title">Gestao ${g.periodo} <span class="${g.status === 'Vigente' ? 'green-badge' : 'badge badge--yellow'}">${g.status}</span></h2>
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
        <div class="step__content"><p class="step__title">${e}</p></div>
      </div>`).join('');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Eleicoes do CAS/DF'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}</p>
        </div>
        ${gestoesHtml}
        <div class="info-section">
          <h2 class="info-section__title">Processo Eleitoral</h2>
          <p class="info-section__text mb-1">${data.processo_eleitoral.descricao}</p>
          <div class="steps">${etapasHtml}</div>
        </div>
      </div>`;
  }

  // ===== CONFERENCIAS =====
  async function renderConferencias(sub) {
    const data = await loadJSON('conferencias.json');
    const active = sub || 'distritais';

    const bc = [{href:'#/', label:'Inicio'}, {href:'#/conferencias', label:'Conferencias'}];
    if (sub === 'regionais') bc.push({label: 'Regionais'});

    let content = '';

    if (active === 'distritais') {
      let confHtml = data.conferencias.map(c => `
        <div class="info-section">
          <h2 class="info-section__title">${c.nome} <span class="${c.status === 'Realizada' ? 'green-badge' : 'badge badge--yellow'}">${c.status}</span></h2>
          <ul>
            <li><strong>Tema:</strong> ${c.tema}</li>
            <li><strong>Data:</strong> ${c.data}</li>
            <li><strong>Local:</strong> ${c.local}</li>
          </ul>
        </div>`).join('');

      let histHtml = `
        <div class="info-section">
          <h2 class="info-section__title">Historico de Conferencias</h2>
          <table class="doc-table">
            <thead><tr><th>Edicao</th><th>Ano</th><th>Tema</th></tr></thead>
            <tbody>${data.historico.map(h => '<tr><td>' + h.edicao + 'a</td><td>' + h.ano + '</td><td>' + h.tema + '</td></tr>').join('')}</tbody>
          </table>
        </div>`;

      content = confHtml + histHtml;
    } else {
      let regHtml = '';
      if (data.regionais && data.regionais.etapas_2024) {
        regHtml = `
          <div class="info-section">
            <h2 class="info-section__title">Etapas Regionais 2024</h2>
            <p class="info-section__text mb-1">${data.regionais.descricao}</p>
            <table class="doc-table">
              <thead><tr><th>Regiao</th><th>Data</th><th>Status</th></tr></thead>
              <tbody>${data.regionais.etapas_2024.map(r => `<tr><td>${r.regiao}</td><td>${r.data}</td><td><span class="calendar-item__status status--${r.status.toLowerCase()}">${r.status}</span></td></tr>`).join('')}</tbody>
            </table>
          </div>`;
      }
      content = regHtml || '<div class="info-section"><p class="info-section__text">Informacoes sobre as conferencias regionais serao publicadas em breve.</p></div>';
    }

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb(bc)}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}</p>
        </div>
        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Conferencias</p>
            <a href="#/conferencias" class="sidebar__link ${active === 'distritais' ? 'active' : ''}">Distritais e Nacionais</a>
            <a href="#/conferencias/regionais" class="sidebar__link ${active === 'regionais' ? 'active' : ''}">Regionais</a>
          </aside>
          <div>${content}</div>
        </div>
      </div>`;
  }

  // ===== ENTIDADES =====
  async function renderEntidades() {
    const data = await loadJSON('entidades.json');

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Entidades Inscritas'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}<br>Ultima atualizacao: ${formatDate(data.ultima_atualizacao)}</p>
        </div>
        <div class="search-box">
          <input type="text" id="entidadesSearch" placeholder="Buscar por nome, regiao ou servico...">
        </div>
        <p id="entidadesCount" style="font-size:.88rem;color:var(--gray-500);margin-bottom:1rem"></p>
        <div id="entidadesList"></div>
      </div>`;

    function renderList(term) {
      const filtered = data.entidades.filter(e => {
        if (!term) return true;
        const t = term.toLowerCase();
        return e.nome.toLowerCase().includes(t) || e.regiao.toLowerCase().includes(t) || e.servicos.some(s => s.toLowerCase().includes(t));
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
          <p class="entity-card__name">${highlightText(e.nome, term)} <span class="entity-status entity-status--${e.situacao === 'Regular' ? 'regular' : 'monitoramento'}">${e.situacao}</span></p>
          <div class="entity-card__info"><strong>Inscricao:</strong> ${e.inscricao} | <strong>Validade:</strong> ${shortDate(e.validade)} | <strong>Regiao:</strong> ${highlightText(e.regiao, term)}</div>
          <div class="entity-card__tags">${e.servicos.map(s => '<span class="entity-tag">' + highlightText(s, term) + '</span>').join('')}</div>
        </div>`).join('');
    }

    renderList('');
    document.getElementById('entidadesSearch').addEventListener('input', (e) => { renderList(e.target.value.trim()); });
  }

  // ===== FISCALIZACAO =====
  async function loadSheetCSV(pubKey, gid) {
    const url = 'https://docs.google.com/spreadsheets/d/e/' + pubKey + '/pub?gid=' + gid + '&single=true&output=csv';
    const text = await fetch(url).then(r => r.text());
    if (!text || !text.trim()) return [];

    // Parse CSV properly (handles quoted fields with commas)
    const rows = [];
    const lines = text.split('\n');
    const parseLine = (line) => {
      const cells = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
          cells.push(current.trim()); current = '';
        } else if (ch === '\r') {
          continue;
        } else {
          current += ch;
        }
      }
      cells.push(current.trim());
      return cells;
    };

    const headers = parseLine(lines[0]);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseLine(line);
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = cells[idx] || ''; });
      rows.push(obj);
    }
    return rows;
  }

  function fiscStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('conclu')) return '<span class="fisc-badge fisc-badge--green">Concluido</span>';
    if (s.includes('recebido')) return '<span class="fisc-badge fisc-badge--blue">Relatorio Recebido</span>';
    if (s.includes('aguardando')) return '<span class="fisc-badge fisc-badge--yellow">Aguardando Relatorio</span>';
    if (s.includes('designado')) return '<span class="fisc-badge fisc-badge--gray">Designado</span>';
    if (s.includes('cancelado')) return '<span class="fisc-badge fisc-badge--red">Cancelado</span>';
    return '<span class="fisc-badge fisc-badge--gray">' + (status || 'N/A') + '</span>';
  }

  function fiscPrazoBadge(situacao) {
    const s = (situacao || '').toLowerCase();
    if (s.includes('no prazo')) return '<span class="fisc-prazo fisc-prazo--green">No prazo</span>';
    if (s.includes('vence')) return '<span class="fisc-prazo fisc-prazo--yellow">Vence em breve</span>';
    if (s.includes('atrasado')) return '<span class="fisc-prazo fisc-prazo--red">Atrasado</span>';
    if (s.includes('conclu')) return '<span class="fisc-prazo fisc-prazo--green">Concluido</span>';
    return '<span class="fisc-prazo fisc-prazo--gray">' + (situacao || '—') + '</span>';
  }

  async function renderFiscalizacao() {
    const data = await loadJSON('fiscalizacao.json');

    // Static content
    let stepsHtml = data.processo.map(p => `
      <div class="step">
        <div class="step__number">${p.passo}</div>
        <div class="step__content">
          <p class="step__title">${p.titulo}</p>
          <p class="step__desc">${p.descricao}</p>
        </div>
      </div>`).join('');

    let resultadosHtml = data.resultados_possiveis.map(r => `
      <div class="fisc-resultado fisc-resultado--${r.cor}">
        <strong>${r.resultado}</strong>
        <p>${r.descricao}</p>
      </div>`).join('');

    let itensHtml = data.itens_verificados.map(i => '<li>' + i + '</li>').join('');

    let html = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Fiscalizacao de Entidades'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}</p>
        </div>`;

    // Live data section (only if sheet is configured)
    if (data.sheet_pub_key && data.sheet_gid) {
      html += `
        <div id="fiscDashboard">
          <div class="fisc-loading">
            <div class="loading">Carregando dados da planilha...</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="info-section" style="border-left:4px solid var(--primary);background:var(--primary-50)">
          <h2 class="info-section__title">Painel de Acompanhamento</h2>
          <p class="info-section__text">O painel com dados ao vivo das fiscalizacoes sera ativado em breve. Quando configurado, voce podera acompanhar em tempo real o status de cada fiscalizacao em andamento.</p>
        </div>`;
    }

    // Static info
    html += `
        <div class="info-section">
          <h2 class="info-section__title">Sobre a Fiscalizacao</h2>
          <p class="info-section__text">${data.sobre_fiscalizacao}</p>
          <p class="info-section__text mt-1"><strong>Base legal:</strong> ${data.base_legal}</p>
          <p class="info-section__text mt-1"><strong>Prazo padrao:</strong> ${data.prazo_padrao}</p>
        </div>

        <div class="section-title mt-2"><h2>Etapas do Processo</h2></div>
        <div class="steps">${stepsHtml}</div>

        <div class="info-section mt-2">
          <h2 class="info-section__title">Itens Verificados na Fiscalizacao</h2>
          <ul class="competencias-list">${itensHtml}</ul>
        </div>

        <div class="section-title mt-2"><h2>Resultados Possiveis</h2></div>
        <div class="fisc-resultados">${resultadosHtml}</div>

        <div class="info-section mt-2">
          <h2 class="info-section__title">Contato</h2>
          <p class="info-section__text">Para duvidas sobre fiscalizacoes:</p>
          <ul class="mt-1">
            <li><strong>E-mail:</strong> ${data.contato_fiscalizacao.email}</li>
            <li><strong>Telefone:</strong> ${data.contato_fiscalizacao.telefone}</li>
          </ul>
        </div>
      </div>`;

    app.innerHTML = html;

    // Load live data if configured
    if (data.sheet_pub_key && data.sheet_gid) {
      try {
        const rows = await loadSheetCSV(data.sheet_pub_key, data.sheet_gid);
        renderFiscDashboard(rows);
      } catch (e) {
        document.getElementById('fiscDashboard').innerHTML = `
          <div class="info-section" style="border-left:4px solid #ef4444;background:#fef2f2">
            <h2 class="info-section__title">Erro ao carregar dados</h2>
            <p class="info-section__text">Nao foi possivel acessar a planilha. Verifique se ela esta publicada na web.</p>
          </div>`;
        console.error('Erro ao carregar planilha:', e);
      }
    }
  }

  function renderFiscDashboard(rows) {
    const container = document.getElementById('fiscDashboard');
    if (!container) return;

    if (!rows.length) {
      container.innerHTML = `
        <div class="info-section" style="border-left:4px solid var(--accent);background:#f0fdf4">
          <h2 class="info-section__title">Painel de Acompanhamento — Conectado</h2>
          <p class="info-section__text">A planilha de controle esta conectada ao blog. Quando as primeiras fiscalizacoes forem registradas, os dados aparecerao automaticamente aqui com estatisticas e tabela de acompanhamento.</p>
        </div>`;
      return;
    }

    // Compute stats
    const total = rows.length;
    const concluidas = rows.filter(r => (r['Status'] || '').toLowerCase().includes('conclu')).length;
    const emAndamento = rows.filter(r => {
      const s = (r['Status'] || '').toLowerCase();
      return s.includes('designado') || s.includes('aguardando');
    }).length;
    const recebidos = rows.filter(r => (r['Status'] || '').toLowerCase().includes('recebido')).length;
    const atrasados = rows.filter(r => (r['Situação Prazo'] || r['Situacao Prazo'] || '').toLowerCase().includes('atrasado')).length;
    const taxa = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    let html = `
      <div class="fisc-stats">
        <div class="fisc-stat fisc-stat--total">
          <div class="fisc-stat__number">${total}</div>
          <div class="fisc-stat__label">Total</div>
        </div>
        <div class="fisc-stat fisc-stat--andamento">
          <div class="fisc-stat__number">${emAndamento}</div>
          <div class="fisc-stat__label">Em andamento</div>
        </div>
        <div class="fisc-stat fisc-stat--recebido">
          <div class="fisc-stat__number">${recebidos}</div>
          <div class="fisc-stat__label">Relatorios recebidos</div>
        </div>
        <div class="fisc-stat fisc-stat--concluido">
          <div class="fisc-stat__number">${concluidas}</div>
          <div class="fisc-stat__label">Concluidas</div>
        </div>
        <div class="fisc-stat fisc-stat--atrasado">
          <div class="fisc-stat__number">${atrasados}</div>
          <div class="fisc-stat__label">Atrasadas</div>
        </div>
        <div class="fisc-stat fisc-stat--taxa">
          <div class="fisc-stat__number">${taxa}%</div>
          <div class="fisc-stat__label">Taxa de conclusao</div>
        </div>
      </div>

      <div class="section-title mt-2"><h2>Fiscalizacoes</h2></div>

      <div class="fisc-controls">
        <input type="text" id="fiscSearch" class="fisc-search" placeholder="Buscar por entidade ou conselheiro...">
        <div class="fisc-filters">
          <button class="fisc-filter active" data-filter="todos">Todos</button>
          <button class="fisc-filter" data-filter="andamento">Em andamento</button>
          <button class="fisc-filter" data-filter="recebido">Recebido</button>
          <button class="fisc-filter" data-filter="concluido">Concluido</button>
          <button class="fisc-filter" data-filter="atrasado">Atrasado</button>
        </div>
      </div>

      <div class="fisc-table-wrap">
        <table class="fisc-table">
          <thead>
            <tr>
              <th>Entidade</th>
              <th>Conselheiro</th>
              <th>Designacao</th>
              <th>Prazo</th>
              <th>Status</th>
              <th>Situacao</th>
            </tr>
          </thead>
          <tbody id="fiscTableBody"></tbody>
        </table>
      </div>
      <p id="fiscCount" class="fisc-count"></p>`;

    container.innerHTML = html;

    // Column name detection (handles accent variations)
    function getCol(row, names) {
      for (const n of names) {
        if (row[n] !== undefined) return row[n];
      }
      return '';
    }

    function renderTable(filter, search) {
      const tbody = document.getElementById('fiscTableBody');
      const countEl = document.getElementById('fiscCount');
      if (!tbody) return;

      let filtered = rows;

      // Filter by status
      if (filter === 'andamento') {
        filtered = filtered.filter(r => {
          const s = (getCol(r, ['Status']) || '').toLowerCase();
          return s.includes('designado') || s.includes('aguardando');
        });
      } else if (filter === 'recebido') {
        filtered = filtered.filter(r => (getCol(r, ['Status']) || '').toLowerCase().includes('recebido'));
      } else if (filter === 'concluido') {
        filtered = filtered.filter(r => (getCol(r, ['Status']) || '').toLowerCase().includes('conclu'));
      } else if (filter === 'atrasado') {
        filtered = filtered.filter(r => (getCol(r, ['Situação Prazo', 'Situacao Prazo']) || '').toLowerCase().includes('atrasado'));
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(r => {
          const text = (getCol(r, ['Entidade']) + ' ' + getCol(r, ['Conselheiro'])).toLowerCase();
          return text.includes(q);
        });
      }

      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-400)">Nenhuma fiscalizacao encontrada.</td></tr>';
        countEl.textContent = '0 resultados';
        return;
      }

      tbody.innerHTML = filtered.map(r => {
        const entidade = getCol(r, ['Entidade']);
        const conselheiro = getCol(r, ['Conselheiro']);
        const designacao = getCol(r, ['Data Designação', 'Data Designacao']);
        const prazo = getCol(r, ['Prazo']);
        const status = getCol(r, ['Status']);
        const situacao = getCol(r, ['Situação Prazo', 'Situacao Prazo']);

        return `<tr>
          <td class="fisc-td-entidade">${entidade}</td>
          <td>${conselheiro}</td>
          <td>${designacao}</td>
          <td>${prazo}</td>
          <td>${fiscStatusBadge(status)}</td>
          <td>${fiscPrazoBadge(situacao)}</td>
        </tr>`;
      }).join('');

      countEl.textContent = filtered.length + ' fiscalizac' + (filtered.length !== 1 ? 'oes' : 'ao') + ' encontrada' + (filtered.length !== 1 ? 's' : '');
    }

    // Initial render
    let currentFilter = 'todos';
    renderTable('todos', '');

    // Filter buttons
    document.querySelectorAll('.fisc-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.fisc-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTable(currentFilter, document.getElementById('fiscSearch').value.trim());
      });
    });

    // Search
    document.getElementById('fiscSearch').addEventListener('input', (e) => {
      renderTable(currentFilter, e.target.value.trim());
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

    const cs = data.como_solicitar;

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Inscricao de Entidades'}])}
        <div class="page__header">
          <h1 class="page__title">${data.titulo}</h1>
          <p class="page__subtitle">${data.descricao}</p>
        </div>

        <div class="info-section" style="border-left:4px solid var(--accent);background:linear-gradient(135deg,var(--primary-50),var(--white))">
          <h2 class="info-section__title">${cs.titulo}</h2>
          <p class="info-section__text">${cs.descricao}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:1.25rem">
            <a href="${cs.eprotocolo.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:1rem;padding:1.25rem;background:var(--primary);color:var(--white);border-radius:var(--radius-lg);text-decoration:none;transition:var(--transition);font-weight:600" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--primary)'">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <div>
                <strong style="display:block;font-size:1rem">${cs.eprotocolo.titulo}</strong>
                <span style="font-size:.82rem;opacity:.85;font-weight:400">${cs.eprotocolo.instrucao}</span>
              </div>
            </a>
            <a href="${cs.orientacoes.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:1rem;padding:1.25rem;background:var(--accent);color:var(--white);border-radius:var(--radius-lg);text-decoration:none;transition:var(--transition);font-weight:600" onmouseover="this.style.background='var(--accent-light)'" onmouseout="this.style.background='var(--accent)'">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <div>
                <strong style="display:block;font-size:1rem">${cs.orientacoes.titulo}</strong>
                <span style="font-size:.82rem;opacity:.85;font-weight:400">${cs.orientacoes.descricao}</span>
              </div>
            </a>
          </div>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Quem deve se inscrever</h2>
          <p class="info-section__text">${data.quem_deve_se_inscrever}</p>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Tipos de Inscricao</h2>
          <table class="doc-table">
            <thead><tr><th>Tipo</th><th>Descricao</th></tr></thead>
            <tbody>${data.tipos_inscricao.map(t => '<tr><td><strong>' + t.tipo + '</strong></td><td>' + t.descricao + '</td></tr>').join('')}</tbody>
          </table>
        </div>
        <div class="info-section">
          <h2 class="info-section__title">Documentos Necessarios</h2>
          <ul class="competencias-list">${data.documentos_necessarios.map(d => '<li>' + d + '</li>').join('')}</ul>
        </div>
        <div class="section-title mt-2"><h2>Passo a Passo</h2></div>
        <div class="steps">${stepsHtml}</div>
        <div class="info-section mt-2">
          <h2 class="info-section__title">Prazo e Contato</h2>
          <p class="info-section__text">${data.prazo}</p>
          <ul class="mt-1">
            <li><strong>E-mail:</strong> ${data.contato.email}</li>
            <li><strong>Telefone:</strong> ${data.contato.telefone}</li>
            <li>
              <strong>WhatsApp da Secretaria Executiva:</strong>
              <a href="https://wa.me/55${data.contato.whatsapp.replace(/\D/g,'')}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600"> ${data.contato.whatsapp}</a>
            </li>
            <li><strong>Horario:</strong> ${data.contato.horario}</li>
          </ul>
        </div>
      </div>`;
  }

  // ===== CONTATO =====
  async function renderContato() {
    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label:'Contato'}])}
        <div class="page__header">
          <h1 class="page__title">Fale Conosco</h1>
          <p class="page__subtitle">Entre em contato com o CAS/DF. Responderemos o mais breve possivel.</p>
        </div>
        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Contato Direto</p>
            <div style="padding:.5rem .75rem;font-size:.85rem;color:var(--gray-600);line-height:1.8">
              <p><strong>E-mail</strong><br>cas.df@sedes.df.gov.br</p>
              <p class="mt-1"><strong>Telefone</strong><br>(61) 3223-1532</p>
              <p class="mt-1"><strong>Endereco</strong><br>SEPN 515, Bloco A, Ed. Banco do Brasil, 1o andar, Asa Norte, Brasilia/DF<br>CEP 70770-501</p>
              <p class="mt-1"><strong>Horario</strong><br>Seg a Sex, 9h as 17h</p>
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

    const form = document.getElementById('contactForm');
    const msg = document.getElementById('formMessage');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        const resp = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        if (resp.ok) {
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
          form.reset();
        } else { throw new Error(); }
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

    if (term && term.trim().length >= 1) {
      const q = term.trim().toLowerCase();

      posts.forEach(p => {
        const text = (p.titulo + ' ' + p.resumo + ' ' + stripHTML(p.conteudo)).toLowerCase();
        if (text.includes(q)) {
          results.push({ titulo: p.titulo, resumo: p.resumo, link: '#/post/' + p.id, tipo: 'Post' });
        }
      });

      try {
        const sobre = await loadJSON('sobre.json');
        if (JSON.stringify(sobre).toLowerCase().includes(q)) {
          results.push({ titulo: 'Sobre o CAS/DF', resumo: sobre.descricao.slice(0, 150) + '...', link: '#/sobre', tipo: 'Pagina' });
        }
      } catch {}

      try {
        const plan = await loadJSON('planejamento.json');
        if (JSON.stringify(plan).toLowerCase().includes(q)) {
          results.push({ titulo: plan.titulo, resumo: plan.missao.slice(0, 150) + '...', link: '#/planejamento', tipo: 'Pagina' });
        }
      } catch {}

      try {
        const docs = await loadJSON('documentos.json');
        docs.resolucoes.anos.forEach(ano => {
          ano.documentos.forEach(d => {
            if ((d.titulo + ' ' + d.numero).toLowerCase().includes(q)) {
              results.push({ titulo: 'Resolucao ' + d.numero + ' — ' + d.titulo, resumo: 'Aprovada em ' + formatDate(d.data), link: '#/resolucoes', tipo: 'Resolucao' });
            }
          });
        });
        docs.atas.periodos.forEach(p => {
          p.documentos.forEach(d => {
            if (d.titulo.toLowerCase().includes(q)) {
              results.push({ titulo: d.titulo, resumo: formatDate(d.data), link: '#/atas', tipo: 'Ata' });
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

    // If empty search, show all posts
    if (!term || term.trim().length < 1) {
      const posts2 = await loadJSON('posts.json');
      [...posts2].sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(p => {
        results.push({ titulo: p.titulo, resumo: p.resumo, link: '#/post/' + p.id, tipo: 'Post' });
      });
    }

    const displayTerm = term && term.trim().length >= 1 ? term : '';

    app.innerHTML = `
      <div class="page fade-in">
        ${breadcrumb([{href:'#/', label:'Inicio'}, {label: displayTerm ? 'Busca: "' + displayTerm + '"' : 'Todas as publicacoes'}])}
        <div class="page__header">
          <h1 class="page__title">${displayTerm ? 'Resultados da Busca' : 'Todas as Publicacoes'}</h1>
          <p class="page__subtitle">${results.length} resultado${results.length !== 1 ? 's' : ''}${displayTerm ? ' para "' + displayTerm + '"' : ''}</p>
        </div>
        ${!results.length ? '<div class="no-results"><p class="no-results__icon">🔍</p><p>Nenhum resultado encontrado. Tente termos diferentes.</p></div>' :
          results.map(r => `
            <div class="search-results__item">
              <span class="card__category">${r.tipo}</span>
              <h3><a href="${r.link}">${displayTerm ? highlightText(r.titulo, displayTerm) : r.titulo}</a></h3>
              <p>${displayTerm ? highlightText(r.resumo, displayTerm) : r.resumo}</p>
            </div>`).join('')}
      </div>`;
  }

  // ===== 404 =====
  function render404() {
    app.innerHTML = `
      <div class="page text-center" style="padding:4rem 1rem">
        <p style="font-size:4rem;font-weight:800;color:var(--gray-200)">404</p>
        <p class="page__subtitle" style="margin-top:.5rem">Pagina nao encontrada</p>
        <a href="#/" class="btn btn--primary mt-2">Voltar ao Inicio</a>
      </div>`;
  }

})();
