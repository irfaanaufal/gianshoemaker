import { Head, Link, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { UserAddress, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useEffect, useState } from 'react';
import { useLoadScript, GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Alamat',
        href: '/settings/address',
    },
];

export default function Address() {
    const { props } = usePage();
    const address: UserAddress[] = props.user_address as UserAddress[];
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    // Google Maps API loading
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // API key from env
        libraries: ["places"], // If you want to use Places API for search
    });

    if (!isLoaded) return <div>Loading...</div>;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan alamat" />
            <SettingsLayout>
                <div className="flex flex-col-reverse md:flex-row lg:flex-row gap-3 w-full">
                    <div className="flex flex-col space-y-3 w-full">
                        <HeadingSmall title="Pengaturan alamat" description="Perbarui pengaturan alamat akun Anda" />
                        <div className="w-full rounded-xl h-[30rem]">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "1rem" }}
                                center={selectedLocation || { lat: -6.200000, lng: 106.816666 }}
                                zoom={15}>
                                {selectedLocation && <Marker position={selectedLocation} />}
                            </GoogleMap>
                        </div>
                    </div>
                    {/* Daftar alamat */}
                    <div className="w-full flex flex-col space-y-3">
                        <h3>Daftar Alamat</h3>
                        {address.map((a: UserAddress) => (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{a.label}</CardTitle>
                                    <CardDescription>{a.address}</CardDescription>
                                    <CardAction>
                                        <Button variant={'outline'} onClick={() => {
                                            setSelectedLocation({ lat: +a.lat, lng: +a.long });
                                        }} className="bg-red-500 hover:bg-red-600">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </Button>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="w-full flex flex-row gap-3">
                                    <span>Latitude : {a.lat}</span>
                                    <span>longitude : {a.long}</span>
                                </CardContent>
                                <CardFooter>
                                    {/* <p>Card Footer</p> */}
                                </CardFooter>
                            </Card>
                        ))}
                        <Link href="/settings/address/create">
                            <Button variant={`outline`} className="bg-green-500 hover:bg-green-600 text-white hover:text-white w-full">
                                <i className="fa-solid fa-plus"></i>
                            </Button>
                        </Link>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
