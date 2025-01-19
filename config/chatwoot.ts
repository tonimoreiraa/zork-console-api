import env from "#start/env";
import axios from "axios";

export const chatwoot = axios.create({
    baseURL: env.get('CHATWOOT_API_URL'),
    headers: {
        api_access_token: env.get('CHATWOOT_PLATFORM_ACCOUNT_KEY')
    }
})

export const chatwootRoot = axios.create({
    baseURL: env.get('CHATWOOT_API_URL'),
    headers: {
        api_access_token: env.get('CHATWOOT_ROOT_API_KEY')
    }
})