import { z } from "zod";
const createMenuSchema = z.object({
    name: z.string({
        message: `Nama tidak boleh kosong!`
    }),
    url: z.string({
        message: `URL tidak boleh kosong!`
    }),
    route: z.string({
        message: `Route tidak boleh kosong!`
    }),
    icon: z.string({
        message: `Icon tidak boleh kosong!`
    }),
    is_active: z.boolean({
        message: `Wajib memilih pilihan aktif atau tidak!`
    }),
    roles: z.array(z.object({
        label: z.string({message:`Tidak boleh kosong`}),
        value: z.string({message:`Tidak boleh kosong`})
    }))
});
export { createMenuSchema }
