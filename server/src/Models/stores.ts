import { pool } from "./pool.ts"
import type { RowDataPacket } from "mysql2/promise"
import type { ResultSetHeader } from "mysql2/promise"

type params = {
    item: {
        amount: number
        item_id: string
    }
    slug: string
}

export class StoresModel {

    static GetAllStores = async () => {

        const [stores] = await pool.query(
        'SELECT BIN_TO_UUID(store_id) store_id, name, seller_name, slug, location, position_x, position_y FROM stores'
    )
        return stores
    }

    static GetCathalog = async ({ slug }: { slug: string }) => {

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
        throw new Error('No items found for this store' );
        }
    
    return catalog

    }   

    static BuyItem =async ({item, slug}: params) => {

        const {
            amount,
            item_id, 
        } = item

        const poolConn = await pool.getConnection();  
        // asegura que esa conexión te pertenece solo a ti durante esa función

        // Concept Autocommit: cada consulta individual (INSERT, UPDATE, DELETE) que ejecutas se guarda en disco de forma permanente e irreversible de manera inmediata.

        // los métodos de transacción (beginTransaction) sirven para suspender ese comportamiento y agrupar múltiples consultas en un bloque atómico ("todo o nada").

        try {

            await poolConn.beginTransaction()
            // Internamente, desactiva temporalmente el autocommit solo para ese hilo. T
            // Todas las modificaciones ocurren en un estado pendiente en memoria; no se graban de forma definitiva ni son visibles para otras conexiones concurrentes

            // restar stock al comerciante
            const [result] = await poolConn.query<ResultSetHeader>(`
                UPDATE store_inventory si
                INNER JOIN stores s
                    ON si.store_id = s.store_id
                SET si.stock = si.stock - ? 
                WHERE s.slug = ? AND si.item_id = UUID_TO_BIN(?) AND si.stock >= ?`, [amount, slug, item_id, amount]);

            // validar si el producto existe en la tienda 
            if (result.affectedRows === 0) {
                throw new Error("Not enough stock")
            }

            // insertar item en el inventario del usuario 
            await poolConn.query(`
            INSERT INTO user_inventory (item_id, store_id, quantity) 
            SELECT UUID_TO_BIN(?), store_id, ?
            FROM stores WHERE slug = ?
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
            `, [item_id, amount, slug]
            )

            // ON DUPLICATE KEY UPDATE: Intenta insertar una nueva fila, pero si al hacerlo choca con un registro que ya existe, no arroja un error: en su lugar, ejecuta un UPDATE sobre la fila existente.


            await poolConn.commit()
            return true;

            // commit: Le indica al motor que todas las operaciones ejecutadas desde beginTransaction() fueron válidas y deben consolidarse de manera permanente e irreversible en el almacenamiento de la base de datos
            // los cambios se vuelven visibles para todos los demás clientes y usuarios del sistema, y la conexión vuelve a su estado normal de autocommit.


        }
        catch (err) {
            await poolConn.rollback()
            throw err // Permite que el try/catch del Controller lo capture
        }
        finally {
            poolConn.release()
        }
    }
}