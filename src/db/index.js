import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from '../secrets/secrets.supabase'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function signUpNewUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // options: {
    //   redirectTo: 'https//example.com/welcome'
    // }
  })
  return { data, error }
}
