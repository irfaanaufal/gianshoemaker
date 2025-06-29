import { BreadcrumbItem, Order, SharedData, User } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const PageOrder = ({
    title,
    orders
}: {
    title: string;
    orders: Order[]
}) => {
    const { auth } = usePage<SharedData>().props;
    const user_login: User = auth.user;
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
            sortable: true,
            render: (row: Order) => {
                return (
                    <Badge className={`px-3 py-1 text-md font-bold rounded-full`}>{row.status.toUpperCase()}</Badge>
                )
            }

        },
        {
            key: "payment_status",
            label: "Status Pembayaran",
            sortable: false,
            render: (row: Order) => (
                <Badge className={`px-3 py-1 text-md font-bold rounded-full ${row.payment_status == 'paid' ? 'bg-green-500' : 'bg-yellow-400'}`}>{row.payment_status.toUpperCase()}</Badge>
            )
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

    const buttonUpdate = (status: string, row: Order): ReactNode | undefined => {
        let nextStatus: string = "";
        if (status == 'belum diambil') {
            nextStatus = "pending";
        }
        if (status == 'pending') {
            nextStatus = "pencucian";
        }
        if (status == 'pencucian') {
            nextStatus = "pengeringan";
        }
        if (status == 'pengeringan') {
            nextStatus = "siap dikirim/diambil";
        }
        if (status == 'siap dikirim/diambil') {
            nextStatus = "dalam perjalanan";
        }
        if (status == 'dalam perjalanan') {
            nextStatus = "selesai";
        }
        return status == 'selesai' ? <></> :
            <Button className="bg-yellow-500 hover:bg-yellow-600 rounded-full" onClick={() => handleClick(nextStatus, row)}>UPDATE {nextStatus.toUpperCase()}</Button>
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3">
                    <h1 className="text-2xl font-bold mb-2">Tabel Order</h1>
                    <Link href={route('order.create')}>
                        <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white hover:text-white rounded-full">
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
                                {
                                    user_login.roles[0].name != "pelanggan" ?
                                        <>
                                            <DetailOrder order={row} />
                                            {['belum diambil', 'siap dikirim/diambil', 'dalam perjalanan'].includes(row.status) ? <></> : buttonUpdate(row.status, row)}
                                        </>
                                        :
                                        <DetailOrder order={row} />
                                }
                            </div>
                        )
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
}

const DetailOrder = ({
    order
}: {
    order: Order
}) => {
    console.log(order);
    return (
        <Drawer direction="right">
            <DrawerTrigger>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full" variant={'outline'}>Detail</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Order ID#{order.trx}</DrawerTitle>
                    <DrawerDescription>Tanggal Order : {order.created_at}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Atas Nama :</Label>
                    <p className="text-md font-bold">{order.user ? order.user.name : order.custom_user}</p>
                </div>
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Jenis Pelayanan :</Label>
                    <Badge className={`px-3 py-1 text-md font-bold rounded-full`}>{order.service_method.toUpperCase()}</Badge>
                </div>
                {['antar jemput', 'antar'].includes(order.service_method) &&
                    <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                        <Label className="text-md">Diantar Ke :</Label>
                        <p className="text-md font-bold">{order.user_address ? order.user_address.address : order.custom_address}</p>
                        <a href={`https://www.google.com/maps?q=${order.user_address ? order.user_address.lat : order.custom_lat},${order.user_address ? order.user_address.long : order.custom_long}`} target="_blank">
                            <Button className="rounded-full">Lihat Lokasi</Button>
                        </a>
                    </div>
                }
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Status Order :</Label>
                    <Badge className={`px-3 py-1 text-md font-bold rounded-full`}>{order.status.toUpperCase()}</Badge>
                </div>
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Status Pembayaran :</Label>
                    <Badge className={`px-3 py-1 text-md font-bold rounded-full ${order.payment_status == 'paid' ? 'bg-green-500' : 'bg-yellow-400'}`}>{order.payment_status.toUpperCase()}</Badge>
                </div>
                <Separator className="mb-[1rem]" />
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-xl mx-auto">Informasi Lainnya</Label>
                </div>
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Nomor Telp :</Label>
                    <p className="text md">{order.user ? order.user.phone : order.custom_phone}</p>
                </div>
                <div className="flex flex-col space-y-2 px-4 mb-[1rem]">
                    <Label className="text-md">Alamat Email :</Label>
                    <p className="text md">{order.user ? order.user.email : "tidak ada"}</p>
                </div>
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant="outline" className="rounded-full">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default PageOrder;
