# Blog CAS/DF — Conselho de Assistencia Social do Distrito Federal

Blog institucional do CAS/DF hospedado no GitHub Pages.

**URL:** https://casdfteste.github.io/blog-cas-df/

## Como gerenciar o conteudo

Todo o conteudo e gerenciado pela pasta `dados/`. Para editar, basta abrir o arquivo no GitHub.com, clicar no icone de lapis (editar) e fazer as alteracoes.

### Adicionar um novo post

1. Abra o arquivo `dados/posts.json` no GitHub
2. Clique no icone de editar (lapis)
3. Copie um post existente e altere os campos:
   - `id`: numero unico (incremente o maior existente)
   - `titulo`: titulo do post
   - `data`: data no formato `"2025-04-15"` (ano-mes-dia)
   - `categoria`: categoria livre (ex: Capacitacao, Resolucoes, Reunioes)
   - `autor`: nome do autor
   - `resumo`: texto curto para o card
   - `conteudo`: conteudo em HTML (use `<p>`, `<ul>`, `<li>`, `<strong>`)
   - `destaque`: `true` para aparecer na secao de destaques, `false` caso contrario
4. Clique em **Commit changes**

### Adicionar uma resolucao ou ata

1. Faca upload do PDF no Google Drive e copie o link compartilhavel
2. Abra `dados/documentos.json` no GitHub
3. Adicione uma nova entrada no ano correspondente com `numero`, `titulo`, `data` e `link`
4. Commit

### Atualizar informacoes institucionais

- **Sobre o CAS/DF:** edite `dados/sobre.json`
- **Planejamento:** edite `dados/planejamento.json`
- **Reunioes:** edite `dados/reunioes.json`
- **Eleicoes:** edite `dados/eleicoes.json`
- **Conferencias:** edite `dados/conferencias.json`
- **Entidades inscritas:** edite `dados/entidades.json`
- **Inscricao de entidades:** edite `dados/inscricao.json`

### Formulario de contato

O formulario de contato usa o [Formspree](https://formspree.io). Para configurar:

1. Crie uma conta gratuita em formspree.io
2. Crie um novo formulario apontando para cas.df@sedes.df.gov.br
3. Copie o endpoint (ex: `https://formspree.io/f/abcd1234`)
4. Edite `index.html` e substitua o `action` do formulario pelo endpoint

## Estrutura do projeto

```
blog-cas-df/
├── index.html          # Pagina principal (esqueleto HTML)
├── css/style.css       # Estilos visuais
├── js/app.js           # Logica da aplicacao
├── dados/              # Conteudo editavel (JSON)
│   ├── posts.json      # Posts do blog
│   ├── sobre.json      # Informacoes institucionais
│   ├── planejamento.json
│   ├── documentos.json # Resolucoes e atas
│   ├── reunioes.json
│   ├── eleicoes.json
│   ├── conferencias.json
│   ├── entidades.json
│   └── inscricao.json
└── README.md
```

## Ativar GitHub Pages

1. Va em **Settings > Pages** no repositorio
2. Source: **Deploy from a branch**
3. Branch: **main**, pasta: **/ (root)**
4. Clique em **Save**
5. Acesse `https://casdfteste.github.io/blog-cas-df/`

## Tecnologias

- HTML5, CSS3, JavaScript puro (sem frameworks)
- Roteamento por hash (`#/rota`)
- Dados em JSON (editaveis pelo GitHub)
- Responsivo (mobile-first)
- Formspree para formulario de contato
