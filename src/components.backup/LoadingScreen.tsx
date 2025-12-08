'use client';

import { BookOpen, Brain, Clock,FileText, Play, Sparkles } from 'lucide-react';
import React from 'react';

interface LoadingScreenProps {
  stage?: 'extracting' | 'generating' | 'finishing';
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ stage = 'extracting', progress = 0 }) => {
  const stages = {
    extracting: {
      icon: FileText,
      title: 'Estrazione del testo',
      description: 'Sto analizzando il contenuto del tuo PDF...',
      color: 'from-blue-500 to-cyan-500'
    },
    generating: {
      icon: Brain,
      title: 'Generazione materiali',
      description: 'L\'AI sta creando riassunti, flashcard e quiz personalizzati...',
      color: 'from-purple-500 to-pink-500'
    },
    finishing: {
      icon: Sparkles,
      title: 'Finalizzazione',
      description: 'Quasi pronto! Sto ottimizzando i tuoi materiali di studio...',
      color: 'from-green-500 to-emerald-500'
    }
  };

  const currentStage = stages[stage];
  const IconComponent = currentStage.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md mx-auto p-8 text-center">
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="w-32 h-32 mx-auto relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentStage.color} opacity-20 animate-ping`}></div>
            <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${currentStage.color} opacity-40 animate-pulse`}></div>
            
            {/* Inner icon container */}
            <div className={`absolute inset-4 rounded-full bg-gradient-to-r ${currentStage.color} flex items-center justify-center shadow-2xl animate-bounce`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            
            {/* Rotating elements */}
            <div className="absolute inset-0 animate-spin">
              <div className="w-2 h-2 bg-white rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              <div className="w-2 h-2 bg-white rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
              <div className="w-2 h-2 bg-white rounded-full absolute left-0 top-1/2 transform -translate-y-1/2"></div>
              <div className="w-2 h-2 bg-white rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{currentStage.title}</h2>
          <p className="text-gray-300 text-lg leading-relaxed">{currentStage.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${currentStage.color} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">{Math.round(progress)}% completato</p>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: FileText, label: 'Riassunti', active: stage !== 'extracting' },
            { icon: BookOpen, label: 'Flashcard', active: stage === 'finishing' },
            { icon: Play, label: 'Quiz', active: stage === 'finishing' },
            { icon: Clock, label: 'Studio 1h', active: stage === 'finishing' }
          ].map((item, index) => {
            const FeatureIcon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${
                  item.active 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg' 
                    : 'bg-white/10 border border-white/20'
                }`}>
                  <FeatureIcon className={`w-6 h-6 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className={`text-xs font-medium ${item.active ? 'text-green-300' : 'text-gray-400'}`}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Encouraging message */}
        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 justify-center text-purple-300">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">La tua esperienza di apprendimento personalizzata sta per iniziare!</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;