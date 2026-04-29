import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qcqmicbajuswejqsqwir.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcW1pY2JhanVzd2VqcXNxd2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNjQsImV4cCI6MjA4NzI2NDA2NH0.JEveQi6TtCXuiKQZTL8XWCYWHdNmJtRX-v-67TNQpV0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
