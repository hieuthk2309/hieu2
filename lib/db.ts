import initSqlJs, { Database } from 'sql.js'
import path from 'path'
import fs from 'fs'

// Use environment variable or default path
const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'orders.db')

// Ensure directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let db: Database | null = null

// Initialize database
async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: file => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
  })

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Initialize tables
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
  `)

  // Save to file
  saveDb()

  return db
}

// Save database to file
function saveDb() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

export interface OrderRow {
  id: number
  customer_name: string
  total: number
  status: string
  created_at: string
}

export interface OrderItemRow {
  id: number
  order_id: number
  menu_item_id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  toppings: string | null
  notes: string | null
  subtotal: number
}

// Insert a new order
export async function createOrder(
  customerName: string,
  total: number
): Promise<number> {
  const database = await getDb()
  
  database.run(`
    INSERT INTO orders (customer_name, total)
    VALUES (?, ?)
  `, [customerName, total])
  
  const result = database.exec('SELECT last_insert_rowid() as id')
  const orderId = result[0]?.values[0]?.[0] as number
  
  saveDb()
  return orderId
}

// Insert order items
export async function createOrderItems(
  orderId: number,
  items: {
    menuItemId: string
    menuItemName: string
    menuItemPrice: number
    quantity: number
    toppings: string[]
    notes?: string
    subtotal: number
  }[]
): Promise<void> {
  const database = await getDb()

  for (const item of items) {
    database.run(`
      INSERT INTO order_items (order_id, menu_item_id, menu_item_name, menu_item_price, quantity, toppings, notes, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      item.menuItemId,
      item.menuItemName,
      item.menuItemPrice,
      item.quantity,
      JSON.stringify(item.toppings),
      item.notes || null,
      item.subtotal
    ])
  }

  saveDb()
}

// Get all orders
export async function getAllOrders(): Promise<OrderRow[]> {
  const database = await getDb()
  const result = database.exec('SELECT * FROM orders ORDER BY created_at DESC')
  
  if (!result[0]) return []
  
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as unknown as OrderRow
  })
}

// Get order by ID with items
export async function getOrderById(id: number): Promise<{ order: OrderRow; items: OrderItemRow[] } | null> {
  const database = await getDb()
  
  const orderResult = database.exec('SELECT * FROM orders WHERE id = ?', [id])
  if (!orderResult[0] || !orderResult[0].values[0]) return null

  const orderColumns = orderResult[0].columns
  const orderObj: Record<string, unknown> = {}
  orderColumns.forEach((col, i) => {
    orderObj[col] = orderResult[0].values[0][i]
  })
  const order = orderObj as unknown as OrderRow

  const itemsResult = database.exec('SELECT * FROM order_items WHERE order_id = ?', [id])
  let items: OrderItemRow[] = []
  
  if (itemsResult[0]) {
    const itemColumns = itemsResult[0].columns
    items = itemsResult[0].values.map(row => {
      const obj: Record<string, unknown> = {}
      itemColumns.forEach((col, i) => {
        obj[col] = row[i]
      })
      return obj as unknown as OrderItemRow
    })
  }

  return { order, items }
}

// Update order status
export async function updateOrderStatus(id: number, status: string): Promise<void> {
  const database = await getDb()
  database.run('UPDATE orders SET status = ? WHERE id = ?', [status, id])
  saveDb()
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<OrderRow[]> {
  const database = await getDb()
  const result = database.exec('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC', [status])
  
  if (!result[0]) return []
  
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as unknown as OrderRow
  })
}

export { getDb }
