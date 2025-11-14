
import React from 'react';
import { User, Plan } from '../types';
import { CheckCircle, PauseCircle } from './common/Icons';

interface BillingPageProps {
  user: User;
  onPurchase: (plan: Plan) => void;
  onLogout: () => void;
}

const LifetimeDealCard: React.FC<{ onSelect: (plan: Plan) => void; }> = ({ onSelect }) => {
    const features = [
        "All Pro features + future updates forever",
        "AI Churn Prediction Engine (AppSumo Exclusive)",
        "Automated Win-Back Workflows (AppSumo Exclusive)",
        "Revenue Saved Dashboard",
        "Full White-Labeling",
        "5-minute Stripe integration"
    ];

    return (
        <div className="border-2 rounded-2xl p-8 flex flex-col bg-white dark:bg-gray-800 border-indigo-500 shadow-2xl max-w-lg mx-auto">
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full self-start">AppSumo Lifetime Deal</span>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Pro for Life</h3>
            <div className="mt-6 flex items-baseline gap-x-2">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">$249</span>
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">one-time payment</span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Get lifetime access to PauseFlow's most powerful features.</p>
            <ul className="mt-8 space-y-4 text-gray-600 dark:text-gray-300 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => onSelect(Plan.LIFETIME)}
                className="mt-10 w-full py-3 px-6 rounded-lg font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 text-lg shadow-lg">
                Secure Your Lifetime Access
            </button>
        </div>
    );
};


const BillingPage: React.FC<BillingPageProps> = ({ user, onPurchase, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 flex flex-col">
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
            <PauseCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user.email}</span>
            <button onClick={onLogout} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Logout</button>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade to Unlock PauseFlow</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Your current plan is inactive. Secure lifetime access to continue.</p>
        </div>
        <LifetimeDealCard onSelect={onPurchase} />
      </main>
    </div>
  );
};

export default BillingPage;
