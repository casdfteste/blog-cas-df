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
    else if (section === 'conferencias') await renderConferenciasAdmin(app);
    else if (section === 'eleicoes') await renderEleicoesAdmin(app);
    else if (section === 'sobre') await renderSobreAdmin(app);
    else if (section === 'legislacao') await renderLegislacaoAdmin(app);
    else if (section === 'config') renderConfig(app);
    else if (section === 'manual') renderManual(app);
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
          <h2 class="info-section__title">Configuração Inicial</h2>
          <p class="info-section__text">Para que o painel possa salvar as alterações diretamente no blog, é necessário configurar um <strong>Token de Acesso do GitHub</strong> (Personal Access Token).</p>
          <div class="info-section mt-1" style="background:var(--primary-50);padding:1.25rem;border-radius:var(--radius)">
            <p class="info-section__text"><strong>Como gerar o token:</strong></p>
            <ol style="margin:.75rem 0 0 1.25rem;font-size:.88rem;color:var(--gray-600);line-height:1.8">
              <li>Acesse <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener">github.com/settings/tokens/new</a></li>
              <li>Em "Note", coloque: <strong>Blog CAS/DF Admin</strong></li>
              <li>Em "Expiration", escolha: <strong>No expiration</strong> (ou a validade desejada)</li>
              <li>Marque a permissão: <strong>repo</strong> (acesso completo ao repositorio)</li>
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
          err.textContent = 'Token inválido ou sem permissão. Verifique e tente novamente.';
        }
      } catch {
        err.className = 'form__message form__message--error';
        err.textContent = 'Erro de conexão. Verifique sua internet.';
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
    const binary = atob(data.content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const text = new TextDecoder('utf-8').decode(bytes);
    const content = JSON.parse(text);
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
      { id: 'posts', label: 'Posts / Notícias', icon: '📝' },
      { id: 'documentos', label: 'Resoluções e Atas', icon: '📄' },
      { id: 'entidades', label: 'Entidades', icon: '🏢' },
      { id: 'reunioes', label: 'Reuniões', icon: '📅' },
      { id: 'conferencias', label: 'Conferências', icon: '🎤' },
      { id: 'eleicoes', label: 'Eleições', icon: '🗳️' },
      { id: 'sobre', label: 'Sobre / Conselheiros', icon: '👥' },
      { id: 'legislacao', label: 'Legislação', icon: '⚖️' },
      { id: 'config', label: 'Configurações', icon: '⚙️' },
      { id: 'manual', label: 'Manual', icon: '📖' },
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
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-bottom:2rem">
        <div class="stat"><div class="stat__number">${postsCount}</div><div class="stat__label">Posts publicados</div></div>
        <div class="stat"><div class="stat__number">${docsCount}</div><div class="stat__label">Documentos</div></div>
        <div class="stat"><div class="stat__number">${entCount}</div><div class="stat__label">Entidades inscritas</div></div>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Ações Rápidas</h2>
        <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:.5rem">
          <a href="#/admin/posts/novo" class="btn btn--primary">+ Novo Post</a>
          <a href="#/admin/documentos" class="btn btn--accent">+ Resolução / Ata</a>
          <a href="#/admin/entidades" class="btn" style="background:var(--gray-700);color:white">+ Entidade</a>
          <a href="#/admin/sobre" class="btn" style="background:var(--primary-50);color:var(--primary)">Editar Conselheiros</a>
          <a href="#/admin/eleicoes" class="btn" style="background:var(--primary-50);color:var(--primary)">Editar Gestão</a>
        </div>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Seções do Painel</h2>
        <ul>
          <li><strong>Posts / Notícias:</strong> Criar, editar e excluir publicações do blog</li>
          <li><strong>Resoluções e Atas:</strong> Cadastrar documentos oficiais com links para PDF</li>
          <li><strong>Entidades:</strong> Gerenciar entidades inscritas no CAS/DF</li>
          <li><strong>Reuniões:</strong> Adicionar pautas e atualizar calendario</li>
          <li><strong>Conferências:</strong> Registrar conferências distritais, nacionais e regionais</li>
          <li><strong>Eleições:</strong> Atualizar dados da gestao e mesa diretora</li>
          <li><strong>Sobre / Conselheiros:</strong> Editar nomes, presidencia e dados institucionais</li>
        </ul>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Como funciona</h2>
        <ul>
          <li>Use os formulários para adicionar ou editar conteudo</li>
          <li>Ao clicar <strong>"Salvar"</strong>, as alterações sao publicadas automaticamente no blog</li>
          <li>O blog atualiza em ate 1 minuto após salvar</li>
          <li>Para adicionar <strong>fotos</strong>, faca upload no Google Drive e cole o link no formulário</li>
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
      alert('Post excluído com sucesso!');
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
      if (!post) { adminLayout(app, 'posts', '<p>Post não encontrado.</p>'); return; }
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
            <label class="form__label">Título *</label>
            <input class="form__input" type="text" id="postTitulo" value="${post.titulo}" required>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
            <div class="form__group">
              <label class="form__label">Data *</label>
              <input class="form__input" type="date" id="postData" value="${post.data}" required>
            </div>
            <div class="form__group">
              <label class="form__label">Categoria *</label>
              <input class="form__input" type="text" id="postCategoria" value="${post.categoria}" placeholder="Ex: Capacitação, Resoluções" required>
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
            <label class="form__label">Conteúdo * (HTML)</label>
            <div style="display:flex;gap:.3rem;margin-bottom:.5rem;flex-wrap:wrap">
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="wrapTag('b')"><b>N</b></button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="wrapTag('em')"><em>I</em></button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('p')">Parágrafo</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('ul')">Lista</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('h3')">Subtítulo</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('a')">Link</button>
              <button type="button" class="btn" style="font-size:.72rem;padding:.25rem .5rem;background:var(--gray-100);color:var(--gray-700)" onclick="insertTag('img')">Imagem</button>
            </div>
            <textarea class="form__textarea" id="postConteudo" rows="12" required style="font-family:monospace;font-size:.85rem">${post.conteudo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
          <div class="form__group">
            <label class="form__label">URL da Imagem de Capa (opcional - link do Google Drive ou URL externa)</label>
            <input class="form__input" type="text" id="postImagem" value="${post.imagem || ''}" placeholder="https://drive.google.com/...">
          </div>
          <div class="form__group" style="display:flex;align-items:center;gap:.5rem">
            <input type="checkbox" id="postDestaque" ${post.destaque ? 'checked' : ''} style="width:18px;height:18px">
            <label for="postDestaque" style="font-weight:500;color:var(--gray-700)">Marcar como Destaque na página inicial</label>
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
    else if (tag === 'h3') insert = '<h3>Subtítulo</h3>\n';
    else if (tag === 'a') insert = '<a href="https://..." target="_blank">Texto do link</a>';
    else if (tag === 'img') insert = '<img src="https://URL_DA_IMAGEM" alt="Descrição da imagem">';
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
        msg.textContent = 'Post salvo com sucesso! O blog será atualizado em instantes.';

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
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Resoluções e Atas</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Resolução</h2>
          <form id="resForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Número *</label><input class="form__input" type="text" id="resNumero" placeholder="001/2025" required></div>
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="resData" required></div>
              <div class="form__group"><label class="form__label">Ano *</label><input class="form__input" type="number" id="resAno" value="2025" required></div>
            </div>
            <div class="form__group"><label class="form__label">Título *</label><input class="form__input" type="text" id="resTitulo" required></div>
            <div class="form__group"><label class="form__label">Link do documento (Google Drive) *</label><input class="form__input" type="url" id="resLink" placeholder="https://drive.google.com/..." required></div>
            <button type="submit" class="btn btn--primary">Salvar Resolução</button>
            <div id="resMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Ata</h2>
          <form id="ataForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="ataData" required></div>
              <div class="form__group"><label class="form__label">Período/Ano *</label><input class="form__input" type="text" id="ataPeriodo" value="2025" required></div>
            </div>
            <div class="form__group"><label class="form__label">Título *</label><input class="form__input" type="text" id="ataTitulo" placeholder="Ata da Xa Reunião Ordinária de 2025" required></div>
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

      // Resolução form handler
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
          await ghPut('dados/documentos.json', d, s, 'Nova resolução: ' + novaRes.numero);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Resolução salva com sucesso!';
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
              <div class="form__group"><label class="form__label">Inscrição (numero) *</label><input class="form__input" type="text" id="entInscricao" placeholder="009/2025" required></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Validade *</label><input class="form__input" type="date" id="entValidade" required></div>
              <div class="form__group"><label class="form__label">Região Administrativa *</label><input class="form__input" type="text" id="entRegiao" placeholder="Ex: Ceilandia, Taguatinga" required></div>
            </div>
            <div class="form__group"><label class="form__label">Serviços (separados por virgula)</label><input class="form__input" type="text" id="entServicos" placeholder="Proteção Social Básica, Convivência e Fortalecimento de Vínculos"></div>
            <div class="form__group">
              <label class="form__label">Situação</label>
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
          ${data.entidades.map(e => '<div style="padding:.5rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem"><strong>' + e.nome + '</strong> - ' + e.regiao + ' <span class="entity-status entity-status--' + (e.situacao === 'Regular' ? 'regular' : 'monitoramento') + '">' + e.situacao + '</span></div>').join('')}
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
            serviços: document.getElementById('entServicos').value.split(',').map(s => s.trim()).filter(Boolean),
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

  // ===== Reuniões Admin =====
  async function renderReunioesAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/reunioes.json');

      adminLayout(app, 'reunioes', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Reuniões do CAS/DF</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Pauta de Reunião</h2>
          <form id="pautaForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="pautaData" required></div>
              <div class="form__group"><label class="form__label">Tipo</label>
                <select class="form__select" id="pautaTipo"><option value="Ordinária">Ordinária</option><option value="Extraordinária">Extraordinária</option></select>
              </div>
            </div>
            <div class="form__group"><label class="form__label">Itens da pauta (um por linha) *</label>
              <textarea class="form__textarea" id="pautaItens" rows="6" placeholder="Aprovação da ata anterior&#10;Apresentação do relatório&#10;Informes da Presidência" required></textarea>
            </div>
            <button type="submit" class="btn btn--primary">Salvar Pauta</button>
            <div id="pautaMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Atualizar Status do Calendário</h2>
          <p class="info-section__text mb-1">Clique em uma reunião agendada para marcá-la como realizada:</p>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">
            ${data.calendario_2025.map((c, i) => `
              <button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:${c.status === 'Realizada' ? '#dcfce7' : 'var(--primary-50)'};color:${c.status === 'Realizada' ? 'var(--accent-dark)' : 'var(--primary)'}" onclick="window.__markReuniao(${i})">${c.mes} - ${c.status}</button>
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
          await ghPut('dados/reunioes.json', d, s, 'Nova pauta: reunião' + novaPauta.data);
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
        await ghPut('dados/reunioes.json', d, s, 'Marcar reunião ' + d.calendario_2025[index].mes + ' como realizada');
        alert('Reunião de ' + d.calendario_2025[index].mes + ' marcada como realizada!');
        location.reload();
      }
    } catch (e) {
      alert('Erro: ' + e.message);
    }
  };

  // ===== Conferências Admin =====
  async function renderConferenciasAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/conferencias.json');

      adminLayout(app, 'conferencias', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Conferências (${data.conferencias.length})</h2>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Conferência</h2>
          <form id="confForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Tipo *</label>
                <select class="form__select" id="confTipo"><option value="Distrital">Distrital</option><option value="Nacional">Nacional</option><option value="Regional">Regional</option></select>
              </div>
              <div class="form__group"><label class="form__label">Status *</label>
                <select class="form__select" id="confStatus"><option value="Realizada">Realizada</option><option value="Agendada">Agendada</option><option value="Aguardando convocação">Aguardando convocação</option></select>
              </div>
            </div>
            <div class="form__group"><label class="form__label">Nome *</label><input class="form__input" type="text" id="confNome" placeholder="XII Conferência Distrital de Assistência Social" required></div>
            <div class="form__group"><label class="form__label">Tema *</label><input class="form__input" type="text" id="confTema" required></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="text" id="confData" placeholder="Outubro de 2024" required></div>
              <div class="form__group"><label class="form__label">Local *</label><input class="form__input" type="text" id="confLocal" placeholder="Centro de Convenções..." required></div>
            </div>
            <div class="form__group"><label class="form__label">Link das deliberações (Google Drive)</label><input class="form__input" type="text" id="confLink" placeholder="https://drive.google.com/..."></div>
            <button type="submit" class="btn btn--primary">Salvar Conferência</button>
            <div id="confMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Conferências cadastradas</h2>
          ${data.conferencias.map((c, i) => '<div style="padding:.75rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem;display:flex;justify-content:space-between;align-items:center"><div><strong>' + c.nome + '</strong><br><span style="color:var(--gray-400)">' + c.data + ' - ' + c.status + '</span></div><button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:#fee2e2;color:#991b1b" onclick="window.__deleteConf(' + i + ')">Excluir</button></div>').join('')}
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Adicionar Etapa Regional</h2>
          <form id="regForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Região *</label><input class="form__input" type="text" id="regRegiao" placeholder="Ceilandia e Samambaia" required></div>
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="text" id="regData" placeholder="Agosto/2024" required></div>
              <div class="form__group"><label class="form__label">Status *</label>
                <select class="form__select" id="regStatus"><option value="Realizada">Realizada</option><option value="Agendada">Agendada</option></select>
              </div>
            </div>
            <button type="submit" class="btn btn--accent">Salvar Etapa Regional</button>
            <div id="regMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>
      `);

      document.getElementById('confForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('confMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/conferencias.json');
          d.conferencias.unshift({
            tipo: document.getElementById('confTipo').value,
            nome: document.getElementById('confNome').value.trim(),
            tema: document.getElementById('confTema').value.trim(),
            data: document.getElementById('confData').value.trim(),
            local: document.getElementById('confLocal').value.trim(),
            status: document.getElementById('confStatus').value,
            deliberacoes_link: document.getElementById('confLink').value.trim() || '#'
          });
          await ghPut('dados/conferencias.json', d, s, 'Nova conferência: ' + document.getElementById('confNome').value.trim());
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Conferência salva com sucesso!';
          document.getElementById('confForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

      document.getElementById('regForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('regMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/conferencias.json');
          if (!d.regionais) d.regionais = { descricao: 'Etapas regionais preparatórias', etapas_2024: [] };
          if (!d.regionais.etapas_2024) d.regionais.etapas_2024 = [];
          d.regionais.etapas_2024.push({
            regiao: document.getElementById('regRegiao').value.trim(),
            data: document.getElementById('regData').value.trim(),
            status: document.getElementById('regStatus').value
          });
          await ghPut('dados/conferencias.json', d, s, 'Nova etapa regional');
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Etapa regional salva!';
          document.getElementById('regForm').reset();
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });
    } catch (e) {
      adminLayout(app, 'conferencias', '<p>Erro: ' + e.message + '</p>');
    }
  }

  window.__deleteConf = async function (index) {
    if (!confirm('Excluir esta conferência?')) return;
    try {
      const { content: d, sha: s } = await ghGet('dados/conferencias.json');
      d.conferencias.splice(index, 1);
      await ghPut('dados/conferencias.json', d, s, 'Excluir conferência');
      alert('Conferência excluída!');
      location.reload();
    } catch (e) { alert('Erro: ' + e.message); }
  };

  // ===== Eleições Admin =====
  async function renderEleicoesAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/eleicoes.json');

      adminLayout(app, 'eleicoes', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Eleições e Gestões (${data.gestoes.length})</h2>

        <div class="info-section">
          <h2 class="info-section__title">Editar Gestão Vigente</h2>
          <form id="gestaoForm" class="form" style="max-width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Período *</label><input class="form__input" type="text" id="gesPeriodo" value="${data.gestoes[0] ? data.gestoes[0].periodo : ''}" placeholder="2024-2026" required></div>
              <div class="form__group"><label class="form__label">Status</label>
                <select class="form__select" id="gesStatus"><option value="Vigente" ${data.gestoes[0] && data.gestoes[0].status === 'Vigente' ? 'selected' : ''}>Vigente</option><option value="Encerrada" ${data.gestoes[0] && data.gestoes[0].status === 'Encerrada' ? 'selected' : ''}>Encerrada</option></select>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Presidente *</label><input class="form__input" type="text" id="gesPresidente" value="${data.gestoes[0] ? data.gestoes[0].mesa_diretora.presidente : ''}" required></div>
              <div class="form__group"><label class="form__label">Vice-Presidente *</label><input class="form__input" type="text" id="gesVice" value="${data.gestoes[0] ? data.gestoes[0].mesa_diretora.vice_presidente : ''}" required></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Segmento da Presidência</label>
                <select class="form__select" id="gesSegmento"><option value="Sociedade Civil" ${data.gestoes[0] && data.gestoes[0].mesa_diretora.segmento_presidente === 'Sociedade Civil' ? 'selected' : ''}>Sociedade Civil</option><option value="Governamental" ${data.gestoes[0] && data.gestoes[0].mesa_diretora.segmento_presidente === 'Governamental' ? 'selected' : ''}>Governamental</option></select>
              </div>
              <div class="form__group"><label class="form__label">Composição</label><input class="form__input" type="text" id="gesComposicao" value="${data.gestoes[0] ? data.gestoes[0].composicao : ''}"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Link do Edital</label><input class="form__input" type="text" id="gesEdital" value="${data.gestoes[0] ? data.gestoes[0].edital || '' : ''}" placeholder="https://drive.google.com/..."></div>
              <div class="form__group"><label class="form__label">Link do Resultado</label><input class="form__input" type="text" id="gesResultado" value="${data.gestoes[0] ? data.gestoes[0].resultado || '' : ''}" placeholder="https://drive.google.com/..."></div>
            </div>
            <button type="submit" class="btn btn--primary">Salvar Gestão</button>
            <div id="gesMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Histórico de Gestões</h2>
          ${data.gestoes.map(g => '<div style="padding:.75rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem"><strong>Gestão ' + g.periodo + '</strong> <span class="' + (g.status === 'Vigente' ? 'green-badge' : 'badge badge--yellow') + '">' + g.status + '</span><br><span style="color:var(--gray-400)">Presidente: ' + g.mesa_diretora.presidente + ' | Vice: ' + g.mesa_diretora.vice_presidente + '</span></div>').join('')}
        </div>
      `);

      document.getElementById('gestaoForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('gesMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/eleicoes.json');
          const gestao = {
            periodo: document.getElementById('gesPeriodo').value.trim(),
            status: document.getElementById('gesStatus').value,
            mesa_diretora: {
              presidente: document.getElementById('gesPresidente').value.trim(),
              vice_presidente: document.getElementById('gesVice').value.trim(),
              segmento_presidente: document.getElementById('gesSegmento').value
            },
            composicao: document.getElementById('gesComposicao').value.trim(),
            edital: document.getElementById('gesEdital').value.trim() || '#',
            resultado: document.getElementById('gesResultado').value.trim() || '#'
          };
          if (d.gestoes.length > 0 && d.gestoes[0].periodo === gestao.periodo) {
            d.gestoes[0] = gestao;
          } else {
            d.gestoes.unshift(gestao);
          }
          await ghPut('dados/eleicoes.json', d, s, 'Atualizar gestão ' + gestao.periodo);
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Gestão salva com sucesso!';
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });
    } catch (e) {
      adminLayout(app, 'eleicoes', '<p>Erro: ' + e.message + '</p>');
    }
  }

  // ===== Sobre / Conselheiros Admin =====
  async function renderSobreAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/sobre.json');

      let scHtml = data.conselheiros.sociedade_civil.map((c, i) =>
        '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-bottom:.5rem">' +
        '<input class="form__input sc-nome" value="' + c.nome + '" style="font-size:.85rem;padding:.4rem .6rem">' +
        '<input class="form__input sc-seg" value="' + c.segmento + '" style="font-size:.85rem;padding:.4rem .6rem">' +
        '<select class="form__select sc-tipo" style="font-size:.85rem;padding:.4rem .6rem"><option ' + (c.tipo === 'Titular' ? 'selected' : '') + '>Titular</option><option ' + (c.tipo === 'Suplente' ? 'selected' : '') + '>Suplente</option></select>' +
        '</div>'
      ).join('');

      let govHtml = data.conselheiros.governamental.map((c, i) =>
        '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-bottom:.5rem">' +
        '<input class="form__input gov-nome" value="' + c.nome + '" style="font-size:.85rem;padding:.4rem .6rem">' +
        '<input class="form__input gov-orgao" value="' + c.orgao + '" style="font-size:.85rem;padding:.4rem .6rem">' +
        '<select class="form__select gov-tipo" style="font-size:.85rem;padding:.4rem .6rem"><option ' + (c.tipo === 'Titular' ? 'selected' : '') + '>Titular</option><option ' + (c.tipo === 'Suplente' ? 'selected' : '') + '>Suplente</option></select>' +
        '</div>'
      ).join('');

      adminLayout(app, 'sobre', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Sobre o CAS/DF - Dados Institucionais</h2>

        <div class="info-section">
          <h2 class="info-section__title">Presidência</h2>
          <form id="presForm" class="form" style="max-width:100%">
            <div class="form__group"><label class="form__label">Nome do(a) Presidente *</label><input class="form__input" type="text" id="presNome" value="${data.presidencia.nome}" required></div>
            <div class="form__group"><label class="form__label">Descrição</label><textarea class="form__textarea" id="presDesc" rows="3" style="min-height:70px">${data.presidencia.descricao}</textarea></div>
            <button type="submit" class="btn btn--primary">Salvar Presidência</button>
            <div id="presMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Conselheiros - Sociedade Civil (${data.conselheiros.sociedade_civil.length})</h2>
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-bottom:.75rem;font-size:.75rem;font-weight:700;color:var(--gray-400);text-transform:uppercase"><span>Nome</span><span>Segmento</span><span>Tipo</span></div>
          <div id="scList">${scHtml}</div>
          <div style="display:flex;gap:.5rem;margin-top:.75rem">
            <button type="button" class="btn" style="font-size:.82rem;background:var(--primary-50);color:var(--primary)" onclick="window.__addConselheiro('sc')">+ Adicionar</button>
            <button type="button" class="btn btn--primary" style="font-size:.82rem" onclick="window.__saveConselheiros()">Salvar Conselheiros</button>
          </div>
          <div id="scMsg" class="form__message" style="margin-top:.75rem"></div>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Conselheiros - Governamental (${data.conselheiros.governamental.length})</h2>
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-bottom:.75rem;font-size:.75rem;font-weight:700;color:var(--gray-400);text-transform:uppercase"><span>Nome</span><span>Órgão</span><span>Tipo</span></div>
          <div id="govList">${govHtml}</div>
          <div style="margin-top:.75rem">
            <button type="button" class="btn" style="font-size:.82rem;background:var(--primary-50);color:var(--primary)" onclick="window.__addConselheiro('gov')">+ Adicionar</button>
          </div>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Descrição Institucional</h2>
          <form id="descForm" class="form" style="max-width:100%">
            <div class="form__group"><label class="form__label">Descrição do CAS/DF</label><textarea class="form__textarea" id="sobreDesc" rows="4">${data.descricao}</textarea></div>
            <div class="form__group"><label class="form__label">Base Legal</label><input class="form__input" type="text" id="sobreBase" value="${data.base_legal}"></div>
            <button type="submit" class="btn btn--primary">Salvar Descrição</button>
            <div id="descMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>
      `);

      // Presidência form
      document.getElementById('presForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('presMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/sobre.json');
          d.presidencia.nome = document.getElementById('presNome').value.trim();
          d.presidencia.descricao = document.getElementById('presDesc').value.trim();
          await ghPut('dados/sobre.json', d, s, 'Atualizar presidência');
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Presidência atualizada!';
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

      // Descrição form
      document.getElementById('descForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('descMsg');
        try {
          const { content: d, sha: s } = await ghGet('dados/sobre.json');
          d.descricao = document.getElementById('sobreDesc').value.trim();
          d.base_legal = document.getElementById('sobreBase').value.trim();
          await ghPut('dados/sobre.json', d, s, 'Atualizar descrição institucional');
          msg.className = 'form__message form__message--success';
          msg.textContent = 'Descrição atualizada!';
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

    } catch (e) {
      adminLayout(app, 'sobre', '<p>Erro: ' + e.message + '</p>');
    }
  }

  window.__addConselheiro = function (type) {
    const list = document.getElementById(type === 'sc' ? 'scList' : 'govList');
    const secondCol = type === 'sc' ? 'Segmento' : 'Órgão';
    const secondClass = type === 'sc' ? 'sc-seg' : 'gov-orgao';
    const nomeClass = type === 'sc' ? 'sc-nome' : 'gov-nome';
    const tipoClass = type === 'sc' ? 'sc-tipo' : 'gov-tipo';
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr;gap:.5rem;margin-bottom:.5rem';
    row.innerHTML = '<input class="form__input ' + nomeClass + '" placeholder="Nome" style="font-size:.85rem;padding:.4rem .6rem">' +
      '<input class="form__input ' + secondClass + '" placeholder="' + secondCol + '" style="font-size:.85rem;padding:.4rem .6rem">' +
      '<select class="form__select ' + tipoClass + '" style="font-size:.85rem;padding:.4rem .6rem"><option>Titular</option><option>Suplente</option></select>';
    list.appendChild(row);
  };

  window.__saveConselheiros = async function () {
    const msg = document.getElementById('scMsg');
    try {
      const { content: d, sha: s } = await ghGet('dados/sobre.json');

      const scNomes = document.querySelectorAll('.sc-nome');
      const scSegs = document.querySelectorAll('.sc-seg');
      const scTipos = document.querySelectorAll('.sc-tipo');
      d.conselheiros.sociedade_civil = [];
      scNomes.forEach((el, i) => {
        if (el.value.trim()) {
          d.conselheiros.sociedade_civil.push({
            nome: el.value.trim(),
            segmento: scSegs[i].value.trim(),
            tipo: scTipos[i].value
          });
        }
      });

      const govNomes = document.querySelectorAll('.gov-nome');
      const govOrgaos = document.querySelectorAll('.gov-orgao');
      const govTipos = document.querySelectorAll('.gov-tipo');
      d.conselheiros.governamental = [];
      govNomes.forEach((el, i) => {
        if (el.value.trim()) {
          d.conselheiros.governamental.push({
            nome: el.value.trim(),
            orgao: govOrgaos[i].value.trim(),
            tipo: govTipos[i].value
          });
        }
      });

      await ghPut('dados/sobre.json', d, s, 'Atualizar conselheiros');
      msg.className = 'form__message form__message--success';
      msg.textContent = 'Conselheiros salvos com sucesso!';
    } catch (err) {
      msg.className = 'form__message form__message--error';
      msg.textContent = 'Erro: ' + err.message;
    }
  };

  // ===== Legislação Admin =====
  async function renderLegislacaoAdmin(app) {
    try {
      const { content: data } = await ghGet('dados/legislacao.json');
      const totalDocs = data.categorias.reduce((s, c) => s + c.documentos.length, 0);

      const catOptions = data.categorias.map(c => '<option value="' + c.id + '">' + c.titulo + '</option>').join('');

      let listHtml = data.categorias.map(cat =>
        '<div style="margin-bottom:1.5rem">' +
        '<h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.5rem">' + cat.icone + ' ' + cat.titulo + ' (' + cat.documentos.length + ')</h3>' +
        (cat.documentos.length === 0 ? '<p style="font-size:.85rem;color:var(--gray-400)">Nenhum documento cadastrado.</p>' :
          cat.documentos.map((d, i) =>
            '<div style="padding:.5rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem;display:flex;justify-content:space-between;align-items:center">' +
            '<div><strong>' + d.numero + '</strong> - ' + d.titulo + '<br><span style="color:var(--gray-400)">' + d.data + '</span></div>' +
            '<div style="display:flex;gap:.5rem;flex-shrink:0">' +
            '<button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:var(--primary-50);color:var(--primary)" onclick="window.__editLeg(\'' + cat.id + '\',' + i + ')">Editar</button>' +
            '<button class="btn" style="font-size:.78rem;padding:.35rem .75rem;background:#fee2e2;color:#991b1b" onclick="window.__deleteLeg(\'' + cat.id + '\',' + i + ')">Excluir</button>' +
            '</div></div>'
          ).join('')) +
        '</div>'
      ).join('');

      adminLayout(app, 'legislacao', `
        <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Legislação (${totalDocs} documentos)</h2>

        <div class="info-section" id="legFormSection">
          <h2 class="info-section__title" id="legFormTitle">Adicionar Documento de Legislação</h2>
          <form id="legForm" class="form" style="max-width:100%">
            <input type="hidden" id="legEditCat" value="">
            <input type="hidden" id="legEditIdx" value="-1">
            <div class="form__group">
              <label class="form__label">Categoria *</label>
              <select class="form__select" id="legCategoria" required>${catOptions}</select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form__group"><label class="form__label">Número *</label><input class="form__input" type="text" id="legNumero" placeholder="Ex: Lei Federal nº 8.742/1993" required></div>
              <div class="form__group"><label class="form__label">Data *</label><input class="form__input" type="date" id="legData" required></div>
            </div>
            <div class="form__group"><label class="form__label">Título *</label><input class="form__input" type="text" id="legTitulo" placeholder="Ex: LOAS - Lei Orgânica da Assistência Social" required></div>
            <div class="form__group"><label class="form__label">Descrição</label><textarea class="form__textarea" id="legDescricao" rows="3" style="min-height:70px" placeholder="Breve descrição do documento..."></textarea></div>
            <div class="form__group"><label class="form__label">Link do documento (Google Drive ou URL externa)</label><input class="form__input" type="text" id="legLink" placeholder="https://drive.google.com/..."></div>
            <div style="display:flex;gap:.75rem">
              <button type="submit" class="btn btn--primary" id="legSaveBtn">Salvar Documento</button>
              <button type="button" class="btn" id="legCancelBtn" style="display:none;background:var(--gray-200);color:var(--gray-600)" onclick="window.__cancelEditLeg()">Cancelar Edição</button>
            </div>
            <div id="legMsg" class="form__message" style="margin-top:.75rem"></div>
          </form>
        </div>

        <div class="info-section">
          <h2 class="info-section__title">Documentos Cadastrados</h2>
          ${listHtml}
        </div>
      `);

      document.getElementById('legForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById('legMsg');
        const editCat = document.getElementById('legEditCat').value;
        const editIdx = parseInt(document.getElementById('legEditIdx').value);
        const isEdit = editCat && editIdx >= 0;

        try {
          const { content: d, sha: s } = await ghGet('dados/legislacao.json');
          const catId = document.getElementById('legCategoria').value;
          const cat = d.categorias.find(c => c.id === catId);
          if (!cat) throw new Error('Categoria não encontrada');
          const doc = {
            numero: document.getElementById('legNumero').value.trim(),
            titulo: document.getElementById('legTitulo').value.trim(),
            descricao: document.getElementById('legDescricao').value.trim(),
            data: document.getElementById('legData').value,
            link: document.getElementById('legLink').value.trim() || '#'
          };

          if (isEdit) {
            const origCat = d.categorias.find(c => c.id === editCat);
            if (editCat === catId && origCat) {
              origCat.documentos[editIdx] = doc;
            } else {
              if (origCat) origCat.documentos.splice(editIdx, 1);
              cat.documentos.unshift(doc);
            }
            await ghPut('dados/legislacao.json', d, s, 'Editar legislação: ' + doc.numero);
            msg.className = 'form__message form__message--success';
            msg.textContent = 'Documento atualizado com sucesso!';
          } else {
            cat.documentos.unshift(doc);
            await ghPut('dados/legislacao.json', d, s, 'Nova legislação: ' + doc.numero);
            msg.className = 'form__message form__message--success';
            msg.textContent = 'Documento salvo com sucesso!';
          }

          setTimeout(() => { location.hash = '#/admin/legislacao'; location.reload(); }, 1200);
        } catch (err) {
          msg.className = 'form__message form__message--error';
          msg.textContent = 'Erro: ' + err.message;
        }
      });

    } catch (e) {
      adminLayout(app, 'legislacao', '<p>Erro: ' + e.message + '</p>');
    }
  }

  window.__editLeg = async function (catId, index) {
    try {
      const { content: data } = await ghGet('dados/legislacao.json');
      const cat = data.categorias.find(c => c.id === catId);
      if (!cat || !cat.documentos[index]) return;
      const d = cat.documentos[index];

      document.getElementById('legEditCat').value = catId;
      document.getElementById('legEditIdx').value = index;
      document.getElementById('legCategoria').value = catId;
      document.getElementById('legNumero').value = d.numero;
      document.getElementById('legTitulo').value = d.titulo;
      document.getElementById('legDescricao').value = d.descricao || '';
      document.getElementById('legData').value = d.data;
      document.getElementById('legLink').value = d.link === '#' ? '' : d.link;

      document.getElementById('legFormTitle').textContent = 'Editar Documento: ' + d.numero;
      document.getElementById('legSaveBtn').textContent = 'Salvar Alterações';
      document.getElementById('legCancelBtn').style.display = '';
      document.getElementById('legFormSection').scrollIntoView({ behavior: 'smooth' });
    } catch (e) { alert('Erro ao carregar documento: ' + e.message); }
  };

  window.__cancelEditLeg = function () {
    document.getElementById('legEditCat').value = '';
    document.getElementById('legEditIdx').value = '-1';
    document.getElementById('legForm').reset();
    document.getElementById('legFormTitle').textContent = 'Adicionar Documento de Legislação';
    document.getElementById('legSaveBtn').textContent = 'Salvar Documento';
    document.getElementById('legCancelBtn').style.display = 'none';
  };

  window.__deleteLeg = async function (catId, index) {
    if (!confirm('Excluir este documento de legislação?')) return;
    try {
      const { content: d, sha: s } = await ghGet('dados/legislacao.json');
      const cat = d.categorias.find(c => c.id === catId);
      if (cat) {
        cat.documentos.splice(index, 1);
        await ghPut('dados/legislacao.json', d, s, 'Excluir documento de legislação');
        alert('Documento excluído!');
        location.reload();
      }
    } catch (e) { alert('Erro: ' + e.message); }
  };

  // ===== Config =====
  async function renderConfig(app) {
    let ig = '', yt = '', fb = '';
    try {
      const { content: cfg } = await ghGet('dados/config.json');
      ig = cfg.redes_sociais.instagram || '';
      yt = cfg.redes_sociais.youtube || '';
      fb = cfg.redes_sociais.facebook || '';
    } catch (e) {}

    adminLayout(app, 'config', `
      <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Configurações</h2>

      <div class="info-section">
        <h2 class="info-section__title">Redes Sociais</h2>
        <form id="socialForm" class="form" style="max-width:100%">
          <div class="form__group">
            <label class="form__label">Instagram</label>
            <input class="form__input" type="url" id="cfgInstagram" value="${ig}" placeholder="https://www.instagram.com/...">
          </div>
          <div class="form__group">
            <label class="form__label">YouTube</label>
            <input class="form__input" type="url" id="cfgYoutube" value="${yt}" placeholder="https://www.youtube.com/...">
          </div>
          <div class="form__group">
            <label class="form__label">Facebook</label>
            <input class="form__input" type="url" id="cfgFacebook" value="${fb}" placeholder="https://www.facebook.com/...">
          </div>
          <button type="submit" class="btn btn--primary">Salvar Redes Sociais</button>
          <div id="socialMsg" class="form__message" style="margin-top:.75rem"></div>
        </form>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Token do GitHub</h2>
        <p class="info-section__text">Token atual: <code style="background:var(--gray-100);padding:.15rem .4rem;border-radius:4px">${token ? token.slice(0, 8) + '...' + token.slice(-4) : 'Não configurado'}</code></p>
        <button class="btn mt-1" style="background:var(--gray-200);color:var(--gray-600);font-size:.82rem" onclick="localStorage.removeItem('gh_token');location.reload()">Alterar Token</button>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Sobre o Painel</h2>
        <ul>
          <li>Repositório: <strong>${REPO}</strong></li>
          <li>Branch: <strong>${BRANCH}</strong></li>
          <li>As alterações são salvas diretamente no GitHub</li>
          <li>O blog atualiza automaticamente via GitHub Pages</li>
        </ul>
      </div>
      <div class="info-section">
        <h2 class="info-section__title">Dicas para Fotos e Documentos</h2>
        <ul>
          <li><strong>Fotos:</strong> Faca upload no Google Drive, clique com botao direito > "Compartilhar" > copie o link e cole no campo de imagem</li>
          <li><strong>PDFs (resolucoes, atas):</strong> Faca upload no Google Drive, copie o link compartilhavel e cole no formulário</li>
          <li><strong>Videos:</strong> Publique no YouTube e copie o link para adicionar na página de Lives</li>
        </ul>
      </div>
    `);

    document.getElementById('socialForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const msg = document.getElementById('socialMsg');
      try {
        let cfg, sha;
        try {
          const res = await ghGet('dados/config.json');
          cfg = res.content;
          sha = res.sha;
        } catch (e) {
          cfg = { redes_sociais: {} };
          sha = undefined;
        }
        cfg.redes_sociais = {
          instagram: document.getElementById('cfgInstagram').value.trim(),
          youtube: document.getElementById('cfgYoutube').value.trim(),
          facebook: document.getElementById('cfgFacebook').value.trim()
        };
        if (sha) {
          await ghPut('dados/config.json', cfg, sha, 'Atualizar redes sociais');
        } else {
          await ghPut('dados/config.json', cfg, undefined, 'Criar config com redes sociais');
        }
        msg.className = 'form__message form__message--success';
        msg.textContent = 'Redes sociais atualizadas! O blog será atualizado em instantes.';
      } catch (err) {
        msg.className = 'form__message form__message--error';
        msg.textContent = 'Erro: ' + err.message;
      }
    });
  }

  // ===== Manual =====
  function renderManual(app) {
    adminLayout(app, 'manual', `
      <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:1rem">Manual do Painel Administrativo</h2>

      <div class="info-section">
        <h2 class="info-section__title">Acesso ao Painel</h2>
        <ol>
          <li>Abra o blog e acesse: <code style="background:var(--gray-100);padding:.15rem .4rem;border-radius:4px">index.html#/admin</code></li>
          <li>Digite a senha: <strong>casdf2025</strong></li>
          <li>Na primeira vez, será solicitado um <strong>Token do GitHub</strong> (veja abaixo)</li>
        </ol>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Configuração do Token do GitHub (primeira vez)</h2>
        <p class="info-section__text mb-1">O token permite que o painel salve as alterações diretamente no blog.</p>
        <ol>
          <li>Acesse: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener">github.com/settings/tokens/new</a></li>
          <li>Em "Note", coloque: <strong>Blog CAS/DF Admin</strong></li>
          <li>Em "Expiration", escolha: <strong>No expiration</strong></li>
          <li>Marque a permissão: <strong>repo</strong></li>
          <li>Clique em <strong>Generate token</strong></li>
          <li>Copie o token e cole no campo do painel</li>
          <li>Pronto! O token fica salvo no navegador</li>
        </ol>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Seções do Painel</h2>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">📝 Posts / Notícias</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Criar post:</strong> Menu > Posts > "+ Novo Post"</li>
            <li>Preencha: título, data, categoria, autor, resumo e conteúdo (HTML)</li>
            <li>O conteúdo aceita formatação HTML (negrito, itálico, listas, links, imagens)</li>
            <li>Use os botões de formatação acima do campo de conteúdo</li>
            <li>Marque "Destaque" para o post aparecer na seção de destaques da página inicial</li>
            <li><strong>Editar:</strong> Clique em "Editar" ao lado do post</li>
            <li><strong>Excluir:</strong> Clique em "Excluir" (pede confirmação)</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">📄 Resoluções e Atas</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Adicionar resolução:</strong> Preencha número, data, ano, título e link do PDF</li>
            <li><strong>Adicionar ata:</strong> Preencha data, período, título e link do PDF</li>
            <li>Os documentos PDF devem ser enviados ao Google Drive e o link compartilhável colado no formulário</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">🏢 Entidades</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Adicionar entidade:</strong> Preencha nome, CNPJ, inscrição, validade, região, serviços e situação</li>
            <li>O total de entidades é atualizado automaticamente</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">📅 Reuniões</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Adicionar pauta:</strong> Preencha data, tipo (ordinária/extraordinária) e itens da pauta (um por linha)</li>
            <li><strong>Atualizar calendário:</strong> Clique no mês desejado para marcar como "Realizada"</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">🎤 Conferências</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Adicionar conferência:</strong> Preencha tipo, nome, tema, data, local e status</li>
            <li><strong>Adicionar etapa regional:</strong> Preencha região, data e status</li>
            <li><strong>Excluir:</strong> Clique em "Excluir" ao lado da conferência</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">🗳️ Eleições</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Editar gestão vigente:</strong> Atualize presidente, vice-presidente, período e links do edital/resultado</li>
            <li>Se o período for diferente, uma nova gestão será criada automaticamente</li>
          </ul>
        </div>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">👥 Sobre / Conselheiros</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li><strong>Presidência:</strong> Atualize nome e descrição</li>
            <li><strong>Conselheiros:</strong> Edite os nomes diretamente nas tabelas e clique "Salvar Conselheiros"</li>
            <li>Use "+ Adicionar" para incluir novos conselheiros</li>
            <li><strong>Descrição institucional:</strong> Edite o texto do CAS/DF e a base legal</li>
          </ul>
        </div>

        <div>
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">⚙️ Configurações</h3>
          <ul style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li>Visualize e altere o token do GitHub</li>
            <li>Edite os links das redes sociais</li>
            <li>Informações sobre o repositório e deploy</li>
          </ul>
        </div>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Como Adicionar Fotos e Documentos</h2>

        <div style="margin-bottom:1rem">
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">Fotos (para posts)</h3>
          <ol style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li>Faça upload da foto no <strong>Google Drive</strong></li>
            <li>Clique com botão direito > <strong>Compartilhar</strong> > <strong>Qualquer pessoa com o link</strong></li>
            <li>Copie o link</li>
            <li>Cole no campo "URL da Imagem" do formulário de post</li>
          </ol>
        </div>

        <div>
          <h3 style="font-size:.95rem;font-weight:600;color:var(--gray-700);margin-bottom:.35rem">Documentos PDF (resoluções, atas, editais)</h3>
          <ol style="font-size:.88rem;color:var(--gray-600);margin-left:1.25rem">
            <li>Faça upload do PDF no <strong>Google Drive</strong></li>
            <li>Clique com botão direito > <strong>Compartilhar</strong> > <strong>Qualquer pessoa com o link</strong></li>
            <li>Copie o link compartilhável</li>
            <li>Cole no campo "Link do documento" do formulário</li>
          </ol>
        </div>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Dicas Importantes</h2>
        <ul>
          <li>Após salvar, o blog atualiza automaticamente em até 1 minuto</li>
          <li>O painel funciona em qualquer navegador (Chrome, Firefox, Edge)</li>
          <li>O token fica salvo apenas no navegador em uso - se trocar de computador, configure novamente</li>
          <li>Para sair do painel, clique em "Sair" no canto superior direito</li>
          <li>Para voltar ao blog, clique em "Ver Blog"</li>
        </ul>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Estrutura dos Dados</h2>
        <p class="info-section__text mb-1">Cada seção do blog corresponde a um arquivo JSON na pasta <code style="background:var(--gray-100);padding:.15rem .4rem;border-radius:4px">dados/</code>:</p>
        <table style="width:100%;font-size:.88rem;border-collapse:collapse">
          <thead><tr style="text-align:left;border-bottom:2px solid var(--gray-200)"><th style="padding:.5rem">Seção</th><th style="padding:.5rem">Arquivo</th></tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Posts/Notícias</td><td style="padding:.5rem"><code>posts.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Resoluções e Atas</td><td style="padding:.5rem"><code>documentos.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Entidades</td><td style="padding:.5rem"><code>entidades.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Reuniões</td><td style="padding:.5rem"><code>reunioes.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Conferências</td><td style="padding:.5rem"><code>conferencias.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Eleições</td><td style="padding:.5rem"><code>eleicoes.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Sobre o CAS/DF</td><td style="padding:.5rem"><code>sobre.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Fiscalização</td><td style="padding:.5rem"><code>fiscalizacao.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Inscrição</td><td style="padding:.5rem"><code>inscricao.json</code></td></tr>
            <tr style="border-bottom:1px solid var(--gray-100)"><td style="padding:.5rem">Legislação</td><td style="padding:.5rem"><code>legislacao.json</code></td></tr>
            <tr><td style="padding:.5rem">Planejamento</td><td style="padding:.5rem"><code>planejamento.json</code></td></tr>
          </tbody>
        </table>
      </div>

      <div class="info-section">
        <h2 class="info-section__title">Suporte</h2>
        <p class="info-section__text">Em caso de dúvidas ou problemas técnicos, entre em contato com o desenvolvedor responsável.</p>
      </div>
    `);
  }

})();
