import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";

const PageUser = ({ title }: { title: string }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User',
            href: '/user/list',
        },
    ];
    return (
    <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
    </AppLayout>
    )
}
export default PageUser;
