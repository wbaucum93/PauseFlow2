import React, { useEffect } from 'react';
import { BlogPost } from '../../types';
// FIX: Changed import from User to Users as User is not an exported member of Icons.
import { PauseCircle, Calendar, Users, Tag, BookOpen } from '../common/Icons';

interface BlogPostProps {
  post: BlogPost;
  onNavigate: (path: string) => void;
}

const BlogHeader: React.FC<{ onNavigate: (path: string) => void; }> = ({ onNavigate }) => (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
                <PauseCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
            </div>
            <nav className="flex items-center space-x-8">
                <button onClick={() => onNavigate('/blog')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-semibold">
                    &larr; Back to Blog
                </button>
            </nav>
        </div>
    </header>
);

const BlogPostPage: React.FC<BlogPostProps> = ({ post, onNavigate }) => {

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
        window.scrollTo(0, 0);
    }, [post]);

    // Simple function to estimate read time
    const calculateReadTime = (html: string) => {
        const text = html.replace(/<[^>]+>/g, '');
        const wordsPerMinute = 200;
        const noOfWords = text.split(/\s/g).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.ceil(minutes);
    };

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen">
            <BlogHeader onNavigate={onNavigate} />

            <main className="py-12 pt-28">
                <article className="container mx-auto px-6 max-w-4xl">
                    <header className="mb-12 text-center">
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{post.category}</p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2">{post.title}</h1>
                        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">{post.subtitle}</p>
                        
                        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-500">
                            <div className="flex items-center space-x-2">
                                {/* FIX: Changed component from User to Users to match the available import. */}
                                <Users className="w-4 h-4" />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                             <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{calculateReadTime(post.contentHTML)} min read</span>
                            </div>
                        </div>
                    </header>

                    <img src={post.coverImage} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"/>

                    <div className="mt-12 prose prose-lg dark:prose-invert max-w-none prose-indigo"
                         dangerouslySetInnerHTML={{ __html: post.contentHTML }}
                    />
                    
                    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                        <div className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                             {post.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                             ))}
                        </div>
                    </div>
                </article>
            </main>

             <footer className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} PauseFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default BlogPostPage;