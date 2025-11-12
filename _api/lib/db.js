import mysql from 'mysql2/promise'

let pool

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

export const query = async (sql, params = []) => {
  const connection = await getConnection()
  console.log('Executing SQL with params:', params)
  const [results] = await connection.query(sql, params)
  return results
}
