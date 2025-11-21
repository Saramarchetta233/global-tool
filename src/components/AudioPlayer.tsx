'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  language?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, language = 'it-IT', className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'browser' | 'backend'>('browser');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Browser TTS functions
  const playBrowserTTS = () => {
    if ('speechSynthesis' in window) {
      setIsLoading(true);
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const pauseBrowserTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const stopBrowserTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Backend TTS functions
  const generateBackendAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });

      if (response.ok) {
        const data = await response.json();
        setAudioUrl(data.audioUrl);
        return data.audioUrl;
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Backend TTS error:', error);
      // Fallback to browser TTS
      setMode('browser');
      playBrowserTTS();
    } finally {
      setIsLoading(false);
    }
  };

  const playBackendAudio = async () => {
    let url = audioUrl;
    if (!url) {
      url = await generateBackendAudio();
    }
    
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseBackendAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopBackendAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Unified control functions
  const handlePlay = () => {
    if (mode === 'browser') {
      playBrowserTTS();
    } else {
      playBackendAudio();
    }
  };

  const handlePause = () => {
    if (mode === 'browser') {
      pauseBrowserTTS();
    } else {
      pauseBackendAudio();
    }
  };

  const handleStop = () => {
    if (mode === 'browser') {
      stopBrowserTTS();
    } else {
      stopBackendAudio();
    }
  };

  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setIsPlaying(false);
      const onError = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      return () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
        {/* Mode Toggle */}
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as 'browser' | 'backend');
            handleStop(); // Stop current playback when switching modes
          }}
          className="bg-transparent text-white text-xs border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-purple-400"
        >
          <option value="browser" className="bg-gray-800">Browser TTS</option>
          <option value="backend" className="bg-gray-800">Backend TTS</option>
        </select>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          ) : (
            <>
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors"
                  title="Play"
                >
                  <Play className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors"
                  title="Pause"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleStop}
                className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                title="Stop"
              >
                <Square className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Volume2 className="w-3 h-3" />
          <span>Ascolta</span>
        </div>
      </div>

      {/* Hidden audio element for backend TTS */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AudioPlayer;