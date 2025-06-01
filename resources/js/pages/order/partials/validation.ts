import { z } from "zod";

const schemaOrder = z.object({
    shoe_name: z.string({
        message: `Harap isi nama sepatu!`
    }),
    treatment_id: z.string({
        message: `Harap pilih treatment!`
    })
    .min(1, {
        message: `Harap pilih treatment!`
    }),
    shoe_type_id: z.string({
        message: `Harap pilih tipe sepatu!`
    })
    .min(1, {
        message: `Harap pilih tipe sepatu!`
    }),
    user_id: z.string().optional(),
    user_address_id: z.string().optional(),
    custom_user: z.string().optional(),
    custom_phone: z.string().optional(),
    custom_address: z.string().optional(),
    custom_lat: z.string().optional(),
    custom_long: z.string().optional(),
    picture_before: z.instanceof(File)
    .refine(file => file.size <= 4000000, {
        message: `File tidak boleh lebih besar dari 4MB`
    })
    .refine(file => ['image/jpg', 'image/png'].includes(file.type), {
        message: `Format file yang diperbolehkan hanya png dan jpg`
    })
});

export { schemaOrder };
