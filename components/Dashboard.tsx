import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { User, PauseEvent, EventType, SubscriptionStatus } from '../types';
import { Users, Pause, History, Download, MoreVertical, Bell, Sun, Moon, AlertTriangle, DollarSign } from './common/Icons';
import { api } from '../services/api';

interface DashboardProps {
  user: User;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {!user.isAdmin && (
            <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex-col hidden lg:flex">
                <div className="flex items-center space-x-2 mb-10">
                    <i data-lucide="pause-circle" className="text-indigo-500"></i>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
                </div>
                <ul className="space-y-2 flex-1">
                    <li><a href="#" className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></a></li>
                </ul>
                {onLogout && (
                    <div className="mt-auto">
                        <button onClick={onLogout} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i data-lucide="log-out"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </nav>
        )}
        <div className="flex-1 flex flex-col">
            <Header user={user} onLogout={onLogout} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                <DashboardContent />
            </main>
        </div>
    </div>
  );
};

const Header: React.FC<{ user: User, onLogout?: () => void }> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5" />
            <div className="w-9 h-5 bg-gray-200 rounded-full">
                <div className="w-4 h-4 mt-0.5 ml-0.5 bg-white rounded-full"></div>
            </div>
            <Moon className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.plan} Plan</p>
          </div>
          {onLogout && !user.isAdmin && (
             <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
              <i data-lucide="log-out"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const DashboardContent: React.FC = () => {
    const [stats, setStats] = useState({ revenueSaved: 0, activeCustomers: 0, pausedCustomers: 0, totalPauseEvents: 0 });
    // TODO: Need to fetch connected account ID
    const connectedAccountId = "acct_placeholder"; // This needs to be fetched and stored

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // TODO: Replace placeholder with real accountId
                const data = await api.get(`/api/metrics/summary?accountId=${connectedAccountId}`);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<DollarSign />} title="Revenue Saved" value={`$${stats.revenueSaved.toLocaleString()}`} change="+15.3%" isPrimary />
                <StatCard icon={<Users />} title="Active Customers" value={stats.activeCustomers.toLocaleString()} change="+12.5%" />
                <StatCard icon={<Pause />} title="Paused Customers" value={stats.pausedCustomers.toLocaleString()} change="+5.2%" />
                <StatCard icon={<History />} title="Total Pause Events" value={stats.totalPauseEvents.toLocaleString()} change="+8.1%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ActivityChart />
                    <HistoryTable />
                </div>
                <div className="lg:col-span-1">
                    <SubscriptionControls connectedAccountId={connectedAccountId} />
                </div>
            </div>
        </>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; change: string; isPrimary?: boolean }> = ({ icon, title, value, change, isPrimary = false }) => (
    <div className={`p-6 rounded-xl shadow-md flex items-start justify-between ${isPrimary ? 'bg-indigo-600 dark:bg-indigo-700 text-white' : 'bg-white dark:bg-gray-800'}`}>
        <div>
            <p className={`text-sm font-medium ${isPrimary ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
            <p className={`text-3xl font-bold mt-2 ${isPrimary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
            <p className={`text-sm mt-2 ${isPrimary ? 'text-indigo-100' : 'text-gray-400'}`}>{change} vs last month</p>
        </div>
        <div className={`p-3 rounded-lg ${isPrimary ? 'bg-indigo-500' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
            {icon}
        </div>
    </div>
);

const ActivityChart: React.FC = () => {
  // TODO: Fetch chart data from the API
  const chartData = []; 
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">30-Day Activity</h3>
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" stroke="rgb(156 163 175)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgb(156 163 175)" fontSize={12} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff' }} />
            <Area type="monotone" dataKey="Pauses" stroke="#8884d8" fillOpacity={1} fill="url(#colorPauses)" />
            <Area type="monotone" dataKey="Resumes" stroke="#82ca9d" fillOpacity={1} fill="url(#colorResumes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
    action: 'pause' | 'resume';
    subscriptionId: string;
    reason?: string;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ action, subscriptionId, reason, isLoading, onConfirm, onCancel }) => {
    const isPause = action === 'pause';
    const title = isPause ? 'Confirm Pause' : 'Confirm Resume';
    const description = `Are you sure you want to ${action} subscription ${subscriptionId}?`;
    const confirmButtonColor = isPause 
        ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300' 
        : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-start">
                    <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isPause ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
                        <AlertTriangle className={`h-6 w-6 ${isPause ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`} />
                    </div>
                    <div>
                        <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <p>{description}</p>
                            {isPause && reason && <p className="mt-2">Reason: <span className="font-medium">{reason}</span></p>}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading} className={`text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center min-w-[120px] ${confirmButtonColor}`}>
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `Confirm ${isPause ? 'Pause' : 'Resume'}`}
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};


const SubscriptionControls: React.FC<{connectedAccountId: string}> = ({ connectedAccountId }) => {
    const [subId, setSubId] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [modalState, setModalState] = useState<{ action: 'pause' | 'resume' } | null>(null);

    const handleInitiateAction = (action: 'pause' | 'resume') => {
        if (!subId) return;
        setModalState({ action });
    };

    const handleConfirmAction = async () => {
        if (!modalState || !connectedAccountId) return;

        const { action } = modalState;
        setIsLoading(true);
        setFeedback({ type: '', message: '' });

        try {
            const endpoint = action === 'pause' ? '/api/subscriptions/pause' : '/api/subscriptions/resume';
            const payload = {
                accountId: connectedAccountId,
                stripeSubId: subId,
                reason: action === 'pause' ? reason : undefined,
            };
            const result = await api.post(endpoint, payload);

            setFeedback({ type: 'success', message: result.message });
            setSubId('');
            setReason('');
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message || 'An error occurred.' });
        } finally {
            setIsLoading(false);
            setModalState(null);
            setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
        }
    };

    const handleCancelAction = () => {
        setModalState(null);
    };
    
    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Controls</h3>
                {feedback.message && (
                    <div className={`p-3 rounded-md mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {feedback.message}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="subId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription ID</label>
                        <input type="text" id="subId" value={subId} onChange={e => setSubId(e.target.value)} placeholder="sub_1a2b3c..." className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Pause (optional)</label>
                        <input type="text" id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., On vacation" className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => handleInitiateAction('pause')} disabled={!subId} className="flex-1 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition flex items-center justify-center">
                            Pause
                        </button>
                        <button onClick={() => handleInitiateAction('resume')} disabled={!subId} className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition flex items-center justify-center">
                            Resume
                        </button>
                    </div>
                </div>
            </div>

            {modalState && (
                <ConfirmationModal
                    action={modalState.action}
                    subscriptionId={subId}
                    reason={reason}
                    isLoading={isLoading}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelAction}
                />
            )}
        </>
    );
};


const HistoryTable: React.FC = () => {
    // TODO: Fetch real history from an events collection
    const history: PauseEvent[] = [];
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">History Log</h3>
                <button className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 text-sm">
                    <Download className="w-4 h-4"/>
                    <span>Export CSV</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Event</th>
                            <th scope="col" className="px-6 py-3">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(event => (
                            <tr key={event.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {event.eventType === EventType.PAUSE ? new Date(event.pausedAt).toLocaleDateString() : new Date(event.resumedAt!).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.eventType === EventType.PAUSE ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                        {event.eventType === EventType.PAUSE ? 'Paused' : 'Resumed'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{event.reason}</td>
                            </tr>
                        ))}
                         {history.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">No recent events.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
