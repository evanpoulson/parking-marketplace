import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { neighborhood, address, description, pricePerDay } = body

    // Validate required fields
    if (!neighborhood || !address || !pricePerDay) {
      return NextResponse.json(
        { error: 'Missing required fields: neighborhood, address, and pricePerDay are required' },
        { status: 400 }
      )
    }

    // Validate price
    if (typeof pricePerDay !== 'number' || pricePerDay < 5) {
      return NextResponse.json(
        { error: 'Price per day must be a number and at least $5' },
        { status: 400 }
      )
    }

    // Insert into spots table
    const { data, error } = await supabase
      .from('spots')
      .insert({
        owner_id: user.id,
        address,
        neighborhood,
        description: description || '',
        price_per_day: pricePerDay,
        is_available: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create parking spot: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      spotId: data.id,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
