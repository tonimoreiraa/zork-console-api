import AccountMember from '#models/account_member'
import { createAccountMember } from '#validators/account_member'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountMembersController {

    async index({ request, bouncer, response }: HttpContext) {
        const accountId = request.input('accountId')

        if (await bouncer.denies('editAccount', accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        const members = await AccountMember.query()
            .where('accountId', accountId)

        return members;
    }

    async store({ request, bouncer, response }: HttpContext) {
        const payload = await request.validateUsing(
            createAccountMember
        )

        if (await bouncer.denies('editAccount', payload.accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        const member = await AccountMember.create(payload)

        return member;
    }

    async destroy({ request, bouncer, response, }: HttpContext) {
        const memberId = request.param('id')
        const member = await AccountMember.findOrFail(memberId)

        if (await bouncer.denies('editAccount', member.accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        await member.delete()

        return response.ok({ message: 'OK' })
    }

}