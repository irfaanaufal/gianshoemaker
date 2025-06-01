import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Menu, Role } from "@/types";
import FormCreateMenu from "./partials/form-menu";
import { Button } from "@/components/ui/button";

const PageEditMenu = ({
    title,
    menu,
    roles,
    readMode,
}: {
    title: string;
    menu: Menu;
    roles: Role[];
    readMode?: boolean
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Menu',
            href: '/menu/list',
        },
        {
            title: `Edit Menu ${menu.name}`,
            href: `/menu/${menu.id}/edit`,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title}/>
            <div className="flex h-full flex-1 lg:flex-row md:flex-row flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col md:w-1/2 lg:w-1/2 space-y-2">
                    <h3 className="text-xl font-bold">
                        {readMode ? `Detail Menu ${menu.name}` : `Form Edit Menu ${menu.name}`}
                    </h3>
                    <p className="text-sm text-slate-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Blanditiis, repellendus eaque. Eum modi impedit necessitatibus culpa ut iste repellat consequatur.</p>
                    <Link href={route('menu.index')}>
                        <Button variant={'destructive'} className="text-white">Kembali</Button>
                    </Link>
                </div>
                <div className="flex flex-col md:w-1/2 lg:w-1/2">
                    <FormCreateMenu
                        editMode={true}
                        readMode={readMode}
                        menu={menu}
                        roles={roles}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
export default PageEditMenu;
