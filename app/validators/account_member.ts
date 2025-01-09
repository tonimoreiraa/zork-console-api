import vine from '@vinejs/vine'
import { accountIdValidator } from './account.js'

const baseSchema = {
    name: vine.string(),
    email: vine.string(),
    role: vine.enum(['admin', 'member']),
}

export const createAccountMember = vine.compile(
    vine.object({
        ...baseSchema,
        accountId: accountIdValidator,
    })
)

export const createAccountMembers = vine.compile(
    vine.object({
        accountId: accountIdValidator,
        members: vine.array(
            vine.object(baseSchema)
        )
    })
)