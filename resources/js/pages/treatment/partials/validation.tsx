import { z } from "zod";
const createTreatmentSchema = z.object({
    name: z.string({
        message: `Nama tidak boleh kosong!`
    }),
    picture: z.instanceof(File)
    .refine(file => file.size <= 4000000, {
        message: `Ukuran file tidak boleh lebih dari 4MB!`
    })
    .refine(file => ['image/jpg', 'image/png', 'image/jpeg'].includes(file.type), {
        message: `Format file yang didukung hanya PNG, JPG, dan JPEG!`
    }),
    description: z.string({
        message: `Deskripsi tidak boleh kosong!`
    }),
    price: z.string({
        message: `Harga tidak boleh kosong!`
    })
});
const updateTreatmentSchema = z.object({
    name: z.string({
        message: `Nama tidak boleh kosong!`
    }),
    picture: z.instanceof(File)
    .refine(file => file.size <= 4000000, {
        message: `Ukuran file tidak boleh lebih dari 4MB!`
    })
    .refine(file => ['image/jpg', 'image/png', 'image/jpeg'].includes(file.type), {
        message: `Format file yang didukung hanya PNG, JPG, dan JPEG!`
    })
    .optional()
    .or(z.literal(null)),
    description: z.string({
        message: `Deskripsi tidak boleh kosong!`
    }),
    price: z.string({
        message: `Harga tidak boleh kosong!`
    })
});
export { createTreatmentSchema, updateTreatmentSchema }
