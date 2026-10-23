import mysql, { type ConnectionConfig, type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';

const dbURL = process.env.DB_URL

if (!dbURL) {
    throw new Error("La variable de entorno DB_URL no está definida.");
}

const connection = await mysql.createConnection(dbURL);

export class StoresController {

    // obtener todas la tiendas 
    GetAll = async (req: Request, res: Response) => {

        // todavia no he hecho el model, esta todo junto por ahora 
        const [stores] = await connection.query(
            'SELECT BIN_TO_UUID(store_id) store_id, name, seller_name, slug, location, position_x, position_y FROM stores'
        )

        res.json(stores)

    }

    // obtener el catalogo de una tienda

    GetStoreCatalog = async (req: Request, res: Response) => {

        // al router se le pasaría un :slug
        const { slug } = req.params

        // esto iria en el model, pasandole el slug
        const [catalog] = await connection.query<RowDataPacket[]>(
            `SELECT 
            i.item_id, 
            i.name, 
            i.type, 
            i.description, 
            i.image_url,
            si.geo_cost,
            si.stock
        FROM items AS i
        INNER JOIN store_inventory AS si ON i.item_id = si.item_id
        INNER JOIN stores AS s ON si.store_id = s.store_id
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