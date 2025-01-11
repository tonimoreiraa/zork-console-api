import env from "#start/env";
import axios from "axios";

export const evolution = axios.create({
    baseURL: env.get('EVOLUTION_API_URL'),
    headers: {
        apikey: env.get('EVOLUTION_API_KEY'),
    }
})