import React, { useState } from 'react'
import { User, LogOut, History, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface UserMenuProps {
  onShowHistory: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ onShowHistory }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => {
                onShowHistory()
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <History className="w-4 h-4" />
              <span>Analysis History</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}