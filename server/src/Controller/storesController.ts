import mysql, { type ConnectionConfig, type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';
import { validateSchema } from '../schema/item-schema.js';
import type { ResultSetHeader } from 'mysql2/promise';

const dbURL = process.env.DB_URL

if (!dbURL) {
    throw new Error("La variable de entorno DB_URL no está definida.");
}

// const connection = await mysql.createConnection(dbURL);

const pool = mysql.createPool(dbURL);

export class StoresController {

    // obtener todas la tiendas 
    GetAll = async (req: Request, res: Response) => {

        // todavia no he hecho el model, esta todo junto por ahora 
        const [stores] = await pool.query(
            'SELECT BIN_TO_UUID(store_id) store_id, name, seller_name, slug, location, position_x, position_y FROM stores'
        )

        res.json(stores)

    }

    // obtener el catalogo de una tienda

    GetStoreCatalog = async (req: Request, res: Response) => {

        // al router se le pasaría un :slug
        const { slug } = req.params

        // esto iria en el model, pasandole el slug
        const [catalog] = await pool.query<RowDataPacket[]>(
            `SELECT 
            BIN_TO_UUID(i.store_id) i.item_id, 
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

// ---

export class InventoryController {

    // GET: get inventory 
    GetInventory = async (req: Request, res: Response) => {

        const [inventory] = await pool.query<RowDataPacket[]>(
            `SELECT 
                id,
                BIN_TO_UUID(item_id) item_id,
                BIN_TO_UUID(store_id) store_id,
                quantity, 
            from user_inventory;`
        )

        res.json(inventory)
    }

    // POST: buy an item
    BuyItem = async (req: Request, res: Response) => {

        // validar el body del rquest con zod 
        const bodyResult = validateSchema(req.body)

        // validar si hay errores 
        if (!bodyResult.success) {
            return res.status(400).json(JSON.parse(bodyResult.error.message))
        }

        const {
            amountToBuy,
            item_id, 
            store_id
        } = bodyResult.data

        const poolConn = await pool.getConnection();  // asegura que esa conexión te pertenece solo a ti durante esa función

        try {

            // Concept Autocommit: cada consulta individual (INSERT, UPDATE, DELETE) que ejecutas se guarda en disco de forma permanente e irreversible de manera inmediata.

            // los métodos de transacción sirven para suspender ese comportamiento y agrupar múltiples consultas en un bloque atómico ("todo o nada").

            await poolConn.beginTransaction()
            // Internamente, desactiva temporalmente el autocommit solo para ese hilo. todas las modificaciones ocurren en un estado pendiente en memoria; no se graban de forma definitiva ni son visibles para otras conexiones concurrentes

            const [result] = await poolConn.query<ResultSetHeader>(`
                UPDATE store_inventory 
                SET stock = stock - ? 
                WHERE store_id = UUID_TO_BIN(?) AND item_id = UUID_TO_BIN(?) AND stock >= ?`, [amountToBuy, store_id, item_id, amountToBuy]);

            // validar si el producto existe en la tienda 
            if (result.affectedRows === 0) {
                await poolConn.rollback();
                return res.status(400).json("Item not found")
            }

            await poolConn.query(`
            INSERT INTO user_inventory (item_id, store_id, quantity) 
            VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
            `, [item_id, store_id, amountToBuy]
            )

            // ON DUPLICATE KEY UPDATE: Intenta insertar esta nueva fila. Pero si al intentar insertarla chocas con un registro que ya existe (porque viola una clave primaria o una restricción UNIQUE), no arrojes un error: en su lugar, ejecuta un UPDATE sobre la fila existente.


            await poolConn.commit()
            return res.status(201).json({ message: 'Item added succefully' });

            // commit: Le indica al motor que todas las operaciones ejecutadas desde beginTransaction() fueron válidas y deben consolidarse de manera permanente e irreversible en el almacenamiento de la base de datos
            // los cambios se vuelven visibles para todos los demás clientes y usuarios del sistema, y la conexión vuelve a su estado normal de autocommit.


        }
        catch (err) {
            await poolConn.rollback()
            return res.status(500).json({ message: 'Server Error'})
        }
        finally {
            poolConn.release()
        }

    }



}


