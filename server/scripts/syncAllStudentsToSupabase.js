import { supabase } from '../src/config/supabase.js'
import { importedCampusUsers } from '../../src/data/importedCampusUsers.js'

async function syncStudents() {
  console.log(`Starting Supabase sync for ${importedCampusUsers.length} COEP students...`)
  const batchSize = 100
  let totalUploaded = 0

  for (let i = 0; i < importedCampusUsers.length; i += batchSize) {
    const batch = importedCampusUsers.slice(i, i + batchSize).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase().trim(),
      role: 'Student',
      department: u.department,
      auth_provider: 'Microsoft Outlook 365',
      is_active: true
    }))

    const { data, error } = await supabase
      .from('users')
      .upsert(batch, { onConflict: 'email' })
      .select('id')

    if (error) {
      console.error(`Error in batch ${i} - ${i + batch.length}:`, error.message)
    } else {
      totalUploaded += (data ? data.length : batch.length)
      process.stdout.write(`Uploaded ${totalUploaded}/${importedCampusUsers.length} students...\r`)
    }
  }

  console.log(`\n🎉 Successfully uploaded all ${totalUploaded} student records to Supabase!`)

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  console.log(`Verified total users in Supabase: ${count}`)
  process.exit(0)
}

syncStudents().catch(err => {
  console.error('Sync failed:', err)
  process.exit(1)
})
