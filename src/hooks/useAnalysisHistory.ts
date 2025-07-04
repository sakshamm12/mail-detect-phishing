import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useAnalysisHistory() {
  const { user } = useAuth()

  const saveAnalysis = async (
    type: 'email' | 'url',
    input: string,
    result: any
  ) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          type,
          input,
          result,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving analysis:', error)
    }
  }

  return { saveAnalysis }
}