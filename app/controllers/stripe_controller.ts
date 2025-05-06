import { stripe } from '#config/stripe'
import User from '#models/user'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import Stripe from 'stripe'

const endpointSecret = env.get('STRIPE_WEBHOOK_SECRET')

export default class StripeController {

    async webhook({ request }: HttpContext)
    {
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
    }

}