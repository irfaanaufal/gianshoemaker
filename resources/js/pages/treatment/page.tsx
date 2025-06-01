import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Treatment } from "@/types";
import DrawerDialogForm from "@/components/drawer-dialog-form";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import FormTreatment from "./partials/form-treatment";
import { useEffect, useState } from "react";
import { api } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AlertDelete from "../../components/alert-delete";

const PageTreatment = ({
    title,
    treatments
}: {
    title: string;
    treatments: Treatment[];
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Treatment',
            href: '/treatment/list',
        },
    ];

    const columns = [
        {
            key: "name",
            label: "Nama Treatment",
            sortable: true
        },
        {
            key: "price",
            label: "Harga",
            sortable: true
        },
        {
            key: "picture",
            label: "Foto",
            sortable: false,
            render: (row: Treatment) => {
                return (
                    <>
                        <img src={row.picture} alt={row.name} className="w-[6rem]" />
                    </>
                )
            }
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row gap-3">
                    <h1 className="text-2xl font-bold mb-2">Tabel Treatment</h1>
                    <Link href={route('treatment.create')}>
                        <Button variant="outline" className="text-white bg-green-500 hover:bg-green-600 hover:text-white">
                            <i className="fa-solid fa-plus"></i>
                        </Button>
                    </Link>

                </div>
                <div className="border-sidebar-border/70 relative flex-1 overflow-hidden rounded-xl border p-3">
                    <DataTable
                        columns={columns}
                        data={treatments}
                        rowIdKey="id"
                        actions={(row) => (
                            <div className="flex gap-2">
                                <Link href={route('treatment.edit', { treatment: row })}>
                                    <Button variant="outline" className="bg-yellow-400 hover:bg-yellow-500">
                                        <i className="fa-solid fa-pencil"></i>
                                    </Button>
                                </Link>
                                <DrawerDialogForm
                                    buttonLabel={<i className="fa-solid fa-eye"></i>}
                                    buttonClassName="bg-blue-500 hover:bg-blue-600"
                                    dialogTitle="Detail Treatment"
                                    dialogDescription=""
                                    form={<FormTreatment method="POST" readMode={true} treatment={row}/>}
                                />
                                <AlertDelete
                                    buttonLabel={<i className="fa-solid fa-trash"></i>}
                                    buttonClassName="text-white"
                                    url={route('treatment.destroy', { treatment: row.id })}
                                />
                            </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

export default PageTreatment;
