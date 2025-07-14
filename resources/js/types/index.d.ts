import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    address?: UserAddress[];
    phone?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Menu {
    id: number;
    name: string;
    slug: string;
    url: string;
    route: string;
    icon: string;
    is_active: boolean;
    roles: Role[]
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface Treatment {
    id: number;
    name: string;
    slug: string;
    picture: string;
    price: string;
    description: string;
}

export interface UserAddress {
    id: number;
    user: User;
    label: string;
    address: string;
    lat: string;
    long: string;
}

export interface ShoeType {
    id: number;
    name: string;
    slug: string;
}

export interface Order {
    id: number;
    trx: string;
    user_id: number;
    user: User;
    user_address_id: number;
    user_address: UserAddress;
    custom_user?: string;
    custom_phone?: string;
    custom_address?: string;
    custom_lat?: string;
    custom_long?: string;
    status: 'siap diambil' | 'sudah diambil' | 'pending' | 'pencucian' | 'pengeringan' | 'siap dikirim' | 'dalam perjalanan (ambil)' | 'dalam perjalanan (antar)' | 'selesai';
    payment_status: "unpaid" | "paid";
    service_method: 'antar jemput' | 'antar' | 'pickup';
    distance_km: number;
    delivery_fee: number;
    order_details: OrderDetail[];
}

export interface OrderDetail {
    id?: number;
    order_id?: string;
    treatment_id: string;
    shoe_type_id: string;
    picture_before: string;
    picture_after?: string;
    shoe_name: string;
    recent_price?: number;
    treatment?: Treatment;
    [key: string]: unknown;
}
