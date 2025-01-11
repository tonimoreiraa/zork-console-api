import AccountTeam from '#models/account_team'
import AccountTeamMember from '#models/account_team_member'
import { createAccountTeamsSchema } from '#validators/account_team'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountTeamsController {

    async index({ request, bouncer, response }: HttpContext) {
        const accountId = request.input('accountId')

        if (await bouncer.denies('editAccount', accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        const teams = await AccountTeam.query()
            .where('account_id', accountId)
            .preload('teams')

        return teams;
    }

    async storeMany({ request, bouncer, response, }: HttpContext) {
        const {
            accountId,
            teams,
        } = await request.validateUsing(
            createAccountTeamsSchema
        )

        if (await bouncer.denies('editAccount', accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        const teamsOutput = []

        for (const team of teams) {
            const payload = {
                name: team.name,
                description: team.description,
                accountId,
            }

            const teamOutput = await AccountTeam.create(payload)

            const membersPayload = team.members.map(member => ({
                teamId: teamOutput.id,
                memberId: member
            }))
            const members = await AccountTeamMember.createMany(membersPayload)
            teamsOutput.push({
                ...teamOutput.serialize(),
                members: members.map(member => member.serialize())
            })
        }

        return teamsOutput;
    }

}