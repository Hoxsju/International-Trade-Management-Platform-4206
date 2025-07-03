import { supabase } from '../config/supabase'

export class AdminLogService {
  // Log admin/sub-admin actions
  static async logAction(actionData) {
    try {
      const logEntry = {
        admin_id: actionData.adminId,
        admin_email: actionData.adminEmail,
        admin_name: actionData.adminName,
        admin_type: actionData.adminType, // 'admin' or 'sub_admin'
        action_type: actionData.actionType, // 'create_user', 'edit_user', 'delete_user', 'verify_supplier', etc.
        target_type: actionData.targetType, // 'user', 'supplier', 'order', etc.
        target_id: actionData.targetId,
        target_email: actionData.targetEmail,
        action_details: actionData.details, // JSON with specific details
        ip_address: actionData.ipAddress || 'unknown',
        user_agent: actionData.userAgent || 'unknown',
        timestamp: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('admin_action_logs_rg2024')
        .insert([logEntry])
        .select()
        .single()

      if (error) {
        console.error('Failed to log admin action:', error)
        return { success: false, error }
      }

      console.log('✅ Admin action logged:', logEntry.action_type)
      return { success: true, data }
    } catch (error) {
      console.error('Admin logging error:', error)
      return { success: false, error }
    }
  }

  // Get logs for a specific admin
  static async getAdminLogs(adminId, filters = {}) {
    try {
      let query = supabase
        .from('admin_action_logs_rg2024')
        .select('*')
        .eq('admin_id', adminId)
        .order('timestamp', { ascending: false })

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }
      
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType)
      }
      
      if (filters.targetType) {
        query = query.eq('target_type', filters.targetType)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch admin logs:', error)
        return { success: false, error }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Admin logs fetch error:', error)
      return { success: false, error }
    }
  }

  // Get all logs (admin only)
  static async getAllLogs(filters = {}) {
    try {
      let query = supabase
        .from('admin_action_logs_rg2024')
        .select('*')
        .order('timestamp', { ascending: false })

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }
      
      if (filters.adminType) {
        query = query.eq('admin_type', filters.adminType)
      }
      
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType)
      }
      
      if (filters.targetType) {
        query = query.eq('target_type', filters.targetType)
      }

      if (filters.adminId) {
        query = query.eq('admin_id', filters.adminId)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch all logs:', error)
        return { success: false, error }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('All logs fetch error:', error)
      return { success: false, error }
    }
  }

  // Get logs for sub-admins only (admin view)
  static async getSubAdminLogs(filters = {}) {
    try {
      let query = supabase
        .from('admin_action_logs_rg2024')
        .select('*')
        .eq('admin_type', 'sub_admin')
        .order('timestamp', { ascending: false })

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }
      
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType)
      }
      
      if (filters.targetType) {
        query = query.eq('target_type', filters.targetType)
      }

      if (filters.subAdminId) {
        query = query.eq('admin_id', filters.subAdminId)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch sub-admin logs:', error)
        return { success: false, error }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Sub-admin logs fetch error:', error)
      return { success: false, error }
    }
  }

  // Helper to get client info
  static getClientInfo() {
    return {
      ipAddress: 'client-ip', // This would need server-side implementation
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    }
  }

  // Create log entry helper
  static createLogEntry(adminUser, actionType, targetType, targetId, targetEmail, details = {}) {
    const clientInfo = this.getClientInfo()
    
    return {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.full_name || adminUser.email,
      adminType: adminUser.account_type, // 'admin' or 'sub_admin'
      actionType,
      targetType,
      targetId,
      targetEmail,
      details,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent
    }
  }
}