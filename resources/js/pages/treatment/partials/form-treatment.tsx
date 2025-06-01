import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { createTreatmentSchema, updateTreatmentSchema } from "./validation";
import { useMediaQuery } from "@/lib/use-media-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { Treatment } from "@/types";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";

// FormTreatment component
const FormTreatment = ({
    readMode,
    method,
    treatment,
}: {
    readMode?: boolean;
    method: "POST" | "PUT";  // Restricting method to "POST" or "PUT"
    treatment?: Treatment;
}) => {
    // Conditional type based on the `method`
    type TreatmentFormValue = {
        [K in "POST" | "PUT"]: K extends "POST"
        ? z.infer<typeof createTreatmentSchema>
        : z.infer<typeof updateTreatmentSchema>;
    }[typeof method];
    // Define default values based on the method (POST or PUT)
    const defaultValueTreatmentForm: Partial<TreatmentFormValue> = {
        name: treatment?.name ?? undefined,
        price: treatment?.price ?? undefined,
        description: treatment?.description ?? undefined,
        picture: undefined,
    };

    // Initialize react-hook-form with the correct schema based on the method
    const treatmentForm = useForm<TreatmentFormValue>({
        resolver: zodResolver(method === "POST" ? createTreatmentSchema : updateTreatmentSchema),
        defaultValues: defaultValueTreatmentForm,
    });

    // Submit handler
    const onSubmit = async (data: TreatmentFormValue) => {
        try {
            const newData = method === "POST" ? data : { ...data, _method: "PUT" };
            const url = method === "POST" ? route("treatment.store") : route("treatment.update", { treatment: treatment });
            const response = await api.post(url, newData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 205) {
                toast(response.data.message);
            }
            if (response.status === 200) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.href = route('treatment.index');
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Media query hook for responsive design
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
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
                            <FormLabel>Nama Treatment</FormLabel>
                            <FormControl>
                                <Input value={value} {...fieldProps} disabled={readMode} readOnly={readMode} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={treatmentForm.control}
                    name="price"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Harga</FormLabel>
                            <FormControl>
                                <Input value={value} type="number" {...fieldProps} disabled={readMode} readOnly={readMode} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {readMode ?
                    <div className="space-y-2">
                        <Label>Foto</Label>
                        <img src={treatment?.picture} alt={`Picture of ${treatment?.name}`} className="w-full rounded-md" />
                    </div>
                    :
                    <FormField
                        control={treatmentForm.control}
                        name="picture"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Foto</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        {...fieldProps}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            onChange(file);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                }

                <FormField
                    control={treatmentForm.control}
                    name="description"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Deskripsi</FormLabel>
                            <FormControl>
                                <Textarea value={value} {...fieldProps} cols={5} disabled={readMode} readOnly={readMode} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {readMode ?
                    <></>
                    :
                    <Button type="submit" disabled={treatmentForm.formState.isSubmitting} className="flex w-full">
                        {method === "POST" ? "Tambah" : "Ubah"}
                    </Button>
                }
            </form>
        </Form>
    );
};

export default FormTreatment;
