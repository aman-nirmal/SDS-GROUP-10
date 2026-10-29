import { dataStore } from '../services/dataStore.js'

export async function getAllUsers(req, res, next) {
  try {
    const { role, search } = req.query
    const users = await dataStore.getUsers({ role, search })
    return res.json({ success: true, count: users.length, users })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, role, department } = req.body
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required.' })
    }
    const user = await dataStore.createUser({ name, email, role, department })
    return res.status(201).json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function bulkImportUsers(req, res, next) {
  try {
    const { users } = req.body
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, error: 'Expected non-empty users array.' })
    }
    const imported = await dataStore.bulkCreateUsers(users)
    return res.status(201).json({ success: true, count: imported.length, imported })
  } catch (err) {
    next(err)
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required.' })
    }
    const user = await dataStore.updateUserRole(req.params.id, role)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' })
    }
    return res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' })
    }
    const user = await dataStore.updateUserStatus(req.params.id, status)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' })
    }
    return res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const deleted = await dataStore.deleteUser(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'User not found.' })
    }
    return res.json({ success: true, message: 'User deleted from directory.' })
  } catch (err) {
    next(err)
  }
}
