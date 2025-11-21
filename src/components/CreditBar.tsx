'use client';

import React, { useState } from 'react';
import { Coins, Plus, User, LogOut, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface CreditBarProps {
  onPurchaseCredits?: () => void;
  credits?: number; // Override credits from auth context
}

const CreditBar: React.FC<CreditBarProps> = ({ onPurchaseCredits, credits }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Use prop credits if provided, otherwise fall back to user credits
  const displayCredits = credits !== undefined ? credits : (user?.credits || 0);

  if (!user) return null;

  return (
    <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Credits Display */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold text-lg">{displayCredits.toLocaleString()}</span>
                <span className="text-gray-300 text-sm">crediti</span>
              </div>
            </div>
            
            {/* Purchase Credits Button */}
            <button
              onClick={onPurchaseCredits}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Acquista Crediti</span>
              <span className="sm:hidden">+</span>
            </button>
            
            {/* Credits Info */}
            <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
              <Info className="w-4 h-4" />
              <span>5 crediti per messaggio tutor</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white font-medium text-sm">{user.email}</p>
                <p className="text-gray-300 text-xs">Utente Premium</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50">
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-gray-300 text-sm">{displayCredits} crediti disponibili</p>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onPurchaseCredits?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
                      >
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span>Gestisci Crediti</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Esci</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBar;