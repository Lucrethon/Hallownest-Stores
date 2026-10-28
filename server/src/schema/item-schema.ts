import z, { int } from 'zod'

export type ItemSchema = z.infer<typeof itemSchema>;

export const itemSchema = z.object({
    quantity: z.number().int().min(1).default(1),
    item_id: z.uuid({ message: 'El item_id debe ser un UUID válido' }),
    store_id: z.uuid({ message: 'El store_id debe ser un UUID válido' })

}); 

export function validateSchema (object : ItemSchema) {
    return itemSchema.safeParse(object)
}