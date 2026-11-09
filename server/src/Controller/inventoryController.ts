import mysql, { type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';
import { validateSchema, validateSellItemSchema } from '../schema/item-schema.ts';
import type { ResultSetHeader } from 'mysql2/promise';
import { pool } from './pool.ts';

interface StorePurchaseRow extends RowDataPacket {
    buy_price: number;
}


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

            // verificar si la tienda compra este objeto: 
            const [rows] = await conn.query<RowDataPacket[]>(`
                SELECT buy_price FROM store_purchases sp
                INNER JOIN stores s
                    ON sp.store_id = s.store_id 
                WHERE s.slug = ? AND item_id = UUID_TO_BIN(?)`, [slug, item_id])
            
            if (rows.length === 0) {
                await conn.rollback()
                return res.status(400).json({ message: "This store does not buy this item"})
            }

            // reducir cantidad en inventario
            const [result] = await conn.query<ResultSetHeader>(
                `UPDATE user_inventory 
                SET quantity = quantity - ?
                WHERE item_id = UUID_TO_BIN(?) AND quantity >= ?`, [amount, item_id, amount]
            )

            // retornar error si no hay suficiente cantidad en el inventario 
            if (result.affectedRows === 0) {
                await conn.rollback()
                return res.status(400).json({ message: "Don't have enough items to sell"})
            }

            // eliminar registros con inventario en 0 o menor
            await conn.query(
                `DELETE FROM user_inventory
                WHERE quantity <= 0`
            )

            // actualizar el stock de la tienda 

            // obtener el precio de compra del mercader
            const { buy_price: buyPrice } = rows[0] as { buy_price: number}

            // actualizar su precio de venta en el stock
            const geoCost = Math.round(buyPrice * 1.2);
            await conn.query(
            `INSERT INTO store_inventory (
                store_id,
                item_id,
                stock,
                geo_cost
            ) SELECT store_id, UUID_TO_BIN(?), ?, ?
            FROM stores WHERE slug = ?
            ON DUPLICATE KEY UPDATE stock = stock + ?`, [item_id, amount, geoCost, slug, amount]
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
