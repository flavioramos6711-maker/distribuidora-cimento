import { createClient } from './lib/supabase/client'

async function test() {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('count').limit(1)
  if (error) {
    console.error('Connection error:', error)
  } else {
    console.log('Connection success:', data)
  }
}

test()
