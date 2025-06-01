import axios from 'axios';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_LOCAL_API_URL,
    headers: {
        'X-API-KEY': import.meta.env.VITE_LOCAL_API_KEY
    }
});
