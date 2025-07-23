import { OrderDetail, SharedData, ShoeType, Treatment, User, UserAddress } from "@/types";
import { z } from "zod";
import { schemaOrder } from "./validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleMap, Marker, Autocomplete as GoogleAutocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { calculateDistance, calculateShippingPrice } from "./utils";
import { Badge } from "@/components/ui/badge";
import DialogOpenAiTreatment from "./openai";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { usePage } from "@inertiajs/react";

const FormOrderPelanggan = ({
    user_options,
    shoe_type_options,
    treatment_options,
}: {
    user_options: User[];
    shoe_type_options: ShoeType[];
    treatment_options: Treatment[];
}) => {
    const { auth, user_address } = usePage<SharedData>().props;
    const user_login: User = auth.user
    const saved_address: UserAddress[] = user_address as UserAddress[];
    console.log(saved_address);

    type FormOrderValue = z.infer<typeof schemaOrder>;
    const fixedLocation = useMemo<{ lat: number; lng: number }>(() => ({
        lat: import.meta.env.VITE_FIXED_LAT,
        lng: import.meta.env.VITE_FIXED_LONG
    }), []);

     const [existAddress, setExistAddress] = useState<boolean>(false);
    const [userSelectedAddress, setUserSelectedAddress] = useState<UserAddress[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // State ntuk jarak
    const [distance, setDistance] = useState<number | null>(null);
    const [addressB, setAddressB] = useState<string>("");
    const [shipping, setShipping] = useState<number>(0);
    const [serviceMethod, setServiceMethod] = useState<string>("");

    // Google Maps API loading
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // API key from env
        libraries: ["places"], // If you want to use Places API for search
    });

    const formOrder = useForm<FormOrderValue>({
        resolver: zodResolver(schemaOrder),
        defaultValues: {
            user_id: user_login.id.toString()
        }
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
                formOrder.setValue('custom_lat', latitude.toString());
                formOrder.setValue('custom_long', longitude.toString());
                formOrder.setValue('custom_address', place.formatted_address ?? "");
                setAddressB(place.formatted_address ?? "");
            }
        }
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                setSelectedLocation({ lat: latitude, lng: longitude });
                formOrder.setValue('custom_lat', latitude.toString());
                formOrder.setValue('custom_long', longitude.toString());

                try {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === "OK" && results && results.length > 0) {
                            const formattedAddress = results[0].formatted_address;
                            formOrder.setValue('custom_address', formattedAddress);
                            setAddressB(formattedAddress ?? "");
                        } else {
                            console.error("Geocoder failed due to: " + status);
                            formOrder.setValue('custom_address', "Alamat tidak ditemukan");
                            setAddressB("Alamat tidak ditemukan!");
                        }
                    });
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    formOrder.setValue('custom_address', "Alamat tidak ditemukan");
                    setAddressB("Alamat tidak ditemukan!");
                }
            });
        }
    };

    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat() ?? 0;
        const lng = e.latLng?.lng() ?? 0;

        setSelectedLocation({ lat, lng });
        formOrder.setValue('custom_lat', lat.toString());
        formOrder.setValue('custom_long', lng.toString());

        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results && results.length > 0) {
                    const formattedAddress = results[0].formatted_address;
                    formOrder.setValue('custom_address', formattedAddress);
                    setAddressB(formattedAddress ?? "");
                } else {
                    console.error("Geocoder failed due to: " + status);
                    formOrder.setValue('custom_address', "Alamat tidak ditemukan");
                    setAddressB("Alamat tidak ditemukan!");
                }
            });
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            formOrder.setValue('custom_address', "Alamat tidak ditemukan");
            setAddressB("Alamat tidak ditemukan!");
        }
    };

    const handleAddButton = async () => {
        const treatment_id = formOrder.getValues("treatment_id") ?? "";
        const shoe_name = formOrder.getValues("shoe_name") ?? "";
        const shoe_type_id = formOrder.getValues("shoe_type_id") ?? "";
        const t = treatment_options.find((to) => +treatment_id == to.id);
        const currT = t?.price ?? "0";
        const newPrice = +currT + totalPrice;

        const newOrderDetail = {
            treatment_id: treatment_id,
            shoe_name: shoe_name,
            shoe_type_id: shoe_type_id,
            recent_price: +currT
        };
        setOrderDetail(prev => [...prev, newOrderDetail]);
        setTotalPrice(newPrice);
        formOrder.resetField("shoe_name");
        formOrder.resetField("shoe_type_id");
        formOrder.resetField("treatment_id");
    };

    const handleDeleteButton = async (key: number) => {
        const isSelected = orderDetail.find((od, idx) => idx === key);
        const t = treatment_options.find((to) => {
            const treatment_id = isSelected?.treatment_id ? +isSelected?.treatment_id : 0;
            return treatment_id === to.id
        });
        const price = t ? +t.price : 0;
        const filteredData = orderDetail.filter((od, idx) => idx !== key) ?? [];
        setTotalPrice(totalPrice - price);
        setOrderDetail(filteredData);
    }

    const handleShipping = useCallback(
        async (total_order: number) => {
            try {
                if (["antar jemput", "antar"].includes(serviceMethod)) {
                    const finalDistance = distance ?? 0;
                    const shippingPrice = calculateShippingPrice(finalDistance, total_order);
                    setShipping(shippingPrice);
                } else {
                    setShipping(0);
                }
            } catch (error) {
                console.log(error);
            }
        },
        [serviceMethod, distance] // dependency array
    );

    const handleUserAddressChange = (e: string) => {
        const selectedAddress = saved_address.find((usa) => usa?.id.toString() === e);
        setSelectedLocation({
            lat: selectedAddress?.lat ? +selectedAddress?.lat : 0,
            lng: selectedAddress?.long ? +selectedAddress?.long : 0
        });
        setAddressB(selectedAddress?.address ?? "");
        return e;
    }

    const handleServiceMethodChange = (e: string): string => {
        setServiceMethod(e);
        return e;
    }

    const findTreatmentById = (id: number | string): Treatment | null => {
        const row: Treatment | undefined = treatment_options.find((t) => id == t.id);
        return row ?? null;  // Mengembalikan null jika tidak ditemukan
    }

    const findShoeTypeById = (id: number | string): ShoeType | null => {
        const row: ShoeType | undefined = shoe_type_options.find((st) => id == st.id);
        return row ?? null;
    }

    const onSubmit = async (data: FormOrderValue) => {
        try {
            const newData = {
                ...data,
                order_details: orderDetail,
                total_price: totalPrice + shipping,
                delivery_fee: shipping,
                distance_km: distance,
            };
            const response = await api.post(route('order.store'), newData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                window.snap.pay(response.data.token, {
                    onSuccess: async (res: unknown) => {
                        try {
                            const callbackData = {
                                order: response.data.order,
                                addon_order: response.data.addon_order,
                                order_details: response.data.order_details
                            };

                            const callbackResponse = await api.post(route('order.callback'), callbackData);

                            if (callbackResponse.status === 200) {
                                toast(callbackResponse.data.message);
                                setTimeout(() => {
                                    window.location.href = route('order.index');
                                }, 3000);
                            }
                        } catch (error) {
                            console.error('Callback error:', error);
                            toast.error('Failed to process payment callback');
                        }
                    },
                    onError: (res: unknown) => {
                        console.error('Payment error:', res);
                        toast.error('Payment failed');
                    }
                });
            }
        } catch (error) {
            console.error('Order submission error:', error);
            toast.error('Failed to create order');
        }
    };

    useEffect(() => {
        if (fixedLocation && selectedLocation) {
            const dist = calculateDistance(
                fixedLocation.lat,
                fixedLocation.lng,
                selectedLocation.lat,
                selectedLocation.lng
            );
            setDistance(dist);
        }
        handleShipping(orderDetail.length);
    }, [fixedLocation, selectedLocation, handleShipping, orderDetail]);

    if (!isLoaded) return <div>Loading...</div>;
    return (
        <Form {...formOrder}>
            <form onSubmit={formOrder.handleSubmit(onSubmit)}>
                <div className="flex lg:flex-row md:flex-row flex-col w-full gap-3">
                    <div className="w-full space-y-3">
                        <div className="flex flex-col space-y-3">
                            <Label>Apakah kamu memiliki alamat tersimpan?</Label>
                            <Switch defaultChecked={existAddress} onClick={() => existAddress == false ? setExistAddress(true) : setExistAddress(false)} />
                            {existAddress == true ?
                                <>
                                    <FormField
                                        control={formOrder.control}
                                        name="user_address_id"
                                        render={({ field: { value, onChange, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Pilih alamat tersimpan</FormLabel>
                                                <FormControl>
                                                    <Select defaultValue={value} {...fieldProps} onValueChange={(e) => onChange(handleUserAddressChange(e))}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih alamat" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {saved_address.map((usa, idxusa) => (
                                                                <SelectItem value={usa.id.toString()} key={idxusa}>{usa.address}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {
                                        distance !== null && fixedLocation &&
                                        (
                                            <div className="p-4 bg-gray-100 rounded-md dark:text-black">
                                                <h3 className="font-medium">Informasi Jarak</h3>
                                                <p>Lokasi Tetap (Titik A):
                                                    <span className="font-semibold">Jl. Sekeloa No.11, RT.01/RW.06, Sekeloa, Kecamatan Coblong, Kota Bandung, Jawa Barat 40134</span>
                                                </p>
                                                <p>Lokasi Input (Titik B):
                                                    <span className="font-semibold">{addressB}</span>
                                                </p>
                                                <p>Jarak antara Titik A dan Titik B:
                                                    <span className="font-semibold"> {distance.toFixed(2)} km</span>
                                                </p>
                                            </div>
                                        )
                                    }
                                    {
                                        distance &&
                                        <FormField
                                            control={formOrder.control}
                                            name="service_method"
                                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                                <FormItem>
                                                    <FormLabel>Pilih jenis pelayanan</FormLabel>
                                                    <FormControl>
                                                        <Select value={value} {...fieldProps} onValueChange={(e) => onChange(handleServiceMethodChange(e))}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih jenis pelayanan" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {
                                                                    distance !== null && distance < 10 &&
                                                                    ['antar jemput', 'antar', 'pickup'].map((jp, idxjp) => (
                                                                        <SelectItem value={jp} key={idxjp}>{jp.toUpperCase()}</SelectItem>
                                                                    ))
                                                                }
                                                                {
                                                                    distance !== null && distance >= 10 &&
                                                                    <SelectItem value={`pickup`}>PICKUP</SelectItem>
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    }
                                </>
                                :
                                <>
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_address"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Alamat Baru</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_lat"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Latitude</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_long"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Longitude</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} />
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
                                            <Button type="button" onClick={handleLocationClick}>
                                                <i className="fa-solid fa-crosshairs"></i>
                                            </Button>
                                        </div>
                                    </div>
                                    {
                                        distance !== null && fixedLocation &&
                                        (
                                            <div className="p-4 bg-gray-100 rounded-md dark:text-black">
                                                <h3 className="font-medium">Informasi Jarak</h3>
                                                <p>Lokasi Tetap (Titik A):
                                                    <span className="font-semibold">Jl. Sekeloa No.11, RT.01/RW.06, Sekeloa, Kecamatan Coblong, Kota Bandung, Jawa Barat 40134</span>
                                                </p>
                                                <p>Lokasi Input (Titik B):
                                                    <span className="font-semibold">{addressB}</span>
                                                </p>
                                                <p>Jarak antara Titik A dan Titik B:
                                                    <span className="font-semibold"> {distance.toFixed(2)} km</span>
                                                </p>
                                            </div>
                                        )
                                    }
                                    {
                                        distance &&
                                        <FormField
                                            control={formOrder.control}
                                            name="service_method"
                                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                                <FormItem>
                                                    <FormLabel>Pilih jenis pelayanan</FormLabel>
                                                    <FormControl>
                                                        <Select value={value} {...fieldProps} onValueChange={(e) => onChange(handleServiceMethodChange(e))}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih jenis pelayanan" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {
                                                                    distance !== null && distance < 10 &&
                                                                    ['antar jemput', 'antar', 'pickup'].map((jp, idxjp) => (
                                                                        <SelectItem value={jp} key={idxjp}>{jp.toUpperCase()}</SelectItem>
                                                                    ))
                                                                }
                                                                {
                                                                    distance !== null && distance >= 10 &&
                                                                    <SelectItem value={`pickup`}>PICKUP</SelectItem>
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    }

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
                                </>
                            }
                        </div>
                    </div>
                    <div className="w-full space-y-3">
                        <FormField
                            control={formOrder.control}
                            name="shoe_name"
                            render={({ field: { value, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Nama Sepatu</FormLabel>
                                    <FormControl>
                                        <Input value={value} {...fieldProps} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formOrder.control}
                            name="shoe_type_id"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Jenis Sepatu</FormLabel>
                                    <FormControl>
                                        <Select defaultValue={value} {...fieldProps} onValueChange={onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Jenis sepatu yang dipilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shoe_type_options.map((st, idxst) => (
                                                    <SelectItem value={st.id.toString()} key={idxst}>{st.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formOrder.control}
                            name="treatment_id"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Treatment yang dipilih</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-row gap-2 items-center">
                                            <Select defaultValue={value} {...fieldProps} onValueChange={onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Treatment yang dipilih" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {treatment_options.map((treatment) => (
                                                        <SelectItem value={treatment.id.toString()} key={treatment.slug}>{treatment.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <DialogOpenAiTreatment
                                                buttonLabel="Rekomendasi Treatment"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button variant={'outline'} className="bg-green-500 hover:bg-green-600 text-white hover:text-white" type="button" onClick={handleAddButton}>
                            Tambahkan
                        </Button>
                        <div className="flex flex-col mt-4 p-3 space-y-3">
                            <h2 className="text-xl font-bold">List Order</h2>
                            {orderDetail.length > 0 ?
                                orderDetail.map((od, idxod) =>
                                (
                                    <Card key={idxod}>
                                        <CardHeader className="flex flex-row justify-between items-center w-full">
                                            <CardTitle>Nama Sepatu : {od.shoe_name}</CardTitle>
                                            <Badge className="bg-red-500 hover:bg-red-600 text-white hover:text-white float-end py-[1rem] px-[1rem]" role="button" id="delete_data" onClick={() => handleDeleteButton(idxod)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="flex flex-col">
                                            <span>Jenis Sepatu : {findShoeTypeById(+od.shoe_type_id)?.name}</span>
                                            <span>Treatment yang dipilih : {findTreatmentById(+od.treatment_id)?.name}</span>
                                            <span>Harga : Rp. {Intl.NumberFormat('id-ID').format(findTreatmentById(+od.treatment_id)?.price as unknown as number)}</span>
                                        </CardContent>
                                    </Card>
                                ))
                                :
                                <p>Tidak ada order...</p>
                            }
                            {orderDetail.length > 0 &&
                                <>
                                    <span>Ongkir : Rp. {Intl.NumberFormat('id-ID').format(shipping)}</span>
                                    <span>Total Harga : Rp. {Intl.NumberFormat('id-ID').format(totalPrice + shipping)}</span>
                                    <Button className="bg-green-500 hover:bg-green-600 text-white hover:text-white" id="submit_form" disabled={formOrder.formState.isSubmitting}>
                                        Checkout Sekarang!
                                    </Button>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
export default FormOrderPelanggan;
