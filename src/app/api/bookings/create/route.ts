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
        { error: 'Unauthorized - please log in to book a spot' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { spotId } = body

    if (!spotId) {
      return NextResponse.json(
        { error: 'Spot ID is required' },
        { status: 400 }
      )
    }

    // Check if spot exists and is available
    const { data: spot, error: spotError } = await supabase
      .from('spots')
      .select('id, price_per_day, is_available, owner_id')
      .eq('id', spotId)
      .single()

    if (spotError || !spot) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to book their own spot
    if (spot.owner_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own spot' },
        { status: 400 }
      )
    }

    // Check if spot is still available
    if (!spot.is_available) {
      return NextResponse.json(
        { error: 'This spot is no longer available' },
        { status: 400 }
      )
    }

    // Calculate dates (today and tomorrow)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 1)

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        spot_id: spotId,
        renter_id: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_price: spot.price_per_day,
        status: 'confirmed',
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking: ' + bookingError.message },
        { status: 500 }
      )
    }

    // Update spot availability
    console.log(`Attempting to update spot ${spotId} to is_available = false...`)
    const { error: updateError, data: updateData } = await supabase
      .from('spots')
      .update({ is_available: false })
      .eq('id', spotId)
      .select()

    if (updateError) {
      console.error('Spot update error:', updateError)
      // Note: Booking was created but spot wasn't updated - this is a partial failure
      return NextResponse.json(
        { error: 'Booking created but failed to update spot availability' },
        { status: 500 }
      )
    }

    console.log(`Successfully updated spot ${spotId} to is_available = false. Updated data:`, updateData)

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
