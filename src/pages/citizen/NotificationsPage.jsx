import { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/ui/index.jsx';
import { formatDateTime } from '../../lib/utils.js';

const TYPE_ICONS = {
  status_update: '🔄',
  assignment: '📋',
  resolution: '✅',
  reopened: '🔁',
  escalation: '🚨',
  general: '🔔',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/grievances/notifications/all')
      .then((res) => {
        const payload = res.data?.data || {};
        setNotifications(payload.notifications || []);
        setUnreadCount(payload.unreadCount || 0);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification(s) marked as read` : 'All caught up'}
      />

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState title="No notifications" message="You will receive updates here when your grievances change status." />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className="card flex items-start gap-4 py-4">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {TYPE_ICONS[n.type] || '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-navy-900 text-sm">{n.title}</h3>
                  <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                {n.reference_id && (
                  <span className="inline-block mt-1.5 text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {n.reference_id}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
