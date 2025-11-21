'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Eye, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserStudySessions, StudyHistory, deleteStudySession } from '@/lib/study-history';

interface HistoryViewProps {
  onSelectDocument: (document: any) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectDocument }) => {
  const [history, setHistory] = useState<StudyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sessions = await getUserStudySessions(user.id);
      setHistory(sessions);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item =>
    item.docTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questa sessione?')) {
      const success = await deleteStudySession(sessionId);
      if (success) {
        fetchHistory(); // Refresh the list
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-300">Caricamento storico...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Storico Documenti</h3>
          <p className="text-gray-400">I tuoi documenti elaborati precedentemente</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca nei documenti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
          />
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {searchTerm ? 'Nessun documento trovato' : 'Nessun documento elaborato'}
          </h3>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Prova con un termine di ricerca diverso.' : 'Carica il tuo primo documento per iniziare.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all duration-300 cursor-pointer"
              onClick={() => onSelectDocument(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {item.docTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                        {item.targetLanguage !== 'Auto' && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">
                            {item.targetLanguage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {item.summaryShort.substring(0, 150)}...
                  </p>

                  {/* Content indicators */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs">
                      <FileText className="w-3 h-3" />
                      <span>Riassunti</span>
                    </div>
                    {item.flashcards.length > 0 && (
                      <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                        <span>{item.flashcards.length} Flashcard</span>
                      </div>
                    )}
                    {item.quizData.length > 0 && (
                      <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-md text-xs">
                        <span>{item.quizData.length} Quiz</span>
                      </div>
                    )}
                    {item.conceptMap.length > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md text-xs">
                        <span>Mappa</span>
                      </div>
                    )}
                    {(item.tutorMessages?.length || 0) > 0 && (
                      <div className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md text-xs">
                        <span>{item.tutorMessages?.length} Chat</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Convert StudyHistory to old format for compatibility
                      const convertedItem = {
                        id: item.id,
                        riassunto_breve: item.summaryShort,
                        riassunto_esteso: item.summaryExtended,
                        mappa_concettuale: item.conceptMap,
                        flashcard: item.flashcards,
                        quiz: item.quizData,
                        guida_esame: item.studyInOneHour,
                        sessionId: item.id
                      };
                      onSelectDocument(convertedItem);
                    }}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;