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
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TreatmentCard } from '@/components/ui/treatment-card';
import Header from '../components/header';
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
            }
        } catch (error) {
            console.log(error);
        }
    }

    const truncateDescription = (description: string, wordLimit: number = 20) => {
        const words = description.split(" "); // Memecah deskripsi berdasarkan spasi
        if (words.length <= wordLimit) {
            return description; // Jika kataใน deskripsiไม่เกินขีดจำกัด
        }
        return words.slice(0, wordLimit).join(" ") + "..."; // Jikaเกินคำจำกัด, return with "..."
    };

    return (
        <div className="relative p-3">
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <Header />

                {/* Section OpenAI */}
                <div className="flex flex-col w-full md:w-1/2 lg:w-1/2 h-screen justify-start items-center mb-[2rem] p-3 space-y-3 mt-[2rem]">
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
                            <div className="flex flex-col space-y-3 w-full md:w-full lg:w-1/2">
                                <h3 className="text-xl font-bold text-center">Hasil Analisis</h3>
                                <Separator />
                                <span>Level Kekotoran Sepatu : <strong>{openaiRes?.dirtiness_level.toUpperCase()}</strong></span>
                                {openaiRes?.is_yellowing && <span>Membutuhkan treatment tambahan : <strong>Ya</strong></span>}
                                <span>Alasan : </span>
                                <br />
                                <div dangerouslySetInnerHTML={{ __html: openaiRes?.reason }} />
                                <span>Rekomendasi Treatment : <strong>{openaiRes?.treatment?.name.toUpperCase()}</strong></span>
                                <Separator />
                                <h3 className="text-xl font-bold text-center">Rekomendasi Treatment</h3>
                                <Card className={`w-[15rem] p-3 mb-[1rem] mx-auto`}>
                                    <img src={openaiRes?.treatment.picture} alt={openaiRes?.treatment.slug} className="rounded-md h-[10rem] object-cover" />
                                    <CardHeader>
                                        <CardTitle>{openaiRes?.treatment.name}</CardTitle>
                                        <CardDescription>{truncateDescription(openaiRes?.treatment.description, 8)}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={route('order.create')}>
                                            <Button className="w-full">Pesan Sekarang</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        }
                    </Form>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </div>
    );
}
