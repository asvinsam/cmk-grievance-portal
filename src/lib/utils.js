export const STATUS_COLORS = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-under-review',
  'In Progress': 'badge-in-progress',
  'Resolved': 'badge-resolved',
  'Reopened': 'badge-reopened'
};

export const STATUS_DOT_COLORS = {
  'Submitted': 'bg-gray-500',
  'Under Review': 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  'Resolved': 'bg-green-700',
  'Reopened': 'bg-red-600'
};

export const PRIORITY_COLORS = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800'
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const truncate = (str, n = 60) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '…' : str;
};

export const isOverdue = (dueDate, status) => {
  if (status === 'Resolved') return false;
  return dueDate && new Date(dueDate) < new Date();
};
