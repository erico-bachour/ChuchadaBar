# 🚀 Guia de Configuração do Supabase

## Passo 1: Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub, Google, ou email)
4. Crie um novo projeto e defina uma senha

## Passo 2: Copiar Credenciais

1. Na página do seu projeto, clique em "Settings" > "API"
2. Copie:
   - **Project URL**: Começa com `https://`
   - **Anon Public Key**: Chave pública para o frontend
3. Crie um arquivo `.env.local` na raiz do projeto `webapp/`

```bash
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

## Passo 3: Criar Tabelas

1. No painel Supabase, vá para "SQL Editor"
2. Clique em "New Query"
3. Cole o SQL abaixo:

```sql
-- Tabela de Ingredientes
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  purchase_unit VARCHAR(20) NOT NULL CHECK (purchase_unit IN ('g', 'kg', 'ml', 'l', 'un')),
  package_quantity NUMERIC(10,3) NOT NULL,
  package_price NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(12,6) NOT NULL,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pratos
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cmv NUMERIC(10,2) NOT NULL,
  category VARCHAR(100),
  price NUMERIC(10,2),
  servings INTEGER,
  ingredients TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pacotes
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  total_cmv NUMERIC(10,2),
  base_price NUMERIC(10,2),
  min_people INTEGER,
  max_people INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Relação Pratos-Pacotes
CREATE TABLE IF NOT EXISTS package_dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  event_date TIMESTAMP,
  people_count INTEGER,
  location VARCHAR(255),
  package_id UUID REFERENCES packages(id),
  total_budget NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'proposal',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_dishes ENABLE ROW LEVEL SECURITY;

-- Politica para usuarios autenticados gerenciarem ingredientes
DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON ingredients;
CREATE POLICY "Authenticated users can manage ingredients"
ON ingredients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

4. Clique em "Execute" (ou Ctrl+Enter)

## Passo 4: Configurar Autenticação

1. Vá para "Authentication" > "Providers"
2. Certifique-se que "Email" está habilitado
3. Configure as políticas de RLS se necessário (opcional)

## Passo 5: Iniciar o Servidor

```bash
cd webapp
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 🔐 Próximos Passos

- [ ] Criar um usuário na autenticação do Supabase
- [ ] Fazer login no app
- [ ] Adicionar alguns pratos de exemplo
- [ ] Criar pacotes
- [ ] Testar a funcionalidade

## 📞 Suporte

Se tiver problemas:
1. Verifique se as credenciais `.env.local` estão corretas
2. Confirme que as tabelas foram criadas no Supabase
3. Verifique a console do navegador (F12) para erros
4. Verifique os logs do terminal onde `npm run dev` está rodando
