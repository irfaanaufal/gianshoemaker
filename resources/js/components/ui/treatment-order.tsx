import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePage } from '@inertiajs/react';
import { ShoeType, Treatment, UserAddress } from '@/types';
import { useEffect, useState } from 'react';
import { api } from '../../lib/utils';
import { useMediaQuery } from '../../lib/use-media-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const TreatmentOrder = () => {
    const { props } = usePage();
    const address: UserAddress[] = props.user_address as UserAddress[];
    const [treatments, setTreatment] = useState<Treatment[]>([]);
    const [shoetypes, setShoetype] = useState<ShoeType[]>([]);
    const [price, setPrice] = useState<number>(0);

    const handleChangePrice = (id: number | string) => {
        const treatment = treatments.find((tr) => tr.id == id);
        if (treatment) setPrice(+treatment?.price);
    }

    // Media query hook for responsive design
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const fetchTreatment = async () => {
        try {
            const response = await api.get(route('api.treatment.index'));
            if (response.status === 200) {
                setTreatment(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const fetchShoeType = async () => {
        try {
            const response = await api.get(route('api.shoe-type.index'));
            if (response.status === 200) {
                setShoetype(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const createTreatmentSchema = z.object({
        name: z.string({
            message: `Nama tidak boleh kosong!`
        }),
        user_address_id: z.string({
            message: `Harap Pilih Alamat anda!`
        }),
        shoe_type_id: z.string({
            message: `Harap pilih tipe sepatu anda!`
        }),
        treatment_id: z.string({
            message: `Harap pilih treatment!`
        }),
    });
    type TreatmentFormValue = z.infer<typeof createTreatmentSchema>
    // Define default values based on the method (POST or PUT)
    const defaultValueTreatmentForm: Partial<TreatmentFormValue> = {
        name: undefined,
        user_address_id: undefined,
        shoe_type_id: undefined,
        treatment_id: undefined
    };
    // Initialize react-hook-form with the correct schema based on the method
    const treatmentForm = useForm<TreatmentFormValue>({
        resolver: zodResolver(createTreatmentSchema),
        defaultValues: defaultValueTreatmentForm,
    });

    // Submit handler
    const onSubmit = async (data: TreatmentFormValue) => {
        // console.log(data);
        try {
            const newData = { ...data, recent_price: price };
            const response = await api.post(route('order.placement.store'), newData, {
            headers: {
                'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                window.snap.pay(response.data.token, {
                    onSuccess: (res) => {
                    /* You may add your own implementation here */
                    console.log(res)
                    },
                    onPending: function (res) {
                    /* You may add your own implementation here */
                    console.log(res)
                    },
                    onError: function (res) {
                    /* You may add your own implementation here */
                    console.log(res)
                    },
                    onClose: function () {
                    /* You may add your own implementation here */
                    }
                })
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTreatment();
        fetchShoeType();
    }, []);
    return (
        <>
        <Card className="lg:w-[30rem]">
            <CardHeader>
                <CardTitle></CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...treatmentForm}>
                    <form
                    onSubmit={treatmentForm.handleSubmit(onSubmit)}
                    className={isDesktop ? `space-y-3` : `space-y-3 px-3`}
                    >
                    <FormField
                        control={treatmentForm.control}
                        name="name"
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
                        control={treatmentForm.control}
                        name="user_address_id"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Alamat Pengiriman</FormLabel>
                            <FormControl>
                                <Select {...fieldProps} onValueChange={onChange} defaultValue={value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Alamat Pengiriman" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {address.map((addrs, idx) => (
                                            <SelectItem key={idx} value={`${addrs.id}`}>{addrs.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={treatmentForm.control}
                        name="shoe_type_id"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Tipe Sepatu</FormLabel>
                            <FormControl>
                                <Select {...fieldProps} onValueChange={onChange} defaultValue={value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Sepatu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shoetypes.map((st, idx) => (
                                            <SelectItem key={idx} value={`${st.id}`}>{st.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={treatmentForm.control}
                        name="treatment_id"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Pilih Treatment</FormLabel>
                            <FormControl>
                                <Select {...fieldProps} onValueChange={(e) => {
                                    onChange(e);
                                    handleChangePrice(e)
                                }} defaultValue={value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Treatment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {treatments.map((treatment, idx) => (
                                            <SelectItem key={idx} value={`${treatment.id}`}>{treatment.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <div className="flex flex-row">
                        <h1 className="font-bold text-xl">Total Harga : Rp. {Intl.NumberFormat('id-ID').format(price)}</h1>
                    </div>

                    <Button type="submit" disabled={treatmentForm.formState.isSubmitting} className="flex w-full">
                        Buat Order
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        </>
    )
}
export { TreatmentOrder }
