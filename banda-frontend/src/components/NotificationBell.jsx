import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`/api/notifikasi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.status_baca).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    let echoInstance = null;
    let userId = null;

    const setupEcho = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('/api/user', { headers: { Authorization: `Bearer ${token}` } });
            userId = res.data.id;
            
            // Import echo dynamically to avoid issues if it's not needed
            const echoModule = await import('../echo');
            echoInstance = echoModule.default;
            
            echoInstance.private(`user.${userId}`)
                .listen('.NotifikasiBaru', (e) => {
                    toast.success('New Notification', { description: e.notifikasi?.mesej });
                    fetchNotifications();
                });
        } catch (error) {
            console.error('Failed to setup echo', error);
        }
    };
    
    setupEcho();

    return () => {
        if (echoInstance && userId) {
            echoInstance.leave(`user.${userId}`);
        }
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifikasi/${id}/baca`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to update notification.');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifikasi/baca-semua`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to update notification.');
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-black text-slate-800 text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-bold text-teal-600 hover:text-teal-700">Mark All as Read</button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">No notifications so far.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.status_baca ? 'bg-teal-50/50' : ''}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className={`text-sm ${!n.status_baca ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{n.mesej}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{new Date(n.created_at).toLocaleString('en-GB')}</p>
                        </div>
                        {!n.status_baca && (
                          <button onClick={() => markAsRead(n.id)} className="text-teal-600 p-1 hover:bg-teal-100 rounded-full transition-colors" title="Mark as read">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
