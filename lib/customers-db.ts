import fs from 'fs'
import path from 'path'
import { supabase } from './supabase'

export interface Customer {
  id: string
  name: string
  debt: number
  phone?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'customers.json')

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8')
  }
}

function readLocalCustomers(): Customer[] {
  try {
    ensureFileExists()
    const content = fs.readFileSync(FILE_PATH, 'utf-8')
    return JSON.parse(content || '[]')
  } catch (error) {
    console.error('Error reading local customers file:', error)
    return []
  }
}

function writeLocalCustomers(customers: Customer[]) {
  try {
    ensureFileExists()
    fs.writeFileSync(FILE_PATH, JSON.stringify(customers, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing local customers file:', error)
  }
}

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('debt', { ascending: false })

    if (!error && data) {
      return data.map(item => ({
        id: String(item.id),
        name: item.name,
        debt: Number(item.debt || 0),
        phone: item.phone || null,
        notes: item.notes || null,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
    }
  } catch {
    // Fallback if table doesn't exist yet
  }

  return readLocalCustomers()
}

export async function createCustomer(name: string, initialDebt: number = 0, phone?: string, notes?: string): Promise<Customer> {
  const trimmedName = name.trim()
  if (!trimmedName) {
    throw new Error('Tên khách hàng không được để trống')
  }

  const now = new Date().toISOString()
  const debtVal = Number(initialDebt) || 0

  // Attempt Supabase insert first
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name: trimmedName,
        debt: debtVal,
        phone: phone || null,
        notes: notes || null,
        created_at: now,
      }])
      .select()
      .single()

    if (!error && data) {
      const created: Customer = {
        id: String(data.id),
        name: data.name,
        debt: Number(data.debt || 0),
        phone: data.phone || null,
        notes: data.notes || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
      // Backup to local file
      const local = readLocalCustomers()
      local.unshift(created)
      writeLocalCustomers(local)
      return created
    }
  } catch {
    // Fallback if table doesn't exist yet
  }

  // Fallback local creation
  const newCustomer: Customer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: trimmedName,
    debt: debtVal,
    phone: phone || null,
    notes: notes || null,
    created_at: now,
    updated_at: now,
  }

  const customers = readLocalCustomers()
  customers.unshift(newCustomer)
  writeLocalCustomers(customers)

  return newCustomer
}

export async function updateCustomerDebt(id: string, newDebt: number, notes?: string): Promise<Customer | null> {
  const now = new Date().toISOString()
  const cleanDebt = Math.max(0, Number(newDebt) || 0)

  // Attempt Supabase update
  try {
    const updatePayload: Record<string, any> = { debt: cleanDebt, updated_at: now }
    if (notes !== undefined) updatePayload.notes = notes
    if (newDebt == 0) updatePayload.notes = null

    const { data, error } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      const updated: Customer = {
        id: String(data.id),
        name: data.name,
        debt: Number(data.debt || 0),
        phone: data.phone || null,
        notes: data.notes || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
      const customers = readLocalCustomers()
      const idx = customers.findIndex(c => String(c.id) === String(id))
      if (idx !== -1) {
        customers[idx] = updated
        writeLocalCustomers(customers)
      }
      return updated
    }
  } catch {
    // Fallback
  }

  const customers = readLocalCustomers()
  const index = customers.findIndex(c => String(c.id) === String(id))
  if (index === -1) return null

  customers[index] = {
    ...customers[index],
    debt: cleanDebt,
    updated_at: now,
    ...(notes !== undefined ? { notes } : {})
  }
  writeLocalCustomers(customers)

  return customers[index]
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await supabase
      .from('customers')
      .delete()
      .eq('id', id)
  } catch {
    // Fallback
  }

  const customers = readLocalCustomers()
  const filtered = customers.filter(c => String(c.id) !== String(id))
  writeLocalCustomers(filtered)
  return true
}

export async function addCustomerDebt(
  id: string,
  amountToAdd: number,
  notes?: string
): Promise<Customer | null> {
  const allCustomers = await getAllCustomers()
  const current = allCustomers.find((c) => String(c.id) === String(id))
  if (!current) return null

  const cleanAmount = Number(amountToAdd) || 0
  const newDebt = Math.max(0, (current.debt || 0) + cleanAmount)

  let updatedNotes = current.notes || ''
  if (notes && notes.trim()) {
    const timestamp = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const noteEntry = `[${timestamp}] ${notes.trim()}`
    updatedNotes = updatedNotes ? `${updatedNotes}\n${noteEntry}` : noteEntry
  }

  return updateCustomerDebt(id, newDebt, updatedNotes)
}
