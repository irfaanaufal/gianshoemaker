import { User } from "@/types";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { schemaUser } from "./validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { api } from "../../../lib/utils";
type FormUserValue = z.infer<typeof schemaUser>;

export default function FormUser({
    user,
    isEdit,
    isDetail
}: {
    user?: User;
    isEdit?: boolean;
    isDetail?: boolean;
}) {
    const defaultValue: FormUserValue = {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        role: user?.roles?.[0]?.name ?? ""
    }

    const userForm = useForm<FormUserValue>({
        resolver: zodResolver(schemaUser),
        defaultValues: defaultValue
    });

    const onSubmit = async (data: FormUserValue) => {
        try {
            const url = isEdit ? route('user.update', { user: user?.id }) : route('user.store');
            const newData = isEdit ? { ...data, _method: "PUT" } : data;

            const response = await api.post(url, newData);

            if (response.status == 201) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.href = route('user.index');
                }, 3000);
            }

            if (response.status != 201) {
                throw response.data
            }
        } catch (error) {
            toast(`Gagal tambah data user!`);
            console.log(error);
        }
    }

    return (
        <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onSubmit)}>
                <div className="flex flex-col space-y-3">
                    <FormField
                        control={userForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value} readOnly={isDetail} disabled={isDetail} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alamat Email</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value} readOnly={isDetail} disabled={isDetail} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={userForm.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value} readOnly={isDetail} disabled={isDetail} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDetail}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role untuk user" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {['kurir', 'pelanggan'].map((r) => (
                                            <SelectItem value={r}>{r.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {isDetail ? <></> :
                    <Button className={`rounded-full`}>{isEdit ? `Update User`: `Tambah User`}</Button>
                    }
                </div>
            </form>
        </Form>
    )
}
