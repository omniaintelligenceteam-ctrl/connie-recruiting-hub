type VoiceNoteProps = {
  candidateId: string;
  autoStart?: boolean;
};

export default function VoiceNote({ candidateId, autoStart = false }: VoiceNoteProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
      Voice note capture coming soon for candidate {candidateId.slice(0, 8)}{autoStart ? ' (auto-start requested)' : ''}.
    </div>
  );
}
