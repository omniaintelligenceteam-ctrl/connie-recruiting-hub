export const SPECIALTIES = [
  'Hematology/Oncology',
  'Gastroenterology',
  'Neurology',
  'OB/GYN',
  'Cardiothoracic Surgery',
  'Other',
] as const;

export const STAGES = [
  'Sourced',
  'Contacted',
  'Responded',
  'Phone Screen',
  'Site Visit',
  'Offer',
  'Negotiation',
  'Accepted',
  'Closed/Lost',
] as const;

export const STAGE_COLORS: Record<string, string> = {
  Sourced: 'bg-gray-100 text-gray-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Responded: 'bg-cyan-100 text-cyan-700',
  'Phone Screen': 'bg-yellow-100 text-yellow-700',
  'Site Visit': 'bg-orange-100 text-orange-700',
  Offer: 'bg-purple-100 text-purple-700',
  Negotiation: 'bg-pink-100 text-pink-700',
  Accepted: 'bg-green-100 text-green-700',
  'Closed/Lost': 'bg-red-100 text-red-700',
};

export const SPECIALTY_COLORS: Record<string, string> = {
  'Hematology/Oncology': 'bg-red-50 text-red-700 border-red-200',
  Gastroenterology: 'bg-amber-50 text-amber-700 border-amber-200',
  Neurology: 'bg-violet-50 text-violet-700 border-violet-200',
  'OB/GYN': 'bg-pink-50 text-pink-700 border-pink-200',
  'Cardiothoracic Surgery': 'bg-blue-50 text-blue-700 border-blue-200',
};

export const SOURCES = [
  'Conference',
  'Referral',
  'Job Board',
  'Cold Outreach',
  'Recruiting Firm',
  'Other',
] as const;

export const INTERACTION_TYPES = [
  'Email Sent',
  'Email Received',
  'Phone Call',
  'Voicemail',
  'Text Message',
  'Site Visit',
  'Meeting',
  'Note',
  'Offer Sent',
  'Contract Sent',
] as const;

export const EMAIL_TEMPLATES = {
  initial_outreach: {
    name: 'Initial Outreach',
    subject: '[Specialty] Opportunity in Western Kentucky — Baptist Health Paducah',
    body: `Dr. [Last Name],

I hope this message finds you well. My name is Connie, and I am a physician recruiter with Baptist Health Paducah in Paducah, Kentucky.

We are currently seeking a [specialty] physician to join our growing team. Baptist Health Paducah offers:

• Competitive compensation with comprehensive benefits
• Supportive, collegial practice environment  
• Reasonable call schedule
• Loan repayment assistance
• A community with excellent quality of life and low cost of living

I would love the opportunity to share more details about this position. Would you have 15 minutes this week for a brief call?

Warm regards,
Connie
Physician Recruiter
Baptist Health Paducah`,
  },
  follow_up_1: {
    name: 'Follow-Up #1',
    subject: 'Following up — [Specialty] at Baptist Health Paducah',
    body: `Dr. [Last Name],

I wanted to follow up on my previous message about our [specialty] opportunity. I understand you are busy, so I will keep this brief.

We are offering a compelling package and would be happy to work around your schedule for a quick conversation. Even if the timing is not right for you, I would appreciate any referrals to colleagues who might be interested.

Best,
Connie
Physician Recruiter
Baptist Health Paducah`,
  },
  follow_up_2: {
    name: 'Follow-Up #2 (Breakup)',
    subject: 'Last note from me — [Specialty] in Paducah, KY',
    body: `Dr. [Last Name],

I do not want to clutter your inbox, so this will be my last message. If a move to western Kentucky ever interests you in the future, my door is always open.

Wishing you the best,
Connie
Physician Recruiter
Baptist Health Paducah`,
  },
  post_phone_screen: {
    name: 'Post Phone Screen Thank You',
    subject: 'Great speaking with you, Dr. [Last Name]',
    body: `Dr. [Last Name],

Thank you for taking the time to speak with me today. I enjoyed learning more about your background and career goals.

As discussed, here are the next steps:
[customize based on conversation]

Please do not hesitate to reach out if any questions come up. I look forward to staying in touch.

Best regards,
Connie
Physician Recruiter
Baptist Health Paducah`,
  },
  site_visit_invite: {
    name: 'Site Visit Invitation',
    subject: 'We would love to host you in Paducah',
    body: `Dr. [Last Name],

Following our recent conversations, I would like to formally invite you for a site visit to Baptist Health Paducah. We will arrange:

• Facility tour and department meetings
• Dinner with the team
• Community tour of Paducah and surrounding area
• Travel and accommodations (covered by Baptist Health)

Could you share a few dates that work for your schedule? We are happy to be flexible.

Looking forward to welcoming you,
Connie
Physician Recruiter
Baptist Health Paducah`,
  },
} as const;
