import { supabase } from '@/lib/supabase';

export interface CreditResult {
  success: boolean;
  credits?: number;
  error?: string;
}

export interface CreditBalance {
  credits: number;
  error?: string;
}

export class CreditManager {
  
  static async getUserCredits(userId: string): Promise<CreditBalance> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return { credits: 0, error: 'Unable to fetch credits' };
      }

      return { credits: data?.credits || 0 };
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return { credits: 0, error: 'Network error' };
    }
  }

  static async consumeCredits(
    userId: string, 
    amount: number, 
    description?: string,
    featureType?: string
  ): Promise<CreditResult> {
    try {
      const { data, error } = await supabase
        .rpc('consume_credits', {
          p_user_id: userId,
          p_amount: amount,
          p_description: description,
          p_feature_type: featureType
        });

      if (error) {
        console.error('Error consuming credits:', error);
        return { success: false, error: 'Database error' };
      }

      if (!data.success) {
        return { 
          success: false, 
          error: data.error === 'insufficient_credits' ? 'Crediti insufficienti' : data.error,
          credits: data.current_credits 
        };
      }

      return { 
        success: true, 
        credits: data.new_balance 
      };
    } catch (error) {
      console.error('Error in consumeCredits:', error);
      return { success: false, error: 'Network error' };
    }
  }

  static async addCredits(
    userId: string, 
    amount: number, 
    description?: string,
    operation = 'add'
  ): Promise<CreditResult> {
    try {
      const { data, error } = await supabase
        .rpc('add_credits', {
          p_user_id: userId,
          p_amount: amount,
          p_description: description,
          p_operation: operation
        });

      if (error) {
        console.error('Error adding credits:', error);
        return { success: false, error: 'Database error' };
      }

      return { 
        success: true, 
        credits: data.new_balance 
      };
    } catch (error) {
      console.error('Error in addCredits:', error);
      return { success: false, error: 'Network error' };
    }
  }

  static async getCreditLogs(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('credit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching credit logs:', error);
        return { logs: [], error: 'Unable to fetch logs' };
      }

      return { logs: data || [] };
    } catch (error) {
      console.error('Error in getCreditLogs:', error);
      return { logs: [], error: 'Network error' };
    }
  }
}