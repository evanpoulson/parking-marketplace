import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query bookings table with spot details
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        status,
        spot:spots (
          id,
          address,
          neighborhood,
          description,
          price_per_day
        )
      `)
      .eq('renter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch your bookings: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
