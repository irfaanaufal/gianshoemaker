import { z } from "zod";
const createAddressSchema = z.object({
    label: z.string({
        message: `Nama tidak boleh kosong!`
    }),
    address: z.string({
        message: `Alamat tidak boleh kosong!`
    }),
    lat: z.string({
        message: `Latitude tidak boleh kosong!`
    }),
    long: z.string({
        message: `Longitude tidak boleh kosong!`
    }),
});
export { createAddressSchema }
