"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceOptions {
  autoSpeak?: boolean;
  language?: string;
  speechRate?: number;
  speechPitch?: number;
  speechVolume?: number;
}

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  clearError: () => void;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    autoSpeak = false,
    language = 'en-US',
    speechRate = 0.9,
    speechPitch = 1,
    speechVolume = 0.8
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    
    setIsSupported(speechRecognitionSupported && speechSynthesisSupported);
    
    if (speechSynthesisSupported) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
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

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (!event.results[i].isFinal) {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, language]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access to use voice input.");
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text.trim() || isSpeaking) return;

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = speechVolume;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [speechRate, speechPitch, speechVolume, isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError
  };
}

// Add speech recognition types to window
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}