import type { Request, Response } from 'express';
import { validateSchema } from '../schema/item-schema.ts';
import { StoresModel } from '../Models/stores.ts';



export class StoresController {

    // GET: obtener todas la tiendas 
    GetAll = async (req: Request, res: Response) => {

        const stores = await StoresModel.GetAllStores()

        res.status(200).json(stores)

    }

    // GET: obtener el catalogo de una tienda
    GetStoreCatalog = async (req: Request, res: Response) => {

        // al router se le pasaría un :slug
        const { slug } = req.params as { slug: string}

        try {
            const catalog = await StoresModel.GetCathalog({slug})
            return res.status(200).json(catalog);
        }
        catch (err: any) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            return res.status(404).json({message})
        }
    // todo esto denttro de un try - catch 
    // el catch seria un error 500 

    }

    // POST: buy an item
    BuyItem = async (req: Request, res: Response) => {

        const { slug } = req.params as {slug : string}

        // validar el body del rquest con zod 
        const bodyResult = validateSchema(req.body)

        // validar si hay errores 
        if (!bodyResult.success) {
            return res.status(400).json(JSON.parse(bodyResult.error.message))
        }

        const item = bodyResult.data 

        try {
            await StoresModel.BuyItem({ item, slug })
            return res.status(200).json({ message: 'Item purchased successfully' })
        }
        catch (err: any) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            return res.status(500).json({message})
        }

    }
}


