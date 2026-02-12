# Manual do Painel Administrativo - Blog CAS/DF

## Acesso ao Painel

1. Abra o blog e acesse: `index.html#/admin`
2. Digite a senha: **casdf2025**
3. Na primeira vez, será solicitado um **Token do GitHub** (veja abaixo)

---

## Configuração do Token do GitHub (primeira vez)

O token permite que o painel salve as alterações diretamente no blog.

1. Acesse: https://github.com/settings/tokens/new
2. Em **Note**, coloque: `Blog CAS/DF Admin`
3. Em **Expiration**, escolha: `No expiration`
4. Marque a permissão: **repo**
5. Clique em **Generate token**
6. Copie o token e cole no campo do painel
7. Pronto! O token fica salvo no navegador

---

## Seções do Painel

### Posts / Notícias
- **Criar post:** Menu > Posts > "+ Novo Post"
- Preencha: titulo, data, categoria, autor, resumo e conteudo (HTML)
- O conteudo aceita formatacao HTML (negrito, italico, listas, links, imagens)
- Use os botoes de formatacao acima do campo de conteudo
- Marque "Destaque" para o post aparecer na seção de destaques da página inicial
- **Editar:** Clique em "Editar" ao lado do post
- **Excluir:** Clique em "Excluir" (pede confirmacao)

### Resoluções e Atas
- **Adicionar resolucao:** Preencha numero, data, ano, titulo e link do PDF
- **Adicionar ata:** Preencha data, periodo, titulo e link do PDF
- Os documentos PDF devem ser enviados ao Google Drive e o link compartilhavel colado no formulário

### Entidades
- **Adicionar entidade:** Preencha nome, CNPJ, inscricao, validade, regiao, serviços e situacao
- O total de entidades e atualizado automaticamente

### Reuniões
- **Adicionar pauta:** Preencha data, tipo (ordinaria/extraordinaria) e itens da pauta (um por linha)
- **Atualizar calendario:** Clique no mes desejado para marcar como "Realizada"

### Conferências
- **Adicionar conferencia:** Preencha tipo, nome, tema, data, local e status
- **Adicionar etapa regional:** Preencha regiao, data e status
- **Excluir:** Clique em "Excluir" ao lado da conferencia

### Eleições
- **Editar gestao vigente:** Atualize presidente, vice-presidente, periodo e links do edital/resultado
- Se o periodo for diferente, uma nova gestao será criada automaticamente

### Sobre / Conselheiros
- **Presidência:** Atualize nome e descricao
- **Conselheiros:** Edite os nomes diretamente nas tabelas e clique "Salvar Conselheiros"
- Use "+ Adicionar" para incluir novos conselheiros
- **Descrição institucional:** Edite o texto do CAS/DF e a base legal

### Configurações
- Visualize e altere o token do GitHub
- Informações sobre o repositorio e deploy

---

## Como Adicionar Fotos e Documentos

### Fotos (para posts)
1. Faca upload da foto no **Google Drive**
2. Clique com botao direito > **Compartilhar** > **Qualquer pessoa com o link**
3. Copie o link
4. Cole no campo "URL da Imagem" do formulário de post

### Documentos PDF (resolucoes, atas, editais)
1. Faca upload do PDF no **Google Drive**
2. Clique com botao direito > **Compartilhar** > **Qualquer pessoa com o link**
3. Copie o link compartilhavel
4. Cole no campo "Link do documento" do formulário

---

## Dicas Importantes

- Apos salvar, o blog atualiza automaticamente em ate 1 minuto
- O painel funciona em qualquer navegador (Chrome, Firefox, Edge)
- O token fica salvo apenas no navegador em uso - se trocar de computador, configure novamente
- Para sair do painel, clique em "Sair" no canto superior direito
- Para voltar ao blog, clique em "Ver Blog"

---

## Estrutura dos Dados

Cada seção do blog corresponde a um arquivo JSON na pasta `dados/`:

| Seção | Arquivo |
|-------|---------|
| Posts/Notícias | `posts.json` |
| Resoluções e Atas | `documentos.json` |
| Entidades | `entidades.json` |
| Reuniões | `reunioes.json` |
| Conferências | `conferencias.json` |
| Eleições | `eleicoes.json` |
| Sobre o CAS/DF | `sobre.json` |
| Fiscalização | `fiscalizacao.json` |
| Inscrição | `inscricao.json` |
| Planejamento | `planejamento.json` |

---

## Suporte

Em caso de dúvidas ou problemas tecnicos, entre em contato com o desenvolvedor responsável.
