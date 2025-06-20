import { BreadcrumbItem, Order } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "../../lib/utils";
import { toast } from "sonner";

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
    const [status, setStatus] = useState<string>("");
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

    const handleClick = async (status: string, row: Order) => {
        try {
            const response = await api.post(route('order.update', { order: row }), { status: status, _method: "put" });
            if (response.status == 201) {
                toast(response.data.message);
            }
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.log(`Error : `, error);
        }
    }

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
                                {row.status == 'pending' ?
                                    <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleClick('processing', row)}>
                                        <i className="fa-solid fa-pencil"></i>
                                    </Button>
                                    :
                                    row.status == 'processing' ?
                                        <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleClick('delivered', row)}>
                                            <i className="fa-solid fa-pencil"></i>
                                        </Button>
                                        :
                                        row.status == 'delivered' ?
                                        <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleClick('complete', row)}>
                                            <i className="fa-solid fa-pencil"></i>
                                        </Button>
                                        :
                                        <></>
                                }
                                {/* <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleClick('', row)}>
                                    <i className="fa-solid fa-pencil"></i>
                                </Button> */}
                            </div>
                        )
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
}
export default PageOrder;
