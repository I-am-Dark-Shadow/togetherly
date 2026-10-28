import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    disabled,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cinematic disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 focus:ring-primary',
        secondary: 'bg-glass border border-glassBorder text-white hover:bg-white/10 focus:ring-white/50',
        danger: 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 focus:ring-red-500',
        ghost: 'hover:bg-glass text-slate-300 hover:text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
}