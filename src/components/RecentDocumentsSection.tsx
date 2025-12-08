'use client';

import { ArrowRight,Calendar, FileText } from 'lucide-react';
import React, { useEffect,useState } from 'react';

import { useAuth } from '@/lib/auth-context';

interface HistoryDocument {
  id: string;
  fileName: string;
  title: string;
  processedAt: string;
  lastUsedAt: string;
  pageCount?: number;
  fileSize?: number;
  riassunto_breve: string;
  riassunto_esteso: string;
  mappa_concettuale: any[];
  flashcard: any[];
  quiz: any[];
  guida_esame: string;
  sessionId: string;
}

interface RecentDocumentsSectionProps {
  onSelectDocument: (document: HistoryDocument) => void;
  onShowAllDocuments: () => void;
}

const RecentDocumentsSection: React.FC<RecentDocumentsSectionProps> = ({
  onSelectDocument,
  onShowAllDocuments
}) => {
  const [recentDocuments, setRecentDocuments] = useState<HistoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      if (!user?.id || !token) {
        setRecentDocuments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch('/api/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Prendi solo i primi 3 documenti (più recenti)
          const recent = (data.history || []).slice(0, 3);
          setRecentDocuments(recent);
        } else {
          setRecentDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching recent documents:', error);
        setRecentDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDocuments();
  }, [user?.id, token]);

  // Non mostrare nulla se non ci sono documenti o se sta caricando
  if (loading || recentDocuments.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric'
    });
  };

  const truncateFileName = (fileName: string, maxLength = 25) => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Riprendi a studiare
        </h2>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {recentDocuments.map((doc, index) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className={`bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-500/10 border border-white/10 hover:border-purple-500/50 border-l-4 border-l-purple-500/70 hover:border-l-purple-400 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 group ${
              index >= 2 ? 'hidden md:block' : ''
            }`}
          >
            {/* Document Icon */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white text-sm sm:text-base font-medium truncate group-hover:text-purple-300 transition-colors">
                  {truncateFileName(doc.title || doc.fileName, 20)}
                </h3>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-1 text-xs sm:text-sm text-gray-400">
              {doc.pageCount && (
                <div className="flex items-center gap-1">
                  <span>{doc.pageCount} pagine</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(doc.processedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <button
          onClick={onShowAllDocuments}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 rounded-lg font-medium text-sm transition-all duration-300"
        >
          <span>📚 Vedi tutti i documenti</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecentDocumentsSection;