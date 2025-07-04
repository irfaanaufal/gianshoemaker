import { Treatment, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Hero } from '@/components/ui/animated-hero';
import { TreatmentCard } from '@/components/ui/treatment-card';
import { api } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { CTA } from '@/components/ui/call-to-action';

export default function Welcome() {
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
                <link rel="shortcut icon" href={`/assets/logo-gianshoemaker.png`} type="image/png" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">

                <Header />

                <Hero />

                {/* Section Treatment */}
                <section id="layanan-kami">
                    <div className="flex flex-col w-full justify-center items-center mb-[2rem]">
                        <h1 className="text-4xl font-bold text-center mb-3 dark:text-white">
                            Layanana Kami
                        </h1>
                        <p className="text-center w-[30rem] dark:text-white">Kami memberikan berbagai macam layanan untuk perawatan barang kesayangan anda
                            yang akan dikerjakan oleh tim kami yang sudah berpengalaman dan professional</p>
                    </div>

                    <div className="flex flex-row flex-wrap gap-3 justify-center items-center">
                        <TreatmentCard data={treatments} className="w-[15rem] p-3" />
                    </div>
                </section>

                {/* Section Kontak */}
                <section id="contact" className="w-full">
                    <CTA />
                </section>

                {/* Section About Us */}
                <section id="about-us" className="w-full">
                    <h1 className="text-4xl font-bold text-center mb-[2rem] dark:text-white">
                        Tentang Kami
                    </h1>
                    <div className="flex flex-col-reverse justify-center items-center md:flex-row lg:flex-row gap-3">
                        <div className="flex flex-col justify-start">
                            <img src={`/assets/about-us.jpg`} alt="About Us" className="w-full lg:w-[30rem] md:w-[30rem] rounded-xl" />
                        </div>
                        <div className="flex flex-col w-full lg:w-[30rem] md:w-[30rem]">
                            <h3 className="text-xl mb-[1rem] font-bold dark:text-white">
                                Selamat Datang di Gianshoemaker
                            </h3>
                            <p className="text-justify dark:text-white">
                                Gianshoemaker adalah premium shoes treatment Indonesia, yang terletak
                                di Bandung dan telah berdiri sejak 2018 untuk melayani laundry sepatu,
                                Standart Treatment, dan treatment sepatu lainnya.
                            </p>
                            <br />
                            <p className="text-justify dark:text-white">
                                Shoes Clean hadir dengan pengalaman lebih dari 7 tahun di dunia cuci
                                sepatu Indonesia, melayani perawatan sepatu seperti Express Treatment,
                                unyellowing Treatment, hingga Extra treatment, yang dikerjakan oleh para
                                ahli dengan pengetahuan dan antusiasme tinggi untuk melayani Anda
                                sepenuh hati.
                            </p>
                        </div>
                    </div>
                </section>

            </div>
            <div className="flex sticky bottom-10 right-10 float-end w-[7rem] h-[7rem] bg-slate-300 rounded-full justify-center items-center">
                <Link href={route('openai')}>
                    <img src="/assets/logo-gpt.png" alt="Logo Chat GPT" className="w-[7rem] h-[7rem] object-cover" />
                </Link>
            </div>
        </div>
    );
}
