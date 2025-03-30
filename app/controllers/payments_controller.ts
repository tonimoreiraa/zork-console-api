import { stripe } from '#config/stripe'
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentsController {

    async createPaymentIntent({ request, auth, response }: HttpContext) {
        const priceId = 'price_1R8O7y2M3REzqANTNLfOV8i5'
        try {
            const { paymentMethodId } = request.all();

            const user = auth.getUserOrFail()
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: user.stripeCustomerId
            });

            await stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: { default_payment_method: paymentMethod.id },
            });

            const subscription = await stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                expand: ["latest_invoice.payment_intent"],
            });

            const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

            return response.json({
                subscriptionId: subscription.id,
                clientSecret,
            });
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    }

    async listPlans({ response }: HttpContext) {
        try {
            const product = 'prod_S2T4oHgNOmqocc'; // Replace with your product ID
            const prices = await stripe.prices.list({
                active: true,
                product: product,
                expand: ['data.product'],
            });

            return response.json(prices.data);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    }
}