import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../layouts/app-layout";
import { BreadcrumbItem } from "../../types";
import { Button } from "../../components/ui/button";
import FormUser from "./partials/form-user";

export default function PageCreateUser({
    title
}: {
    title: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User',
            href: '/user/list',
        },
        {
            title: "Tambah Data User",
            href: "/user/create",
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3 justify-between w-full lg:w-[40%] md:w-[50%]">
                    <h1 className="text-2xl font-bold mb-2">Form Tambah User</h1>
                    <Link href={route('user.index')}>
                        <Button className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 rounded-full gap-3">
                            <i className="fa-solid fa-arrow-left"></i>
                            Kembali
                        </Button>
                    </Link>
                </div>
                <div className="border-sidebar-border/70 relative flex-1 overflow-hidden rounded-xl p-3 w-full lg:w-[40%] md:w-[50%]">
                    <FormUser />
                </div>
            </div>
        </AppLayout>
    )
}
