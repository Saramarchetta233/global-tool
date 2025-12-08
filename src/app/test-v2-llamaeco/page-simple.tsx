'use client';

import React, { useState } from 'react';

import LoadingScreen from '@/components/LoadingScreen';

const StudiusAIV2Test: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  if (authLoading) {
    return <LoadingScreen stage="extracting" progress={50} />;
  }

  if (loading) {
    return <LoadingScreen stage="extracting" progress={50} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white">Test Page</h1>
        <p className="text-gray-300 mt-4">Se vedi questo, la pagina funziona!</p>
      </div>
    </div>
  );
};

export default StudiusAIV2Test;