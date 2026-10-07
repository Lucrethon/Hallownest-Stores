import mysql from 'mysql2/promise';
import fs from 'node:fs'; 
import type { ConnectionOptions } from 'mysql2/promise';

const PORT = 4000

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    port: PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
} as ConnectionOptions;

const connection = await mysql.createConnection(config);
const sqlScript = fs.readFileSync('./hallownest-db.sql', 'utf-8');
console.log('Creando tablas')
await connection.query(sqlScript)
console.log('¡Tablas creadas y pobladas con éxito!')

await connection.end()