# AutonomoPro

Sistema para gestao de autonomos, processamento de RPAs e acompanhamento de retencoes tributarias em ambiente multi-tenant.

## Objetivo

O AutonomoPro centraliza o cadastro de prestadores, a esteira de pagamentos, o acompanhamento de pendencias financeiras e a parametrizacao tributaria. A aplicacao foi desenhada para cenarios com multiplas unidades gestoras, como universidades, fundacoes e areas corporativas.

## Estrutura

- `frontend/`: aplicacao web em Next.js 16 + React 19
- `backend/`: API em NestJS com Prisma
- `backend/prisma/`: schema, migrations e seeds do banco

## Como o sistema funciona

### 1. Dashboard

O dashboard apresenta a visao executiva do tenant atual:

- total de autonomos ativos
- valor bruto repassado
- impostos retidos
- alertas operacionais
- preview do historico da planilha mestra

Tambem concentra atalhos para:

- criar ficha de autonomo
- importar lote
- exportar relatorio
- editar configuracoes tributarias

### 2. Gestao de autonomos

Na rota `/autonomos` o operador:

- cadastra novos prestadores
- edita dados cadastrais
- inativa registros
- pesquisa por nome, documento ou status

### 3. Esteira de pagamentos

Na rota `/pagamentos` ficam os lancamentos de RPA com filtros por etapa:

- todos
- em elaboracao
- em aprovacao
- pagos/liberados

Cada lancamento leva para o detalhe em `/pagamentos/[id]`, onde e possivel:

- revisar dados pessoais e fiscais
- rejeitar com motivo obrigatorio
- aprovar e liquidar
- copiar o Universal ID
- baixar o espelho do recibo

IDs inexistentes retornam 404 customizado.

### 4. Multi-tenant

Na rota `/tenants` a aplicacao exibe as unidades gestoras e seus indicadores consolidados. A pagina permite:

- abrir consolidado global
- fundar/cadastrar nova instituicao
- acessar o workspace de um tenant
- abrir menu de acoes por tenant

As contagens de pendencias sao reativas no frontend e refletem alteracoes feitas no fluxo de pagamentos.

### 5. Engenharia tributaria

Na rota `/configuracoes` o time pode ajustar parametros fiscais, incluindo:

- configuracao de INSS
- deducoes de IRRF
- edicao inline da tabela de faixas

## Fluxo operacional resumido

1. Cadastrar ou atualizar o autonomo.
2. Importar ou criar o lancamento de pagamento.
3. Revisar o RPA no detalhe.
4. Rejeitar com justificativa ou aprovar e liquidar.
5. Acompanhar alertas, status e consolidado por tenant.
6. Ajustar tabelas tributarias quando necessario.

## Execucao local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

## Observacoes

- O frontend usa dados mockados compartilhados para simular o comportamento do sistema.
- Parte do estado operacional recente fica sincronizada no navegador para refletir mudancas entre telas.
- O backend possui estrutura pronta para evolucao da integracao real com banco e servicos fiscais.
