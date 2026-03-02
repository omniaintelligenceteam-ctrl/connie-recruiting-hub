import { Mic, MicOff, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { useVoiceNote } from '../../hooks/useVoiceNote';

type VoiceNoteProps = {
  candidateId: string;
  autoStart?: boolean;
  /** Called with the final transcript when the user saves */
  onSave?: (transcript: string, candidateId: string) => void;
};

export default function VoiceNote({ candidateId, autoStart = false, onSave }: VoiceNoteProps) {
  const { recording, supported, startRecording, stopRecording, transcript, clearTranscript } =
    useVoiceNote();
  const [saved, setSaved] = useState(false);

  // Honour autoStart on first render (one-shot)
  useState(() => {
    if (autoStart && supported) startRecording();
  });

  const handleStop = async () => {
    await stopRecording();
  };

  const handleSave = () => {
    if (transcript.trim()) {
      onSave?.(transcript.trim(), candidateId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!supported) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
        Voice recording is not supported in this browser. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Mic size={16} className="text-blue-600" />
        <span className="text-sm font-semibold text-slate-800">Voice Note</span>
        {recording && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording…
          </span>
        )}
      </div>

      {/* Transcript area */}
      <div className="mb-3 min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {transcript || (
          <span className="text-slate-400 italic">
            {recording ? 'Listening…' : 'Press Record to start speaking.'}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Mic size={14} />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            <MicOff size={14} />
            Stop
          </button>
        )}

        {transcript && (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save as Note'}
            </button>
            <button
              type="button"
              onClick={() => { clearTranscript(); setSaved(false); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
