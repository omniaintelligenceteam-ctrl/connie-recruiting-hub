import PipelineBoard from '../components/pipeline/PipelineBoard';

export default function PipelinePage() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Recruiting Pipeline</h1>
        <p className="text-base text-slate-600">Track every doctor and move candidates through each recruiting stage.</p>
      </header>
      <PipelineBoard />
    </section>
  );
}
