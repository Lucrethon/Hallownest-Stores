import express from 'express'

import type { Request, Response } from 'express';
import { createKnightRouter } from './src/Routers/knight_router.ts';
import { createStoresRouter } from './src/Routers/stores_router.ts'
import { corsMiddleware } from './src/Middlewares/cors.ts'


const app = express()

const PORT = 5173 

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
