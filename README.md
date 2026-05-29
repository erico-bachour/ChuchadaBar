# Chuchada Bar - Sistema de Gerenciamento de Eventos

Um aplicativo web moderno para gerenciar eventos em bar com até 200 pessoas, com sistema de cálculo de CMV (Custo de Mercadoria Vendida) e customização de pacotes.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Autenticação)
- **Estilo**: Tailwind CSS
- **Gráficos**: Recharts
- **Roteamento**: React Router

## 📋 Funcionalidades

- ✅ Autenticação de usuários com Supabase Auth
- ✅ Cadastro e gerenciamento de pratos com CMV
- ✅ Sistema de categorização de pratos
- ✅ Cálculo automático de margem de lucro
- ✅ Dashboard com estatísticas
- ✅ Criação de pacotes customizados
- ✅ Gestão de eventos
- ✅ Responsivo (mobile/desktop)

## 🔧 Configuração

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no [Supabase](https://supabase.com) (gratuita)

### Instalação

1. **Clone ou navegue até o projeto**
   ```bash
   cd webapp
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Supabase**
   - Crie uma conta em [Supabase](https://supabase.com)
   - Crie um novo projeto
   - Copie suas credenciais (URL e chave anon)
   - Crie `.env.local` com suas credenciais

4. **Configure o banco de dados** - veja `.env.example` para instruções

## 🏃 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```
Acesse em `http://localhost:5173`

### Produção
```bash
npm run build
npm run preview
```

## 📁 Estrutura

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── services/       # Integração com APIs
├── types/          # Tipos TypeScript
├── utils/          # Funções utilitárias
└── hooks/          # Custom hooks
```

## 🌐 Deploy

Recomenda-se usar **Vercel** ou **Netlify** com configuração de variáveis de ambiente Supabase.


```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
