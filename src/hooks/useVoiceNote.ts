import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseVoiceNoteReturn {
  recording: boolean;
  supported: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<string>;
  transcript: string;
  clearTranscript: () => void;
}

// The Web Speech API is not universally typed in all TS DOM lib versions,
// so we use a narrow interface + any-casts to stay strict-mode-safe.
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined;
}

/**
 * Voice-to-notes hook using the Web Speech API.
 * Falls back gracefully when the API is unavailable.
 */
export function useVoiceNote(): UseVoiceNoteReturn {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const resolveRef = useRef<((t: string) => void) | null>(null);
  const accumulatedRef = useRef('');

  const supported = !!getSpeechRecognitionCtor();

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || recording) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    accumulatedRef.current = '';

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result[0] && result.isFinal) {
          final += result[0].transcript;
        } else if (result[0]) {
          interim += result[0].transcript;
        }
      }
      if (final) {
        accumulatedRef.current += final + ' ';
      }
      setTranscript(accumulatedRef.current + interim);
    };

    recognition.onerror = () => {
      setRecording(false);
      resolveRef.current?.(accumulatedRef.current.trim());
      resolveRef.current = null;
    };

    recognition.onend = () => {
      setRecording(false);
      const finalText = accumulatedRef.current.trim();
      setTranscript(finalText);
      resolveRef.current?.(finalText);
      resolveRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }, [recording]);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!recording || !recognitionRef.current) {
        resolve(transcript);
        return;
      }
      resolveRef.current = resolve;
      recognitionRef.current.stop();
    });
  }, [recording, transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    accumulatedRef.current = '';
  }, []);

  return {
    recording,
    supported,
    startRecording,
    stopRecording,
    transcript,
    clearTranscript,
  };
}
