import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Treatment } from "@/types";
import { Button } from "@/components/ui/button";
import FormTreatment from "./partials/form-treatment";

const PageEditTreatment = ({
    title,
    treatment
}: {
    title: string;
    treatment: Treatment;
}) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Treatment',
            href: '/treatment/list',
        },
        {
            title: 'Edit Treatment',
            href: `/treatment/edit/${treatment.id}`,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title}/>
            <div className="flex h-full flex-1 lg:flex-row md:flex-row flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col md:w-1/2 lg:w-1/2 space-y-2">
                    <h3 className="text-xl font-bold">
                        Form Edit Treatment
                    </h3>
                    <p className="text-sm text-slate-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Blanditiis, repellendus eaque. Eum modi impedit necessitatibus culpa ut iste repellat consequatur.</p>
                    <Link href={route('treatment.index')}>
                        <Button variant={'destructive'} className="text-white">Kembali</Button>
                    </Link>
                </div>
                <div className="flex flex-col md:w-1/2 lg:w-1/2">
                    {/* <FormCreateMenu /> */}
                    <FormTreatment method="PUT" treatment={treatment} />
                </div>
            </div>
        </AppLayout>
    );
}
export default PageEditTreatment;
