import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef } from "react";
import { useLoadScript, GoogleMap, Marker, Autocomplete as GoogleAutocomplete } from "@react-google-maps/api";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAddressSchema } from "./validation";
import { useMediaQuery } from "@/lib/use-media-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { SharedData, UserAddress } from "@/types";
import { usePage } from "@inertiajs/react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const FormCreateAddress = ({
    editMode,
    readMode,
    address
}: {
    editMode?: boolean;
    readMode?: boolean;
    address?: UserAddress
}) => {

    const { auth } = usePage<SharedData>().props;

    // State untuk jarak
    const [distance, setDistance] = useState<number | null>(null);
    const [fixedLocation, setFixedLocation] = useState<{ lat: number; lng: number } | null>(null);

    type AddressFormValue = z.infer<typeof createAddressSchema>;

    const defaultValueMenuForm: Partial<AddressFormValue> = {
        label: address?.label ?? undefined,
        address: address?.address ?? undefined,
        lat: address?.lat ?? undefined,
        long: address?.long ?? undefined
    };

    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Google Maps API loading
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const addressForm = useForm<AddressFormValue>({
        resolver: zodResolver(createAddressSchema),
        defaultValues: defaultValueMenuForm
    });

    // Tambahkan dalam komponen:
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const handlePlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                const { lat, lng } = place.geometry.location!;
                const latitude = lat();
                const longitude = lng();

                setSelectedLocation({ lat: latitude, lng: longitude });
                addressForm.setValue('lat', latitude.toString());
                addressForm.setValue('long', longitude.toString());
                addressForm.setValue('address', place.formatted_address ?? "");
            }
        }
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                setSelectedLocation({ lat: latitude, lng: longitude });
                addressForm.setValue('lat', latitude.toString());
                addressForm.setValue('long', longitude.toString());

                try {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === "OK" && results && results.length > 0) {
                            const formattedAddress = results[0].formatted_address;
                            addressForm.setValue('address', formattedAddress);
                        } else {
                            console.error("Geocoder failed due to: " + status);
                            addressForm.setValue('address', "Alamat tidak ditemukan");
                        }
                    });
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    addressForm.setValue('address', "Alamat tidak ditemukan");
                }
            });
        }
    };

    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat() ?? 0;
        const lng = e.latLng?.lng() ?? 0;

        setSelectedLocation({ lat, lng });
        addressForm.setValue('lat', lat.toString());
        addressForm.setValue('long', lng.toString());

        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results && results.length > 0) {
                    const formattedAddress = results[0].formatted_address;
                    addressForm.setValue('address', formattedAddress);
                } else {
                    console.error("Geocoder failed due to: " + status);
                    addressForm.setValue('address', "Alamat tidak ditemukan");
                }
            });
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            addressForm.setValue('address', "Alamat tidak ditemukan");
        }
    };

    // 2. Define a submit handler.
    const onSubmit = async (data: AddressFormValue) => {
        try {
            const newData = editMode ? { ...data, _method: "PUT", user_id: auth.user.id } : { ...data, user_id: auth.user.id };
            const url = editMode ? route('user-address.update', { user_address: address }) : route('user-address.store');
            const response = await api.post(url, newData);
            toast(response.data.message);
            if (response.status === 200) {
                setTimeout(() => {
                    window.location.href = route('profile.address');
                }, 3000);
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Fungsi untuk menghitung jarak
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius bumi dalam km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Jarak dalam km
        return distance;
    };

    useEffect(() => {
        setFixedLocation({
            lat: import.meta.env.VITE_FIXED_LAT,
            lng: import.meta.env.VITE_FIXED_LONG
        });
        if (fixedLocation && selectedLocation) {
            const dist = calculateDistance(
                fixedLocation.lat,
                fixedLocation.lng,
                selectedLocation.lat,
                selectedLocation.lng
            );
            setDistance(dist);
        }
    }, [selectedLocation, fixedLocation]);

    const isDesktop = useMediaQuery("(min-width: 768px)");
    if (!isLoaded) return <div>Loading...</div>;
    return (
        <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onSubmit)} className={isDesktop ? `space-y-3` : `space-y-3 px-3`}>
                <FormField
                    control={addressForm.control}
                    name="label"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Label Alamat</FormLabel>
                            <FormControl>
                                <Input value={value} {...fieldProps} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={addressForm.control}
                    name="address"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Detail Alamat</FormLabel>
                            <FormControl>
                                <Textarea value={value} {...fieldProps} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={addressForm.control}
                    name="lat"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                                <Input value={value} {...fieldProps} type="number" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={addressForm.control}
                    name="long"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                                <Input value={value} {...fieldProps} type="number" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-2 w-full">
                    <Label>Cari Alamat</Label>
                    <div className="flex flex-row justify-stretch gap-2">
                        <GoogleAutocomplete
                            onLoad={(ref) => (autocompleteRef.current = ref)}
                            onPlaceChanged={handlePlaceChanged}
                            className="w-full"
                        >
                            <Input type="text" className="w-full" placeholder="Search for an address" />
                        </GoogleAutocomplete>
                        {/* Button to get Current Location */}
                        <Button type="button" onClick={handleLocationClick} disabled={readMode}>
                            <i className="fa-solid fa-crosshairs"></i>
                        </Button>
                    </div>
                </div>

                {distance !== null && fixedLocation && (
                    <div className="p-4 bg-gray-100 rounded-md">
                        <h3 className="font-medium">Informasi Jarak</h3>
                        <p>Lokasi Tetap (Titik A):
                            <span className="font-semibold">Jl. Sekeloa No.11, RT.01/RW.06, Sekeloa, Kecamatan Coblong, Kota Bandung, Jawa Barat 40134</span>
                        </p>
                        <p>Lokasi Input (Titik B):
                            <span className="font-semibold">{addressForm.getValues("address")}</span>
                        </p>
                        <p>Jarak antara Titik A dan Titik B:
                            <span className="font-semibold"> {distance.toFixed(2)} km</span>
                        </p>
                    </div>
                )}

                <div className="w-full h-[30rem]">
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={selectedLocation || { lat: -6.200000, lng: 106.816666 }}
                        zoom={15}>
                        {selectedLocation &&
                            <Marker
                                position={selectedLocation}
                                draggable
                                onDragEnd={handleMarkerDragEnd}
                            />
                        }
                    </GoogleMap>
                </div>

                {readMode ?
                    <></>
                    :
                    <Button type="submit" disabled={addressForm.formState.isSubmitting} className="flex w-full">{editMode ? "Ubah" : "Tambah"}</Button>
                }
            </form>
        </Form>
    );
}
export default FormCreateAddress;
