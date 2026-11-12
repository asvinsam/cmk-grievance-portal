import { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import { Breadcrumb, LoadingSkeleton } from '../../components/ui/index.jsx';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(1);

  useEffect(() => {
    api.get('/faqs')
      .then((res) => setFaqs(res.data?.data || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />

      <h1 className="text-3xl font-bold text-navy-900 mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-600 text-sm mb-8">
        Find answers to common questions about submitting, tracking, and resolving grievances.
      </p>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="card p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-navy-900 hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="text-xl font-bold text-saffron-600 ml-4" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
