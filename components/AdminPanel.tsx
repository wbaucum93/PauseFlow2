import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Plan, SubscriptionStatus } from '../types';
import { Search, Download, MoreVertical } from './common/Icons';
import { api } from '../services/api';

const ChurnRiskIndicator: React.FC<{ risk: number }> = ({ risk }) => {
    const riskPercent = Math.round(risk * 100);
    let color = 'bg-gray-400';
    if (risk > 0.75) color = 'bg-red-500';
    else if (risk > 0.4) color = 'bg-yellow-500';
    else color = 'bg-green-500';

    return (
        <div className="flex items-center space-x-2" title={`Churn Risk: ${riskPercent}%`}>
            <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
            <span>{riskPercent}%</span>
        </div>
    );
};

const AdminPanel: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    // TODO: Need to fetch connected account ID
    const connectedAccountId = "acct_placeholder";

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                // TODO: Replace placeholder with real accountId
                const data = await api.get(`/api/subscriptions?accountId=${connectedAccountId}`);
                
                if (Array.isArray(data)) {
                    // TODO: The backend might need to enrich this data with customer email, etc.
                    // This is a temporary mapping.
                    const mappedCustomers: Customer[] = data.map((sub: any) => ({
                        id: sub.id,
                        email: sub.customerId, // Placeholder, should be customer email
                        plan: sub.plan?.id.includes('pro') ? Plan.PRO : Plan.GROWTH, // Heuristic
                        status: sub.status as SubscriptionStatus,
                        pauseCount: 0, // TODO: This should come from the backend
                        monthlyValue: sub.plan?.amount / 100 || 0, // Stripe amount is in cents
                        churnRisk: sub.status === 'paused' ? Math.random() : undefined // Mock churn risk
                    }));
                    setCustomers(mappedCustomers);
                } else {
                    console.error("Failed to fetch customers: API did not return an array.", data);
                    setCustomers([]);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                setCustomers([]); // Ensure customers is an empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);


    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => 
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, customers]);

    const getStatusChip = (status: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case SubscriptionStatus.PAUSED:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case SubscriptionStatus.CANCELED:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const getPlanChip = (plan: Plan) => {
        switch (plan) {
            case Plan.STARTER:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case Plan.GROWTH:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
            case Plan.PRO:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Customers</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view all customer subscriptions.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <button className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap">
                        <Download className="w-4 h-4"/>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Customer Email</th>
                            <th scope="col" className="px-6 py-3">Plan</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Churn Risk</th>
                            <th scope="col" className="px-6 py-3 text-center">Pause Count</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr>
                                <td colSpan={6} className="text-center py-10">
                                    <div className="flex justify-center items-center">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-4 text-gray-500 dark:text-gray-400">Loading customers...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCustomers.map(customer => (
                            <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {customer.email}
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanChip(customer.plan)}`}>
                                        {customer.plan.charAt(0).toUpperCase() + customer.plan.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChip(customer.status)}`}>
                                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                    </span>
                                </td>
                                 <td className="px-6 py-4">
                                    {customer.status === SubscriptionStatus.PAUSED && customer.churnRisk ? (
                                        <ChurnRiskIndicator risk={customer.churnRisk} />
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">{customer.pauseCount}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 { !loading && filteredCustomers.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;