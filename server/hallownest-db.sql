DROP DATABASE IF EXISTS `hallownest-stores-db`; 
CREATE DATABASE `hallownest-stores-db`;
USE `hallownest-stores-db`;

CREATE TABLE stores (
    store_id BINARY(16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID())), 
    name VARCHAR(255) NOT NULL, 
    seller_name VARCHAR(255) NOT NULL, 
    slug VARCHAR(255) UNIQUE NOT NULL, 
    location VARCHAR(255), 
    position_x INT,
    position_y INT
    -- avatar_url TEXT
); 

CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    type ENUM('charm', 'mask_shard', 'vessel_fragment', 'key', 'map') NOT NULL,
    description TEXT, 
    image_url TEXT
); 


CREATE TABLE store_inventory (
    store_id BINARY(16),
    item_id INT, 
    stock INT NOT NULL, 
    geo_cost INT NOT NULL, 
    PRIMARY KEY(store_id, item_id), 
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE

); 

CREATE TABLE user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
); 

INSERT INTO stores (name, seller_name, slug, location) VALUES
("Divine's Store", "Divine", "divinestore", 'Dirtmouth'),
("Salubra's Store", "Salubra", "salubrastore", "Forgotten Crossroads"),
("Iselda's Store", "Iselda", "iseldastore", "Dirthmouth"),
("Leg Eater", "Leg Eater", "merchant", "Fungal Wastes"),
("Lemm's Store", "Relic Seeker Lemm", "lemmstore", "City of Tears"),
("Sly's Store", "Sly", "slystore", "Dirtmouth");


INSERT INTO items (name, type, description, image_url) VALUES
('Wayward Compass', 'charm', 'Puntos cardinales que indican la ubicación exacta del portador en el mapa.', 'https://static.wikia.nocookie.net/hollowknight/images/7/7d/Wayward_Compass.png/revision/latest?cb=20180909165457'),
('Gathering Swarm', 'charm', 'Un enjambre de insectos recupera automáticamente el Geo caído en el suelo.', 'https://static.wikia.nocookie.net/hollowknight/images/8/8a/Gathering_Swarm.png/revision/latest?cb=20180909165419'),
('Stalwart Shell', 'charm', 'Aumenta el tiempo de invencibilidad temporal tras recibir daño.', 'https://static.wikia.nocookie.net/hollowknight/images/f/f2/Stalwart_Shell.png/revision/latest?cb=20170330141533'),
('Soul Catcher', 'charm', 'Aumenta moderadamente la cantidad de Alma obtenida al golpear enemigos con el aguijón.', 'https://static.wikia.nocookie.net/hollowknight/images/c/ca/Soul_Catcher.png/revision/latest?cb=20180909165119'),
('Shaman Stone', 'charm', 'Aumenta significativamente la potencia y el tamaño de los hechizos.', 'https://static.wikia.nocookie.net/hollowknight/images/5/5e/Shaman_Stone.png/revision/latest?cb=20180909165308'),
('Soul Eater', 'charm', 'Aumenta en gran medida la cantidad de Alma absorbida de los enemigos.', 'https://static.wikia.nocookie.net/hollowknight/images/6/6c/Soul_Eater.png/revision/latest?cb=20180909165007'),
('Dashmaster', 'charm', 'Permite realizar el sprint más seguido y también en dirección hacia abajo.', 'https://static.wikia.nocookie.net/hollowknight/images/7/70/Dashmaster.png/revision/latest?cb=20180810194020'),
('Sprintmaster', 'charm', 'Incrementa la velocidad de movimiento al correr por el suelo.', 'https://static.wikia.nocookie.net/hollowknight/images/e/e9/Sprintmaster.png/revision/latest?cb=20171028131625'),
('Grubsong', 'charm', 'Otorga una pequeña cantidad de Alma cada vez que el portador recibe daño.', 'https://static.wikia.nocookie.net/hollowknight/images/7/78/Grubsong.png/revision/latest?cb=20180909170155'),
('Grubberfly''s Elegy', 'charm', 'Dispara rayos de energía sagrada desde el aguijón cuando la salud está al máximo.', 'https://static.wikia.nocookie.net/hollowknight/images/b/bd/Grubberfly%27s_Elegy.png/revision/latest?cb=20180909170214'),
('Fragile Heart', 'charm', 'Aumenta la salud máxima en dos máscaras. Se rompe si el portador muere.', 'https://static.wikia.nocookie.net/hollowknight/images/1/13/Fragile_Heart.png/revision/latest?cb=20180923025627'),
('Fragile Greed', 'charm', 'Los enemigos derrotados sueltan más Geo. Se rompe al morir el portador.', 'https://static.wikia.nocookie.net/hollowknight/images/b/b6/Fragile_Greed.png/revision/latest?cb=20180923025659'),
('Fragile Strength', 'charm', 'Aumenta enormemente el daño de los golpes físicos. Se rompe al morir.', 'https://static.wikia.nocookie.net/hollowknight/images/7/7b/Fragile_Strength.png/revision/latest?cb=20180923025436'),
('Spell Twister', 'charm', 'Reduce el consumo de Alma necesario para conjurar hechizos.', 'https://static.wikia.nocookie.net/hollowknight/images/3/33/Spell_Twister.png/revision/latest?cb=20180909165049'),
('Steady Body', 'charm', 'Elimina por completo el retroceso que sufre el Caballero al asestar un golpe.', 'https://static.wikia.nocookie.net/hollowknight/images/f/f5/Steady_Body.png/revision/latest?cb=20180909165654'),
('Heavy Blow', 'charm', 'Aumenta la distancia a la que son empujados los enemigos al ser golpeados.', 'https://static.wikia.nocookie.net/hollowknight/images/f/f6/Heavy_Blow.png/revision/latest?cb=20180909165720'),
('Quick Slash', 'charm', 'Permite blandir el aguijón a una velocidad mucho más rápida.', 'https://static.wikia.nocookie.net/hollowknight/images/5/5f/Quick_Slash.png/revision/latest?cb=20180909165747'),
('Longnail', 'charm', 'Aumenta ligeramente el alcance de ataque del aguijón.', 'https://static.wikia.nocookie.net/hollowknight/images/d/d1/Longnail.png/revision/latest?cb=20180909165814'),
('Mark of Pride', 'charm', 'Aumenta considerablemente el alcance del aguijón, regalo de las mantis.', 'https://static.wikia.nocookie.net/hollowknight/images/6/69/Mark_of_Pride.png/revision/latest?cb=20170508202722'),
('Fury of the Fallen', 'charm', 'Aumenta drásticamente el daño del aguijón cuando solo queda una máscara de salud.', 'https://static.wikia.nocookie.net/hollowknight/images/4/4f/Fury_of_the_Fallen.png/revision/latest?cb=20180909171045'),
('Thorns of Agony', 'charm', 'Brota una lluvia de zarzas espinosas que daña a los enemigos cercanos al recibir daño.', 'https://static.wikia.nocookie.net/hollowknight/images/8/8f/Thorns_of_Agony.png/revision/latest?cb=20180909165348'),
('Baldur Shell', 'charm', 'Protege al portador con un caparazón impenetrable mientras concentra Alma.', 'https://static.wikia.nocookie.net/hollowknight/images/2/21/Baldur_Shell.png/revision/latest?cb=20180909165838'),
('Flukenest', 'charm', 'Transforma el hechizo Espíritu Vengativo en una ráfaga de crías de tremátodo.', 'https://static.wikia.nocookie.net/hollowknight/images/7/79/Flukenest.png/revision/latest?cb=20180909165913'),
('Defender''s Crest', 'charm', 'Emite un hedor fétido continuo que daña lentamente a los enemigos cercanos.', 'https://static.wikia.nocookie.net/hollowknight/images/5/56/Defender%27s_Crest.png/revision/latest?cb=20180909165929'),
('Glowing Womb', 'charm', 'Consume Alma para generar pequeñas crías explosivas que atacan a los rivales.', 'https://static.wikia.nocookie.net/hollowknight/images/c/c6/Glowing_Womb.png/revision/latest?cb=20180909165949'),
('Quick Focus', 'charm', 'Aumenta drásticamente la velocidad para concentrar Alma y recuperar salud.', 'https://static.wikia.nocookie.net/hollowknight/images/6/6a/Quick_Focus.png/revision/latest?cb=20180909170014'),
('Deep Focus', 'charm', 'La concentración de Alma es más lenta pero restaura dos máscaras en vez de una.', 'https://static.wikia.nocookie.net/hollowknight/images/e/ea/Deep_Focus.png/revision/latest?cb=20180909170038'),
('Lifeblood Heart', 'charm', 'Proporciona dos máscaras de savia vital al descansar en un banco.', 'https://static.wikia.nocookie.net/hollowknight/images/7/7c/Lifeblood_Heart.png/revision/latest?cb=20180909170057'),
('Lifeblood Core', 'charm', 'Proporciona cuatro máscaras de savia vital al descansar en un banco.', 'https://static.wikia.nocookie.net/hollowknight/images/8/81/Lifeblood_Core.png/revision/latest?cb=20180909170116'),
('Joni''s Blessing', 'charm', 'Transforma toda la salud en savia vital e incrementa la cantidad de máscaras totales.', 'https://static.wikia.nocookie.net/hollowknight/images/6/67/Joni%27s_Blessing.png/revision/latest?cb=20180909170135'),
('Hiveblood', 'charm', 'Regenera pasivamente la última máscara de salud perdida con el tiempo sin usar Alma.', 'https://static.wikia.nocookie.net/hollowknight/images/e/eb/Hiveblood.png/revision/latest?cb=20170508194807'),
('Spore Shroom', 'charm', 'Libera una nube de esporas venenosas al concentrar Alma.', 'https://static.wikia.nocookie.net/hollowknight/images/7/78/Spore_Shroom.png/revision/latest?cb=20170508194757'),
('Sharp Shadow', 'charm', 'Transforma la sombra de evasión en una hoja afilada que inflige daño al atravesar rivales.', 'https://static.wikia.nocookie.net/hollowknight/images/1/13/Sharp_Shadow.png/revision/latest?cb=20170508194735'),
('Shape of Unn', 'charm', 'Permite al portador adoptar forma de oruga y deslizarse libremente mientras concentra Alma.', 'https://static.wikia.nocookie.net/hollowknight/images/b/b4/Shape_of_Unn.png/revision/latest?cb=20180909170919'),
('Nailmaster''s Glory', 'charm', 'Reduce drásticamente el tiempo de carga de las artes de aguijón.', 'https://static.wikia.nocookie.net/hollowknight/images/0/0f/Nailmaster%27s_Glory.png/revision/latest?cb=20170508194621'),
('Weaversong', 'charm', 'Invoca pequeñas arañas tejedoras compañeras que atacan y extraen Alma de los rivales.', 'https://static.wikia.nocookie.net/hollowknight/images/2/26/Weaversong.png/revision/latest?cb=20171028131632'),
('Dream Wielder', 'charm', 'Reduce el tiempo de carga del Aguijón Onírico y duplica el Alma absorbida.', 'https://static.wikia.nocookie.net/hollowknight/images/9/94/Dream_Wielder.png/revision/latest?cb=20180909170602'),
('Dreamshield', 'charm', 'Conjura un escudo giratorio que bloquea proyectiles y golpea a los enemigos.', 'https://static.wikia.nocookie.net/hollowknight/images/4/47/Dreamshield.png/revision/latest?cb=20180909171219'),
('Grimmchild', 'charm', 'Compañero que consume llamas de pesadilla para evolucionar y disparar fuego.', 'https://static.wikia.nocookie.net/hollowknight/images/6/6a/Grimmchild01.png/revision/latest?cb=20171028133715'),
('Carefree Melody', 'charm', 'Contiene una canción que en ocasiones bloquea completamente el daño recibido.', 'https://static.wikia.nocookie.net/hollowknight/images/c/c4/Carefree_Melody.png/revision/latest?cb=20180909171307'),
('Kingsoul', 'charm', 'Amuleto real sagrado que regenera Alma de forma infinita y continua.', 'https://static.wikia.nocookie.net/hollowknight/images/3/34/Kingsoul.png/revision/latest?cb=20180909170505'),
('Void Heart', 'charm', 'Unifica el vacío bajo la voluntad del portador. No puede ser desequipado ni consume muescas.', 'https://static.wikia.nocookie.net/hollowknight/images/b/bb/Void_Heart.png/revision/latest?cb=20180909170526');

