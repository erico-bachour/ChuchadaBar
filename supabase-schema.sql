-- Chuchada Bar database schema

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

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON ingredients;
CREATE POLICY "Authenticated users can manage ingredients"
ON ingredients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_unit VARCHAR(20) NOT NULL CHECK (purchase_unit IN ('g', 'kg', 'ml', 'l', 'un')),
  package_quantity NUMERIC(10,3) NOT NULL,
  package_price NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(12,6) NOT NULL,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage ingredient prices" ON ingredient_prices;
CREATE POLICY "Authenticated users can manage ingredient prices"
ON ingredient_prices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
