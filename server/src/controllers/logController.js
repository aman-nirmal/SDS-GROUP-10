import { dataStore } from '../services/dataStore.js'

export async function getLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '100', 10)
    const logs = await dataStore.getLogs(limit)
    return res.json({ success: true, count: logs.length, logs })
  } catch (err) {
    next(err)
  }
}

export async function createLog(req, res, next) {
  try {
    const { action, module, severity, actor, ip } = req.body
    if (!action) {
      return res.status(400).json({ success: false, error: 'Log action description is required.' })
    }
    const log = dataStore.addLog(
      action,
      module || 'System',
      severity || 'info',
      actor || 'Client',
      ip || req.ip || '127.0.0.1'
    )
    return res.status(201).json({ success: true, log })
  } catch (err) {
    next(err)
  }
}
