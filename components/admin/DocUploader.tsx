import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
// FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
import { useMockBlogData } from '../../hooks/useMockBlogData';
import { FileUp, CheckCircle } from '../common/Icons';

type DocUploaderProps = {
    onPublish: () => void;
};

const DocUploader: React.FC<DocUploaderProps> = ({ onPublish }) => {
    const [docUrl, setDocUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processedContent, setProcessedContent] = useState<any | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
    const { addPost } = useMockBlogData();

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [processedContent]);

    const handleProcessDoc = async () => {
        if (!docUrl) return;
        setIsLoading(true);
        setError('');
        setProcessedContent(null);
        try {
            const result = await geminiService.processGoogleDoc(docUrl);
            setProcessedContent(result);
        } catch (err) {
            setError('Failed to process document. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAsDraft = () => {
        if (!processedContent) return;
        
        const newPostData = {
            title: processedContent.title,
            subtitle: processedContent.subtitle || '',
            slug: processedContent.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
            author: 'PauseFlow Team',
            category: processedContent.category,
            tags: processedContent.tags,
            coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            contentHTML: processedContent.contentHTML,
            excerpt: processedContent.excerpt,
            published: false, // Always save as draft first
        };
        addPost(newPostData);
        setSuccessMessage('Successfully saved post as a draft!');
        setProcessedContent(null);
        setDocUrl('');
        setTimeout(() => {
            onPublish();
        }, 2000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import from Google Docs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Paste a Google Docs URL to automatically create a formatted blog post draft using AI.</p>
            
            {!processedContent && (
                <div className="flex items-start gap-4">
                    <input
                        type="text"
                        placeholder="e.g., https://docs.google.com/document/d/..."
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={handleProcessDoc}
                        disabled={isLoading || !docUrl}
                        className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FileUp className="w-4 h-4"/>
                        )}
                        <span>{isLoading ? 'Processing...' : 'Process Document'}</span>
                    </button>
                </div>
            )}
            
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {successMessage && <p className="mt-4 text-green-500 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {successMessage}</p>}


            {processedContent && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Preview</h3>
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <h4 className="text-2xl font-bold">{processedContent.title}</h4>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{processedContent.subtitle}</p>
                        <div className="mt-4 prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: processedContent.contentHTML }}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setProcessedContent(null)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition">
                            Cancel
                        </button>
                        <button onClick={handleSaveAsDraft} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition">
                            Save as Draft
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocUploader;