type EmailPreviewProps = {
  subject: string;
  body: string;
  recipientName: string;
  onLooksGood?: () => void;
  onEditMore?: () => void;
};

export default function EmailPreview({
  subject,
  body,
  recipientName,
  onLooksGood,
  onEditMore,
}: EmailPreviewProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <h3 className="text-lg font-semibold text-slate-900">Preview</h3>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-base text-slate-700">
          <span className="font-semibold">To:</span> {recipientName || 'Manual Recipient'}
        </p>
        <p className="mt-2 text-base text-slate-700">
          <span className="font-semibold">Subject:</span> {subject || '(No subject)'}
        </p>
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-4 text-base leading-relaxed text-slate-800">
          {body || '(No email body yet)'}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onLooksGood}
          className="min-h-11 rounded-lg bg-green-600 px-5 text-base font-semibold text-white"
        >
          Looks Good
        </button>
        <button
          type="button"
          onClick={onEditMore}
          className="min-h-11 rounded-lg border border-slate-300 px-5 text-base font-semibold text-slate-700"
        >
          Edit More
        </button>
      </div>
    </section>
  );
}
