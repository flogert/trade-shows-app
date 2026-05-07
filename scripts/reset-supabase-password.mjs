import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

const envFilePath = resolve(process.cwd(), '.env.local')

if (existsSync(envFilePath)) {
  const envFile = readFileSync(envFilePath, 'utf8')

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.argv[2]?.trim().toLowerCase()
const password = process.argv[3]

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

if (!email || !password) {
  console.error('Usage: node scripts/reset-supabase-password.mjs <email> <temporary-password>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const { data, error } = await supabase.auth.admin.listUsers()

if (error) {
  console.error(`Unable to list users: ${error.message}`)
  process.exit(1)
}

const user = data.users.find((entry) => entry.email?.toLowerCase() === email)

if (!user) {
  console.error(`No Supabase auth user found for ${email}.`)
  process.exit(1)
}

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password,
})

if (updateError) {
  console.error(`Unable to update password: ${updateError.message}`)
  process.exit(1)
}

console.log(`Temporary password updated for ${email}.`)