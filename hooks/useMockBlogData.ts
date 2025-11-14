import { useState, useMemo } from 'react';
import { BlogPost } from '../types';

const initialBlogPosts: BlogPost[] = [
    {
        id: '1',
        title: 'How Subscription Pauses Can Slash Your Churn Rate',
        subtitle: 'Discover the simple strategy that top SaaS companies use to retain customers.',
        slug: 'subscription-pauses-slash-churn-rate',
        author: 'PauseFlow Team',
        category: 'Churn Reduction',
        tags: ['SaaS', 'Churn', 'Retention'],
        coverImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        contentHTML: `<p>Customer churn is the silent killer of SaaS businesses. You work hard to acquire customers, only to see them disappear a few months later. But what if many of those cancellations could be prevented? The answer is simpler than you think: subscription pauses.</p><h2>Why Pauses Work</h2><p>Life happens. Customers go on vacation, face temporary budget constraints, or simply don't need your service for a short period. Without a pause option, their only choice is to cancel. By offering a pause, you acknowledge their temporary situation and keep the door open for their return.</p>`,
        excerpt: 'Customer churn is the silent killer of SaaS businesses. Learn how offering a simple pause option can dramatically improve your customer retention and reduce your churn rate.',
        createdAt: new Date('2023-10-26T10:00:00Z'),
        updatedAt: new Date('2023-10-26T10:00:00Z'),
        published: true,
    },
    {
        id: '2',
        title: 'Integrating PauseFlow with Stripe: A Step-by-Step Guide',
        subtitle: 'Get up and running with PauseFlow in under an hour.',
        slug: 'integrating-pauseflow-with-stripe',
        author: 'PauseFlow Team',
        category: 'Integrations',
        tags: ['Stripe', 'How-To', 'Setup'],
        coverImage: 'https://images.unsplash.com/photo-1620714223084-86c9df2a889a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        contentHTML: `<h2>It's Easy to Get Started</h2><p>One of the core design principles of PauseFlow is simplicity. We believe you shouldn't need a team of engineers to implement a powerful churn-reduction tool. This guide will walk you through the entire process of connecting your Stripe account to PauseFlow.</p>`,
        excerpt: 'This guide provides a complete walkthrough for connecting your existing Stripe account to PauseFlow. No engineering resources required.',
        createdAt: new Date('2023-10-20T14:30:00Z'),
        updatedAt: new Date('2023-10-22T11:00:00Z'),
        published: true,
    },
    {
        id: '3',
        title: 'Draft Post: Analyzing Pause Data',
        subtitle: 'How to use data to your advantage.',
        slug: 'analyzing-pause-data',
        author: 'PauseFlow Team',
        category: 'Analytics',
        tags: ['Data', 'SaaS'],
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        contentHTML: `<p>This is a draft and should not be visible on the public blog.</p>`,
        excerpt: 'This is a draft post.',
        createdAt: new Date('2023-10-28T09:00:00Z'),
        updatedAt: new Date('2023-10-28T09:00:00Z'),
        published: false,
    }
];

// Singleton pattern for data so it persists across hook uses
let blogPostsStore = initialBlogPosts;

export const useMockBlogData = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(blogPostsStore);

  const getPostBySlug = (slug: string) => {
    return blogPosts.find(p => p.slug === slug);
  };
  
  const addPost = (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPost: BlogPost = {
          ...post,
          id: String(Date.now()),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      blogPostsStore = [newPost, ...blogPostsStore];
      setBlogPosts(blogPostsStore);
      return newPost;
  }

  const togglePostStatus = (postId: string) => {
    blogPostsStore = blogPostsStore.map(post => {
        if (post.id === postId) {
            return { ...post, published: !post.published, updatedAt: new Date() };
        }
        return post;
    });
    setBlogPosts([...blogPostsStore]);
  };

  return useMemo(() => ({
    blogPosts,
    getPostBySlug,
    addPost,
    togglePostStatus,
  }), [blogPosts]);
};
