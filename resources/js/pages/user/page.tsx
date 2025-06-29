import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Badge } from "../../components/ui/badge";
import DrawerDialogForm from "../../components/drawer-dialog-form";
import FormUser from "./partials/form-user";

const PageUser = ({
    title,
    users
}: {
    title: string;
    users: User[];
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User',
            href: '/user/list',
        },
    ];
    const columns = [
        {
            key: "name",
            label: "Nama",
            sortable: true
        },
        {
            key: "email",
            label: "Email",
            sortable: true
        },
        {
            key: "phone",
            label: "Nomor Telp",
            sortable: true
        },
        {
            key: "roles",
            label: "Role",
            sortable: true,
            render: (row: User) => (
                <Badge>{row.roles?.[0]?.name.toUpperCase()}</Badge>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3">
                    <h1 className="text-2xl font-bold mb-2">Tabel User</h1>
                    <Link href={route('user.create')}>
                        <Button className="bg-green-400 hover:bg-green-500 dark:bg-green-400 dark:hover:bg-green-500 rounded-full">
                            <i className="fa-solid fa-plus"></i>
                        </Button>
                    </Link>

                </div>
                <div className="border-sidebar-border/70 relative flex-1 overflow-hidden rounded-xl border p-3">
                    <DataTable
                        columns={columns}
                        data={users}
                        rowIdKey="id"
                        actions={(row) => (
                            <div className="flex gap-2">
                                <Link href={route('user.edit', { user: row })}>
                                    <Button className="bg-yellow-300 hover:bg-yellow-400 text-black dark:bg-yellow-300 dark:hover:bg-yellow-400 dark:text-black rounded-full">
                                        <i className="fa-solid fa-pencil"></i>
                                    </Button>
                                </Link>
                                <DrawerDialogForm
                                    buttonLabel={<i className="fa-solid fa-eye"></i>}
                                    dialogTitle="Detail User"
                                    buttonClassName="bg-blue-400 hover:bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-500 text-white hover:text-white dark:text-white dark:hover:text-white rounded-full"
                                    dialogDescription=""
                                    form={<FormUser isDetail={true} user={row} />}
                                />
                                {/* <AlertDelete
                                    buttonLabel={<i className="fa-solid fa-trash"></i>}
                                    buttonClassName="text-white"
                                    url={route('menu.destroy', { menu: row.id })}
                                /> */}
                            </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
export default PageUser;
