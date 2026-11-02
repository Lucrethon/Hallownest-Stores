import mysql, { type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';
import { pool } from './pool.ts';



export class StoresController {

    // GET: obtener todas la tiendas 
    GetAll = async (req: Request, res: Response) => {

        // todavia no he hecho el model, esta todo junto por ahora 
        const [stores] = await pool.query(
            'SELECT BIN_TO_UUID(store_id) store_id, name, seller_name, slug, location, position_x, position_y FROM stores'
        )

        res.json(stores)

    }

    // GET: obtener el catalogo de una tienda
    GetStoreCatalog = async (req: Request, res: Response) => {

        // al router se le pasaría un :slug
        const { slug } = req.params

        // esto iria en el model, pasandole el slug
        const [catalog] = await pool.query<RowDataPacket[]>(
            `SELECT 
            BIN_TO_UUID(i.item_id) as item_id, 
            i.name, 
            i.type, 
            i.description, 
            i.image_url,
            si.geo_cost,
            si.stock
        FROM items i
        INNER JOIN store_inventory si 
            ON i.item_id = si.item_id
        INNER JOIN stores s 
            ON si.store_id = s.store_id
        WHERE s.slug = ?;`, [slug]
        )

    if (catalog.length === 0) {
        return res.status(404).json({ message: 'No items found for this store' });
    }

    return res.json(catalog);

    // todo esto denttro de un try - catch 
    // el catch seria un error 500 

    }
}

// ---



