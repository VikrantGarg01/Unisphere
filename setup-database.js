import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the public MySQL URL from Railway
// Format: mysql://root:PASSWORD@HOST:PORT/railway
const DB_URL = 'mysql://root:MjZrfcjnGdfSYQnNwqRiArKWOswCLtFL@shortline.proxy.rlwy.net:36650/railway';

async function setupDatabase() {
  let connection;
  
  try {
    console.log('📡 Connecting to Railway MySQL database...');
    
    connection = await mysql.createConnection(DB_URL);
    
    console.log('✅ Connected successfully!');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`\n📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
        console.log('✅ Success');
      }
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Tables created:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log(`  ✓ ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Connection closed');
    }
  }
}

setupDatabase();
