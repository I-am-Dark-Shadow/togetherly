import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, error, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                ref={ref}
                className={cn(
                    'w-full bg-black/40 border border-glassBorder rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/70 transition-all',
                    error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';