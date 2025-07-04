import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useAnalysisHistory() {
  const { user } = useAuth()

  const saveAnalysis = async (
    type: 'email' | 'url',
    input: string,
    result: any
  ) => {
    if (!user) {
      console.log('User not authenticated, skipping history save')
      return
    }

    try {
      const { error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          type,
          input,
          result,
        })

      if (error) {
        console.error('Error saving analysis to history:', error)
        throw error
      }
      
      console.log('Analysis saved to history successfully')
    } catch (error) {
      console.error('Error saving analysis:', error)
    }
  }

  const getHistory = async (limit = 50) => {
    if (!user) return { data: [], error: null }

    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  const deleteAnalysis = async (id: string) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Extra security check

      return { error }
    } catch (error) {
      return { error }
    }
  }

  return { 
    saveAnalysis, 
    getHistory, 
    deleteAnalysis,
    isAuthenticated: !!user 
  }
}