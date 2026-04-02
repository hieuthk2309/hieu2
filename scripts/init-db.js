import initSqlJs from 'sql.js'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

// Create data directory if it doesn't exist
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
  console.log('Created data directory')
}

const dbPath = join(dataDir, 'orders.db')

// Initialize SQL.js
const SQL = await initSqlJs()
const db = new SQL.Database()

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id TEXT NOT NULL,
    menu_item_name TEXT NOT NULL,
    menu_item_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    toppings TEXT,
    notes TEXT,
    subtotal INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
`)

// Save database to file
const data = db.export()
const buffer = Buffer.from(data)
writeFileSync(dbPath, buffer)

console.log('Database initialized successfully at:', dbPath)
console.log('Tables created: orders, order_items')
