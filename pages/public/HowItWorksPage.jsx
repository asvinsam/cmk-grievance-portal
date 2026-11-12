const DISCLAIMER =
  "Recruitment Prototype. Not an official Government of Kerala / Chief Minister's Office website. All data is fictional.";

const steps = [
  {
    icon: '📝',
    number: 1,
    title: 'Submit Grievance',
    actor: 'Citizen',
    desc: 'The citizen logs in to the portal and fills in the grievance form — providing details such as subject, description, district, and category.',
    color: 'border-blue-400 bg-blue-50',
    dot: 'bg-blue-500',
  },
  {
    icon: '🔖',
    number: 2,
    title: 'Reference ID Generated',
    actor: 'System',
    desc: 'The system auto-generates a unique reference ID in the format CMK-YYYY-XXXXXX (e.g. CMK-2026-000123). This ID is emailed to the citizen.',
    color: 'border-purple-400 bg-purple-50',
    dot: 'bg-purple-500',
  },
  {
    icon: '🔍',
    number: 3,
    title: 'CMO Review',
    actor: 'CMO Admin',
    desc: 'The CMO Admin reviews the grievance, sets priority, verifies jurisdiction, and assigns it to the relevant government department.',
    color: 'border-navy-500 bg-indigo-50',
    dot: 'bg-indigo-600',
  },
  {
    icon: '🏛️',
    number: 4,
    title: 'Department Assignment',
    actor: 'Department',
    desc: 'The grievance is assigned to the relevant department and a Department Officer is tasked with investigating and responding.',
    color: 'border-saffron-400 bg-amber-50',
    dot: 'bg-amber-500',
  },
  {
    icon: '📋',
    number: 5,
    title: 'Investigation & Action Report',
    actor: 'Dept. Officer',
    desc: 'The Department Officer investigates the matter, takes necessary action, and submits an Action Taken Report (ATR) with remarks.',
    color: 'border-orange-400 bg-orange-50',
    dot: 'bg-orange-500',
  },
  {
    icon: '✅',
    number: 6,
    title: 'Resolution or Reopen',
    actor: 'CMO / Citizen',
    desc: 'The CMO marks the grievance as Resolved with public remarks. If unsatisfied, the citizen can reopen the grievance within the allowed period.',
    color: 'border-green-500 bg-green-50',
    dot: 'bg-green-600',
  },
];

const statusFlow = [
  { status: 'Submitted', color: 'bg-gray-500', text: 'text-white' },
  { status: 'Under Review', color: 'bg-blue-500', text: 'text-white' },
  { status: 'In Progress', color: 'bg-amber-500', text: 'text-white' },
  { status: 'Resolved', color: 'bg-green-600', text: 'text-white' },
  { status: 'Reopened', color: 'bg-red-500', text: 'text-white' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-300 text-amber-800 text-xs text-center py-2 px-4 font-medium">
        ⚠️ {DISCLAIMER}
      </div>

      {/* Header */}
      <section className="bg-navy-900 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">How It Works</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-base">
          Understand the end-to-end lifecycle of a grievance — from submission to resolution.
        </p>
      </section>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-navy-900 mb-10 text-center">
            6-Step Grievance Lifecycle
          </h2>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className={`bg-white border-l-4 ${step.color} rounded-xl shadow-sm p-6 flex gap-5`}>
                  {/* Number Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.dot} flex items-center justify-center text-white font-bold text-lg shadow`}>
                    {step.number}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-2xl">{step.icon}</span>
                      <h3 className="font-bold text-navy-900 text-lg">{step.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2.5 py-0.5 font-medium">
                        {step.actor}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Connector Arrow */}
                {i < steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <div className="absolute flex justify-center" style={{ marginTop: '1.5rem' }}>
                      <span className="text-gray-400 text-lg leading-none">▼</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Flow Diagram */}
      <section className="py-14 px-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-navy-900 mb-2 text-center">
            Grievance Status Flow
          </h2>
          <p className="text-gray-500 text-sm text-center mb-10">
            A grievance progresses through these statuses during its lifecycle.
          </p>

          {/* Horizontal flow */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {statusFlow.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`${s.color} ${s.text} px-4 py-2 rounded-full font-semibold text-sm shadow-sm`}>
                  {s.status}
                </div>
                {i < statusFlow.length - 1 && (
                  <span className="text-gray-400 font-bold text-lg">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Reopen note */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 max-w-xl mx-auto text-center">
            <strong>🔁 Reopen:</strong> If a citizen is unsatisfied with the resolution, they can reopen
            the grievance — triggering a new review cycle from "Reopened" status.
          </div>
        </div>
      </section>

      {/* Reference ID Format */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Reference ID Format</h2>
          <div className="inline-block bg-navy-900 text-white rounded-2xl px-10 py-6 shadow-lg mb-4">
            <span className="text-3xl md:text-4xl font-mono font-bold tracking-wider">
              CMK-<span className="text-saffron-400">2026</span>-<span className="text-green-400">000123</span>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 text-sm">
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm">
              <span className="font-bold text-navy-900">CMK</span>
              <span className="text-gray-500 ml-2">— Chief Minister Kerala prefix</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm">
              <span className="font-bold text-saffron-600">YYYY</span>
              <span className="text-gray-500 ml-2">— Year of submission</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm">
              <span className="font-bold text-green-600">XXXXXX</span>
              <span className="text-gray-500 ml-2">— Sequential number (6 digits)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SLA Note */}
      <section className="py-10 px-4 bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">Service Level Agreement (SLA)</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Each department has a defined SLA (in working days) for resolving grievances. Grievances
            approaching or exceeding the SLA are automatically flagged and escalated to the CMO Admin
            to ensure no complaint falls through the cracks.
          </p>
        </div>
      </section>
    </div>
  );
}
