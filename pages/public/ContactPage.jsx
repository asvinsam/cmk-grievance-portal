import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import { Breadcrumb, AlertBox } from '../../components/ui/index.jsx';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || form.message.trim().length < 10) {
      setError('Please fill in all fields. Message must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      toast.success('Enquiry submitted successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />

      <h1 className="text-3xl font-bold text-navy-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 text-sm mb-8">
        Have a question about using the portal? Send us an enquiry below. (Prototype contact form)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 card">
          {submitted ? (
            <div className="space-y-4 py-6 text-center">
              <div className="text-4xl">✅</div>
              <h2 className="text-xl font-bold text-navy-900">Enquiry Received</h2>
              <p className="text-sm text-gray-600">
                Thank you for reaching out. Your enquiry has been saved and will be reviewed within 2–3 working days.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary text-sm">
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <AlertBox type="error" message={error} />}

              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="form-input" required />
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" required />
              </div>

              <div>
                <label htmlFor="subject" className="form-label">Subject *</label>
                <input id="subject" name="subject" type="text" value={form.subject} onChange={handleChange} className="form-input" required />
              </div>

              <div>
                <label htmlFor="message" className="form-label">Message * (min 10 chars)</label>
                <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} className="form-input" required />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card space-y-3 text-sm">
            <h2 className="text-lg font-bold text-navy-900">Helpdesk Info (Fictional)</h2>
            <div>
              <p className="font-semibold text-gray-700">Address</p>
              <p className="text-gray-600">Prototype Grievance Cell, Secretariat Annex, Thiruvananthapuram, Kerala 695001</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Helpline</p>
              <p className="text-gray-600">1800-000-0000 (Sample Toll-Free)</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Email</p>
              <p className="text-gray-600 font-mono">support@cmk-prototype.example</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Working Hours</p>
              <p className="text-gray-600">Monday – Friday, 10:00 AM – 5:00 PM</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
