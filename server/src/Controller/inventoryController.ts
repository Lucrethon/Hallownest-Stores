import mysql, { type RowDataPacket } from 'mysql2/promise'
import type { Request, Response } from 'express';
import { validateSchema } from '../schema/item-schema.ts';
import { InventoryModel } from '../Models/inventory.ts';

interface StorePurchaseRow extends RowDataPacket {
    buy_price: number;
}

export class InventoryController {

    // GET: get inventory 
    GetInventory = async (req: Request, res: Response) => {

        const inventory = await InventoryModel.GetInventory()

        res.status(200).json(inventory)
    }

    // POST: sell item. Recibe el slug de la tienda
    SellItem = async (req: Request, res: Response) => {

        const { slug } = req.params as { slug: string }

        const bodyResult = validateSchema(req.body);

        if (!bodyResult.success) {
            return res.status(400).json(JSON.parse(bodyResult.error.message))
        }

        const item = bodyResult.data

        try {
            await InventoryModel.SellItem({ item, slug })
            return res.status(200).json({ message: "item added successfully"})
        }
        catch (err: any) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            return res.status(500).json({message})
        }

    } 

}
