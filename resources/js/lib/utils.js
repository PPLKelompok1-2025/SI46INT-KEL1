import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(amount);
};

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
