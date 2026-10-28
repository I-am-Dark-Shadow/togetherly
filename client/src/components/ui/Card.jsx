import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                'backdrop-blur-xl bg-glass border border-glassBorder rounded-3xl shadow-2xl overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}