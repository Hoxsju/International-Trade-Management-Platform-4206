-- Create Service Orders Table
CREATE TABLE IF NOT EXISTS service_orders_rg2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL,
  buyer_company TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  supplier_id UUID,
  supplier_name TEXT,
  supplier_email TEXT,
  supplier_phone TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('verification', 'inspection', 'testing', 'shipping', 'certificates')),
  service_name TEXT NOT NULL,
  service_cost DECIMAL(10,2) DEFAULT 0,
  service_details JSONB,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE service_orders_rg2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own service orders" ON service_orders_rg2024
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can create service orders" ON service_orders_rg2024
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Admins can view all service orders" ON service_orders_rg2024
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_rg2024 
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_orders_service_order_id ON service_orders_rg2024(service_order_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_buyer_id ON service_orders_rg2024(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_supplier_id ON service_orders_rg2024(supplier_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_service_type ON service_orders_rg2024(service_type);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders_rg2024(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON service_orders_rg2024(created_at);

-- Add comments
COMMENT ON TABLE service_orders_rg2024 IS 'Stores individual service orders placed by buyers';
COMMENT ON COLUMN service_orders_rg2024.service_type IS 'Type of service: verification, inspection, testing, shipping, certificates';
COMMENT ON COLUMN service_orders_rg2024.service_details IS 'JSON object containing service-specific requirements and details';
COMMENT ON COLUMN service_orders_rg2024.status IS 'Service order status: pending_review, in_progress, completed, cancelled';