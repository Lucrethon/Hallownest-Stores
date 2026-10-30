import { Router } from "express";
import { StoresController } from "../Controller/storesController.js";

export const createStoresRouter = () => {
    const storesRouter = Router()
    const storesConroller = new StoresController()

    // GET all stores
    storesRouter.get('/', storesConroller.GetAll)

    // GET catalog from specific store
    storesRouter.get('/:slug', storesConroller.GetStoreCatalog)

    return storesRouter
}