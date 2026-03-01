export default function SettingsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      <p className="text-slate-600">Configure your OpenClaw gateway in your environment variables.</p>
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>Required keys:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>VITE_OPENCLAW_GATEWAY_URL</li>
          <li>VITE_OPENCLAW_GATEWAY_TOKEN</li>
        </ul>
      </div>
    </section>
  );
}
