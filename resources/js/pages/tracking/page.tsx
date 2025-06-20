import { Head, Link, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Order, UserAddress, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

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
            <div className="flex flex-col-reverse md:flex-row lg:flex-row-reverse gap-3 w-full p-4">
                <div className="flex flex-col space-y-3 w-full md:w-[70%] lg:w-[70%]">
                    <HeadingSmall title="Pengaturan alamat" description="Perbarui pengaturan alamat akun Anda" />
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
                <div className="w-full md:w-[30%] lg:w-[30%] flex flex-col space-y-3">
                    <h3>Daftar Order</h3>
                    {orders.map((r: Order) => {
                        return (
                            <Card key={r.trx}>
                                <CardHeader>
                                    <CardTitle>No : {r.trx} ({r.user ? r.user.name : r.custom_user})</CardTitle>
                                    <CardDescription>{r.user_address.address}</CardDescription>
                                    <CardAction>
                                        <Button variant={'outline'} onClick={() => {
                                            const lat = +r?.user_address?.lat;
                                            const lng = +r?.user_address?.long;
                                            // console.log(lat, lng);
                                            setSelectedLocation({ lat, lng });
                                        }} className="bg-red-500 hover:bg-red-600">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </Button>
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
