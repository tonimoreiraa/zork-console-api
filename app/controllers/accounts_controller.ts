import Account from '#models/account'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountsController {

    async index() {
        const accounts = await Account.query()
            .preload('user')
            .preload('members')
    }
}