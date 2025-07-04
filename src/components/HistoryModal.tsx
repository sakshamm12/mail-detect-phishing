import React, { useEffect, useState } from 'react'
import { X, History, Mail, Link, Calendar, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface HistoryItem {
  id: string
  type: 'email' | 'url'
  input: string
  result: any
  created_at: string
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'email' | 'url'>('all')
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory()
    }
  }, [isOpen, user])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id)

      if (error) throw error
      setHistory(history.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting history item:', error)
    }
  }

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.type === filter
  )

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-400" />
            Analysis History
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex space-x-4 mb-4">
          {(['all', 'email', 'url'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType === 'email' ? 'Emails' : 'URLs'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analysis history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.type === 'email' ? (
                          <Mail className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Link className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-white font-medium capitalize">
                          {item.type} Analysis
                        </span>
                        <span className={`text-sm font-medium ${getRiskColor(item.result.riskLevel)}`}>
                          {item.result.riskLevel} risk
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm font-mono break-all mb-2">
                        {item.input}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <span>Score: {item.result.score}/100</span>
                        <span>{item.result.issues?.length || 0} issues</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}