import { BreadcrumbItem, Order } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

const PageOrder = ({
    title,
    orders
}: {
    title: string;
    orders: Order[]
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Order',
            href: '/order/list',
        },
    ];
    const columns = [
        {
            key: "trx",
            label: "TRX",
            sortable: true
        },
        {
            key: "status",
            label: "Status",
            sortable: true
        },
        {
            key: "payment_status",
            label: "Status Pembayaran",
            sortable: false
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3">
                    <h1 className="text-2xl font-bold mb-2">Tabel Order</h1>
                    <Link href={route('order.create')}>
                        <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white hover:text-white">
                            <i className="fa-solid fa-plus"></i>
                        </Button>
                    </Link>

                </div>
                <div className="border-sidebar-border/70 relative flex-1 overflow-hidden rounded-xl border p-3">
                    <DataTable
                        columns={columns}
                        data={orders}
                        rowIdKey="id"
                        actions={(row) => (
                            <div className="flex gap-2">
                                <Link href={'#'}>
                                    <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600">
                                        <i className="fa-solid fa-pencil"></i>
                                    </Button>
                                </Link>
                                {/* <DrawerDialogForm
                                    buttonLabel="Detail"
                                    dialogTitle="Detail Menu"
                                    dialogDescription=""
                                    form={<FormCreateMenu menu={row} readMode={true} roles={roles} />}
                                />
                                <AlertDelete
                                    buttonLabel={<i className="fa-solid fa-trash"></i>}
                                    buttonClassName="text-white"
                                    url={route('menu.destroy', { menu: row.id })}
                                /> */}
                            </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
export default PageOrder;
