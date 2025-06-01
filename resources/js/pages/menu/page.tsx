import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Menu, Role, type BreadcrumbItem } from '@/types';
import { DataTable } from "@/components/data-table";
import DrawerDialogForm from "@/components/drawer-dialog-form";
import { Button } from "@/components/ui/button";
import FormCreateMenu from "./partials/form-menu";
import AlertDelete from "@/components/alert-delete";
const PageMenu = ({
    title,
    menus,
    roles
}: {
    title: string;
    menus: Menu[];
    roles: Role[];
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Menu',
            href: '/menu/list',
        },
    ];
    const columns = [
        {
            key: "name",
            label: "Nama Menu",
            sortable: true
        },
        {
            key: "url",
            label: "URL",
            sortable: true
        }
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3">
                    <h1 className="text-2xl font-bold mb-2">Tabel Menu</h1>
                    <Link href={route('menu.create')}>
                        <Button variant="outline">Tambah Menu</Button>
                    </Link>

                </div>
                <div className="border-sidebar-border/70 relative flex-1 overflow-hidden rounded-xl border p-3">
                    <DataTable
                        columns={columns}
                        data={menus}
                        rowIdKey="id"
                        actions={(row) => (
                        <div className="flex gap-2">
                            <Link href={route('menu.edit', { menu: row })}>
                                <Button variant="outline">Edit Menu</Button>
                            </Link>
                            <DrawerDialogForm
                                buttonLabel="Detail"
                                dialogTitle="Detail Menu"
                                dialogDescription=""
                                form={<FormCreateMenu menu={row} readMode={true} roles={roles} />}
                            />
                            <AlertDelete
                                buttonLabel={<i className="fa-solid fa-trash"></i>}
                                buttonClassName="text-white"
                                url={route('menu.destroy', { menu: row.id })}
                            />
                        </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
export default PageMenu;
