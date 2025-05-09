import { chatwoot, chatwootRoot } from '#config/chatwoot'
import { stripe } from '#config/stripe'
import Account from '#models/account'
import User from '#models/user'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Stripe from 'stripe'

const endpointSecret = env.get('STRIPE_WEBHOOK_SECRET')

export default class StripeController {

    async webhook({ request }: HttpContext)
    {
        try {
            const sig = request.header('stripe-signature') as string
            const body = request.raw() as string
            const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)

            switch (event.type) {
                case 'payment_intent.succeeded':
                    break;

                case 'checkout.session.completed':
                    const session = await stripe.checkout.sessions.retrieve(
                        event.data.object.id,
                        {
                            expand: ['line_items']
                        }
                    )
                    console.log(session)

                    const priceId = session.line_items?.data[0].price?.id
                    const customerId = session.customer as string
                    const customerDetails = session.customer_details as Stripe.Checkout.Session.CustomerDetails

                    let user = await User.query()
                        .where('email', customerDetails.email ?? '')
                        .first()

                    if (!user) {
                        user = new User()
                        user.password = cuid()
                    }
                    user.stripeCustomerId = customerId
                    user.stripePriceId = priceId as string
                    user.hasAccess = true
                    user.name = customerDetails.name as string
                    user.email = customerDetails.email as string

                    await user.save()

                    const accountName = session.custom_fields.find(field => field.key == 'nomedaempresa')?.text?.value as string

                    const accountResponse = await chatwoot.post('/platform/api/v1/accounts', {
                        name: accountName,
                    })

                    const accountId = accountResponse.data.id

                    // Add root user to account
                    await chatwoot.post(`/platform/api/v1/accounts/${accountId}/account_users`, {
                        role: 'administrator',
                        user_id: env.get('CHATWOOT_ROOT_USER_ID'),
                    })

                    // Create user in Chatwoot
                    if (!user.chatwootUserId) {
                        const userResponse = await chatwootRoot.post(`/api/v1/accounts/${accountId}/agents`, {
                            name: user.name,
                            email: user.email,
                            role: 'administrator'
                        })
                        user.chatwootUserId = userResponse.data.id;
                        await user.save()
                    }

                    // Remove root user from account
                    await chatwoot.delete(`/platform/api/v1/accounts/${accountId}/account_users`, {
                        params: {
                            user_id: env.get('CHATWOOT_ROOT_USER_ID'),
                        }
                    })

                    const account = await Account.create({
                        name: accountName,
                        chatwootAccountId: accountId,
                        userId: user.id,
                        subscriptionId: session.subscription as string
                    })
                    logger.info(`Nova empresa: ${account.name} (${account.id}) | Usuário ${user.name} (${user.id})`)
                    break;
                case 'customer.subscription.deleted':
                    const subscription = await stripe.subscriptions.retrieve(event.data.object.id)
                    const deletedUser = await User.findByOrFail('stripeCustomerId', subscription.customer)
                    deletedUser.hasAccess = false;

                    await deletedUser.save()
                    break;
                case 'customer.subscription.updated':
                    break;
                case 'invoice.paid':
                    // Send successful message
                    break;
                case 'invoice.payment_failed':
                    // Send message
                    break;
            }
        } catch (e) {
            console.error(e)
            console.error(e.response.data)
        }
    }

}