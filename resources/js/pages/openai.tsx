import { Treatment, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { Separator } from '../components/ui/separator';
interface OpenAi {
    dirtiness_level: string;
    is_yellowing: boolean;
    treatment: Treatment;
    reason: string;
}

export default function OpenAITreatment({
    title
}: {
    title: string
}) {
    const { auth } = usePage<SharedData>().props;
    const inputFile = useRef<HTMLInputElement>(null);
    const [imagePath, setImagePath] = useState<string>("/assets/no-img.jpg");
    const [loading, setLoading] = useState<boolean | undefined>(undefined);
    const [openaiRes, setOpenaiRes] = useState<OpenAi>();
    const [openaiRes1, setOpenaiRes1] = useState<string>("");
    const schemaOpenAi = z.object({
        image: z.instanceof(File)
            .refine(file => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type), {
                message: `Hanya gambar dengan format png, jpg, jpeg yang diperbolehkan!`
            })
    });
    type ValueOpenAi = z.infer<typeof schemaOpenAi>;
    const formOpenAi = useForm<ValueOpenAi>({
        resolver: zodResolver(schemaOpenAi)
    });
    const onSubmit = async (data: ValueOpenAi) => {
        try {
            setLoading(true);
            const response = await api.post(route('openai.treatment.analyze'), data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            if (response.status == 201) {
                setLoading(false);
                setOpenaiRes(response.data);
                // setOpenaiRes1(response.data.feedback);
            }
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div className="relative p-3">
            <Head title={title}>
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

                {/* Section OpenAI */}
                <div className="flex flex-col w-full md:w-1/2 lg:w-1/2 h-screen justify-start items-center mb-[2rem] p-3 space-y-3">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-bold text-center mb-3 dark:text-white">
                            AI Rekomendasi Treatment
                        </h1>
                    </div>

                    <Form {...formOpenAi}>
                        <form onSubmit={formOpenAi.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
                            <div className="flex flex-row gap-3">
                                <FormField
                                    control={formOpenAi.control}
                                    name="image"
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel>Masukkan Foto Sepatu</FormLabel>
                                            <FormControl>
                                                <Input {...fieldProps} ref={inputFile} type="file" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        onChange(e.target.files[0]);
                                                        setImagePath(URL.createObjectURL(e.target.files[0]))
                                                    }
                                                }}
                                                    className="w-full bg-white"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button variant={'outline'} className="bg-blue-500 text-white justify-self-end h-auto hover:bg-blue-600 hover:text-white">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </Button>
                            </div>
                            <div className="flex flex-col">
                                <img src={imagePath} alt="Image Preview OpenAI" className="rounded-md h-[15rem] w-[25rem] object-cover" />
                            </div>
                        </form>
                        {loading ?
                            <p className="text-center">Loding...</p>
                            :
                            <></>
                        }
                        {
                            openaiRes
                            &&
                            <div className="flex flex-col space-y-3 w-full md:w-1/2 lg:w-1/2">
                                <h3 className="text-xl font-bold text-center">Hasil Analisis</h3>
                                <Separator/>
                                <span>Level Kekotoran Sepatu : <strong>{openaiRes?.dirtiness_level.toUpperCase()}</strong></span>
                                {openaiRes?.is_yellowing && <span>Membutuhkan treatment tambahan : <strong>Ya</strong></span>}
                                <span>Rekomendasi Treatment : <strong>{openaiRes?.treatment?.name.toUpperCase()}</strong></span>
                                <p>Alasan : <br/> {openaiRes?.reason}</p>
                            </div>
                        }
                        {/*
                        {
                            openaiRes1
                            &&
                            <div className="flex flex-col space-y-3">
                                <h3 className="text-xl font-medium">Response GPT:</h3>
                                <p>{openaiRes1}</p>
                            </div>
                        }
                         */}
                    </Form>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </div>
    );
}
