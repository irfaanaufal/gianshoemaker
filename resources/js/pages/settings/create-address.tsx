import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import FormCreateAddress from './partials/form-address';

export default function CreateAddress() {
    //
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengaturan Alamat',
            href: '/settings/address',
        },
        {
            title: 'Tambah Alamat Baru',
            href: '/settings/address/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan alamat" />
            <SettingsLayout>
                <div className="space-y-6 w-1/2">
                    <HeadingSmall title="Pengaturan alamat" description="Perbarui pengaturan alamat akun Anda" />
                    {/* Daftar alamat */}
                    <div className="w-full">
                        <h3>Form Tambah Alamat Baru</h3>
                    </div>
                    <FormCreateAddress />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
