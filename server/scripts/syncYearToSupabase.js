import { supabase } from '../src/config/supabase.js'
import { importedCampusUsers } from '../src/data/importedCampusUsers.js'

async function syncYear() {
  console.log('Testing whether "year" column is present in Supabase...')
  const testRes = await supabase.from('users').select('id, year').limit(1)

  if (testRes.error && testRes.error.message.includes("'year' column")) {
    console.log('\n⚠️ The "year" column has not been added to PostgreSQL table "users" yet.')
    console.log('Please run the following in your Supabase SQL Editor (https://supabase.com/dashboard/project/ozdthbfemtuaefrrxwnm/sql):')
    console.log('\nALTER TABLE public.users ADD COLUMN IF NOT EXISTS year TEXT DEFAULT \'SY\';')
    console.log('UPDATE public.users SET year = \'SY\' WHERE role = \'Student\';\n')
    process.exit(1)
  }

  console.log('Column "year" detected! Updating student records to "SY"...')
  const { data, error } = await supabase
    .from('users')
    .update({ year: 'SY' })
    .eq('role', 'Student')
    .select('id')

  if (error) {
    console.error('Failed to update year:', error.message)
    process.exit(1)
  }

  console.log(`🎉 Successfully updated ${data ? data.length : 1479} students in Supabase to year: SY!`)
  process.exit(0)
}

syncYear().catch(err => {
  console.error(err)
  process.exit(1)
})
