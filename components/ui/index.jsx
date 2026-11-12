import { STATUS_COLORS, STATUS_DOT_COLORS, PRIORITY_COLORS } from '../../lib/utils.js';

export const StatusBadge = ({ status }) => {
  const cls = STATUS_COLORS[status] || 'badge-submitted';
  const dot = STATUS_DOT_COLORS[status] || 'bg-gray-500';
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5 inline-block`} aria-hidden />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const cls = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {priority}
    </span>
  );
};

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-2" role="status" aria-label={label}>
    <div className={`spinner ${size === 'lg' ? 'w-8 h-8 border-4' : ''}`} />
    <span className="sr-only">{label}</span>
  </div>
);

export const LoadingSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-10 w-full rounded" />
    ))}
  </div>
);

export const EmptyState = ({ icon = '📭', title, message, description, action }) => (
  <div className="text-center py-12 text-gray-500">
    <div className="text-4xl mb-3 flex justify-center">{icon}</div>
    {title && <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>}
    {(message || description) && <p className="text-sm mb-4">{message || description}</p>}
    {action && typeof action === 'object' && !action.$$typeof && action.label ? (
      <button onClick={action.onClick} className="btn-secondary text-sm py-2 px-4">
        {action.label}
      </button>
    ) : action}
  </div>
);

export const Breadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-4">
    <ol className="flex items-center gap-2 text-sm text-gray-500">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>›</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-navy-900 hover:underline">{item.label}</a>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export const KPICard = ({ title, label, value, subtitle, description, color = 'navy', icon, onClick }) => {
  const colorMap = {
    navy: 'border-l-navy-900 bg-navy-50',
    saffron: 'border-l-saffron-500 bg-amber-50',
    yellow: 'border-l-saffron-500 bg-amber-50',
    orange: 'border-l-orange-500 bg-orange-50',
    green: 'border-l-green-700 bg-green-50',
    red: 'border-l-red-600 bg-red-50',
    blue: 'border-l-blue-500 bg-blue-50',
    purple: 'border-l-purple-600 bg-purple-50',
    gray: 'border-l-gray-500 bg-gray-50'
  };

  const displayTitle = title || label;
  const displaySub = subtitle || description;

  return (
    <div
      className={`card border-l-4 ${colorMap[color] || colorMap.navy} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{displayTitle}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
          </p>
          {displaySub && <p className="text-xs text-gray-500 mt-1">{displaySub}</p>}
        </div>
        {icon && <span className="text-3xl" aria-hidden>{icon}</span>}
      </div>
    </div>
  );
};

export const AlertBox = ({ type = 'info', message, children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-300 text-blue-900',
    success: 'bg-green-50 border-green-300 text-green-900',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    error: 'bg-red-50 border-red-300 text-red-900'
  };
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${styles[type]}`} role="alert">
      <span className="flex-shrink-0">{icons[type]}</span>
      <div className="text-sm">{children || message}</div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, breadcrumb, actions, action }) => (
  <div className="mb-6">
    {breadcrumb && <Breadcrumb items={breadcrumb} />}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
      </div>
      {(actions || action) && <div className="flex gap-3">{actions || action}</div>}
    </div>
  </div>
);

export const Pagination = ({ page, currentPage, totalPages, onPageChange }) => {
  const activePage = page || currentPage || 1;
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
      <button
        onClick={() => onPageChange(activePage - 1)}
        disabled={activePage <= 1}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
        aria-label="Previous page"
      >← Prev</button>
      <span className="text-sm text-gray-600">Page {activePage} of {totalPages}</span>
      <button
        onClick={() => onPageChange(activePage + 1)}
        disabled={activePage >= totalPages}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
        aria-label="Next page"
      >Next →</button>
    </div>
  );
};

export const GrievanceTimeline = ({ history }) => {
  if (!history?.length) return <p className="text-gray-500 text-sm">No history available.</p>;

  const timelineColors = {
    'Submitted': 'bg-gray-500',
    'Under Review': 'bg-blue-500',
    'In Progress': 'bg-amber-500',
    'Resolved': 'bg-green-700',
    'Reopened': 'bg-red-600'
  };

  return (
    <ol className="relative border-l-2 border-gray-200 ml-4 space-y-6">
      {history.map((item, i) => (
        <li key={i} className="ml-6 relative">
          <span className={`absolute flex items-center justify-center w-4 h-4 rounded-full -left-8 top-1 ${timelineColors[item.to_status] || 'bg-gray-400'}`} aria-hidden />
          <div className="card py-3 px-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-navy-900">{item.to_status}</span>
              {item.from_status && (
                <span className="text-xs text-gray-500">from {item.from_status}</span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(item.timestamp || item.createdAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            {item.remarks && <p className="text-sm text-gray-700">{item.remarks}</p>}
            {item.changed_by_role && (
              <p className="text-xs text-gray-400 mt-1">By: {item.changed_by_role?.replace('_', ' ')}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
