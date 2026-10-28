import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines tailwind classes safely, resolving conflicts.
 * Example: cn('px-2 py-1', isHovered && 'bg-blue-500', customClasses)
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}