import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic' // Ensure route is never cached

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Query spots table with owner information
    const { data, error } = await supabase
      .from('spots')
      .select(`
        *,
        owner:users!owner_id (
          name
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch parking spots: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ spots: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
