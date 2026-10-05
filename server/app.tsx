import express from 'express'
import cors from 'cors'
import type { CorsOptions } from 'cors'

const app = express()

const PORT = process.env.PORT ?? 4500 

const ACCEPTED_ORIGINS = [
    'http://localhost:5173',
]

type CorsMiddlewareOptions = {
    acceptedOrigins? : string[] | string
}

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS} : CorsMiddlewareOptions) => {
    return cors({
        origin: (    
            origin : string | undefined, 
            callback : (err: Error | null, allow?: boolean) => void) => {

            // Si no hay origin (peticiones directas/mismo origen) o si el origen está incluido en los origentes permitidos
            if (!origin || acceptedOrigins.includes(origin)) {
                return callback(null, true)
            }
            return callback(new Error('Not Allowed by CORS'))
        }
    });
};

app.use(corsMiddleware())