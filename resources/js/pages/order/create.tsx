import { BreadcrumbItem, ShoeType, Treatment, User } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import FormOrder from "./partials/form-order";

const PageCreateOrder = ({
    title,
    shoe_types,
    users,
    treatments
}: {
    title: string;
    shoe_types: ShoeType[];
    users: User[];
    treatments: Treatment[];
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Order',
            href: '/order/list',
        },
        {
            title: 'Buat Order',
            href: '/order/create',
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col md:w-1/2 lg:w-1/2 space-y-2">
                    <h3 className="text-xl font-bold">
                        Form Tambah Order
                    </h3>
                </div>
                <div className="w-full relative">
                    <FormOrder
                        user_options={users}
                        shoe_type_options={shoe_types}
                        treatment_options={treatments}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
export default PageCreateOrder;
