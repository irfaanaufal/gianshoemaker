import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector, { Option } from '@/components/multi-select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createMenuSchema } from "./validation";
import { useMediaQuery } from "@/lib/use-media-query";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { Menu, Role } from "@/types";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
const FormCreateMenu = ({
    promises,
    menu,
    editMode,
    readMode,
    roles,
} : {
    promises?: () => void;
    menu?: Menu;
    editMode?: boolean;
    readMode?: boolean;
    roles: Role[];
}) => {
    const options: Option[] = roles.map((role) => ({
        label: role.name,
        value: role.id.toString()
    }));

    const selected: Option[] = menu?.roles ? menu?.roles.map((r) => ({
        label: r.name,
        value: r.id.toString()
    })) : [];

    type MenuFormValue = z.infer<typeof createMenuSchema>;
    const defaultValueMenuForm: Partial<MenuFormValue> = {
        name: menu?.name ?? undefined,
        icon: menu?.icon ?? undefined,
        url: menu?.url ?? undefined,
        route: menu?.route ?? undefined,
        is_active: menu?.is_active ?? false,
        roles: selected ?? []
    };
    const menuForm = useForm<MenuFormValue>({
        resolver: zodResolver(createMenuSchema),
        defaultValues: defaultValueMenuForm
    });
    // 2. Define a submit handler.
    const onSubmit = async (data: MenuFormValue) => {
        try {
            // console.log(data);
            const newData = editMode ? { ...data, _method: "PUT" } : data;
            const url = editMode ? route('menu.update', { menu: menu }) : route('menu.store');
            const response = await api.post(url, newData);
            if (response.status === 205) {
                toast(response.data.message);
            }
            if (response.status === 200) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.href = route('menu.index');
                }, 3000)
            }
        } catch (error) {
            console.log(error)
        }
    }
    const isDesktop = useMediaQuery("(min-width: 768px)");
    return (
        <Form {...menuForm}>
            <form onSubmit={menuForm.handleSubmit(onSubmit)} className={isDesktop ? `space-y-3` : `space-y-3 px-3`}>
            <FormField
                control={menuForm.control}
                name="name"
                render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Nama Menu</FormLabel>
                    <FormControl>
                        <Input value={value} {...fieldProps} readOnly={readMode} disabled={readMode}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={menuForm.control}
                name="icon"
                render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                        <Input value={value} {...fieldProps} readOnly={readMode} disabled={readMode}/>
                    </FormControl>
                    <FormDescription>
                        Inputkan icon yang ingin ditampilkan, anda dapat mengambil nama class di <a href="https://fontawesome.com" target="_blank">Fontawesome</a>
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={menuForm.control}
                name="url"
                render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                        <Input value={value} {...fieldProps} readOnly={readMode} disabled={readMode}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={menuForm.control}
                name="route"
                render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Route</FormLabel>
                    <FormControl>
                        <Input value={value} {...fieldProps} readOnly={readMode} disabled={readMode}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={menuForm.control}
                name="is_active"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Aktif?</FormLabel>
                    <FormControl>
                        <Switch
                            {...fieldProps}
                            checked={value}
                            onCheckedChange={onChange}
                            disabled={readMode}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {readMode ?
            <div className="flex flex-col space-y-2">
                <Label>Yang diberikan Hak Akses</Label>
                <div className="flex flex-row space-x-2">
                    {menu?.roles.map((role) => <Badge>{role.name.toUpperCase()}</Badge>)}
                </div>
            </div>
            :
            <FormField
                control={menuForm.control}
                name="roles"
                render={({ field: { value, onChange } }) => (
                <FormItem>
                    <FormLabel>Pilih Hak Akses</FormLabel>
                    <FormControl>
                        <MultipleSelector
                            options={options}
                            defaultOptions={value}
                            disabled={readMode}
                            onChange={(e) => {
                                const selectedIds = e.map((option: Option) => ({ label: option.label, value: option.value }));
                                onChange(selectedIds);
                            }}
                            placeholder="Pilih role untuk diberikan hak akses"
                            emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                    tidak ditemukan role.
                                </p>
                            }
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            }
            {readMode ?
                <></>
            :
                <Button type="submit" disabled={menuForm.formState.isSubmitting} className="flex w-full">{editMode ? "Ubah" : "Tambah"}</Button>
            }
            </form>
        </Form>
    );
}
export default FormCreateMenu;
