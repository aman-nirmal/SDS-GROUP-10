import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEPT_MAP = {
  aiml: 'Artificial Intelligence & Machine Learning',
  civil: 'Civil Engineering',
  comp: 'Computer Engineering',
  elec: 'Electrical Engineering',
  extc: 'Electronics & Telecommunication Engineering',
  instru: 'Instrumentation & Control Engineering',
  mech: 'Mechanical Engineering',
  meta: 'Metallurgy & Material Science',
  plan: 'Town Planning & Architecture',
  mfg: 'Manufacturing Engineering & Industrial Management'
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function parseRawUsers(rawText) {
  const regex = /"([^"]+)"\s*<([^>]+)>/g
  const users = []
  const seenEmails = new Set()
  let match

  let index = 1
  while ((match = regex.exec(rawText)) !== null) {
    const rawName = match[1].trim()
    const email = match[2].trim().toLowerCase()

    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    // Extract dept from email e.g. shahar25.aiml@coeptech.ac.in -> aiml
    const deptMatch = email.match(/\.([a-z]+)@coeptech\.ac\.in$/i)
    const deptCode = deptMatch ? deptMatch[1].toLowerCase() : ''
    const department = DEPT_MAP[deptCode] || 'General Academic Complex'

    const name = toTitleCase(rawName)
    const paddedIndex = String(index).padStart(4, '0')

    users.push({
      id: `USR-STU-${paddedIndex}`,
      name,
      email,
      role: 'Student',
      department,
      authProvider: 'Microsoft Outlook 365',
      status: 'Active',
      lastActive: 'Registered',
      createdAt: '2026-10-20'
    })

    index++
  }

  return users
}
