import mysql from 'mysql2/promise'
const dbURL = process.env.DB_URL

if (!dbURL) {
    throw new Error("La variable de entorno DB_URL no está definida.");
}

// const connection = await mysql.createConnection(dbURL);

export const pool = mysql.createPool(dbURL);