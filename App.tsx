
import React, { useState, useEffect } from 'react';
import { User, SubscriptionStatus } from './types';
import LoginPage from './components/LoginPage';
import BillingPage from './components/BillingPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/landing/LandingPage';
import BlogIndexPage from './components/blog/BlogIndexPage';
import BlogPostPage from './components/blog/BlogPostPage';
import BlogAdminPanel from './components/admin/BlogAdminPanel';
import DocUploader from './components/admin/DocUploader';
import WorkflowsPanel from './components/admin/WorkflowsPanel';
import SettingsPanel from './components/admin/SettingsPanel';
import CustomerPausePortal from './components/portal/CustomerPausePortal';
// Blog data is now a separate concern, will be fetched within components if needed or can be mocked separately for now
// For this refactor, we keep blog posts mocked to focus on the core app functionality.
import { useMockBlogData } from './hooks/useMockBlogData';


type AppView = 'dashboard' | 'adminCustomers' | 'adminBlog' | 'adminDocUploader' | 'adminWorkflows' | 'adminSettings';

export default function App() {
  const { user, loading, error, login, logout, purchasePlan } = useAuth();
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  
  const { getPostBySlug } = useMockBlogData();

  useEffect(() => {
    const handlePopState = () => {
        setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };
  
  const handleEnterApp = () => {
    setView('app');
    navigate('/dashboard'); 
  };
  
  const handleNavigateLanding = (path: string) => {
      navigate(path);
      setView('landing');
  }

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  // Public Routes
  if (currentRoute.startsWith('/blog/')) {
      const slug = currentRoute.split('/blog/')[1];
      const post = getPostBySlug(slug);
      if (post) {
        return <BlogPostPage post={post} onNavigate={navigate} />;
      }
  }
  
  if (currentRoute === '/blog') {
      return <BlogIndexPage onNavigate={navigate} onEnterApp={handleEnterApp} />;
  }
  
  const pausePortalMatch = currentRoute.match(/^\/([^/]+)\/pause$/);
  if (pausePortalMatch) {
      const tenantSlug = pausePortalMatch[1];
      return <CustomerPausePortal tenantSlug={tenantSlug} />;
  }

  if (view === 'landing' && currentRoute === '/') {
    return <LandingPage onEnterApp={handleEnterApp} onNavigate={handleNavigateLanding} />;
  }

  // App Routes
  if (!user) {
    return <LoginPage onLogin={(email) => login(email)} />;
  }

  if (user.status === SubscriptionStatus.INACTIVE || user.status === SubscriptionStatus.CANCELED) {
    return <BillingPage user={user} onPurchase={purchasePlan} onLogout={logout} />;
  }
  
  const renderAdminView = () => {
    switch(appView) {
        case 'dashboard': return <Dashboard user={user} />;
        case 'adminCustomers': return <AdminPanel />;
        case 'adminWorkflows': return <WorkflowsPanel />;
        case 'adminSettings': return <SettingsPanel />;
        case 'adminBlog': return <BlogAdminPanel onNavigateTo={(view) => setAppView(view)} />;
        case 'adminDocUploader': return <DocUploader onPublish={() => setAppView('adminBlog')} />;
        default: return <Dashboard user={user} />;
    }
  };

  if (user.isAdmin) {
      return (
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
             <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col">
                <div className="flex items-center space-x-2 mb-10">
                    <i data-lucide="pause-circle" className="text-indigo-500"></i>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
                </div>
                <ul className="space-y-2 flex-1">
                    <li><button onClick={() => setAppView('dashboard')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'dashboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="layout-dashboard"></i><span>Dashboard</span></button></li>
                    <li><button onClick={() => setAppView('adminCustomers')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'adminCustomers' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="users"></i><span>Customers</span></button></li>
                    <li><button onClick={() => setAppView('adminWorkflows')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'adminWorkflows' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="git-merge"></i><span>Workflows</span></button></li>
                    <li><button onClick={() => setAppView('adminSettings')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'adminSettings' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="sliders-horizontal"></i><span>Settings</span></button></li>
                    
                    <li className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4"><span className="text-xs font-semibold text-gray-400 uppercase px-2">Content</span></li>
                    <li><button onClick={() => setAppView('adminBlog')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'adminBlog' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="file-text"></i><span>Blog Posts</span></button></li>
                    <li><button onClick={() => setAppView('adminDocUploader')} className={`w-full flex items-center space-x-3 p-2 rounded-lg ${appView === 'adminDocUploader' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><i data-lucide="file-up"></i><span>Doc Uploader</span></button></li>
                </ul>
                <div className="mt-auto">
                    <button onClick={logout} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i data-lucide="log-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
            <main className="flex-1 p-8 overflow-auto">
                {renderAdminView()}
            </main>
          </div>
      );
  }

  return <Dashboard user={user} onLogout={logout} />;
}