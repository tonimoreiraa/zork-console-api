import env from "#start/env";
import Stripe from "stripe";

const SECRET_KEY_STRIPE = env.get('STRIPE_SECRET_KEY')
export const stripe = new Stripe(SECRET_KEY_STRIPE)