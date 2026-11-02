import express from 'express'
import cors from 'cors'
import type { Request, Response } from 'express';
import { createKnightRouter } from './src/Routers/knight_router.ts';
import { createStoresRouter } from './src/Routers/stores_router.ts'


const app = express()

const PORT = 5173 

const ACCEPTED_ORIGINS = [
    'http://localhost:5173/',
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


app.use(express.json());
app.disable('x-powered-by');
app.use(corsMiddleware({}));

app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hallownest Stores</h1>')
})

app.use('/stores', createStoresRouter())
app.use('/knight', createKnightRouter())


// Default error 404
app.use((req, res) => {
    res.status(404).send('<h1>Error 404</h1>')
})


// Listen port
app.listen(PORT, () => {
    console.log(`Sever listening in port http://localhost:${PORT}`)
})
