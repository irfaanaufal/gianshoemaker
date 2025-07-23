import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    title: string;
    total_order: number;
    active_order: number;
    revenue: number;
}

export default function Dashboard({
    title,
    total_order,
    active_order,
    revenue
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user_login: User = auth.user
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row justify-between">
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem]">
                        <h3 className="text-black dark:text-white text-2xl text-center">Total Order</h3>
                        <h2 className="text-4xl text-center">{total_order}</h2>
                    </div>
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem]">
                        <h3 className="text-black dark:text-white text-2xl text-center">Total Order Aktif</h3>
                        <h2 className="text-4xl text-center">{active_order}</h2>
                    </div>
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem]">
                        <h3 className="text-black dark:text-white text-2xl text-center">{user_login.roles[0].name == 'pelanggan' ? `Total Pengeluaran` : `Total Pendapatan`}</h3>
                        <h2 className="text-4xl text-center">Rp. {Intl.NumberFormat('id-ID').format(revenue)}</h2>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
