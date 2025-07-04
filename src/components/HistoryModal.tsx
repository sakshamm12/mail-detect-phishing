import React, { useEffect, useState } from 'react'
import { X, History, Mail, Link, Calendar, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
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
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory()
    }
  }, [isOpen, user])

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setHistory(data || [])
    } catch (error: any) {
      console.error('Error fetching history:', error)
      setError('Failed to load analysis history. Please try again.')
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

  const getRiskIcon = (riskLevel: string, isSafe: boolean) => {
    if (isSafe) return <CheckCircle className="w-4 h-4 text-green-400" />
    if (riskLevel === 'high') return <XCircle className="w-4 h-4 text-red-400" />
    return <AlertCircle className="w-4 h-4 text-yellow-400" />
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
              <span className="ml-2 text-xs opacity-75">
                ({filterType === 'all' ? history.length : history.filter(h => h.type === filterType).length})
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-slate-300">Loading your analysis history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchHistory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No analysis history found</p>
              <p className="text-sm">
                {filter === 'all' 
                  ? 'Start analyzing emails and URLs to see your history here'
                  : `No ${filter} analyses found. Try analyzing some ${filter}s first.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors duration-200"
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
                        {getRiskIcon(item.result.riskLevel, item.result.isSafe)}
                        <span className={`text-sm font-medium ${getRiskColor(item.result.riskLevel)}`}>
                          {item.result.isSafe ? 'Safe' : `${item.result.riskLevel} risk`}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm font-mono break-all mb-3 bg-slate-800/50 p-2 rounded">
                        {item.input}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="bg-slate-600 px-2 py-1 rounded">
                          Score: {item.result.score}/100
                        </span>
                        <span className="bg-slate-600 px-2 py-1 rounded">
                          {item.result.issues?.length || 0} issues
                        </span>
                      </div>

                      {item.result.issues && item.result.issues.length > 0 && (
                        <div className="text-xs text-slate-400">
                          <span className="font-medium">Issues: </span>
                          {item.result.issues.slice(0, 2).map((issue: any, idx: number) => (
                            <span key={idx} className="mr-2">
                              {issue.type}
                              {idx < Math.min(item.result.issues.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {item.result.issues.length > 2 && (
                            <span>+{item.result.issues.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-1"
                      title="Delete this analysis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && filteredHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600 text-center text-xs text-slate-400">
            Showing {filteredHistory.length} of {history.length} total analyses
          </div>
        )}
      </div>
    </div>
  )
}