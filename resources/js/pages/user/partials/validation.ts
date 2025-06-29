import { z } from "zod";

const schemaUser = z.object({
    name: z.string().min(1),
    email: z.string().email().min(1),
    phone: z.string().max(20),
    role: z.string().min(1)
})

export { schemaUser }
