import Account from '#models/account'
import { createAccountSchema, isValidCNPJ } from '#validators/account'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountsController {

    async store({ request, auth, response }: HttpContext) {
        const payload = await request.validateUsing(
            createAccountSchema
        )

        if (!isValidCNPJ(payload.cnpj)) {
            return response.badRequest({
                message: 'CNPJ inválido.'
            })
        }

        const account = await Account.create({
            ...payload,
            userId: auth.user?.id,
        })

        return account.serialize()
    }

}