import { differenceInCalendarDays, format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STAGE_COLORS, SPECIALTY_COLORS } from '../../lib/constants';
import type { Candidate, Interaction } from '../../lib/database.types';
import Badge from '../shared/Badge';
import { useToast } from '../shared/Toast';

type InterviewPrepSheetProps = {
  candidate: Candidate;
  interactions: Interaction[];
};

type CompensationEntry = {
  salaryRange: string;
  signOnBonusRange: string;
  benefits: string[];
};

const BASE_TALKING_POINTS = [
  'Competitive compensation tailored to specialty and experience',
  'Strong quality of life with short commute times and affordable housing',
  'Low cost of living compared with major metro markets',
  'Loan repayment support opportunities',
  'Collegial physician culture and leadership access',
  'Reasonable and sustainable call schedule structure',
];

const SPECIALTY_TALKING_POINTS: Record<string, string[]> = {
  'Hematology/Oncology': [
    'Cancer center capabilities with multidisciplinary support and coordinated care pathways',
    'Growing oncology program with leadership support for expansion and service-line growth',
  ],
  Gastroenterology: [
    'Strong procedural volume with consistent referral flow across the region',
    'Well-equipped endoscopy suite supporting efficient workflow and quality outcomes',
  ],
  Neurology: [
    'Stroke center infrastructure and protocols to support high-acuity neurology care',
    'Sustained demand driven by an aging regional population with significant neurology needs',
  ],
  'OB/GYN': [
    'Healthy delivery volume and broad women\'s health service demand',
    'Midwife support model that helps balance patient access and physician workload',
    'Malpractice coverage included as part of the standard employed package',
  ],
  'Cardiothoracic Surgery': [
    'OR capabilities aligned with complex cardiothoracic case needs',
    'Integrated cardiac cath lab collaboration for procedural continuity',
    'Regional referral base that supports long-term case volume stability',
  ],
};

const COMPENSATION_DATA: Record<string, CompensationEntry> = {
  'Hematology/Oncology': {
    salaryRange: '$550,000 - $725,000',
    signOnBonusRange: '$50,000 - $75,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
  Gastroenterology: {
    salaryRange: '$575,000 - $750,000',
    signOnBonusRange: '$40,000 - $70,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
  Neurology: {
    salaryRange: '$375,000 - $500,000',
    signOnBonusRange: '$25,000 - $50,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
  'OB/GYN': {
    salaryRange: '$350,000 - $480,000',
    signOnBonusRange: '$30,000 - $60,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
  'Cardiothoracic Surgery': {
    salaryRange: '$750,000 - $950,000',
    signOnBonusRange: '$60,000 - $75,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
  Other: {
    salaryRange: '$300,000 - $500,000',
    signOnBonusRange: '$20,000 - $50,000',
    benefits: ['Health, dental, and vision coverage', 'Malpractice coverage', 'CME allowance', 'Relocation assistance', 'Loan repayment support'],
  },
};

const PHONE_SCREEN_QUESTIONS = [
  'What is most important to you in your next role?',
  'What does your ideal practice setup look like day-to-day?',
  'What is your timeline for making a move?',
  'Have you considered community-based practice versus academic practice?',
  'What does your family situation look like, and do you have location preferences?',
  'What is your current call schedule, and what would be ideal in your next role?',
  'What parts of your current role are you looking to improve?',
  'What would make you say “yes” to the right opportunity?',
];

const SITE_VISIT_QUESTIONS = [
  'What were your first impressions of the facility and department?',
  'Did you get a clear feel for the team culture?',
  'Are there any concerns about the community or area?',
  'What would make this the right long-term opportunity for you?',
  'What does the compensation package need to include for this to work?',
  'When could you realistically see yourself starting?',
  'How did the clinical support and workflows compare with your expectations?',
  'Who else should be involved in your decision process?',
];

const GENERAL_RED_FLAGS = [
  'Spouse or family reluctance about relocation to the Paducah area',
  'Compensation expectations that are materially outside market benchmarks',
  'Active legal, contract, or non-compete disputes with current employer',
];

const SPECIALTY_RED_FLAGS: Record<string, string[]> = {
  'OB/GYN': ['Elevated malpractice concerns that could delay acceptance', 'Call frequency burnout risk based on current workload history'],
  'Cardiothoracic Surgery': ['Case volume expectations significantly above realistic projections', 'Concerns about OR/cardiac support staff depth and quality'],
};

export default function InterviewPrepSheet({ candidate, interactions }: InterviewPrepSheetProps) {
  const { showToast } = useToast();

  const fullName = `Dr. ${candidate.first_name} ${candidate.last_name}`;
  const daysInPipeline = Math.max(0, differenceInCalendarDays(new Date(), new Date(candidate.created_at)));

  const talkingPoints = [
    ...BASE_TALKING_POINTS,
    ...(SPECIALTY_TALKING_POINTS[candidate.specialty] ?? []),
  ];

  const compensation = COMPENSATION_DATA[candidate.specialty] ?? COMPENSATION_DATA.Other;

  const stageQuestions = candidate.stage === 'Site Visit' ? SITE_VISIT_QUESTIONS : PHONE_SCREEN_QUESTIONS;

  const redFlags = [
    ...GENERAL_RED_FLAGS,
    ...(SPECIALTY_RED_FLAGS[candidate.specialty] ?? []),
  ];

  return (
    <section className="space-y-4 print:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/candidates/${candidate.id}`} className="text-sm font-medium text-blue-700 hover:underline">
          ← Back to Profile
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700"
          >
            Print Prep Sheet
          </button>
          <button
            type="button"
            onClick={() =>
              showToast(
                "AI-enhanced prep sheets coming soon — will research the candidate's publications, current hospital, and personalize talking points",
                'info',
              )
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            <Sparkles size={16} /> Enhance with AI
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Interview Prep Sheet</h1>
          <p className="mt-1 text-sm text-slate-500">Baptist Health Paducah • Candidate Brief</p>
        </header>

        <section className="border-b border-slate-200 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Candidate Snapshot</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">{fullName}</p>
            <Badge label={candidate.specialty} colorClass={SPECIALTY_COLORS[candidate.specialty]} />
            <Badge label={candidate.stage} colorClass={STAGE_COLORS[candidate.stage]} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Current Employer:</span> {candidate.current_employer ?? 'Not provided'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Location:</span> {candidate.current_location ?? 'Not provided'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Source:</span> {candidate.source ?? 'Unknown'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Days in Pipeline:</span> {daysInPipeline}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-900">Previous Interactions</h3>
            {interactions.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {interactions.slice(0, 8).map((interaction) => (
                  <li key={interaction.id}>
                    <span className="font-medium text-slate-900">
                      {format(new Date(interaction.contact_date), 'MMM d, yyyy')} • {interaction.type}:
                    </span>{' '}
                    {interaction.summary}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No interactions logged yet.</p>
            )}
          </div>
        </section>

        <section className="border-b border-slate-200 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Talking Points</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {talkingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="border-b border-slate-200 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Compensation Overview</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Estimated Salary Range:</span> {compensation.salaryRange}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Typical Sign-On Bonus:</span> {compensation.signOnBonusRange}
            </p>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-slate-900">Common Benefits</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {compensation.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-slate-200 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Questions to Ask</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {stageQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>

        <section className="py-5">
          <h2 className="text-lg font-semibold text-slate-900">Red Flags to Watch For</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {redFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
}
