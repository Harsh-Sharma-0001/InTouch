import React, { useState, useEffect, useRef } from 'react';
import { Subtitles, X } from 'lucide-react';

const LiveCaptions = ({ stream, enabled }) => {
  const [captions, setCaptions] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const captionsEndRef = useRef(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (!SpeechRecognition || !enabled) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const results = Array.from(event.results);
        const transcript = results
          .map(result => result[0].transcript)
          .join(' ');

        const lastResult = results[results.length - 1];
        const isFinal = lastResult.isFinal;

        if (isFinal) {
          setCaptions(prev => {
            const newCaptions = [...prev, {
              text: lastResult[0].transcript,
              timestamp: new Date().toLocaleTimeString(),
              final: true
            }];
            // Keep only last 10 captions
            return newCaptions.slice(-10);
          });
        } else {
          // Update interim result
          setCaptions(prev => {
            const withoutInterim = prev.filter(c => c.final);
            return [...withoutInterim, {
              text: lastResult[0].transcript,
              timestamp: new Date().toLocaleTimeString(),
              final: false
            }];
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart recognition after a brief pause
          setTimeout(() => {
            if (recognitionRef.current && enabled) {
              try {
                recognition.start();
              } catch (e) {
                // Already started
              }
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        // Restart recognition if still enabled
        if (enabled && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }
      };

      recognitionRef.current = recognition;

      if (enabled) {
        recognition.start();
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  }, [enabled, stream]);

  useEffect(() => {
    // Auto-scroll to bottom when new captions arrive
    if (captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [captions]);

  if (!enabled || !isSupported) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Subtitles size={16} className="text-primary" />
            <span className="text-sm font-semibold text-white">Live Captions</span>
          </div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-h-32 overflow-y-auto space-y-2">
          {captions.length === 0 ? (
            <p className="text-gray-400 text-sm">Listening...</p>
          ) : (
            captions.map((caption, index) => (
              <div key={index} className={`text-sm ${caption.final ? 'text-white' : 'text-gray-400 italic'}`}>
                <span className="text-xs text-gray-500 mr-2">{caption.timestamp}</span>
                {caption.text}
              </div>
            ))
          )}
          <div ref={captionsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LiveCaptions;

