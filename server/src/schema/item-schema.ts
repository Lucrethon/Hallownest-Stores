import z, { int } from 'zod'

export type ItemSchema = z.infer<typeof itemSchema>;

export const itemSchema = z.object({
    amountToBuy: z.number().int().min(1).default(1),
    item_id: z.uuid({ message: 'El item_id debe ser un UUID válido' }),
    store_id: z.uuid({ message: 'El store_id debe ser un UUID válido' })

}); 

export function validateSchema (object : ItemSchema) {
    return itemSchema.safeParse(object)
}

// validate partial schmea to update quantity 

export function validatePartialSchema (object : unknown) {
    return itemSchema.partial().safeParse(object)
}