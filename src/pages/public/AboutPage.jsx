const DISCLAIMER =
  "Recruitment Prototype. Not an official Government of Kerala / Chief Minister's Office website. All data is fictional.";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-saffron-400" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
  </svg>
);

const features = [
  { icon: '🔒', title: 'Secure & Confidential', desc: 'All grievances are encrypted and accessible only to authorized personnel.' },
  { icon: '⏱️', title: 'SLA-Bound Resolution', desc: 'Every grievance is bound by a Service Level Agreement ensuring timely action.' },
  { icon: '📡', title: 'Real-Time Tracking', desc: 'Citizens can track the status of their grievance at any point using the reference ID.' },
  { icon: '🏛️', title: 'Multi-Department Coverage', desc: 'Covers all major Kerala government departments under a unified portal.' },
  { icon: '📊', title: 'Transparent Analytics', desc: 'Public dashboards show aggregate statistics, ensuring accountability.' },
  { icon: '🔔', title: 'Automated Notifications', desc: 'Email and in-app alerts keep citizens informed at every step.' },
];

const objectives = [
  'Provide a single-window system for citizens to submit grievances directly to the CMO.',
  'Ensure timely, transparent resolution through SLA enforcement.',
  'Facilitate inter-departmental coordination for complex grievances.',
  'Build public trust through open data and resolution analytics.',
  'Reduce manual paperwork and speed up administrative response.',
  'Enable data-driven policymaking through aggregated grievance insights.',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-300 text-amber-800 text-xs text-center py-2 px-4 font-medium">
        ⚠️ {DISCLAIMER}
      </div>

      {/* Page Header */}
      <section className="bg-navy-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <ShieldIcon />
          </div>
          <h1 className="text-4xl font-bold mb-3">About the Portal</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">
            The CM Kerala Grievance Portal is a prototype digital governance initiative connecting
            citizens directly to the Chief Minister's Office for efficient grievance redressal.
          </p>
        </div>
      </section>

      {/* Mission Vision */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h2 className="text-xl font-bold text-navy-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              To empower every citizen of Kerala with a transparent, accountable, and responsive
              grievance redressal mechanism — ensuring that no genuine concern goes unheard by
              the highest office of the state government.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌟</span>
              <h2 className="text-xl font-bold text-navy-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              A Kerala where every citizen has equal and direct access to the government, where
              administrative accountability is measurable, and where technology bridges the gap
              between the state and its people.
            </p>
          </div>
        </div>
      </section>

      {/* Purpose Statement */}
      <section className="py-10 px-4 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Purpose of the Portal</h2>
          <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto text-sm">
            The CM Kerala Grievance Portal was established to streamline the process of grievance
            submission, tracking, and resolution across all state government departments. It eliminates
            the need for citizens to physically visit government offices, provides a verifiable audit
            trail for every complaint, and ensures that departments are held accountable through
            automated SLA monitoring and escalation workflows.
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Key Objectives</h2>
          <p className="text-gray-500 text-sm mb-8">
            What we aim to achieve through this initiative
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-2">Key Features</h2>
          <p className="text-gray-500 text-sm text-center mb-10">
            Built for transparency, efficiency, and citizen trust
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-navy-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Footer Note */}
      <section className="py-8 px-4 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-700 text-xs font-medium">
            ⚠️ {DISCLAIMER}
          </p>
        </div>
      </section>
    </div>
  );
}
