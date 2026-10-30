import { Router } from "express";
import { InventoryController } from "../Controller/storesController.js";

export const createKnightRouter = () => {
    const knightRouter = Router()
    const knightController = new InventoryController()

    // GET knight inventory 
    knightRouter.get('/', knightController.GetInventory)

    // POST: buy an item 
    knightRouter.post('/slug', knightController.BuyItem)

    return knightRouter
}
