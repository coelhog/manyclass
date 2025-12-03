/*
 * Database simulation layer
 * This file provides a unified interface for interacting with LocalStorage
 * mimicking a persistent database connection.
 */

const DB_PREFIX = 'manyclass_'

export const db = {
  /**
   * Retrieve all items from a collection
   */
  get: <T>(collection: string): T[] => {
    try {
      const data = localStorage.getItem(`${DB_PREFIX}${collection}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading from DB collection ${collection}:`, error)
      return []
    }
  },

  /**
   * Find item by ID
   */
  getById: <T extends { id: string }>(
    collection: string,
    id: string,
  ): T | undefined => {
    const items = db.get<T>(collection)
    return items.find((item) => item.id === id)
  },

  /**
   * Insert a new item into a collection
   */
  insert: <T>(collection: string, item: T): T => {
    const items = db.get<T>(collection)
    const newItems = [...items, item]
    localStorage.setItem(`${DB_PREFIX}${collection}`, JSON.stringify(newItems))
    return item
  },

  /**
   * Update an existing item
   */
  update: <T extends { id: string }>(
    collection: string,
    id: string,
    updates: Partial<T>,
  ): T => {
    const items = db.get<T>(collection)
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error(`Item with ID ${id} not found in ${collection}`)
    }

    const updatedItem = { ...items[index], ...updates }
    items[index] = updatedItem
    localStorage.setItem(`${DB_PREFIX}${collection}`, JSON.stringify(items))
    return updatedItem
  },

  /**
   * Delete an item from a collection
   */
  delete: <T extends { id: string }>(collection: string, id: string): void => {
    const items = db.get<T>(collection)
    const newItems = items.filter((item) => item.id !== id)
    localStorage.setItem(`${DB_PREFIX}${collection}`, JSON.stringify(newItems))
  },

  /**
   * Bulk insert
   */
  insertMany: <T>(collection: string, newItems: T[]): T[] => {
    const items = db.get<T>(collection)
    const updatedItems = [...items, ...newItems]
    localStorage.setItem(
      `${DB_PREFIX}${collection}`,
      JSON.stringify(updatedItems),
    )
    return newItems
  },

  /**
   * Overwrite collection
   */
  set: <T>(collection: string, items: T[]): void => {
    localStorage.setItem(`${DB_PREFIX}${collection}`, JSON.stringify(items))
  },
}
