import type { AppData } from '@/types';

export const ALT_DATA: AppData = {
  property: {
    address: '4287 Pine Ridge Trail',
    city: 'Conifer, CO 80433',
    type: 'Single Family · Rural',
    beds: 4, baths: 3, sqft: 3140,
    list: 985000,
    contract: 962500,
    earnest: 28000,
    loanType: 'Conventional 80%',
    mls: 'IR-7421983',
    photoTint: '#1E3A66',
  },

  parties: [
    { role: 'Buyer',         name: 'Maya & Daniel Okafor',  sub: 'Primary residence',      phone: '(303) 555-0142', email: 'maya.okafor@gmail.com',       initials: 'MO', color: '#1E3A66' },
    { role: 'Seller',        name: 'Robert & Linda Hayes',  sub: 'Out of state',            phone: '(720) 555-0190', email: 'rhayes@bellrock.us',          initials: 'RH', color: '#B8862F' },
    { role: 'Listing Agent', name: 'Sarah Chen',            sub: 'Bell Rock Realty',        phone: '(303) 555-0177', email: 'sarah@bellrockrealty.com',    initials: 'SC', color: '#5C6B82' },
    { role: 'Lender',        name: 'James Patel',           sub: 'First Western Mortgage',  phone: '(303) 555-0156', email: 'jpatel@firstwestern.com',     initials: 'JP', color: '#4A6B82' },
    { role: 'Title',         name: 'Heritage Title Co.',    sub: 'Closer: Dana Ruiz',       phone: '(303) 555-0123', email: 'dana@heritagetitle.com',      initials: 'HT', color: '#B8624A' },
    { role: 'Inspector',     name: 'High Country Inspect.', sub: 'Owen Brennan',            phone: '(303) 555-0188', email: 'owen@highcountryhi.com',      initials: 'HC', color: '#85724B' },
  ],

  stages: [
    { id: 'under-contract', label: 'Under Contract',    day: 0,  done: true },
    { id: 'inspection',     label: 'Inspection',        day: 7,  done: true },
    { id: 'objection',      label: 'Inspection Resol.', day: 12, done: true },
    { id: 'appraisal',      label: 'Appraisal',         day: 18, done: false, current: true },
    { id: 'loan',           label: 'Loan Approval',     day: 24, done: false },
    { id: 'walkthrough',    label: 'Final Walkthrough', day: 28, done: false },
    { id: 'closing',        label: 'Closing',           day: 30, done: false },
  ],

  checklist: [
    { group: 'Contract & Deadlines', items: [
      { id: 'c-exec',  title: 'Fully executed contract distributed',    due: 'Apr 03', state: 'done',  ai: 'AI extracted from §29 signatures' },
      { id: 'c-eern',  title: 'Earnest money receipted',                due: 'Apr 05', state: 'done',  detail: '$28,000 · Heritage Title' },
      { id: 'c-disc',  title: "Seller's Property Disclosure delivered", due: 'Apr 08', state: 'done' },
      { id: 'c-titl',  title: 'Title commitment ordered',               due: 'Apr 09', state: 'done' },
      { id: 'c-srcd',  title: 'Title commitment reviewed w/ buyer',     due: 'Apr 12', state: 'doing' },
    ]},
    { group: 'Inspection', items: [
      { id: 'i-sched', title: 'General inspection scheduled',           due: 'Apr 09', state: 'done' },
      { id: 'i-objc',  title: 'Inspection Objection delivered',         due: 'Apr 14', state: 'done', detail: '6 items requested' },
      { id: 'i-rslv',  title: 'Inspection Resolution executed',         due: 'Apr 17', state: 'done' },
      { id: 'i-radn',  title: 'Radon test results received',            due: 'Apr 16', state: 'done', detail: '2.1 pCi/L · pass' },
      { id: 'i-sewr',  title: 'Sewer scope completed',                  due: 'Apr 15', state: 'na',   detail: 'Property on septic — N/A' },
    ]},
    { group: 'Rural Property', items: [
      { id: 'r-sept',  title: 'Septic inspection (Use Permit)',         due: 'Apr 18', state: 'doing', ai: 'Flagged — rural property; permit required at closing' },
      { id: 'r-well',  title: 'Well water potability test',             due: 'Apr 19', state: 'doing' },
      { id: 'r-flow',  title: 'Well flow / yield report',               due: 'Apr 19', state: 'todo' },
      { id: 'r-prop',  title: 'Propane tank lease vs owned confirmed',  due: 'Apr 20', state: 'todo' },
      { id: 'r-mine',  title: 'Mineral rights disclosure reviewed',     due: 'Apr 22', state: 'todo' },
    ]},
    { group: 'HOA & Road', items: [
      { id: 'h-docs',  title: 'HOA road maintenance docs received',     due: 'Apr 14', state: 'done' },
      { id: 'h-disc',  title: 'HOA disclosure signed by buyer',         due: 'Apr 17', state: 'doing' },
      { id: 'h-cond',  title: 'Full HOA covenants & financials',        due: '—',      state: 'na',   detail: 'Not a condo / full HOA — N/A' },
    ]},
    { group: 'Loan & Appraisal', items: [
      { id: 'l-appr',  title: 'Appraisal ordered',                      due: 'Apr 16', state: 'done' },
      { id: 'l-rcvd',  title: 'Appraisal received',                     due: 'Apr 22', state: 'doing', ai: 'Upcoming — high priority' },
      { id: 'l-objc',  title: 'Appraisal objection window',             due: 'Apr 23', state: 'todo' },
      { id: 'l-cond',  title: 'Loan conditions cleared',                due: 'Apr 26', state: 'todo' },
      { id: 'l-cltc',  title: 'Clear to close',                         due: 'Apr 28', state: 'todo' },
    ]},
    { group: 'Closing', items: [
      { id: 'z-cd',    title: 'Closing Disclosure delivered (3-day)',   due: 'Apr 27', state: 'todo' },
      { id: 'z-wlk',   title: 'Final walkthrough',                      due: 'Apr 30', state: 'todo' },
      { id: 'z-funds', title: 'Buyer wire confirmed',                   due: 'May 01', state: 'todo' },
      { id: 'z-sign',  title: 'Settlement signing',                     due: 'May 01', state: 'todo' },
      { id: 'z-keys',  title: 'Keys & possession transferred',          due: 'May 01', state: 'todo' },
    ]},
  ],

  deadlines: [
    { date: 'Apr 18', day: 'Fri', label: 'Septic inspection',          tag: 'inspection', urgent: false, days: 2 },
    { date: 'Apr 19', day: 'Sat', label: 'Well water tests',           tag: 'inspection', urgent: false, days: 3 },
    { date: 'Apr 22', day: 'Tue', label: 'Appraisal due',              tag: 'loan',       urgent: true,  days: 6 },
    { date: 'Apr 23', day: 'Wed', label: 'Appraisal objection deadl.', tag: 'loan',       urgent: false, days: 7 },
    { date: 'Apr 26', day: 'Sat', label: 'Loan conditions cleared',    tag: 'loan',       urgent: false, days: 10 },
    { date: 'Apr 27', day: 'Sun', label: 'Closing Disclosure (3-day)', tag: 'closing',    urgent: true,  days: 11 },
    { date: 'Apr 30', day: 'Wed', label: 'Final walkthrough',          tag: 'closing',    urgent: false, days: 14 },
    { date: 'May 01', day: 'Thu', label: 'Closing — 10:00 AM',         tag: 'closing',    urgent: true,  days: 15 },
  ],

  documents: [
    { id: 'd-1',  name: 'Contract to Buy and Sell',          src: 'CTME',           received: 'Apr 03', state: 'received' },
    { id: 'd-2',  name: "Seller's Property Disclosure",      src: 'CTME',           received: 'Apr 04', state: 'received' },
    { id: 'd-3',  name: 'Title commitment',                  src: 'Heritage',       received: 'Apr 09', state: 'received' },
    { id: 'd-4',  name: 'Inspection report',                 src: 'High Country',   received: 'Apr 11', state: 'received' },
    { id: 'd-5',  name: 'Inspection Objection (BIO)',        src: 'CTME',           received: 'Apr 14', state: 'received' },
    { id: 'd-6',  name: 'Inspection Resolution',             src: 'CTME',           received: 'Apr 17', state: 'received' },
    { id: 'd-7',  name: 'Radon test results',                src: 'High Country',   received: 'Apr 16', state: 'received' },
    { id: 'd-8',  name: 'Septic Use Permit',                 src: 'Jefferson Cty',  received: '',       state: 'pending' },
    { id: 'd-9',  name: 'Well potability + flow test',       src: 'Front Range Water', received: '',    state: 'pending' },
    { id: 'd-10', name: 'Appraisal report',                  src: 'First Western',  received: '',       state: 'pending', urgent: true },
    { id: 'd-11', name: 'Closing Disclosure',                src: 'Heritage',       received: '',       state: 'upcoming' },
    { id: 'd-12', name: 'Sewer scope',                       src: '—',              received: '',       state: 'na', detail: 'Septic system — N/A' },
    { id: 'd-13', name: 'HOA full covenants & financials',   src: '—',              received: '',       state: 'na', detail: 'Road association only — N/A' },
    { id: 'd-14', name: 'Condo questionnaire',               src: '—',              received: '',       state: 'na', detail: 'Not a condo — N/A' },
  ],

  notes: [
    { author: 'You',   when: 'Today · 8:14 AM',    text: 'Owen confirmed septic guy is booked Fri 9am. Buyer will be there.' },
    { author: 'Sarah', when: 'Yesterday · 4:02 PM', text: 'Sellers are flexible on possession — fine with 12pm same-day.' },
    { author: 'You',   when: 'Apr 14 · 6:30 PM',   text: 'Buyers want the propane tank addressed in the BIO. Owen flagged a leased tank.' },
    { author: 'James', when: 'Apr 12 · 11:20 AM',  text: 'Pre-underwriting clean. Just waiting on appraisal.' },
  ],

  dashboard: [
    { id: 'tx-1', address: '4287 Pine Ridge Trail', city: 'Conifer',  stage: 'Appraisal',            daysToClose: 15, progress: 0.62, next: 'Appraisal due Tue', urgent: true,  parties: 'Okafor · Hayes',      price: 962500,  active: true },
    { id: 'tx-2', address: '1108 Cherry Creek Dr',  city: 'Denver',   stage: 'Inspection Resolution', daysToClose: 22, progress: 0.34, next: 'BIR due Thu',       urgent: false, parties: 'Nguyen · Park',       price: 1295000, active: false },
    { id: 'tx-3', address: '722 Pearl St #4B',       city: 'Boulder',  stage: 'Under Contract',        daysToClose: 38, progress: 0.18, next: 'Title ordered',     urgent: false, parties: 'Whitmore · Foss',     price: 680000,  active: false },
    { id: 'tx-4', address: '55 Mountain View Rd',    city: 'Evergreen',stage: 'Clear to Close',        daysToClose: 4,  progress: 0.92, next: 'CD signed — funds Mon', urgent: false, parties: 'Reyes · Templeton', price: 1450000, active: false },
  ],

  summary: {
    week: 'Apr 11 – Apr 17',
    completed: [
      'Inspection completed and Resolution executed',
      'Title commitment ordered and reviewed with buyer',
      'Radon results returned at 2.1 pCi/L — under threshold',
      'HOA road maintenance docs delivered and signed',
    ],
    upcoming: [
      { d: 'Fri Apr 18', t: 'Septic inspection on-site (Use Permit)' },
      { d: 'Sat Apr 19', t: 'Well water potability + flow tests' },
      { d: 'Tue Apr 22', t: 'Appraisal due from First Western' },
      { d: 'Sun Apr 27', t: 'Closing Disclosure delivery — 3-day window' },
    ],
    risks: [
      { sev: 'med', t: 'Appraisal turn time tight — confirm with First Western by Mon AM' },
      { sev: 'low', t: 'Propane tank lease vs owned still to confirm before closing' },
    ],
  },

  postClose: [
    { t: 'Send closing gift — local roaster, Conifer',  when: 'Day +1',  state: 'doing' },
    { t: 'Handwritten thank-you cards to both parties', when: 'Day +2',  state: 'todo' },
    { t: 'Request 5★ review from Maya & Daniel',        when: 'Day +5',  state: 'todo' },
    { t: 'File commission disbursement to brokerage',   when: 'Day +1',  state: 'done' },
    { t: 'Archive closed transaction file',             when: 'Day +14', state: 'todo' },
    { t: 'Add to annual home anniversary touchpoint',   when: 'Day +30', state: 'todo' },
    { t: 'Referral check-in call',                      when: 'Day +60', state: 'todo' },
  ],

  user: { name: 'Brett Morales', initials: 'BM', brokerage: 'Altitude Realty · Denver' },
};
