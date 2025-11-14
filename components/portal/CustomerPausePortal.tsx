import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Placeholder, as we're not using react-router
import { PauseCircle, CheckCircle } from '../common/Icons';
import { api } from '../../services/api'; // This will be a public API endpoint

interface CustomerPausePortalProps {
    tenantSlug: string;
}

const CustomerPausePortal: React.FC<CustomerPausePortalProps> = ({ tenantSlug }) => {
    const [settings, setSettings] = useState<{ pauseReasons: string[], brandColor?: string }>({ pauseReasons: [] });
    const [selectedReason, setSelectedReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // In a real app with react-router, you'd use `useSearchParams()`
    // For this environment, we'll parse it manually.
    const [searchParams] = useState(new URLSearchParams(window.location.search));
    const subscriptionId = searchParams.get('sub');

    useEffect(() => {
        // In a real app, these settings would be fetched from a public endpoint
        // using the tenantSlug (e.g., /api/public/settings/{tenantSlug})
        // For now, we mock them.
        setSettings({
            pauseReasons: [
                'I\'m on vacation',
                'I don\'t need the service right now',
                'It\'s too expensive at the moment',
                'Other',
            ],
            brandColor: '#4F46E5' // Default to indigo
        });
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [tenantSlug]);
    
    useEffect(() => {
        if (settings.pauseReasons.length > 0) {
            setSelectedReason(settings.pauseReasons[0]);
        }
    }, [settings.pauseReasons]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subscriptionId) {
            setError('Subscription identifier is missing.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            // TODO: This needs a public endpoint that doesn't require user auth
            // The backend would need to validate the subscription against the tenant
            // await api.post('/api/public/pause', {
            //     tenantId: tenantSlug,
            //     subscriptionId: subscriptionId,
            //     reason: selectedReason,
            // });
            
            // Mocking success for now
            await new Promise(res => setTimeout(res, 1000));
            console.log(`Pausing ${subscriptionId} for ${tenantSlug} with reason: ${selectedReason}`);

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md text-center">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                     <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-6">Subscription Paused</h1>
                     <p className="text-gray-500 dark:text-gray-400 mt-2">Your subscription has been successfully paused. You won't be charged until it resumes.</p>
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">Powered by PauseFlow</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        {/* TODO: Use tenant logo from settings */}
                        <div className="w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: settings.brandColor }}></div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pause Your Subscription</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Need a break? Pause your subscription and resume anytime. You won't be billed while paused.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="reason" className="text-sm font-medium text-gray-600 dark:text-gray-300">Why are you pausing today?</label>
                            <select
                                id="reason"
                                value={selectedReason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="mt-2 w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                            >
                                {settings.pauseReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>

                         {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !subscriptionId}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition disabled:opacity-50"
                                style={{ backgroundColor: settings.brandColor }}
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm Pause'}
                            </button>
                        </div>
                    </form>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">Powered by <a href="#" className="font-semibold text-indigo-500">PauseFlow</a></p>
            </div>
        </div>
    );
};

export default CustomerPausePortal;
