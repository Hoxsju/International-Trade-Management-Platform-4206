-- Create Order Requests Table for Edit/Cancel Requests
CREATE TABLE IF NOT EXISTS order_requests_rg2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  buyer_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('edit', 'cancel')),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_response TEXT,
  admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE order_requests_rg2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own requests" ON order_requests_rg2024
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can create requests for their orders" ON order_requests_rg2024
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON order_requests_rg2024
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_rg2024 
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_requests_order_id ON order_requests_rg2024(order_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_buyer_id ON order_requests_rg2024(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status ON order_requests_rg2024(status);
CREATE INDEX IF NOT EXISTS idx_order_requests_type ON order_requests_rg2024(request_type);

-- Add comments
COMMENT ON TABLE order_requests_rg2024 IS 'Stores buyer requests for order edits and cancellations';
COMMENT ON COLUMN order_requests_rg2024.request_type IS 'Type of request: edit or cancel';
COMMENT ON COLUMN order_requests_rg2024.reason IS 'Buyer explanation for the request';
COMMENT ON COLUMN order_requests_rg2024.details IS 'Additional details about the request';
COMMENT ON COLUMN order_requests_rg2024.status IS 'Request status: pending, approved, rejected, completed';