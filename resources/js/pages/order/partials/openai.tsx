'use client';

import { Treatment } from '@/types';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface OpenAi {
    dirtiness_level: string;
    is_yellowing: boolean;
    treatments: Treatment[];
    reason: string;
}

interface OpenAiTreatmentProps {
    buttonLabel: string | ReactNode;
    buttonClassName?: string;
}

export default function DialogOpenAiTreatment({
    buttonLabel,
    buttonClassName,
}: OpenAiTreatmentProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className={buttonClassName}>{buttonLabel}</Button>
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto p-6"
            >
                <DialogHeader>
                    <DialogTitle>Rekomendasi Treatment</DialogTitle>
                </DialogHeader>
                <OpenAITreatment />
            </DialogContent>
        </Dialog>
    );
}

function OpenAITreatment() {
    const inputFile = useRef<HTMLInputElement>(null);
    const [imagePath, setImagePath] = useState<string>("/assets/no-img.jpg");
    const [loading, setLoading] = useState<boolean>(false);
    const [openaiRes, setOpenaiRes] = useState<OpenAi | null>(null);

    const schemaOpenAi = z.object({
        image: z.instanceof(File).refine(file => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type), {
            message: `Hanya gambar dengan format PNG, JPG, JPEG yang diperbolehkan!`
        })
    });

    type ValueOpenAi = z.infer<typeof schemaOpenAi>;

    const formOpenAi = useForm<ValueOpenAi>({
        resolver: zodResolver(schemaOpenAi)
    });

    const onSubmit = async (data: ValueOpenAi) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("image", data.image);

            const response = await api.post(route('order.treatment.recommend'), formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log(response.data);

            if (response.status === 201) {
                setOpenaiRes(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const truncateDescription = (description: string, wordLimit: number = 20) => {
        const words = description.split(" ");
        return words.length <= wordLimit
            ? description
            : words.slice(0, wordLimit).join(" ") + "...";
    };

    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            setImagePath(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <div className="flex flex-row gap-3 items-center justify-center">
                <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm font-medium">Upload File</Label>
                    <Controller
                        control={formOpenAi.control}
                        name="image"
                        render={({ field, fieldState }) => (
                            <>
                                <Input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    ref={inputFile}
                                    onChange={(e) => handleChangeImage(e, field.onChange)}
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>
                <Badge
                    role="button"
                    className="bg-blue-500 text-white h-auto px-4 py-4 cursor-pointer hover:bg-blue-600"
                    onClick={() => formOpenAi.handleSubmit(onSubmit)()}
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </Badge>
            </div>

            <div className="flex justify-center">
                <img
                    src={imagePath}
                    alt="Image Preview OpenAI"
                    className="rounded-md h-[15rem] w-[25rem] object-cover"
                />
            </div>

            {loading && <p className="text-center">Loading...</p>}

            {openaiRes && (
                <div className="flex flex-col space-y-3 w-full mt-6">
                    <h3 className="text-xl font-bold text-center">Hasil Analisis</h3>
                    {/* <span>Treatment yang direkomendasikan: <strong></strong></span> */}
                    {/* {openaiRes.treatment.name.toUpperCase()} */}
                    <Separator />
                    <div dangerouslySetInnerHTML={{ __html: openaiRes.reason }} />
                    <Separator />
                    <h3 className="text-xl font-bold">Treatment yang direkomendasikan</h3>
                    { openaiRes.treatments &&
                    openaiRes.treatments.map((t, idxt) => {
                        return (
                            <div className="flex flex-col">
                                <h5 className="text-md" key={idxt}>{idxt + 1}. {t.name}</h5>
                                <p className="text-justify">{t.description}</p>
                                <p>Harga : Rp. {Intl.NumberFormat('id-ID').format(+t.price)}</p>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    );
}
