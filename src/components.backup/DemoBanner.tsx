'use client';

import { Code, Database,Zap } from 'lucide-react';
import React from 'react';

const DemoBanner: React.FC = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Zap className="w-4 h-4" />
        <span>MODALITÀ DEMO ATTIVA</span>
        <Code className="w-4 h-4" />
        <span>|</span>
        <Database className="w-4 h-4" />
        <span>Database simulato in memoria - Dati non permanenti</span>
      </div>
      
      <div className="text-xs mt-1 opacity-90">
        <strong>Utenti di test:</strong> test@demo.com/password123 • admin@demo.com/admin123 • user@studius.test/testing123
      </div>
    </div>
  );
};

export default DemoBanner;