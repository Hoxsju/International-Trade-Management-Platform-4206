import { supabase } from '../config/supabase'

export class OrderRequestService {
  // Create the order requests table if it doesn't exist
  static async ensureTableExists() {
    try {
      console.log('🔧 Ensuring order_requests_rg2024 table exists...')
      
      // First try to select from the table to see if it exists
      const { data, error } = await supabase
        .from('order_requests_rg2024')
        .select('count')
        .limit(1)
      
      if (!error) {
        console.log('✅ Table already exists')
        return { success: true, exists: true }
      }
      
      console.log('❌ Table does not exist, creating it...')
      
      // Create the table using SQL
      const createTableSQL = `
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
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      })
      
      if (createError) {
        console.error('❌ Failed to create table:', createError)
        throw createError
      }
      
      console.log('✅ Table created successfully')
      return { success: true, created: true }
      
    } catch (error) {
      console.error('💥 Table creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Create a request with table existence check
  static async createRequest(requestData) {
    try {
      console.log('📝 Creating order request...', requestData)
      
      // First ensure the table exists
      const tableResult = await this.ensureTableExists()
      if (!tableResult.success) {
        throw new Error(`Table setup failed: ${tableResult.error}`)
      }
      
      // Now try to insert the request
      const { data, error } = await supabase
        .from('order_requests_rg2024')
        .insert([{
          order_id: requestData.order_id,
          buyer_id: requestData.buyer_id,
          request_type: requestData.request_type,
          reason: requestData.reason,
          details: requestData.details || null,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Insert error:', error)
        throw error
      }

      console.log('✅ Request created successfully:', data)
      return { success: true, data }
      
    } catch (error) {
      console.error('💥 Request creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Alternative: Create request using direct SQL
  static async createRequestDirectSQL(requestData) {
    try {
      console.log('📝 Creating request using direct SQL...', requestData)
      
      const insertSQL = `
        INSERT INTO order_requests_rg2024 
        (order_id, buyer_id, request_type, reason, details, status, created_at, updated_at)
        VALUES 
        ('${requestData.order_id}', '${requestData.buyer_id}', '${requestData.request_type}', 
         '${requestData.reason.replace(/'/g, "''")}', 
         ${requestData.details ? `'${requestData.details.replace(/'/g, "''")}'` : 'NULL'}, 
         'pending', NOW(), NOW())
        RETURNING *;
      `
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: insertSQL 
      })
      
      if (error) {
        console.error('❌ Direct SQL insert error:', error)
        throw error
      }
      
      console.log('✅ Request created via SQL:', data)
      return { success: true, data }
      
    } catch (error) {
      console.error('💥 Direct SQL creation failed:', error)
      return { success: false, error: error.message }
    }
  }
}