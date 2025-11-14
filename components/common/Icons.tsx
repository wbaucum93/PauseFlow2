import React from 'react';

// This is a common pattern to centralize icon usage and make it easier to swap libraries.
// It uses a simple approach: render a span and let a script (like lucide) replace it.
// For a more robust solution without a script, you would use an SVG library like `lucide-react`.

const Icon = ({ name, className }: { name: string, className?: string }) => (
  <i data-lucide={name} className={className}></i>
);
 
type IconProps = { className?: string };

export const Mail: React.FC<IconProps> = ({ className }) => <Icon name="mail" className={className} />;
export const Lock: React.FC<IconProps> = ({ className }) => <Icon name="lock" className={className} />;
export const PauseCircle: React.FC<IconProps> = ({ className }) => <Icon name="pause-circle" className={className} />;
export const CheckCircle: React.FC<IconProps> = ({ className }) => <Icon name="check-circle" className={className} />;
export const Users: React.FC<IconProps> = ({ className }) => <Icon name="users" className={className} />;
export const Pause: React.FC<IconProps> = ({ className }) => <Icon name="pause" className={className} />;
export const History: React.FC<IconProps> = ({ className }) => <Icon name="history" className={className} />;
export const Calendar: React.FC<IconProps> = ({ className }) => <Icon name="calendar" className={className} />;
export const Download: React.FC<IconProps> = ({ className }) => <Icon name="download" className={className} />;
export const MoreVertical: React.FC<IconProps> = ({ className }) => <Icon name="more-vertical" className={className} />;
export const Search: React.FC<IconProps> = ({ className }) => <Icon name="search" className={className} />;
export const ChevronDown: React.FC<IconProps> = ({ className }) => <Icon name="chevron-down" className={className} />;
export const ChevronUp: React.FC<IconProps> = ({ className }) => <Icon name="chevron-up" className={className} />;
export const Bell: React.FC<IconProps> = ({ className }) => <Icon name="bell" className={className} />;
export const Sun: React.FC<IconProps> = ({ className }) => <Icon name="sun" className={className} />;
export const Moon: React.FC<IconProps> = ({ className }) => <Icon name="moon" className={className} />;
export const AlertTriangle: React.FC<IconProps> = ({ className }) => <Icon name="alert-triangle" className={className} />;
export const Zap: React.FC<IconProps> = ({ className }) => <Icon name="zap" className={className} />;
export const BarChart3: React.FC<IconProps> = ({ className }) => <Icon name="bar-chart-3" className={className} />;
export const Target: React.FC<IconProps> = ({ className }) => <Icon name="target" className={className} />;
export const ShieldCheck: React.FC<IconProps> = ({ className }) => <Icon name="shield-check" className={className} />;
export const FileText: React.FC<IconProps> = ({ className }) => <Icon name="file-text" className={className} />;
export const Tag: React.FC<IconProps> = ({ className }) => <Icon name="tag" className={className} />;
export const BookOpen: React.FC<IconProps> = ({ className }) => <Icon name="book-open" className={className} />;
export const FileUp: React.FC<IconProps> = ({ className }) => <Icon name="file-up" className={className} />;
export const DollarSign: React.FC<IconProps> = ({ className }) => <Icon name="dollar-sign" className={className} />;
export const SlidersHorizontal: React.FC<IconProps> = ({ className }) => <Icon name="sliders-horizontal" className={className} />;
export const GitMerge: React.FC<IconProps> = ({ className }) => <Icon name="git-merge" className={className} />;
export const Trash2: React.FC<IconProps> = ({ className }) => <Icon name="trash-2" className={className} />;
export const Info: React.FC<IconProps> = ({ className }) => <Icon name="info" className={className} />;
export const TrendingDown: React.FC<IconProps> = ({ className }) => <Icon name="trending-down" className={className} />;
export const RefreshCw: React.FC<IconProps> = ({ className }) => <Icon name="refresh-cw" className={className} />;
