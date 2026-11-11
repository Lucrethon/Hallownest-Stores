import { pool } from './pool.ts'
import type { RowDataPacket } from 'mysql2/promise'
import type { ResultSetHeader } from 'mysql2/promise'

type params = {
    item: {
        amount: number
        item_id: string
    }
    slug: string
}

export class InventoryModel {

    static GetInventory = async () => {

        const [inventory] = await pool.query<RowDataPacket[]>(
            `SELECT 
                ui.id,
                BIN_TO_UUID(ui.item_id) AS item_id,
                ui.quantity,
                i.name,
                i.image_url
            FROM user_inventory ui
            INNER JOIN items i
                ON ui.item_id = i.item_id`
        )

        return inventory
    }

    static SellItem = async ({ item, slug }: params) => {

        const {
            amount, 
            item_id
        } = item

        const conn = await pool.getConnection()

        try {
            await conn.beginTransaction()

            // verificar si la tienda compra este objeto: 
            const [rows] = await conn.query<RowDataPacket[]>(`
                SELECT sp.buy_price FROM store_purchases sp
                INNER JOIN stores s
                    ON sp.store_id = s.store_id 
                WHERE s.slug = ? AND sp.item_id = UUID_TO_BIN(?)`, [slug, item_id])
            
            if (rows.length === 0) {
                throw new Error("This store does not buy this item")
            }

            // reducir cantidad en inventario
            const [result] = await conn.query<ResultSetHeader>(
                `UPDATE user_inventory 
                SET quantity = quantity - ?
                WHERE item_id = UUID_TO_BIN(?) AND quantity >= ?`, [amount, item_id, amount]
            )

            // retornar error si no hay suficiente cantidad en el inventario 
            if (result.affectedRows === 0) {
                throw new Error("Don't have enough items to sell")
            }

            // eliminar registros con inventario en 0 o menor
            await conn.query(
                `DELETE FROM user_inventory
                WHERE quantity <= 0 AND item_id = UUID_TO_BIN(?)`, [item_id]
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
            return true
        }
        catch (err) {
            await conn.rollback()
            throw err // Permite que el try/catch del Controller lo capture
        }
        finally {
            conn.release()
        }

    }
}