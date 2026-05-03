import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://giryekrfphmmebisivom.supabase.co'
const supabaseKey = 'sb_publishable_DCFCHtuxnRf3MZLm7io4cg_H8p2Nog-'

export const supabase = createClient(supabaseUrl, supabaseKey)
