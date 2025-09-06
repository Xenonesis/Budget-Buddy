"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Square, Play, Pause, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInterfaceProps {
  onTranscriptAction: (text: string) => void;
  onSpeakTextAction?: (speakFunction: (text: string) => void) => void;
  onListeningChangeAction?: (isListening: boolean, transcript?: string) => void;
  onTranscriptUpdateAction?: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
  mode?: 'compact' | 'expanded' | 'center';
}

export function VoiceInterface({ 
  onTranscriptAction, 
  onSpeakTextAction,
  onListeningChangeAction,
  onTranscriptUpdateAction,
  disabled = false,
  className = "",
  mode = 'compact'
}: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [microphoneTest, setMicrophoneTest] = useState<{
    testing: boolean;
    level: number;
    deviceInfo: string | null;
    error?: string;
  }>({
    testing: false,
    level: 0,
    deviceInfo: null,
    error: undefined
  });
  
  // Performance monitoring
  const performanceRef = useRef({
    recognitionStartTime: 0,
    speechStartTime: 0,
    errorCount: 0,
    successCount: 0,
    speechTimeoutId: null as NodeJS.Timeout | null
  });

  // Browser detection for optimizations
  const browserInfo = useRef({
    isChrome: typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent),
    isFirefox: typeof window !== 'undefined' && /Firefox/.test(navigator.userAgent),
    isSafari: typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isEdge: typeof window !== 'undefined' && /Edge/.test(navigator.userAgent)
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const speechRecognitionSupported = 
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const speechSynthesisSupported = 'speechSynthesis' in window;
      
      setIsSupported(speechRecognitionSupported && speechSynthesisSupported);
      
      if (speechSynthesisSupported) {
        synthRef.current = window.speechSynthesis;
      }
    };

    checkSupport();
  }, []);

  // Initialize speech recognition with real microphone access
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Ensure real microphone access
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Request explicit microphone access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          console.log('Microphone access granted');
          // Keep the stream active for speech recognition
          stream.getTracks().forEach(track => track.stop());
        })
        .catch((error) => {
          console.error('Microphone access denied:', error);
          setError('Microphone access denied. Please enable microphone permissions in your browser settings.');
        });
    }
    
    // Browser-specific optimizations
    if (browserInfo.current.isChrome) {
      // Chrome-specific optimizations
      if ('maxAlternatives' in recognition) {
        (recognition as any).maxAlternatives = 1; // Reduce processing overhead
      }
    }
    
    if (browserInfo.current.isFirefox) {
      // Firefox may need shorter continuous periods
      recognition.continuous = false; // Firefox handles continuous differently
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setFinalTranscript("");
      performanceRef.current.recognitionStartTime = Date.now();
      
            // Notify parent about listening state change
      onListeningChangeAction?.(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscriptLocal = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscriptLocal += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
          
          // Track successful recognition
          performanceRef.current.successCount++;
          const processingTime = Date.now() - performanceRef.current.recognitionStartTime;
          console.debug(`Speech recognition completed in ${processingTime}ms`);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript);
      setConfidence(maxConfidence);
      
      // Notify parent about real-time transcript updates
      if (interimTranscript) {
        onTranscriptUpdateAction?.(interimTranscript);
      }
      
      if (finalTranscriptLocal) {
        setFinalTranscript(finalTranscriptLocal);
        onTranscriptAction(finalTranscriptLocal);
        
        // Clear interim transcript after final result
        setTimeout(() => {
          setTranscript("");
        }, 1000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      
      // Enhanced error handling with recovery strategies
      switch (event.error) {
        case 'no-speech':
          setError("No speech detected. Try speaking clearly.");
          // Auto-retry for no-speech errors
          setTimeout(() => {
            setError(null);
            if (!disabled && isListening) {
              startListening();
            }
          }, 2000);
          break;
        case 'audio-capture':
          setError("Microphone not accessible. Please check permissions.");
          break;
        case 'not-allowed':
          setError("Microphone permission denied. Please enable microphone access in your browser.");
          break;
        case 'network':
          setError("Network error. Please check your connection and try again.");
          // Retry after network recovery
          setTimeout(() => {
            if (navigator.onLine) {
              setError(null);
              if (!disabled) {
                startListening();
              }
            }
          }, 5000);
          break;
        case 'language-not-supported':
          setError("Language not supported. Using default language.");
          if (recognitionRef.current) {
            recognitionRef.current.lang = 'en-US';
          }
          break;
        case 'service-not-allowed':
          setError("Speech service unavailable. Try again later.");
          break;
        default:
          setError(`Recognition error: ${event.error}`);
      }
      
      setIsListening(false);
      performanceRef.current.errorCount++;
      
      // Notify parent about listening state change
      onListeningChangeAction?.(false);
    };

    recognition.onend = () => {
      if (!isPaused && isListening) {
        // Try to restart if we're still supposed to be listening
        setTimeout(() => {
          try {
            if (recognitionRef.current && !isPaused) {
              recognitionRef.current.start();
            }
          } catch (err) {
            setIsListening(false);
          }
        }, 100);
      } else {
        setIsListening(false);
        setTranscript("");
        // Notify parent about listening state change
        onListeningChangeAction?.(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSupported, onTranscriptAction, isListening, isPaused]);

  const startListening = async () => {
    if (!recognitionRef.current || disabled || isListening) return;

    try {
      // Ensure real microphone access with detailed permissions check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Microphone API not supported in this browser.");
        return;
      }

      console.log('Requesting real microphone access...');
      
      // Request microphone permission and verify audio input
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Verify audio tracks are available
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      console.log('Real microphone access granted:', {
        deviceId: audioTracks[0].getSettings().deviceId,
        label: audioTracks[0].label,
        enabled: audioTracks[0].enabled
      });
      
      // Stop the stream after permission check
      stream.getTracks().forEach(track => track.stop());
      
      setIsPaused(false);
      setError(null);
      
      // Start speech recognition with real microphone
      recognitionRef.current.start();
      
    } catch (err: any) {
      console.error('Microphone access error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please click the microphone icon in your browser's address bar and allow access.");
      } else if (err.name === 'NotFoundError') {
        setError("No microphone found. Please connect a microphone and try again.");
      } else if (err.name === 'NotReadableError') {
        setError("Microphone is already in use by another application. Please close other apps using the microphone.");
      } else {
        setError(`Microphone error: ${err.message}. Please check your microphone connection and browser permissions.`);
      }
    }
  };

  const stopListening = () => {
    setIsPaused(true);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const pauseListening = () => {
    setIsPaused(true);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const resumeListening = () => {
    setIsPaused(false);
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log("Recognition restart failed:", err);
      }
    }
  };

  const speakText = async (text: string) => {
    if (!synthRef.current || !text.trim()) return;

    // Stop any current speech
    stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate || 0.9;
      utterance.pitch = speechPitch || 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      // Use selected voice or find a suitable one
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const availableVoices = synthRef.current.getVoices();
        const preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Neural') || voice.name.includes('Enhanced') || voice.name.includes('Premium'))
        ) || availableVoices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          setSelectedVoice(preferredVoice);
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        
        // Retry with different voice on error
        if (event.error === 'voice-unavailable' && !selectedVoice) {
          const fallbackVoices = synthRef.current!.getVoices();
          const fallbackVoice = fallbackVoices.find(voice => voice.lang.startsWith('en'));
          if (fallbackVoice) {
            setSelectedVoice(fallbackVoice);
            // Retry with fallback voice
            setTimeout(() => speakText(text), 100);
          }
        }
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);

      // Fallback timeout for browsers that don't fire onend consistently
      performanceRef.current.speechTimeoutId = setTimeout(() => {
        if (currentUtteranceRef.current === utterance && isSpeaking) {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          console.warn("Speech synthesis timeout - forcing stop");
        }
      }, text.length * 100 + 2000); // Estimate based on text length

    } catch (error) {
      console.error("Error in speakText:", error);
      setIsSpeaking(false);
      setError("Text-to-speech failed. Please try again.");
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      // Use cancel for immediate stop (more reliable than pause/resume)
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      
      // Clear any pending timeouts
      if (performanceRef.current.speechTimeoutId) {
        clearTimeout(performanceRef.current.speechTimeoutId);
        performanceRef.current.speechTimeoutId = null;
      }
    }
  };

  const testMicrophone = async () => {
    if (microphoneTest.testing) {
      setMicrophoneTest(prev => ({ ...prev, testing: false }));
      return;
    }

    try {
      setMicrophoneTest(prev => ({ ...prev, testing: true, level: 0 }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Get microphone device info
      const audioTracks = stream.getAudioTracks();
      const deviceInfo = audioTracks[0] ? `${audioTracks[0].label || 'Default microphone'}` : 'Unknown device';
      
      setMicrophoneTest(prev => ({ ...prev, deviceInfo }));
      
      // Create audio context to monitor microphone levels
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const monitorLevel = () => {
        if (!microphoneTest.testing) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = Math.round((average / 255) * 100);
        
        setMicrophoneTest(prev => ({ ...prev, level }));
        
        if (microphoneTest.testing) {
          requestAnimationFrame(monitorLevel);
        }
      };
      
      monitorLevel();
      
      // Auto-stop test after 10 seconds
      setTimeout(() => {
        setMicrophoneTest(prev => ({ ...prev, testing: false }));
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }, 10000);
      
    } catch (error: any) {
      console.error('Microphone test failed:', error);
      let errorMessage = "Unknown microphone error";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "Microphone permission denied. Please allow microphone access.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Microphone is already in use by another application.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Microphone constraints not supported.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMicrophoneTest(prev => ({ 
        ...prev, 
        testing: false, 
        error: errorMessage 
      }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if the target is not an input element
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
          break;
        case 'Escape':
          if (isListening) {
            stopListening();
          }
          if (isSpeaking) {
            stopSpeaking();
          }
          break;
        case 'KeyP':
          if (event.ctrlKey && isListening) {
            event.preventDefault();
            if (isPaused) {
              resumeListening();
            } else {
              pauseListening();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening, isPaused, isSpeaking]);

  // Expose speak function to parent
  useEffect(() => {
    if (onSpeakTextAction) {
      onSpeakTextAction(speakText);
    }
  }, [onSpeakTextAction]);

  if (!isSupported) {
    return (
      <Card className={cn("p-4 text-center", className)}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <MicOff className="h-4 w-4" />
          <span className="text-sm">Voice features not supported in this browser</span>
        </div>
      </Card>
    );
  }

  const renderCompactMode = () => (
    <div className={cn("flex items-center gap-2", className)} role="group" aria-label="Voice interface controls">
      {/* Speech-to-Text Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={cn(
          "relative transition-all duration-200",
          isListening && "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 animate-pulse"
        )}
        aria-label={isListening ? "Stop voice recognition" : "Start voice recognition"}
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            <span className="ml-1 text-xs">Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span className="ml-1 text-xs">Speak</span>
          </>
        )}
      </Button>

      {/* Pause/Resume Button (only when listening) */}
      {isListening && (
        <Button
          variant="outline"
          size="sm"
          onClick={isPaused ? resumeListening : pauseListening}
          disabled={disabled}
          className="relative"
          aria-label={isPaused ? "Resume voice recognition" : "Pause voice recognition"}
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Text-to-Speech Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={stopSpeaking}
        disabled={disabled || !isSpeaking}
        className={cn(
          isSpeaking && "bg-blue-500 hover:bg-blue-600 text-white"
        )}
        aria-label={isSpeaking ? "Stop text-to-speech" : "Text-to-speech available"}
        aria-pressed={isSpeaking}
      >
        {isSpeaking ? (
          <>
            <Square className="h-4 w-4" />
            <span className="ml-1 text-xs">Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span className="ml-1 text-xs">Listen</span>
          </>
        )}
      </Button>

      {/* Status Indicators */}
      {isListening && !isPaused && (
        <Badge variant="destructive" className="text-xs animate-pulse" aria-live="polite">
          Listening...
        </Badge>
      )}
      
      {isPaused && (
        <Badge variant="secondary" className="text-xs" aria-live="polite">
          Paused
        </Badge>
      )}
      
      {isSpeaking && (
        <Badge variant="default" className="text-xs" aria-live="polite">
          Speaking...
        </Badge>
      )}

      {/* Live Transcript */}
      {transcript && (
        <div className="flex-1 min-w-0" role="status" aria-live="assertive">
          <div className="text-xs text-muted-foreground italic truncate" aria-label={`Voice input: ${transcript}`}>
            "{transcript}"
          </div>
        </div>
      )}
    </div>
  );

  const renderExpandedMode = () => (
    <Card className={cn("p-6", className)} role="region" aria-labelledby="voice-interface-expanded-title">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 id="voice-interface-expanded-title" className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Assistant
          </h3>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSend}
              onCheckedChange={setAutoSend}
              id="auto-send-expanded"
              aria-describedby="auto-send-expanded-description"
            />
            <Label htmlFor="auto-send-expanded" className="text-sm">Auto-send</Label>
          </div>
        </div>
        <div id="auto-send-expanded-description" className="sr-only">
          When enabled, voice input will be automatically sent when you stop speaking
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3" role="group" aria-label="Voice control buttons">
          <Button
            variant={isListening ? "default" : "outline"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            className={cn(
              "relative transition-all duration-200",
              isListening && "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
            )}
            aria-label={isListening ? "Stop voice recognition" : "Start voice recognition"}
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </>
            )}
          </Button>

          {isListening && (
            <Button
              variant="outline"
              size="lg"
              onClick={isPaused ? resumeListening : pauseListening}
              disabled={disabled}
              aria-label={isPaused ? "Resume voice recognition" : "Pause voice recognition"}
              aria-pressed={isPaused}
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={stopSpeaking}
            disabled={disabled || !isSpeaking}
            className={cn(
              isSpeaking && "bg-blue-500 hover:bg-blue-600 text-white"
            )}
            aria-label={isSpeaking ? "Stop text-to-speech" : "Text-to-speech available"}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? (
              <>
                <Square className="h-5 w-5 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5 mr-2" />
                Text-to-Speech
              </>
            )}
          </Button>
        </div>

        {/* Status Display */}
        <div className="text-center space-y-2" role="status" aria-live="polite">
          {isListening && !isPaused && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Badge variant="destructive" className="animate-pulse">
                Listening... Speak now
              </Badge>
            </div>
          )}
          
          {isPaused && (
            <Badge variant="secondary">
              Voice Recognition Paused
            </Badge>
          )}
          
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <Badge variant="default" className="animate-pulse">
                Speaking...
              </Badge>
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {(transcript || finalTranscript) && (
          <div className="bg-muted/50 rounded-lg p-4 min-h-[60px]" role="log" aria-live="assertive">
            <div className="text-sm">
              {transcript && (
                <div className="text-muted-foreground italic" aria-label={`Current input: ${transcript}`}>
                  {transcript}
                </div>
              )}
              {finalTranscript && (
                <div className="text-foreground font-medium mt-1" aria-label={`Final input: ${finalTranscript}`}>
                  "{finalTranscript}"
                </div>
              )}
            </div>
            {confidence > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        )}

        {/* Microphone Test */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Microphone Test
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={testMicrophone}
              disabled={microphoneTest.testing}
              className="text-xs"
            >
              {microphoneTest.testing ? "Testing..." : "Test Mic"}
            </Button>
          </div>
          
          {microphoneTest.testing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Monitoring microphone...
              </div>
              
              {/* Audio Level Indicator */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Audio Level:</div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                    style={{ width: `${microphoneTest.level}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {microphoneTest.level.toFixed(0)}%
                </div>
              </div>
              
              {microphoneTest.deviceInfo && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Device: {microphoneTest.deviceInfo}</div>
                </div>
              )}
            </div>
          )}
          
          {microphoneTest.error && (
            <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
              Microphone Error: {microphoneTest.error}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            This tests your real hardware microphone access and audio levels.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3" role="alert">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <Loader2 className="h-4 w-4" />
              {error}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-destructive hover:text-destructive"
              aria-label="Dismiss error message"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  const renderCenterMode = () => (
    <div className={cn("text-center", className)} role="region" aria-labelledby="voice-interface-center-title">
      <h2 id="voice-interface-center-title" className="sr-only">Voice Input Center</h2>
      <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10 rounded-2xl border-2 border-dashed border-primary/20">
        {/* Large Microphone Button */}
        <Button
          variant={isListening ? "default" : "outline"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={cn(
            "w-20 h-20 rounded-full transition-all duration-300 shadow-lg",
            isListening 
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25 animate-pulse scale-110" 
              : "hover:scale-105"
          )}
          aria-label={isListening ? "Stop voice recognition - currently listening" : "Start voice recognition"}
          aria-pressed={isListening}
          aria-describedby="voice-center-status"
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {/* Status Text */}
        <div className="space-y-1" role="status" aria-live="polite" id="voice-center-status">
          <div className="text-lg font-semibold">
            {isListening ? "Listening..." : "Tap to Speak"}
          </div>
          <div className="text-sm text-muted-foreground">
            {isListening 
              ? "Speak clearly and naturally"
              : "Click the microphone to start voice input"
            }
          </div>
        </div>

        {/* Live Feedback */}
        {(transcript || finalTranscript) && (
          <div className="max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border rounded-lg p-4 shadow-sm" role="log" aria-live="assertive">
            {transcript && (
              <div className="text-muted-foreground italic text-sm" aria-label={`Current input: ${transcript}`}>
                {transcript}
              </div>
            )}
            {finalTranscript && (
              <div className="text-foreground font-medium text-sm mt-1" aria-label={`Final input: ${finalTranscript}`}>
                "{finalTranscript}"
              </div>
            )}
          </div>
        )}

        {/* Keyboard Navigation Hint */}
        <div className="text-xs text-muted-foreground mt-2" role="note">
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to toggle voice input
        </div>
      </div>
    </div>
  );

  // Render based on mode
  switch (mode) {
    case 'expanded':
      return renderExpandedMode();
    case 'center':
      return renderCenterMode();
    default:
      return renderCompactMode();
  }
}

// Add speech recognition types to window
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}