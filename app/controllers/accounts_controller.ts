import { chatwoot, chatwootRoot } from '#config/chatwoot'
import { evolution } from '#config/evolution'
import Account from '#models/account'
import InboxWhatsapp from '#models/inbox_whatsapp'
import env from '#start/env'
import { createAccountSchema, isValidCNPJ } from '#validators/account'
import type { HttpContext } from '@adonisjs/core/http'

interface ChatwootResponse {
    data: {
        id: number
    }
}

async function removeRootAccount(accountId: number) {
    // Remove root user from account
    await chatwoot.delete(`/platform/api/v1/accounts/${accountId}/account_users`, {
        params: {
            user_id: env.get('CHATWOOT_ROOT_USER_ID'),
        }
    })
}

export default class AccountsController {

    async index({ auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const accounts = await Account.query()
            .where('user_id', user.id)
        return accounts;
    }

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

    async deploySettings({ request, response }: HttpContext) {
        // Input validation
        const accountId = request.param('id')
        if (!accountId) {
            return response.badRequest('Account ID is required')
        }

        // Find and validate account
        const account = await Account.findOrFail(accountId)

        // Create Chatwoot account if it doesn't exist
        if (!account.chatwootAccountId) {
            try {
                const accountResponse: ChatwootResponse = await chatwoot.post('/platform/api/v1/accounts', {
                    name: account.name,
                })
                account.chatwootAccountId = accountResponse.data.id
                await account.save()
            } catch (error) {
                console.log(error.response.data)
                throw new Error(`Failed to create Chatwoot account: ${error.message}`)
            }
        }

        // Add root user to account
        await chatwoot.post(`/platform/api/v1/accounts/${account.chatwootAccountId}/account_users`, {
            role: 'administrator',
            user_id: env.get('CHATWOOT_ROOT_USER_ID'),
        })

        // Create members
        await account.load('members', (query) => query.whereNull('chatwootUserId'))
        for (const member of account.members) {
            try {
                // Create user in Chatwoot
                const userResponse: ChatwootResponse = await chatwootRoot.post(`/api/v1/accounts/${account.chatwootAccountId}/agents`, {
                    name: member.name,
                    email: member.email,
                    role: member.role === 'admin' ? 'administrator' : 'agent',
                })
                const userId = userResponse.data.id

                // Update local user record
                member.chatwootUserId = userId
                await member.save()
            } catch (error) {
                console.log(error.response.data)
                await removeRootAccount(account.chatwootAccountId)
                return response.internalServerError(`Failed to create Chatwoot user for ${member.email}: ${error.message}`)
            }
        }

        // Create teams
        await account.load('teams', (query) =>
            query.whereNull('chatwootTeamId').preload('members', member => member.preload('member'))
        )

        for (const team of account.teams) {
            try {
                // Create team in Chatwoot
                const teamResponse: ChatwootResponse = await chatwootRoot.post(
                    `/api/v1/accounts/${account.chatwootAccountId}/teams`,
                    {
                        name: team.name,
                        description: team.description,
                    }
                )
                const teamId = teamResponse.data.id

                // Add members to team
                const validTeamMembers = team.members
                    .map(m => m.member.chatwootUserId)
                    .filter(m => !!m)
                if (validTeamMembers.length > 0) {
                    await chatwootRoot.post(
                        `/api/v1/accounts/${account.chatwootAccountId}/teams/${teamId}/team_members`,
                        {
                            user_ids: validTeamMembers,
                        }
                    )
                }

                // Update local team record
                team.chatwootTeamId = teamId
                await team.save()
            } catch (error) {
                console.log(error.response.data)
                await removeRootAccount(account.chatwootAccountId)
                return response.internalServerError(`Failed to create Chatwoot team ${team.name}: ${error.message}`)
            }
        }


        const whatsappInstances = await InboxWhatsapp.query()
            .where('accountId', account.id)

        for (const whatsapp of whatsappInstances) {
            await evolution.post(`/chatwoot/set/${whatsapp.instanceName}`, {
                enabled: true,
                account_id: account.chatwootAccountId,
                token: env.get('CHATWOOT_ROOT_API_KEY'),
                url: 'https://app.zork.chat',
                sign_msg: true,
                sign_delimiter: "\n",
                reopen_conversation: true,
                conversation_pending: true,
                import_contacts: true,
                import_messages: false,
                days_limit_import_messages: 1,
                auto_create: true
            })
        }

        return { success: true }
    }

}