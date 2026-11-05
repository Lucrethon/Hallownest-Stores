import mysql, { type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';
import { validateSchema, validateSellItemSchema } from '../schema/item-schema.ts';
import type { ResultSetHeader } from 'mysql2/promise';
import { pool } from './pool.ts';


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
            amount,
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
                WHERE store_id = UUID_TO_BIN(?) AND item_id = UUID_TO_BIN(?) AND stock >= ?`, [amount, store_id, item_id, amount]);

            // validar si el producto existe en la tienda 
            if (result.affectedRows === 0) {
                await poolConn.rollback();
                return res.status(400).json("Item not found")
            }

            await poolConn.query(`
            INSERT INTO user_inventory (item_id, store_id, quantity) 
            VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
            `, [item_id, store_id, amount]
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

    // POST: sell item 
    // recibe el slug de la tienda
    SellItem = async (req: Request, res: Response) => {

        const { slug } = req.params

        const bodyResult = validateSellItemSchema(req.body);

        if (!bodyResult.success) {
            return res.status(400).json(JSON.parse(bodyResult.error.message))
        }

        const {
            amount, 
            item_id
        } = bodyResult.data

        const conn = await pool.getConnection()

        try {
            await conn.beginTransaction()

            // reducir cantidad en inventario
            await conn.query(
                `UPDATE user_inventory 
                SET quantity = quantity - ?
                WHERE item_id = UUID_TO_BIN(?) AND quantity => ?`, [amount, item_id, amount]
            )

            // eliminar registros con inventario en 0 o menor
            await conn.query(
                `DELETE FROM user_inventory
                WHERE quantity <= 0`
            )

            // actualizar el stock de la tienda 
            await conn.query(
            `INSERT INTO store_inventory (
                store_id,
                item_id,
                stock,
                geo_cost
            ) SELECT store_id, ?, ?, ?)
            FROM stores WHERE slug = ?`, [item_id, amount, cost, slug]
            );

            await conn.commit()
            return res.status(200).json({ message: "item added successfully"})
        }
        catch {
            await conn.rollback()
            return res.status(500).json({ message: "Server Internal Error"})
        }
        finally {
            conn.release()
        }

    } 

    



}
