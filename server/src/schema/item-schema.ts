import z, { int } from 'zod'

export const itemSchema = z.object({
    amount: z.number().int().min(1).default(1),
    item_id: z.uuid({ message: 'El item_id debe ser un UUID válido' }),
}); 

export type ItemSchema = z.infer<typeof itemSchema>;

export function validateSchema (object : ItemSchema) {
    return itemSchema.safeParse(object)
}

export function validatePartialSchema (object : unknown) {
    return itemSchema.partial().safeParse(object)
}