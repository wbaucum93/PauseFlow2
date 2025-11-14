import React, { useState, useMemo, useEffect } from 'react';
// FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
import { useMockBlogData } from '../../hooks/useMockBlogData';
import { Search, FileText } from '../common/Icons';

type BlogAdminPanelProps = {
    onNavigateTo: (view: 'adminBlog' | 'adminDocUploader' | 'dashboard' | 'adminCustomers') => void;
};

const BlogAdminPanel: React.FC<BlogAdminPanelProps> = ({ onNavigateTo }) => {
    // FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
    const { blogPosts, togglePostStatus } = useMockBlogData();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, blogPosts]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create, edit, and manage your articles.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap">
                        <FileText className="w-4 h-4"/>
                        <span>New Post</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map(post => (
                            <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {post.title}
                                </td>
                                <td className="px-6 py-4">{post.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(post.updatedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex items-center space-x-4">
                                    <button className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                                    <button 
                                        onClick={() => togglePostStatus(post.id)}
                                        className={`font-medium ${post.published 
                                            ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300' 
                                            : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                                    >
                                        {post.published ? 'Unpublish' : 'Publish'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPosts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogAdminPanel;