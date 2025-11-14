import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Trash2 } from '../common/Icons';
import { api } from '../../services/api';

interface Settings {
    pauseReasons: string[];
    whiteLabel?: {
        logoUrl?: string;
        brandColor?: string;
        domain?: string;
    }
}

const SettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({ pauseReasons: [] });
    const [newReason, setNewReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/api/settings');
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [settings.pauseReasons]);

    const handleSaveChanges = async (updatedSettings: Settings) => {
        setIsSaving(true);
        try {
            await api.put('/api/settings', updatedSettings);
            setSettings(updatedSettings);
        } catch (error) {
            console.error("Failed to save settings:", error);
            // TODO: Show an error toast to the user
        } finally {
            setIsSaving(false);
        }
    };


    const handleAddReason = () => {
        if (newReason.trim() && !settings.pauseReasons.includes(newReason.trim())) {
            const updatedReasons = [...settings.pauseReasons, newReason.trim()];
            handleSaveChanges({ ...settings, pauseReasons: updatedReasons });
            setNewReason('');
        }
    };

    const handleDeleteReason = (reasonToDelete: string) => {
        const updatedReasons = settings.pauseReasons.filter(r => r !== reasonToDelete);
        handleSaveChanges({ ...settings, pauseReasons: updatedReasons });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <SlidersHorizontal className="w-7 h-7 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure your PauseFlow settings and customize the customer experience.</p>
            </div>

            {/* Custom Pause Reasons */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Pause Reasons</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide structured options for customers when they pause. This gives you cleaner data for analytics.</p>
                <div className="mt-6 space-y-3">
                    {settings.pauseReasons.map((reason, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{reason}</span>
                            <button onClick={() => handleDeleteReason(reason)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 flex items-center gap-3">
                    <input
                        type="text"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        placeholder="Add a new reason..."
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddReason()}
                    />
                    <button onClick={handleAddReason} disabled={isSaving} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 text-sm disabled:bg-indigo-400">
                        {isSaving ? '...' : 'Add'}
                    </button>
                </div>
            </div>

            {/* White-Labeling */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">White-Labeling</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize the pause portal to match your brand.</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full self-start">Pro Plan</span>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Domain</label>
                            <input type="text" disabled value="billing.yourdomain.com" className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Color</label>
                            <div className="mt-1 flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-md bg-indigo-600 border-2 border-white shadow-sm"></div>
                                <input type="text" disabled value="#4F46E5" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
                         <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full bg-gray-50 dark:bg-gray-900/50">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 mx-auto"></div>
                                <h4 className="mt-3 font-semibold text-gray-800 dark:text-white">Confirm Subscription Pause</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You won't be billed during your pause.</p>
                                <button className="mt-4 w-full text-sm bg-indigo-600 text-white font-semibold py-2 rounded-md">Confirm Pause</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SettingsPanel;
