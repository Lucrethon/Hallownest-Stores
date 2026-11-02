import { Router } from "express";
import { InventoryController } from "../Controller/inventoryController.ts";

export const createKnightRouter = () => {
    const knightRouter = Router()
    const knightController = new InventoryController()

    // GET knight inventory 
    knightRouter.get('/', knightController.GetInventory)

    // POST: buy an item 
    knightRouter.post('/', knightController.BuyItem)

    return knightRouter
}
