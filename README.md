# Blog CAS/DF

Portal oficial do Conselho de Assistencia Social do Distrito Federal.

## Sobre o Projeto

Este e o blog institucional do CAS/DF (Conselho de Assistencia Social do Distrito Federal), um orgao colegiado de carater permanente e deliberativo, vinculado a SEDES/DF.

**Presidente Atual:** Coracy Coelho Chavante (Gestao 2025-2027)

## Estrutura do Projeto

```
blog-cas-df/
├── index.html              # Pagina principal
├── css/
│   └── styles.css          # Estilos do site
├── js/
│   └── app.js              # Logica da aplicacao
├── assets/
│   └── images/             # Imagens e favicon
└── README.md               # Este arquivo
```

## Funcionalidades

### Implementadas

- **Sistema de Posts**: Criar, editar, visualizar e excluir posts
- **Categorias**: Gerenciamento de categorias de conteudo
- **Busca**: Sistema de busca de posts
- **Navegacao**: Menu completo com dropdowns e subpaginas
- **Armazenamento Local**: Posts salvos no localStorage do navegador
- **Design Responsivo**: Funciona em desktop e dispositivos moveis
- **Sistema de Notificacoes**: Feedback visual para acoes do usuario
- **Modais**: Visualizacao de posts e formularios em modais

### Secoes do Site

1. **Inicio** - Posts recentes e estatisticas
2. **Sobre** - Informacoes institucionais (Presidencia, Secretaria, Conselheiros, Comissoes)
3. **Planejamento Estrategico** - PEI 2025-2027, Objetivos, Indicadores
4. **Resolucoes** - Documentos normativos por ano
5. **Atas** - Registros de reunioes
6. **Reunioes do CAS DF** - Pautas, calendario, lives e fotos
7. **Eleicao Sociedade Civil** - Historico eleitoral
8. **Conferencias** - Regionais, distrital e nacional
9. **Entidades Inscritas** - Base de dados de entidades
10. **Procedimentos para Inscricao** - Guia de inscricao
11. **Contate-nos** - Formulario de contato

## Como Usar

### Visualizar o Site

Abra o arquivo `index.html` em qualquer navegador moderno.

### Adicionar Posts

1. Clique no botao "+ Adicionar Post" na pagina inicial
2. Preencha os campos: titulo, categoria, data, resumo e conteudo
3. Clique em "Publicar Post"

### Gerenciar Categorias

1. Clique em "Gerenciar Categorias" na pagina inicial
2. Visualize categorias existentes
3. Adicione novas categorias com chave, nome e cor

### Buscar Conteudo

1. Use a caixa de busca no cabecalho
2. Digite o termo desejado e pressione Enter ou clique na lupa
3. Os resultados serao exibidos em um modal

### Acesso Administrativo

- Clique em "Acesso Restrito" no cabecalho
- Senha padrao: `casdf2025`

## Tecnologias Utilizadas

- **HTML5**: Estrutura semantica
- **CSS3**: Estilos modernos com variaveis CSS, flexbox e grid
- **JavaScript (ES6+)**: Logica da aplicacao sem frameworks
- **localStorage**: Armazenamento de dados no navegador

## Personalizacao

### Alterar Cores

Edite as variaveis CSS no arquivo `css/styles.css`:

```css
:root {
    --primary-blue: #1e3a8a;
    --primary-blue-light: #3b82f6;
    --primary-green: #16a34a;
    --primary-orange: #f97316;
}
```

### Alterar Configuracoes

Edite o objeto CONFIG no arquivo `js/app.js`:

```javascript
const CONFIG = {
    siteName: 'Blog CAS DF',
    adminPassword: 'casdf2025',
    president: {
        name: 'Coracy Coelho Chavante',
        term: '2025-2027'
    }
};
```

## Proximos Passos

- [ ] Integracao com backend para persistencia de dados
- [ ] Sistema de autenticacao completo
- [ ] Upload de documentos e imagens
- [ ] Envio de emails pelo formulario de contato
- [ ] Exportacao de dados em PDF/Excel
- [ ] Indexacao para SEO avancado

## Contato

**CAS/DF - Conselho de Assistencia Social do Distrito Federal**

- Endereco: SEPN 511, Bloco C, Ed. Bittar IV, 4o andar, Asa Norte, Brasilia/DF
- Telefone: (61) 2017-4260
- E-mail: cas.df@sedes.df.gov.br
- Horario: Segunda a Sexta, 8h as 18h

## Licenca

Este projeto e de uso institucional do CAS/DF.

---

Desenvolvido para o Conselho de Assistencia Social do Distrito Federal.
