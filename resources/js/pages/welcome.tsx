import { Treatment, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Hero } from '@/components/ui/animated-hero';
import { TreatmentCard } from '@/components/ui/treatment-card';
import { api } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [treatments, setTreatment] = useState<Treatment[]>([]);

    const fetchTreatment = async () => {
        try {
            const response = await api.get(route('api.treatment.index'));
            if (response.status === 200) {
                setTreatment(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchTreatment();
    }, []);

    return (
        <div className="relative p-3">
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <Hero />

                {/* Section Treatment */}
                <div className="flex flex-col w-full justify-center items-center mb-[2rem]">
                    <h1 className="text-4xl font-bold text-center mb-3 dark:text-white">
                        Our Treatment
                    </h1>
                    <p className="text-center w-[30rem] dark:text-white">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto fuga laborum eaque architecto. Debitis dolore, veritatis dicta tenetur quo velit.</p>
                </div>

                <div className="flex flex-row flex-wrap gap-3 justify-center items-center">
                    <TreatmentCard data={treatments} className="w-[15rem] p-3" />
                </div>

            </div>
            <div className="flex sticky bottom-10 right-10 float-end w-[7rem] h-[7rem] bg-slate-300 rounded-full justify-center items-center">
                <Link href={route('openai')}>
                    <img src="/assets/logo-gpt.png" alt="Logo Chat GPT" className="w-[7rem] h-[7rem] object-cover" />
                </Link>
            </div>
        </div>
    );
}
