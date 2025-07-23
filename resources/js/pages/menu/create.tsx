import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Role } from "@/types";
import FormCreateMenu from "./partials/form-menu";
import { Button } from "@/components/ui/button";

const PageCreateMenu = ({
    title,
    roles
}: {
    title: string;
    roles: Role[];
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Menu',
            href: '/menu/list',
        },
        {
            title: 'Tambah Menu',
            href: '/menu/create',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title}/>
            <div className="flex h-full flex-1 lg:flex-row md:flex-row flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col md:w-1/2 lg:w-1/2 space-y-2">
                    <h3 className="text-xl font-bold">
                        Form Tambah Menu
                    </h3>
                    <Link href={route('menu.index')}>
                        <Button variant={'destructive'} className="text-white">Kembali</Button>
                    </Link>
                </div>
                <div className="flex flex-col md:w-1/2 lg:w-1/2">
                    <FormCreateMenu
                        roles={roles}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
export default PageCreateMenu;
