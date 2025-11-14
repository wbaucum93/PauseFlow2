import React, { useState, useMemo, useEffect } from 'react';
// FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
import { useMockBlogData } from '../../hooks/useMockBlogData';
import { BlogPost } from '../../types';
import { PauseCircle, Search, ChevronDown } from '../common/Icons';

interface BlogIndexProps {
  onNavigate: (path: string) => void;
  onEnterApp: () => void;
}

const BlogHeader: React.FC<BlogIndexProps> = ({ onNavigate, onEnterApp }) => (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
                <PauseCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <button onClick={() => onNavigate('/')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Home</button>
            </nav>
            <div className="flex items-center space-x-4">
                <button onClick={onEnterApp} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                    Dashboard Login
                </button>
            </div>
        </div>
    </header>
);

const BlogCard: React.FC<{ post: BlogPost; onNavigate: (path: string) => void; }> = ({ post, onNavigate }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-transform duration-300">
        <img src={post.coverImage} alt={post.title} className="h-56 w-full object-cover"/>
        <div className="p-6">
            <p className="text-sm text-indigo-500 dark:text-indigo-400 font-semibold">{post.category}</p>
            <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{post.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                <button onClick={() => onNavigate(`/blog/${post.slug}`)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Read More &rarr;
                </button>
            </div>
        </div>
    </div>
);

const BlogIndexPage: React.FC<BlogIndexProps> = ({ onNavigate, onEnterApp }) => {
    // FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
    const { blogPosts } = useMockBlogData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    const publishedPosts = useMemo(() => blogPosts.filter(p => p.published), [blogPosts]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(publishedPosts.map(p => p.category)))], [publishedPosts]);

    const filteredPosts = useMemo(() => {
        return publishedPosts
            .filter(post => selectedCategory === 'All' || post.category === selectedCategory)
            .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [publishedPosts, searchTerm, selectedCategory]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <BlogHeader onNavigate={onNavigate} onEnterApp={onEnterApp} />
            
            <main className="container mx-auto px-6 py-12 pt-28">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">The PauseFlow Blog</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                        Insights on churn reduction, customer retention, and scaling your subscription business.
                    </p>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                         <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="appearance-none w-full sm:w-48 pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                         >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map(post => (
                        <BlogCard key={post.id} post={post} onNavigate={onNavigate} />
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">No articles found. Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} PauseFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default BlogIndexPage;