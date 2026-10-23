SELECT BIN_TO_UUID(store_id) store_id, name, seller_name, slug, location, position_x, position_y FROM stores;

SELECT item_id, 
        name, 
        type, 
        description, 
        image_url 
    FROM items AS i
    JOIN store_inventory as si ON i.item_id = si.item_id
    WHERE si.store_slug = ?;