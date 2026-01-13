import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onCommand?: (command: string) => void;
  triggerWords?: string[];
  language?: string;
}

interface SpeechRecognitionResult {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const useSpeechRecognition = ({
  onCommand,
  triggerWords = ['scan', 'capture', 'photo', 'click', 'take', 'shoot'],
  language = 'en-US'
}: UseSpeechRecognitionOptions = {}): SpeechRecognitionResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if it was supposed to be listening
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started or other error
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors, they're common
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();
      setTranscript(currentTranscript);

      // Check for trigger words
      if (finalTranscript && onCommand) {
        const words = finalTranscript.toLowerCase().split(/\s+/);
        const foundTrigger = triggerWords.some(trigger => 
          words.some(word => word.includes(trigger.toLowerCase()))
        );
        
        if (foundTrigger) {
          onCommand(finalTranscript);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [isSupported, language, onCommand, triggerWords]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useSpeechRecognition;
