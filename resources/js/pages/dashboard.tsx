import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface TreatmentData {
    label: string;
    value: number;
}

interface MonthlyOrder {
    month: string;
    count: number;
}

interface RevenueItem {
    month: string;
    revenue: number;
}

interface DashboardProps {
    title: string;
    total_order: number;
    active_order: number;
    revenue: number;
    top_treatments: TreatmentData[];
    monthly_orders: MonthlyOrder[];
    monthly_revenue: RevenueItem[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57'];

export default function Dashboard({
    title,
    total_order,
    active_order,
    revenue,
    top_treatments,
    monthly_orders,
    monthly_revenue
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user_login: User = auth.user;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row md:flex-row justify-between gap-3">
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem] shadow-md rounded-xl dark:border-2">
                        <h3 className="text-black dark:text-white text-2xl text-center">Total Order</h3>
                        <h2 className="text-4xl text-center">{total_order}</h2>
                    </div>
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem] shadow-md rounded-xl dark:border-2">
                        <h3 className="text-black dark:text-white text-2xl text-center">Total Order Aktif</h3>
                        <h2 className="text-4xl text-center">{active_order}</h2>
                    </div>
                    <div className="flex-1 flex-col gap-3 items-center py-[2rem] shadow-md rounded-xl dark:border-2">
                        <h3 className="text-black dark:text-white text-2xl text-center">{user_login.roles[0].name == 'pelanggan' ? `Total Pengeluaran` : `Total Pendapatan`}</h3>
                        <h2 className="text-4xl text-center">Rp. {Intl.NumberFormat('id-ID').format(revenue)}</h2>
                    </div>
                </div>
                <div className="flex flex-1 flex-col md:flex-row lg:flex-row justify-center items-start w-full gap-4">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Treatment Terpopuler</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={top_treatments}
                                        dataKey="value"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        fill="#8884d8"
                                        label
                                    >
                                        {top_treatments.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Total Order Bulanan</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly_orders}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-1 flex-row justify-center items-start w-full gap-4">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>{user_login.roles[0].name == 'pelanggan' ? `Total Pengeluaran Bulanan (Rp)` : `Total Pendapatan Bulanan (Rp)`}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly_revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `Rp${value.toLocaleString('id-ID')}`} />
                                    <Tooltip
                                        formatter={(value: number) =>
                                            `Rp${value.toLocaleString('id-ID')}`
                                        }
                                    />
                                    <Bar dataKey="revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
