import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Order, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { ReactNode, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
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
import { api } from '@/lib/utils';
import { toast } from 'sonner';
import { useMediaQuery } from '@/lib/use-media-query';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tracking Order',
        href: '/tracking/list',
    },
];

export default function PageTracking({
    title,
    orders
}: {
    title: string;
    orders: Order[]
}) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    // Google Maps API loading
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // API key from env
        libraries: ["places"], // If you want to use Places API for search
    });

    const handleMarkerClick = (data: { lat: number; lng: number }) => {
        const url = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
        window.open(url, "_blank"); // Membuka URL di tab baru
    };

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
        if (status == 'siap diambil') {
            nextStatus = "dalam perjalanan (ambil)";
        }
        if (status == 'dalam perjalanan (ambil)') {
            nextStatus = "sudah diambil";
        }
        if (status == "siap dikirim") {
            nextStatus = "dalam perjalanan (antar)"
        }
        if (status == "dalam perjalanan (antar)") {
            nextStatus = "selesai"
        }
        return status == 'selesai' ? <></> :
            <Button className="bg-yellow-500 hover:bg-yellow-600 rounded-full" onClick={() => handleClick(nextStatus, row)}>UPDATE {nextStatus.toUpperCase()}</Button>
    }

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="relative flex flex-col md:flex-row lg:flex-row-reverse gap-3 w-full p-4 max-h-[90vh]">
                <div className="flex flex-col space-y-3 w-full md:w-[70%] lg:w-[70%]">
                    <HeadingSmall title="Lihat Alamat Pesaan" description="" />
                    <div className="w-full rounded-xl h-[30rem]">
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "1rem" }}
                            center={selectedLocation || { lat: -6.200000, lng: 106.816666 }}
                            zoom={15}>
                            {selectedLocation &&
                                <Marker
                                    position={selectedLocation}
                                    onClick={() => handleMarkerClick(selectedLocation)}
                                />
                            }
                        </GoogleMap>
                    </div>
                </div>
                {isDesktop ?
                    <div className="hidden w-full md:w-[30%] lg:w-[30%] md:flex lg:flex flex-col space-y-3 overflow-y-scroll">
                        <h3>Daftar Order</h3>
                        {orders.length < 1 && <p className="text-xl">Tidak ada orderan</p>}
                        {orders.map((r: Order) => {
                            return (
                                <Card key={r.trx}>
                                    <CardHeader>
                                        <CardTitle>No : {r.trx} ({r.user ? r.user.name : r.custom_user})</CardTitle>
                                        <CardDescription>{r.user_address ? r.user_address.address : r.custom_address}</CardDescription>
                                        <CardAction className="flex gap-2">
                                            <Button onClick={() => {
                                                const lat = r.custom_lat ? +r.custom_lat : +r.user_address.lat;
                                                const lng = r.custom_long ? +r.custom_long : +r.user_address.long;
                                                // console.log(lat, lng);
                                                setSelectedLocation({ lat, lng });
                                            }} className="bg-red-500 hover:bg-red-600 rounded-full">
                                                <i className="fa-solid fa-location-dot text-white"></i>
                                            </Button>
                                            <DetailOrder order={r} />
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="w-full flex flex-row gap-3">
                                        <span>Latitude : {r?.custom_lat ?? r?.user_address?.lat}</span>
                                        <span>longitude : {r?.user_address?.long}</span>
                                    </CardContent>
                                    <CardFooter>
                                        {buttonUpdate(r.status, r)}
                                    </CardFooter>
                                </Card>
                            )
                        }
                        )}
                    </div>
                    :
                    <div className="flex flex-col mt-[1rem] overflow-scroll gap-3">
                        {orders.length < 1 && <p className="text-xl">Tidak ada orderan</p>}
                        <Drawer direction='left'>
                            <DrawerTrigger className="absolute top-0 right-0 -translate-x-2">
                                <Badge className="px-[2rem] py-[1rem] bg-blue-500 hover:bg-blue-600 text-white">
                                    Lihat Orderan
                                </Badge>
                            </DrawerTrigger>
                            <DrawerContent className="px-1 overflow-y-scroll">
                                <DrawerHeader>
                                    <DrawerTitle>List Orderan</DrawerTitle>
                                </DrawerHeader>
                                {orders.map((data, idxo) => {
                                    return (
                                        <Collapsible
                                            // open={isOpen}
                                            // onOpenChange={setIsOpen}
                                            className="flex flex-col gap-2 border-2 rounded-xl p-2 mb-2"
                                            key={idxo}
                                            id={data.trx}
                                        >
                                            <div className="flex items-center justify-between gap-4 px-4">
                                                <h4 className="text-sm font-semibold">
                                                    {data.user ? data.user.name : data.custom_user} | Order#{idxo + 1}
                                                </h4>
                                                <div className="flex flex-row items-center gap-2">
                                                    <Button onClick={() => {
                                                        const lat = data.custom_lat ? +data.custom_lat : +data.user_address.lat;
                                                        const lng = data.custom_long ? +data.custom_long : +data.user_address.long;
                                                        // console.log(lat, lng);
                                                        setSelectedLocation({ lat, lng });
                                                    }} className="bg-red-500 hover:bg-red-600 rounded-full">
                                                        <i className="fa-solid fa-location-dot text-white"></i>
                                                    </Button>
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="icon" className={`size-8`} id={data.trx}>
                                                            <ChevronsUpDown />
                                                            <span className="sr-only">Toggle</span>
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                            </div>
                                            {buttonUpdate(data.status, data)}
                                            <CollapsibleContent className="flex flex-col gap-2">
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    TRX : {data.trx}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Tanggal Order : {data.created_at.toString().substring(0, 10)}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Atas Nama : {data.user ? data.user.name : data.custom_user}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Jenis Pelayanan : {data.service_method.toUpperCase()}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Diantar Ke : <br /> {data.user_address ? data.user_address.address : data.custom_address}
                                                </div>
                                                <a href={`https://www.google.com/maps?q=${data.user_address ? data.user_address.lat : data.custom_lat},${data.user_address ? data.user_address.long : data.custom_long}`} target="_blank">
                                                    <Badge className="rounded-md border px-4 py-2 font-mono text-sm w-fit" role='button'>
                                                        Lihat Lokasi
                                                    </Badge>
                                                </a>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Status Order : {data.status.toUpperCase()}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Status Pembayaran : {data.payment_status.toUpperCase() == "PAID" ? "LUNAS" : "BELUM DIBAYAR"}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Nomor Telepon : {data.user ? data.user.phone : data.custom_phone}
                                                </div>
                                                <div className="rounded-md border px-4 py-2 font-mono text-sm">
                                                    Email : {data.user ? data.user.email : "tidak ada"}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )
                                })}
                            </DrawerContent>
                        </Drawer>
                    </div>
                }
            </div>
        </AppLayout>
    )
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
