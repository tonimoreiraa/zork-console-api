import vine from '@vinejs/vine'

export const createAccountSchema = vine.compile(
    vine.object({
        name: vine.string(),
        cnpj: vine.string().regex(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}/)
    })
)