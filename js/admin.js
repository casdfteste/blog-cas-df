(function () {
  'use strict';

  // ===== Config =====
  const REPO = 'casdfteste/blog-cas-df';
  const BRANCH = 'main';
  // SHA-256 hash of the admin password (default: "casdf2025")
  const PASS_HASH = '6420cc7d63025554736136aef9dbc63fb5907488faaf9ecf3b32f8579363aa47';

  // ===== State =====
  let token = localStorage.getItem('gh_token') || '';
  let isAuthenticated = false;

  // ===== Entry =====
  window.__renderAdmin = async function (app, sub) {
    if (!isAuthenticated) {
      renderLogin(app);
      return;
    }
    if (!token) {
      renderTokenSetup(app);
      return;
    }
    const section = sub || 'dashboard';
    if (section === 'dashboard') await renderDashboard(app);
    else if (section === 'posts') await renderPostsAdmin(app);
    else if (section === 'posts/novo') renderPostForm(app);
    else if (section.startsWith('posts/editar/')) renderPostEdit(app, parseInt(section.split('/')[2]));
    else if (section === 'documentos') await renderDocsAdmin(app);
    else if (section === 'entidades') await renderEntidadesAdmin(app);
    else if (section === 'reunioes') await renderReunioesAdmin(app);
    else if (section === 'config') renderConfig(app);
    else renderDashboard(app);
  };

  // ===== Auth =====
  async function hashPassword(pw) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function renderLogin(app) {
    app.innerHTML = `
      <div class="page fade-in" style="max-width:420px;margin:3rem auto">
        <div class="info-section" style="text-align:center">
          <div style="font-size:2.5rem;margin-bottom:1rem">🔐</div>
          <h2 class="info-section__title" style="justify-content:center;border:none;padding:0">Painel Administrativo</h2>
          <p class="info-section__text mb-2">Digite a senha para acessar o painel de gerenciamento do blog.</p>
          <form id="loginForm" class="form" style="max-width:100%">
            <div class="form__group">
              <input class="form__input" type="password" id="adminPass" placeholder="Senha do painel" required style="text-align:center;font-size:1rem">
            </div>
            <button type="submit" class="btn btn--primary" style="width:100%">Entrar</button>
            <div id="loginError" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>
      </div>`;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('adminPass').value;
      const hash = await hashPassword(pw);
      if (hash === PASS_HASH) {
        isAuthenticated = true;
        if (!token) renderTokenSetup(app);
        else window.__renderAdmin(app, 'dashboard');
      } else {
        const err = document.getElementById('loginError');
        err.className = 'form__message form__message--error';
        err.textContent = 'Senha incorreta.';
      }
    });
  }

  function renderTokenSetup(app) {
    app.innerHTML = `
      <div class="page fade-in" style="max-width:560px;margin:2rem auto">
        <div class="info-section">
          <h2 class="info-section__title">Configuracao Inicial</h2>
          <p class="info-section__text">Para que o painel possa salvar as alteracoes diretamente no blog, e necessario configurar um <strong>Token de Acesso do GitHub</strong> (Personal Access Token).</p>
          <div class="info-section mt-1" style="background:var(--primary-50);padding:1.25rem;border-radius:var(--radius)">
            <p class="info-section__text"><strong>Como gerar o token:</strong></p>
            <ol style="margin:.75rem 0 0 1.25rem;font-size:.88rem;color:var(--gray-600);line-height:1.8">
              <li>Acesse <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener">github.com/settings/tokens/new</a></li>
              <li>Em "Note", coloque: <strong>Blog CAS/DF Admin</strong></li>
              <li>Em "Expiration", escolha: <strong>No expiration</strong> (ou a validade desejada)</li>
              <li>Marque a permissao: <strong>repo</strong> (acesso completo ao repositorio)</li>
              <li>Clique em <strong>Generate token</strong></li>
              <li>Copie o token gerado e cole abaixo</li>
            </ol>
          </div>
          <form id="tokenForm" class="form mt-2" style="max-width:100%">
            <div class="form__group">
              <label class="form__label">Token de Acesso do GitHub</label>
              <input class="form__input" type="password" id="ghToken" placeholder="ghp_xxxxxxxxxxxx" required>
            </div>
            <button type="submit" class="btn btn--primary" style="width:100%">Salvar e Continuar</button>
            <div id="tokenError" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>
      </div>`;

    document.getElementById('tokenForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = document.getElementById('ghToken').value.trim();
      const err = document.getElementById('tokenError');
      try {
        const res = await fetch('https://api.github.com/repos/' + REPO, {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        if (res.ok) {
          token = t;
          localStorage.setItem('gh_token', t);
          window.__renderAdmin(app, 'dashboard');
        } else {
          err.className = 'form__message form__message--error';
          err.textContent = 'Token invalido ou sem permissao. Verifique e tente novamente.';
        }
      } catch {
        err.className = 'form__message form__message--error';
        err.textContent = 'Erro de conexao. Verifique sua internet.';
      }
    });
  }

  // ===== GitHub API =====
  async function ghGet(path) {
    const res = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('Erro ao carregar ' + path);
    const data = await res.json();
    const content = JSON.parse(atob(data.content));
    return { content, sha: data.sha };
  }

  async function ghPut(path, content, sha, message) {
    const res = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || 'Atualizar ' + path,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        sha: sha,
        branch: BRANCH
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erro ao salvar');
    }
    return await res.json();
  }

  // ===== Admin Layout =====
  function adminLayout(app, active, content) {
    const menu = [
      { id: 'dashboard', label: 'Painel', icon: '📊' },
      { id: 'posts', label: 'Posts / Noticias', icon: '📝' },
      { id: 'documentos', label: 'Resolucoes e Atas', icon: '📄' },
      { id: 'entidades', label: 'Entidades', icon: '🏢' },
      { id: 'reunioes', label: 'Reunioes', icon: '📅' },
      { id: 'config', label: 'Configuracoes', icon: '⚙️' },
    ];

    app.innerHTML = `
      <div class="page fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
          <div>
            <h1 class="page__title" style="font-size:1.4rem">Painel Administrativo</h1>
            <p style="font-size:.82rem;color:var(--gray-400)">Gerencie o conteudo do blog CAS/DF</p>
          </div>
          <div style="display:flex;gap:.5rem">
            <a href="#/" class="btn btn--primary" style="font-size:.82rem;padding:.5rem 1rem">Ver Blog</a>
            <button onclick="localStorage.removeItem('gh_token');location.reload()" class="btn" style="font-size:.82rem;padding:.5rem 1rem;background:var(--gray-200);color:var(--gray-600)">Sair</button>
          </div>
        </div>
        <div class="layout-sidebar">
          <aside class="sidebar">
            <p class="sidebar__title">Menu</p>
            ${menu.map(m => '<a href="#/admin/' + m.id + '" class="sidebar__link ' + (active === m.id ? 'active' : '') + '">' + m.icon + ' ' + m.label + '</a>').join('')}
          </aside>
          <div>${content}</div>
        </div>
      </div>`;
  }

  // ===== Dashboard =====
  async function renderDashboard(app) {
    let postsCount = '...', docsCount = '...', entCount = '...';
    try {
      const p = await ghGet('dados/posts.json');
      postsCount = p.content.length;
    } catch {}
    try {
      const d = await ghGet('dados/documentos.json');
      docsCount = d.content.resolucoes.anos.reduce((s, a) => s + a.documentos.length, 0) + d.content.atas.periodos.reduce((s, p) => s + p.documentos.length, 0);
    } catch {}
    try {
      const e = await ghGet('dados/entidades.json');
      entCount = e.content.entidades.length;
    } catch {}

    adminLayout(app, 'dashboard', `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-bottom:2rem">
        <div class="stat"><div class="stat__number">${postsCount}</div><div class="stat__label">Posts publicados</div></div>
        <div class="stat"><div class="stat__number">${docsCount}</div><div class="stat__label">Documentos</div></div>
        <div class="stat"><div class="stat__number">${entCount}</div><div class="stat__label">Entidades inscritas</div></div>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Acoes Rapidas</h2>
        <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:.5rem">
          <a href="#/admin/posts/novo" class="btn btn--primary">+ Novo Post</a>
          <a href="#/admin/documentos" class="btn btn--accent">+ Resolucao / Ata</a>
          <a href="#/admin/entidades" class="btn" style="background:var(--gray-700);color:white">+ Entidade</a>
        </div>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Como funciona</h2>
        <ul>
          <li>Use os formularios para adicionar ou editar conteudo</li>
          <li>Ao clicar <strong>"Salvar"</strong>, as alteracoes sao publicadas automaticamente no blog</li>
          <li>O blog atualiza em ate 1 minuto apos salvar</li>
          <li>Para adicionar <strong>fotos</strong>, faca upload no Google Drive e cole o link no formulario</li>
          <li>Para adicionar <strong>documentos PDF</strong>, faca upload no Google Drive e cole o link compartilhavel</li>
        </ul>
      </div>
    `);
  }

  // ===== Posts Admin =====
  async function renderPostsAdmin(app) {
    let html = '<div class="info-section"><h2 class="info-section__title">Carregando posts...</h2></div>';
    adminLayout(app, 'posts', html);

    try {
      const { content: posts } = await ghGet('dados/posts.json');
      const sorted = [...posts].sort((a, b) => new Date(b.data) - new Date(a.data));

      html = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary)">Posts (${posts.length})</h2>
          <a href="#/admin/posts/novo" class="btn btn--primary" style="font-size:.82rem">+ Novo Post</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          ${sorted.map(p => `
            <div class="entity-card" style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
              <div style="flex:1">
                <p class="entity-card__name">${p.titulo}</p>
                <div class="entity-card__info">${p.data} | ${p.categoria} | ${p.autor} ${p.destaque ? '<span class="green-badge">Destaque</span>' : ''}</div>
              </div>
              <div style="display:flex;gap:.5rem;flex-shrink:0">
                <a href="#/admin/posts/editar/${p.id}" class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:var(--primary-50);color:var(--primary)">Editar</a>
                <button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:#fee2e2;color:#991b1b" onclick="window.__deletePost(${p.id})">Excluir</button>
              </div>
            </div>`).join('')}
        </div>`;

      adminLayout(app, 'posts', html);
    } catch (e) {
      adminLayout(app, 'posts', '<div class="info-section"><p class="info-section__text">Erro ao carregar posts: ' + e.message + '</p></div>');
    }
  }

  window.__deletePost = async function (id) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      const { content: posts, sha } = await ghGet('dados/posts.json');
      const updated = posts.filter(p => p.id !== id);
      await ghPut('dados/posts.json', updated, sha, 'Excluir post #' + id);
      alert('Post excluido com sucesso!');
      location.hash = '#/admin/posts';
      location.reload();
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  };

  // ===== Post Form (Novo) =====
  function renderPostForm(app) {
    adminLayout(app, 'posts', postFormHTML({
      id: 0, titulo: '', data: new Date().toISOString().slice(0, 10), categoria: '',
      autor: 'Secretaria Executiva CAS/DF', resumo: '', conteudo: '', imagem: '', destaque: false
    }, 'Novo Post'));

    setupPostFormHandlers(false);
  }

  async function renderPostEdit(app, id) {
    try {
      const { content: posts } = await ghGet('dados/posts.json');
      const post = posts.find(p => p.id === id);
      if (!post) { adminLayout(app, 'posts', '<p>Post nao encontrado.</p>'); return; }
      adminLayout(app, 'posts', postFormHTML(post, 'Editar Post'));
      setupPostFormHandlers(true);
    } catch (e) {
      adminLayout(app, 'posts', '<p>Erro: ' + e.message + '</p>');
    }
  }

  function postFormHTML(post, title) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary)">${title}</h2>
        <a href="#/admin/posts" style="font-size:.85rem;color:var(--gray-500)">← Voltar</a>
      </div>
      <div class="info-section">
        <form id="postForm" class="form" style="max-width:100%">
          <input type="hidden" id="postId" value="${post.id}">
          <div class="form__group">
            <label class="form__label">Titulo *</label>
            <input class="form__input" type="text" id="postTitulo" value="${post.titulo}" required>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
            <div class="form__group">
              <label class="form__label">Data *</label>
              <input class="form__input" type="date" id="postData" value="${post.data}" required>
            </div>
            <div class="form__group">
              <label class="form__label">Categoria *</label>
              <input class="form__input" type="text" id="postCategoria" value="${post.categoria}" placeholder="Ex: Capacitacao, Resolucoes" required>
            </div>
            <div class="form__group">
              <label class="form__label">Autor</label>
              <input class="form__input" type="text" id="postAutor" value="${post.autor}">
            </div>
          </div>
          <div class="form__group">
            <label class="form__label">Resumo * (aparece no card)</label>
            <textarea class="form__textarea" id="postResumo" rows="3" required style="min-height:80px">${post.resumo}</textarea>
          </div>
          <div class="form__group">
            <label class="form__label">Conteudo * (HTML)</label>
            <div style="display:flex;gap:.3rem;margin-bottom:.5rem;flex-wrap:wrap">
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="wrapTag('b')"><b>N</b></button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="wrapTag('em')"><em>I</em></button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('p')">Paragrafo</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('ul')">Lista</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('h3')">Subtitulo</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('a')">Link</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('img')">Imagem</button>
            </div>
            <textarea class="form__textarea" id="postConteudo" rows="12" required style="font-family:monospace;font-size:.85rem">${post.conteudo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
          <div class="form__group">
            <label class="form__label">URL da Imagem de Capa (opcional — link do Google Drive ou URL externa)</label>
            <input class="form__input" type="text" id="postImagem" value="${post.imagem || ''}" placeholder="https://drive.google.com/...">
          </div>
          <div class="form__group" style="display:flex;align-items:center;gap:.5rem">
            <input type="checkbox" id="postDestaque" ${post.destaque ? 'checked' : ''} style="width:18px;height:18px">
            <label for="postDestaque" style="font-weight:500;color:var(--gray-700)">Marcar como Destaque na pagina inicial</label>
          </div>
          <div style="display:flex;gap:.75rem;margin-top:1rem">
            <button type="submit" class="btn btn--primary" id="postSaveBtn">Salvar e Publicar</button>
            <a href="#/admin/posts" class="btn" style="background:var(--gray-200);color:var(--gray-600)">Cancelar</a>
          </div>
          <div id="postMsg" class="form__message" style="margin-top:.75rem"></div>
        </form>
      </div>`;
  }

  // Editor helpers
  window.wrapTag = function (tag) {
    const ta = document.getElementById('postConteudo');
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = ta.value.substring(start, end);
    ta.value = ta.value.substring(0, start) + '<' + tag + '>' + sel + '</' + tag + '>' + ta.value.substring(end);
    ta.focus();
  };

  window.insertTag = function (tag) {
    const ta = document.getElementById('postConteudo');
    const pos = ta.selectionStart;
    let insert = '';
    if (tag === 'p') insert = '<p>Texto aqui</p>\n';
    else if (tag === 'ul') insert = '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n';
    else if (tag === 'h3') insert = '<h3>Subtitulo</h3>\n';
    else if (tag === 'a') insert = '<a href="https://..." target="_blank">Texto do link</a>';
    else if (tag === 'img') insert = '<img src="https://URL_DA_IMAGEM" alt="Descricao da imagem">';
    ta.value = ta.value.substring(0, pos) + insert + ta.value.substring(pos);
    ta.focus();
  };

  function setupPostFormHandlers(isEdit) {
    document.getElementById('postForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('postSaveBtn');
      const msg = document.getElementById('postMsg');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      try {
        const { content: posts, sha } = await ghGet('dados/posts.json');

        const postData = {
          id: isEdit ? parseInt(document.getElementById('postId').value) : (Math.max(0, ...posts.map(p => p.id)) + 1),
          titulo: document.getElementById('postTitulo').value.trim(),
          data: document.getElementById('postData').value,
          categoria: document.getElementById('postCategoria').value.trim(),
          autor: document.getElementById('postAutor').value.trim(),
          resumo: document.getElementById('postResumo').value.trim(),
          conteudo: document.getElementById('postConteudo').value.trim(),
          imagem: document.getElementById('postImagem').value.trim(),
          destaque: document.getElementById('postDestaque').checked
        };

        let updated;
        if (isEdit) {
          updated = posts.map(p => p.id === postData.id ? postData : p);
        } else {
          updated = [...posts, postData];
        }

        await ghPut('dados/posts.json', updated, sha, (isEdit ? 'Editar' : 'Novo') + ' post: ' + postData.titulo);

        msg.className = 'form__message form__message--success';
        msg.textContent = 'Post salvo com sucesso! O blog sera atualizado em instantes.';

        if (!isEdit) {
          setTimeout(() => { location.hash = '#/admin/posts'; }, 1500);
        }
      } catch (err) {
        msg.className = 'form__message form__message--error';
        msg.textContent = 'Erro ao salvar: ' + err.message;
      }

      btn.disabled = false;
      btn.textContent = 'Salvar e Publicar';
    });
  }

  // ===== Documentos Admin =====
  async function renderDocsAdmin(app) {
    try {
      const { content: docs, sha } = await ghGet('dados/documentos.json');

      const resCount = docs.resolucoes.anos.reduce((s, a) => s + a.documentos.length, 0);
      const atasCount = docs.atas.periodos.reduce((s, p) => s + p.documentos.length, 0);

      adminLayout(app, 'documentos', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Resolucoes e Atas</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Resolucao</h2>
          <form id="resForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Numero *</label><input class="form__input" type="text" id="resNumero" placeholder="001/2025" required></div>
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="resData" required></div>
              <div class="form__group"><label class="form__label">Ano *</label><input class="form__input" type="number" id="resAno" value="2025" required></div>
            </div>
            <div class="form__group"><label class="form__label">Titulo *</label><input class="form__input" type="text" id="resTitulo" required></div>
            <div class="form__group"><label class="form__label">Link do documento (Google Drive) *</label><input class="form__input" type="url" id="resLink" placeholder="https://drive.google.com/..." required></div>
            <button type="submit" class="btn btn--primary">Salvar Resolucao</button>
            <div id="resMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Ata</h2>
          <form id="ataForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="ataData" required></div>
              <div class="form__group"><label class="form__label">Periodo/Ano *</label><input class="form__input" type="text" id="ataPeriodo" value="2025" required></div>
            </div>
            <div class="form__group"><label class="form__label">Titulo *</label><input class="form__input" type="text" id="ataTitulo" placeholder="Ata da Xa Reuniao Ordinaria de 2025" required></div>
            <div class="form__group"><label class="form__label">Link do documento (Google Drive) *</label><input class="form__input" type="url" id="ataLink" placeholder="https://drive.google.com/..." required></div>
            <button type="submit" class="btn btn--accent">Salvar Ata</button>
            <div id="ataMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Documentos cadastrados</h2>
          <p class="info-section__text">${resCount} resolucoes e ${atasCount} atas cadastradas.</p>
        </div>
      `);

      // Resolucao form handler
      document.getElementById('resForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('resMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/documentos.json');
          const ano = parseInt(document.getElementById('resAno').value);
          const novaRes = {
            numero: document.getElementById('resNumero').value.trim(),
            titulo: document.getElementById('resTitulo').value.trim(),
            data: document.getElementById('resData').value,
            link: document.getElementById('resLink').value.trim()
          };
          let anoObj = d.resolucoes.anos.find(a => a.ano === ano);
          if (!anoObj) { anoObj = { ano, documentos: [] }; d.resolucoes.anos.unshift(anoObj); }
          anoObj.documentos.unshift(novaRes);
          d.resolucoes.anos.sort((a, b) => b.ano - a.ano);
          await ghPut('dados/documentos.json', d, s, 'Nova resolucao: ' + novaRes.numero);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Resolucao salva com sucesso!';
          document.getElementById('resForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

      // Ata form handler
      document.getElementById('ataForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('ataMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/documentos.json');
          const periodo = document.getElementById('ataPeriodo').value.trim();
          const novaAta = {
            titulo: document.getElementById('ataTitulo').value.trim(),
            data: document.getElementById('ataData').value,
            link: document.getElementById('ataLink').value.trim()
          };
          let perObj = d.atas.periodos.find(p => p.periodo === periodo);
          if (!perObj) { perObj = { periodo, documentos: [] }; d.atas.periodos.unshift(perObj); }
          perObj.documentos.unshift(novaAta);
          await ghPut('dados/documentos.json', d, s, 'Nova ata: ' + novaAta.titulo);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Ata salva com sucesso!';
          document.getElementById('ataForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

    } catch (e) {
      adminLayout(app, 'documentos', '<p>Erro: ' + e.message + '</p>');
    }
  }

  // ===== Entidades Admin =====
  async function renderEntidadesAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/entidades.json');

      adminLayout(app, 'entidades', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Entidades Inscritas (${data.entidades.length})</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Nova Entidade</h2>
          <form id="entForm" class="form" style="max-width:100%">
            <div class="form__group"><label class="form__label">Nome da Entidade *</label><input class="form__input" type="text" id="entNome" required></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">CNPJ *</label><input class="form__input" type="text" id="entCnpj" required></div>
              <div class="form__group"><label class="form__label">Inscricao (numero) *</label><input class="form__input" type="text" id="entInscricao" placeholder="009/2025" required></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Validade *</label><input class="form__input" type="date" id="entValidade" required></div>
              <div class="form__group"><label class="form__label">Regiao Administrativa *</label><input class="form__input" type="text" id="entRegiao" placeholder="Ex: Ceilandia, Taguatinga" required></div>
            </div>
            <div class="form__group"><label class="form__label">Servicos (separados por virgula)</label><input class="form__input" type="text" id="entServicos" placeholder="Protecao Social Basica, Convivencia e Fortalecimento de Vinculos"></div>
            <div class="form__group">
              <label class="form__label">Situacao</label>
              <select class="form__select" id="entSituacao">
                <option value="Regular">Regular</option>
                <option value="Em monitoramento">Em monitoramento</option>
              </select>
            </div>
            <button type="submit" class="btn btn--primary">Salvar Entidade</button>
            <div id="entMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Entidades cadastradas</h2>
          ${data.entidades.map(e => '<div style="padding:.5rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem"><strong>' + e.nome + '</strong> — ' + e.regiao + ' <span class="entity-status entity-status--' + (e.situacao === 'Regular' ? 'regular' : 'monitoramento') + '">' + e.situacao + '</span></div>').join('')}
        </div>
      `);

      document.getElementById('entForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('entMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/entidades.json');
          const novaEnt = {
            nome: document.getElementById('entNome').value.trim(),
            cnpj: document.getElementById('entCnpj').value.trim(),
            inscricao: document.getElementById('entInscricao').value.trim(),
            validade: document.getElementById('entValidade').value,
            servicos: document.getElementById('entServicos').value.split(',').map(s => s.trim()).filter(Boolean),
            regiao: document.getElementById('entRegiao').value.trim(),
            situacao: document.getElementById('entSituacao').value
          };
          d.entidades.push(novaEnt);
          d.total = d.entidades.length;
          d.ultima_atualizacao = new Date().toISOString().slice(0, 10);
          await ghPut('dados/entidades.json', d, s, 'Nova entidade: ' + novaEnt.nome);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Entidade salva com sucesso!';
          document.getElementById('entForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

    } catch (e) {
      adminLayout(app, 'entidades', '<p>Erro: ' + e.message + '</p>');
    }
  }

  // ===== Reunioes Admin =====
  async function renderReunioesAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/reunioes.json');

      adminLayout(app, 'reunioes', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Reunioes do CAS/DF</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Pauta de Reuniao</h2>
          <form id="pautaForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="pautaData" required></div>
              <div class="form__group"><label class="form__label">Tipo</label>
                <select class="form__select" id="pautaTipo"><option value="Ordinaria">Ordinaria</option><option value="Extraordinaria">Extraordinaria</option></select>
              </div>
            </div>
            <div class="form__group"><label class="form__label">Itens da pauta (um por linha) *</label>
              <textarea class="form__textarea" id="pautaItens" rows="6" placeholder="Aprovacao da ata anterior&#10;Apresentacao do relatorio&#10;Informes da Presidencia" required></textarea>
            </div>
            <button type="submit" class="btn btn--primary">Salvar Pauta</button>
            <div id="pautaMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Atualizar Status do Calendario</h2>
          <p class="info-section__text mb-1">Clique em uma reuniao agendada para marca-la como realizada:</p>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">
            ${data.calendario_2025.map((c, i) => `
              <button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:${c.status === 'Realizada' ? '#dcfce7' : 'var(--primary-50)'};color:${c.status === 'Realizada' ? 'var(--accent-dark)' : 'var(--primary)'}" onclick="window.__markReuniao(${i})">${c.mes} — ${c.status}</button>
            `).join('')}
          </div>
        </div>
      `);

      document.getElementById('pautaForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('pautaMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/reunioes.json');
          const novaPauta = {
            data: document.getElementById('pautaData').value,
            tipo: document.getElementById('pautaTipo').value,
            itens: document.getElementById('pautaItens').value.split('\n').map(l => l.trim()).filter(Boolean)
          };
          d.pautas_recentes.unshift(novaPauta);
          if (d.pautas_recentes.length > 5) d.pautas_recentes = d.pautas_recentes.slice(0, 5);
          await ghPut('dados/reunioes.json', d, s, 'Nova pauta: reuniao ' + novaPauta.data);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Pauta salva com sucesso!';
          document.getElementById('pautaForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

    } catch (e) {
      adminLayout(app, 'reunioes', '<p>Erro: ' + e.message + '</p>');
    }
  }

  window.__markReuniao = async function (index) {
    try {
      const { content: d, sha: s } = await ghGet('dados/reunioes.json');
      if (d.calendario_2025[index].status === 'Agendada') {
        d.calendario_2025[index].status = 'Realizada';
        await ghPut('dados/reunioes.json', d, s, 'Marcar reuniao ' + d.calendario_2025[index].mes + ' como realizada');
        alert('Reuniao de ' + d.calendario_2025[index].mes + ' marcada como realizada!');
        location.reload();
      }
    } catch (e) {
      alert('Erro: ' + e.message);
    }
  };

  // ===== Config =====
  function renderConfig(app) {
    adminLayout(app, 'config', `
      <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Configuracoes</h2>
      <div class="info-section">
        <h2 class="info-section__title">Token do GitHub</h2>
        <p class="info-section__text">Token atual: <code style="background:var(--gray-100);padding:.15rem .4rem;border-radius:4px">${token ? token.slice(0, 8) + '...' + token.slice(-4) : 'Nao configurado'}</code></p>
        <button class="btn mt-1" style="background:var(--gray-200);color:var(--gray-600);font-size:.82rem" onclick="localStorage.removeItem('gh_token');location.reload()">Alterar Token</button>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Sobre o Painel</h2>
        <ul>
          <li>Repositorio: <strong>${REPO}</strong></li>
          <li>Branch: <strong>${BRANCH}</strong></li>
          <li>As alteracoes sao salvas diretamente no GitHub</li>
          <li>O blog atualiza automaticamente via GitHub Pages</li>
        </ul>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Dicas para Fotos e Documentos</h2>
        <ul>
          <li><strong>Fotos:</strong> Faca upload no Google Drive, clique com botao direito > "Compartilhar" > copie o link e cole no campo de imagem</li>
          <li><strong>PDFs (resolucoes, atas):</strong> Faca upload no Google Drive, copie o link compartilhavel e cole no formulario</li>
          <li><strong>Videos:</strong> Publique no YouTube e copie o link para adicionar na pagina de Lives</li>
        </ul>
      </div>
    `);
  }

})();
