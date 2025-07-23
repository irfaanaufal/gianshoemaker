import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { UserAddress, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import FormCreateAddress from './partials/form-address';

export default function EditAddress({
    user_address
}: {
    user_address: UserAddress;
}) {
    //
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengaturan Alamat',
            href: '/settings/address',
        },
        {
            title: `Edit Alamat ${user_address.label}`,
            href: `/settings/address/${user_address.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan alamat" />
            <SettingsLayout>
                <div className="space-y-6 md:w-1/2 lg:w-1/2">
                    <HeadingSmall title="Pengaturan alamat" description="Perbarui pengaturan alamat akun Anda" />
                    {/* Daftar alamat */}
                    <div className="w-full">
                        <h3>Form Edit Alamat</h3>
                    </div>
                    <FormCreateAddress
                        address={user_address}
                        editMode
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
