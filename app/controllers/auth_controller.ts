import User from '#models/user'
import { signUpSchema } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {

    async signIn({ request, response, auth }: HttpContext) {
        const email = request.input('email')
        const password = request.input('password')

        const user = await User.findBy('email', email)

        if (!user) {
            return response.badRequest({
                message: 'Não foi encontrado um usuário com esse e-mail.'
            })
        }

        const isPasswordValid = await hash.verify(user.password, password)

        if (!isPasswordValid) {
            return response.badRequest({
                message: 'Senha incorreta.'
            })
        }

        const token = await auth.use('web').login(user)

        return { user, token }
    }

    async signUp({ request, auth }: HttpContext) {
        const payload = await request.validateUsing(
            signUpSchema
        )

        const user = await User.create(payload)

        const token = await auth.use('web').login(user)

        return { user, token }
    }
}