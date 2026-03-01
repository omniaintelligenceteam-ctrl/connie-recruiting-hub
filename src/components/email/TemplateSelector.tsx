import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EMAIL_TEMPLATES } from '../../lib/constants';

export type TemplateMap = typeof EMAIL_TEMPLATES;
export type TemplateKey = keyof TemplateMap;
export type TemplateData = {
  name: string;
  subject: string;
  body: string;
};

type TemplateSelectorProps = {
  onSelect: (key: TemplateKey, template: TemplateData) => void;
};

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedKey, setSelectedKey] = useState<TemplateKey | null>(null);

  const templates = useMemo(
    () => Object.entries(EMAIL_TEMPLATES) as [TemplateKey, TemplateMap[TemplateKey]][],
    [],
  );

  const getSubjectPreview = (subject: string) =>
    subject.length > 72 ? `${subject.slice(0, 72)}...` : subject;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Choose a template</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map(([key, template]) => {
          const isSelected = selectedKey === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedKey(key);
                onSelect(key, {
                  name: template.name,
                  subject: template.subject,
                  body: template.body,
                });
              }}
              className={`relative min-h-28 rounded-xl border-2 p-4 text-left shadow-sm transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-transparent bg-white hover:shadow-md'
              }`}
            >
              {isSelected ? (
                <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check size={14} />
                </span>
              ) : null}
              <p className="text-base font-semibold text-slate-900">{template.name}</p>
              <p className="mt-2 text-sm text-slate-500">{getSubjectPreview(template.subject)}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
