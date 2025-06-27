import { Head, Link, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Order, UserAddress, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
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
    const { props } = usePage();
    const address: UserAddress[] = props.user_address as UserAddress[];
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

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex flex-col-reverse md:flex-row lg:flex-row-reverse gap-3 w-full p-4 max-h-[90vh]">
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
                {/* Daftar alamat */}
                <div className="w-full md:w-[30%] lg:w-[30%] flex flex-col space-y-3 overflow-y-scroll">
                    <h3>Daftar Order</h3>
                    {orders.length < 1 && <p className="text-xl">Tidak ada orderan</p>}
                    {orders.map((r: Order) => {
                        console.log(r)
                        return (
                            <Card key={r.trx}>
                                <CardHeader>
                                    <CardTitle>No : {r.trx} ({r.user ? r.user.name : r.custom_user})</CardTitle>
                                    <CardDescription>{r.user_address? r.user_address.address : r.custom_address}</CardDescription>
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
                                    <span>Latitude : {r?.user_address?.lat}</span>
                                    <span>longitude : {r?.user_address?.long}</span>
                                </CardContent>
                                <CardFooter>
                                    {/* <p>Card Footer</p> */}
                                </CardFooter>
                            </Card>
                        )
                    }
                    )}
                </div>
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
                        <Link href={`https://www.google.com/maps?q=${order.user_address ? order.user_address.lat : order.custom_lat},${order.user_address ? order.user_address.long : order.custom_long}`} target="_blank">
                            <Button className="rounded-full">Lihat Lokasi</Button>
                        </Link>
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
