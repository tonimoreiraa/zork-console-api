import Account from '#models/account'
import { createAccountSchema } from '#validators/account'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountsController {

    async store({ request, auth }: HttpContext) {
        const payload = await request.validateUsing(
            createAccountSchema
        )

        const account = await Account.create({
            ...payload,
            userId: auth.user?.id,
        })

        return account.serialize()
    }

}