import vine from '@vinejs/vine'
import { accountIdValidator } from './account.js'

export const createAccountTeamsSchema = vine.compile(
    vine.object({
        accountId: accountIdValidator,
        teams: vine.array(
            vine.object({
                name: vine.string(),
                description: vine.string(),
                members: vine.array(
                    vine.number()
                        .exists((db, value) => db.query().from('account_members').where('id', value).firstOrFail())
                )
            })
        )
    })
)