import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseRawUsers } from './parseAndImportUsers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rawPath = path.resolve(__dirname, 'raw_users.txt')
const rawText = fs.readFileSync(rawPath, 'utf8')

const students = parseRawUsers(rawText)
console.log(`Successfully parsed ${students.length} students!`)

// Department breakdown
const deptCounts = {}
students.forEach(s => {
  deptCounts[s.department] = (deptCounts[s.department] || 0) + 1
})
console.log('Department breakdown:')
console.table(deptCounts)

// Write to src/data/importedCampusUsers.js
const outDir = path.resolve(__dirname, '../../src/data')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
const outPath = path.resolve(outDir, 'importedCampusUsers.js')
fs.writeFileSync(outPath, `export const importedCampusUsers = ${JSON.stringify(students, null, 2)}\n`, 'utf8')
console.log(`Saved ${students.length} users to ${outPath}`)

// Now let's check mockAdminData.js
const mockDataPath = path.resolve(__dirname, '../../src/components/admin/mockAdminData.js')
let mockContent = fs.readFileSync(mockDataPath, 'utf8')

// Clean up any old JSON import if present
mockContent = mockContent.replace(/import importedCampusUsers from '\.\.\/\.\.\/data\/importedCampusUsers\.json'\n?/, '')

if (!mockContent.includes('importedCampusUsers')) {
  mockContent = `import { importedCampusUsers } from '../../data/importedCampusUsers.js'\n` + mockContent
  mockContent = mockContent.replace(
    'export const INITIAL_ADMIN_USERS = [',
    'export const INITIAL_ADMIN_USERS = [\n  ...importedCampusUsers,'
  )
} else if (!mockContent.includes(`import { importedCampusUsers } from '../../data/importedCampusUsers.js'`)) {
  mockContent = `import { importedCampusUsers } from '../../data/importedCampusUsers.js'\n` + mockContent
}
fs.writeFileSync(mockDataPath, mockContent, 'utf8')
console.log('Updated mockAdminData.js with JS export')
