import React, { useEffect } from 'react';
import { GitMerge, Zap, CheckCircle, Info } from '../common/Icons';

const WorkflowCard: React.FC<{
    title: string;
    description: string;
    stats: string;
}> = ({ title, description, stats }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start gap-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg flex-shrink-0">
            <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">{stats}</p>
        </div>
    </div>
);

const WorkflowsPanel: React.FC = () => {
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <GitMerge className="w-7 h-7 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automated Workflows</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">These workflows run automatically to re-engage customers and save churn. No configuration needed.</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-200 p-4 rounded-md flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">How It Works</h4>
                    <p className="text-sm">PauseFlow monitors customer pause events and automatically triggers the appropriate communication to maximize retention.</p>
                </div>
            </div>

            <div className="space-y-6">
                <WorkflowCard
                    title="Pre-Resume Nurturing"
                    description="A week before a subscription is set to resume, this workflow sends a 'welcome back' email, highlighting new features or benefits to build excitement."
                    stats="1,284 emails sent this month"
                />
                <WorkflowCard
                    title="Post-Resume Check-in"
                    description="Three days after a subscription resumes, a follow-up email is sent to ensure the customer is satisfied and to gather valuable feedback."
                    stats="971 emails sent this month"
                />
                 <WorkflowCard
                    title="At-Risk Intervention (AI-Powered)"
                    description="For paused customers with a high churn risk score, this workflow triggers a special intervention, such as offering a one-time discount or prompting them to chat with support."
                    stats="87 interventions triggered this month"
                />
            </div>
        </div>
    );
};

export default WorkflowsPanel;