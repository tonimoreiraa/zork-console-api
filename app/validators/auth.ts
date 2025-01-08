import vine from '@vinejs/vine'

export const signUpSchema = vine.compile(
    vine.object({
        name: vine.string().minLength(3),
        password: vine.string().minLength(6),
        email: vine.string().email(),
    })
)