import { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import { Breadcrumb, LoadingSkeleton, EmptyState } from '../../components/ui/index.jsx';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/departments')
      .then((res) => setDepartments(res.data?.data || []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = departments.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Departments' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Participating Departments</h1>
          <p className="text-gray-600 text-sm mt-1">
            Fictional state departments handling citizen grievances under the prototype portal.
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter departments…"
          className="form-input md:w-72 bg-white"
          aria-label="Filter departments"
        />
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No departments found" message="Try clearing your search filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept) => (
            <article key={dept._id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold bg-navy-50 text-navy-900 px-2.5 py-1 rounded">
                    {dept.code}
                  </span>
                  <span className="text-xs text-gray-500">SLA: {dept.sla_days || 15} days</span>
                </div>
                <h2 className="text-lg font-bold text-navy-900 mb-2">{dept.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{dept.description}</p>
              </div>
              <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1">
                {dept.head_name && <p>Head: <span className="font-medium text-gray-700">{dept.head_name}</span></p>}
                {dept.contact_email && <p>Email: <span className="font-mono text-gray-700">{dept.contact_email}</span></p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
