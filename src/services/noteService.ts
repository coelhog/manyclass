import { ClassNote } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_NOTES = 'class_notes'

export const noteService = {
  getAll: async (): Promise<ClassNote[]> => {
    await delay(200)
    return db.get<ClassNote>(COLLECTION_NOTES)
  },

  getByEventId: async (eventId: string): Promise<ClassNote | undefined> => {
    await delay(200)
    const notes = db.get<ClassNote>(COLLECTION_NOTES)
    return notes.find((n) => n.eventId === eventId)
  },

  getByStudentId: async (studentId: string): Promise<ClassNote[]> => {
    await delay(300)
    const notes = db.get<ClassNote>(COLLECTION_NOTES)
    return notes.filter((n) => n.studentId === studentId)
  },

  save: async (
    data: Omit<ClassNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<ClassNote> => {
    await delay(400)
    const notes = db.get<ClassNote>(COLLECTION_NOTES)

    // Check if note exists for this event to update instead of create duplicate
    const existingNote = notes.find((n) => n.eventId === data.eventId)

    if (existingNote) {
      // Update existing
      return db.update(COLLECTION_NOTES, existingNote.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    }

    // Create new
    const newNote: ClassNote = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return db.insert(COLLECTION_NOTES, newNote)
  },

  delete: async (id: string): Promise<void> => {
    await delay(200)
    db.delete(COLLECTION_NOTES, id)
  },
}
