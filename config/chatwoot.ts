import env from "#start/env";
import axios from "axios";

export const chatwoot = axios.create({
    baseURL: env.get('CHATWOOT_API_URL') + '/platform/api/v1/',
    headers: {
        api_access_token: env.get('CHATWOOT_ROOT_ACCOUNT_KEY')
    }
})