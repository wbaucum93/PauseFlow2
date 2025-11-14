
import React, { useState, useEffect, useRef } from 'react';
import { PauseCircle, CheckCircle, ChevronDown, ChevronUp, TrendingDown, RefreshCw, DollarSign, ShieldCheck, Target } from '../common/Icons';
// FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
import { useMockBlogData } from '../../hooks/useMockBlogData';
import { BlogPost } from '../../types';

declare global {
  interface Window {
    lucide: {
      createIcons: () => void;
    };
  }
}

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigate: (path: string) => void;
}

const Header: React.FC<LandingPageProps> = ({ onEnterApp, onNavigate }) => (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
                <PauseCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PauseFlow</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Features</a>
                <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Pricing</a>
                <button onClick={() => onNavigate('/blog')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Blog</button>
                <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
                <button onClick={onEnterApp} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition hidden sm:block">
                    Login
                </button>
                <button onClick={onEnterApp} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                    Get Lifetime Access
                </button>
            </div>
        </div>
    </header>
);

const AnimatedHeroGraph = () => (
    <div className="mt-16 w-full max-w-4xl mx-auto">
        <div className="relative aspect-video rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 p-4 sm:p-6 overflow-hidden backdrop-blur-sm">
             <style>{`
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
                .path-draw {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: draw 2s ease-out forwards;
                }
                .path-draw.delay-1 { animation-delay: 0.2s; }
            `}</style>
            <div className="absolute top-4 left-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Churn Rate</p>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <p className="text-xs text-red-500 dark:text-red-400">Trending Down</p>
                </div>
            </div>
            <div className="absolute bottom-4 left-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue Saved</p>
                 <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <p className="text-xs text-green-500 dark:text-green-400">Trending Up</p>
                </div>
            </div>
            <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 text-gray-300 dark:text-gray-600">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
                <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
                <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>

                {/* Churn path (red, going down) */}
                <path d="M 0 60 C 80 80, 150 40, 250 50, 350 20, 400 30" stroke="#F87171" strokeWidth="3" className="path-draw" />

                {/* Revenue Saved path (green, going up) */}
                <path d="M 0 170 C 80 160, 150 190, 250 150, 350 120, 400 90" stroke="#4ADE80" strokeWidth="3" className="path-draw delay-1" />
            </svg>
        </div>
    </div>
);


const Hero: React.FC<LandingPageProps> = ({ onEnterApp }) => (
    <section className="pt-32 pb-20 bg-white dark:bg-gray-900 text-center">
        <div className="container mx-auto px-6">
            <div className="inline-block bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                Built for SaaS Businesses
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
                Stop Churn Before It Starts: The AI-Powered Platform That Turns 'Cancels' into 'Pauses'
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                PauseFlow doesn’t just stop churn — it sees it coming. With built-in AI prediction, automated win-backs, and real-time ROI tracking, you’ll know exactly who to save, when to act, and how much revenue you’re keeping.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onEnterApp} className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg text-lg">
                    Get Lifetime Access – $249 One-Time
                </button>
                <button onClick={onEnterApp} className="bg-gray-100 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition">
                    Watch 60-Second Demo
                </button>
            </div>
            <AnimatedHeroGraph />
        </div>
    </section>
);

const FeatureGrid: React.FC = () => {
    const features = [
        { emoji: '1️⃣', title: "Integrates with Stripe in 5 Minutes", description: "No code, no engineers, no migration." },
        { emoji: '2️⃣', title: "AI Churn Prediction Engine", description: "Predict which paused customers are likely to cancel. (AppSumo Exclusive)" },
        { emoji: '3️⃣', title: "Automated Win-Back Workflows", description: "Re-engage customers with intelligent email sequences. (AppSumo Exclusive)" },
        { emoji: '4️⃣', title: "Prove Your ROI", description: "'Revenue Saved' dashboard shows exact dollars kept." },
        { emoji: '5️⃣', title: "Full White-Labeling", description: "Your logo, your domain, your colors." },
        { emoji: '6️⃣', title: "PRO Plan for Life", description: "All current and future Pro features for a single payment." }
    ];

    return (
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
             <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Why Founders Love PauseFlow</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <div key={feature.title} className="bg-white dark:bg-gray-800 p-8 rounded-xl text-left border border-gray-200 dark:border-gray-700 shadow-lg">
                            <span className="text-3xl">{feature.emoji}</span>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
                 <p className="text-center mt-12 text-xl font-medium text-gray-700 dark:text-gray-300">
                    “You’re not buying a pause button. You’re buying an intelligent, automated retention system.”
                </p>
            </div>
        </section>
    );
};

const HowItWorks: React.FC = () => (
    <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Get Started in 3 Simple Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
                <div className="p-6">
                    <div className="flex justify-center items-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mx-auto"><ShieldCheck className="w-8 h-8 text-indigo-500"/></div>
                    <h3 className="mt-6 text-xl font-semibold">1. Connect Stripe</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Securely connect your Stripe account in 5 minutes. No code required.</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-center items-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mx-auto"><Target className="w-8 h-8 text-indigo-500"/></div>
                    <h3 className="mt-6 text-xl font-semibold">2. Predict & Act</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Our AI identifies at-risk customers so you can intervene before they churn.</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-center items-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mx-auto"><DollarSign className="w-8 h-8 text-indigo-500"/></div>
                    <h3 className="mt-6 text-xl font-semibold">3. Track ROI</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Watch your "Revenue Saved" metric grow as our automated workflows win back customers.</p>
                </div>
            </div>
        </div>
    </section>
);


const Pricing: React.FC<LandingPageProps> = ({ onEnterApp }) => (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">The Only Plan You'll Ever Need</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">As part of our AppSumo launch, we're offering lifetime access for a single, one-time payment. This deal won't last forever.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto border-indigo-500">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full">AppSumo Lifetime Deal</span>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Pro for Life</h3>
                        <div className="mt-4 flex items-baseline gap-x-2">
                            <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">$249</span>
                            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">one-time</span>
                        </div>
                    </div>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                        <li className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" /><span>All Pro features + future updates</span></li>
                        <li className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" /><span>AI Churn Prediction Engine</span></li>
                        <li className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" /><span>Automated Win-Back Workflows</span></li>
                        <li className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" /><span>Revenue Saved Dashboard</span></li>
                        <li className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" /><span>Full White-Labeling</span></li>
                    </ul>
                </div>
                <button onClick={onEnterApp} className="mt-10 w-full py-4 px-6 rounded-lg font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 text-lg shadow-lg">
                    Secure Your Lifetime Access →
                </button>
            </div>
        </div>
    </section>
);

const AnimatedCounter: React.FC<{ value: number; duration?: number; isMoney?: boolean; suffix?: string; }> = ({ value, duration = 2000, isMoney = false, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const end = value;
                    const startTime = performance.now();

                    const animate = (currentTime: number) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const currentCount = Math.floor(progress * (end - start) + start);
                        setCount(currentCount);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(end); // Ensure it ends on the exact value
                        }
                    };
                    requestAnimationFrame(animate);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value, duration]);
    
    const formatValue = (val: number) => {
        if (isMoney) {
            return `$${(val / 1000).toFixed(1)}K`;
        }
        return `${val.toLocaleString()}${suffix}`;
    };

    return <span ref={ref}>{formatValue(count)}</span>;
};


const ProofSection: React.FC = () => {
    const metrics = [
        { icon: <TrendingDown className="w-8 h-8 text-indigo-500"/>, value: 50, suffix: '%', label: "Average Churn Reduction" },
        { icon: <RefreshCw className="w-8 h-8 text-indigo-500"/>, value: 30, suffix: '%', label: "Reactivation Rate" },
        { icon: <DollarSign className="w-8 h-8 text-indigo-500"/>, value: 2400, isMoney: true, label: "Avg. MRR Saved" },
        { icon: <ShieldCheck className="w-8 h-8 text-indigo-500"/>, value: 100, suffix: '%', label: "Stripe Compatibility" },
    ];
    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {metrics.map(metric => (
                        <div key={metric.label}>
                            <div className="flex justify-center items-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mx-auto">
                                {metric.icon}
                            </div>
                            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-4">
                               <AnimatedCounter value={metric.value} isMoney={metric.isMoney} suffix={metric.suffix} />
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{metric.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Faq: React.FC = () => {
    const faqItems = [
        { q: "Will this replace my billing system?", a: "No. PauseFlow plugs directly into your existing Stripe account in minutes. It enhances your current setup, it doesn't replace it." },
        { q: "Is the AI Churn Prediction included in the lifetime plan?", a: "Yes, absolutely. The AI engine and automated workflows are exclusive features included forever in the AppSumo lifetime deal." },
        { q: "What happens after I purchase?", a: "You'll receive an email with a link to create your account and a simple guide to connect your Stripe account. You'll have instant access." },
        { q: "Is support included?", a: "Yes, lifetime purchasers get priority email and Slack support for life." },
        { q: "Is there a refund policy?", a: "We offer a 14-day money-back guarantee. If you don't see value, we'll issue a full refund, no questions asked." }
    ];
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-center text-left p-6 font-semibold text-gray-800 dark:text-white">
                                <span>{item.q}</span>
                                {openIndex === index ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                                <p className="p-6 pt-0 text-gray-600 dark:text-gray-400">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeaturedPosts: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    // FIX: The file hooks/useMockData.ts is not a module. Use useMockBlogData instead.
    const { blogPosts } = useMockBlogData();
    const featured = blogPosts.filter(p => p.published).slice(0, 3);

    if (featured.length === 0) return null;

    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Learn From The Blog</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Insights on churn reduction, customer retention, and scaling your business.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featured.map(post => (
                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                            <img src={post.coverImage} alt={post.title} className="h-56 w-full object-cover"/>
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-sm text-indigo-500 dark:text-indigo-400 font-semibold">{post.category}</p>
                                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm flex-grow">{post.excerpt}</p>
                                <button onClick={() => onNavigate(`/blog/${post.slug}`)} className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start">
                                    Read More &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} PauseFlow. All rights reserved.</p>
        </div>
    </footer>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigate }) => {
  useEffect(() => {
    // This effect ensures that Lucide icons are rendered after any component update.
    const timer = setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 0);
    return () => clearTimeout(timer);
  });

  return (
    <div className="bg-white dark:bg-gray-900">
      <Header onEnterApp={onEnterApp} onNavigate={onNavigate} />
      <main>
        <Hero onEnterApp={onEnterApp} onNavigate={onNavigate}/>
        <FeatureGrid />
        <HowItWorks />
        <Pricing onEnterApp={onEnterApp} onNavigate={onNavigate}/>
        <ProofSection />
        <Faq />
        <FeaturedPosts onNavigate={onNavigate} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;