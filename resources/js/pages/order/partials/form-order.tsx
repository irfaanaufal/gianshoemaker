import { Order, ShoeType, Treatment, User, UserAddress } from "@/types";
import { z } from "zod";
import { schemaOrder } from "./validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoadScript, GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const FormOrder = ({
    editMode,
    readMode,
    order,
    user_options,
    shoe_type_options,
    treatment_options,
}: {
    editMode?: boolean;
    readMode?: boolean;
    order?: Order;
    user_options: User[];
    shoe_type_options: ShoeType[];
    treatment_options: Treatment[];
}) => {
    const [existUser, setExistUser] = useState<boolean>(false);
    const [existAddress, setExistAddress] = useState<boolean>(false);
    const [userSelectedAddress, setUserSelectedAddress] = useState<UserAddress[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const currentInputFile = useRef<HTMLInputElement>(null);
    // Google Maps API loading
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // API key from env
        libraries: ["places"], // If you want to use Places API for search
    });


    type FormOrderValue = z.infer<typeof schemaOrder>;
    const formOrder = useForm<FormOrderValue>({
        resolver: zodResolver(schemaOrder),
    });

    const handlePlaceChange = useCallback(
        (event: google.maps.places.PlaceResult | null) => {
            if (event && event.geometry) {
                const { lat, lng } = event.geometry.location;
                setSelectedLocation({ lat: lat(), lng: lng() });
                formOrder.setValue('custom_lat', lat())
                formOrder.setValue('custom_long', lng())
                formOrder.setValue('custom_address', event.formatted_address || "");
            }
        },
        [formOrder]
    );

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setSelectedLocation({ lat: latitude, lng: longitude });
                formOrder.setValue('custom_lat', latitude.toString())
                formOrder.setValue('custom_long', longitude.toString())
                formOrder.setValue('custom_address', "Current User Location")
            });
        }
    };

    const onSubmit = (data: FormOrderValue) => {
        console.log(data);
    }

    if (!isLoaded) return <div>Loading...</div>;
    return (
        <Form {...formOrder}>
            <form onSubmit={formOrder.handleSubmit(onSubmit)}>
                <div className="flex lg:flex-row md:flex-row flex-col w-full gap-3">
                    <div className="w-full space-y-3">
                        <div className="flex flex-col space-y-3">
                            <Label>Apakah pelanggan memiliki akun?</Label>
                            <Switch defaultChecked={existUser} onClick={() => existUser == false ? setExistUser(true) : setExistUser(false)} />
                            {existUser == true ?
                                <FormField
                                    control={formOrder.control}
                                    name="user_id"
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel>Pilih akun pelanggan</FormLabel>
                                            <FormControl>
                                                <Select defaultValue={value} {...fieldProps} onValueChange={(e) => {
                                                    const user_address = user_options.filter((usr) => {
                                                        return usr?.id?.toString() === e
                                                    });
                                                    Promise.all([
                                                        onChange(e),
                                                        setUserSelectedAddress(user_address[0]?.address ?? [])
                                                    ])
                                                }}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih akun pelanggan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {user_options.map((us) => (
                                                            <SelectItem value={us.id.toString()}>{us.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                :
                                <>
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_user"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Masukkan nama pelanggan</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} disabled={readMode} readOnly={readMode} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_phone"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Masukkan nomor pelanggan yang dapat dihubungi</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} disabled={readMode} readOnly={readMode} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            }
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label>Apakah pelanggan alamat tersimpan?</Label>
                            <Switch defaultChecked={existAddress} onClick={() => existAddress == false ? setExistAddress(true) : setExistAddress(false)} />
                            {existUser == true && existAddress == true ?
                                <FormField
                                    control={formOrder.control}
                                    name="user_address_id"
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel>Pilih alamat tersimpan user</FormLabel>
                                            <FormControl>
                                                <Select defaultValue={value} {...fieldProps} onValueChange={onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih alamat pelanggan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {userSelectedAddress.map((usa) => (
                                                            <SelectItem value={usa.id.toString()}>{usa.address}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                :
                                <>
                                    <FormField
                                        control={formOrder.control}
                                        name="custom_address"
                                        render={({ field: { value, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel>Alamat Baru</FormLabel>
                                                <FormControl>
                                                    <Input value={value} {...fieldProps} disabled={readMode} readOnly />
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
                                                    <Input value={value} {...fieldProps} disabled={readMode} readOnly />
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
                                                    <Input value={value} {...fieldProps} disabled={readMode} readOnly />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-2 w-full">
                                        <Label>Cari Alamat</Label>
                                        <div className="flex flex-row justify-stretch gap-2">
                                            <Autocomplete onPlaceChanged={() => handlePlaceChange} className="w-full">
                                                <Input type="text" className="w-full" placeholder="Search for an address" />
                                            </Autocomplete>
                                            {/* Button to get Current Location */}
                                            <Button type="button" onClick={handleLocationClick} disabled={readMode}>
                                                <i className="fa-solid fa-crosshairs"></i>
                                            </Button>
                                        </div>
                                    </div>


                                    <div className="w-full h-[30rem]">
                                        <GoogleMap
                                            mapContainerStyle={{ width: "100%", height: "100%" }}
                                            center={selectedLocation || { lat: -6.200000, lng: 106.816666 }}
                                            zoom={15}>
                                            {selectedLocation && <Marker position={selectedLocation} />}
                                        </GoogleMap>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                    <div className="w-full space-y-3">
                        {/*  */}
                        <FormField
                            control={formOrder.control}
                            name="shoe_name"
                            render={({ field: { value, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Nama Sepatu</FormLabel>
                                    <FormControl>
                                        <Input value={value} {...fieldProps} disabled={readMode} readOnly={readMode} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formOrder.control}
                            name="shoe_type_id"
                            render={({ field: { value, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Jenis Sepatu</FormLabel>
                                    <FormControl>
                                        <Select defaultValue={value} {...fieldProps}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Jenis sepatu yang dipilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shoe_type_options.map((st) => (
                                                    <SelectItem value={st.id.toString()}>{st.name}</SelectItem>
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
                            render={({ field: { value, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Treatment yang dipilih</FormLabel>
                                    <FormControl>
                                        <Select defaultValue={value} {...fieldProps}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Treatment yang dipilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {treatment_options.map((treatment) => (
                                                    <SelectItem value={treatment.id.toString()}>{treatment.name}</SelectItem>
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
                            name="picture_before"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Foto Kondisi Sepatu</FormLabel>
                                    <FormControl>
                                        <Input {...fieldProps} ref={currentInputFile} type={"file"} onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            onChange(file);
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col mt-4 p-3">
                            <h2 className="text-xl font-bold">List Order</h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card Title</CardTitle>
                                    <CardDescription>Card Description</CardDescription>
                                    <CardAction>Card Action</CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p>Card Content</p>
                                </CardContent>
                                <CardFooter>
                                    <p>Card Footer</p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
export default FormOrder;
