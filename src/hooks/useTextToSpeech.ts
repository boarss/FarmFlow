import { useState, useCallback, useEffect, useRef } from 'react';
import { Language } from '../types';

export interface UseTextToSpeechOptions {
  language?: Language;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface UseTextToSpeechReturn {
  speak: (text: string, language?: Language) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  error: Error | null;
  availableVoices: SpeechSynthesisVoice[];
}

/**
 * Language to voice locale mapping
 */
const LANGUAGE_LOCALE_MAP: Record<Language, string[]> = {
  english: ['en-US', 'en-GB', 'en'],
  hausa: ['ha-NG', 'ha'],
  yoruba: ['yo-NG', 'yo'],
  igbo: ['ig-NG', 'ig'],
};

/**
 * Custom hook for Text-to-Speech functionality
 * Uses Web Speech Synthesis API for multi-language voice output
 */
export function useTextToSpeech(
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn {
  const {
    language = 'english',
    rate = 0.9,
    pitch = 1,
    volume = 1,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  const isSupported = !!(
    typeof window !== 'undefined' &&
    window.speechSynthesis &&
    window.SpeechSynthesisUtterance
  );

  /**
   * Load available voices
   */
  const loadVoices = useCallback(() => {
    if (!isSupported) return;

    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
  }, [isSupported]);

  /**
   * Find best voice for language
   */
  const findVoiceForLanguage = useCallback(
    (lang: Language): SpeechSynthesisVoice | null => {
      const locales = LANGUAGE_LOCALE_MAP[lang];
      
      // Try to find exact match
      for (const locale of locales) {
        const voice = availableVoices.find(v => 
          v.lang.toLowerCase().startsWith(locale.toLowerCase())
        );
        if (voice) return voice;
      }

      // Fallback to default voice
      return availableVoices.find(v => v.default) || availableVoices[0] || null;
    },
    [availableVoices]
  );

  /**
   * Speak text
   */
  const speak = useCallback(
    (text: string, speakLanguage?: Language) => {
      if (!isSupported) {
        const err = new Error('Text-to-speech is not supported on this device');
        setError(err);
        onError?.(err);
        return;
      }

      try {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Set voice based on language
        const targetLanguage = speakLanguage || language;
        const voice = findVoiceForLanguage(targetLanguage);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          // Fallback to language code
          const locales = LANGUAGE_LOCALE_MAP[targetLanguage];
          utterance.lang = locales[0];
        }

        // Set speech parameters
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          onEnd?.();
        };

        utterance.onerror = (event) => {
          const err = new Error(`Speech synthesis error: ${event.error}`);
          setError(err);
          setIsSpeaking(false);
          setIsPaused(false);
          onError?.(err);
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        const error = err instanceof Error 
          ? err 
          : new Error('Failed to speak text');
        setError(error);
        setIsSpeaking(false);
        onError?.(error);
      }
    },
    [isSupported, language, rate, pitch, volume, findVoiceForLanguage, onEnd, onError]
  );

  /**
   * Stop speaking
   */
  const stop = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking]);

  /**
   * Pause speaking
   */
  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);

  /**
   * Resume speaking
   */
  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Load voices on mount and when they change
  useEffect(() => {
    if (!isSupported) return;

    loadVoices();

    // Voices may load asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, loadVoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    error,
    availableVoices,
  };
}

// Made with Bob