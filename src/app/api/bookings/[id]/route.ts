import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params
    const { id } = await params
    console.log('DELETE booking request received for booking ID:', id)

    // Create Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - please log in to cancel a booking' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    // Get the booking to verify ownership and get spot_id
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, renter_id, spot_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Fetch booking error:', fetchError)
    }

    if (!booking) {
      console.error('Booking not found for ID:', id)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    console.log('Booking found:', booking)

    // Verify the booking belongs to the current user
    if (booking.renter_id !== user.id) {
      console.error('Ownership mismatch. Booking renter_id:', booking.renter_id, 'User id:', user.id)
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      )
    }

    console.log('Ownership verified. Attempting to delete booking...')

    // Delete the booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Booking deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to cancel booking: ' + deleteError.message },
        { status: 500 }
      )
    }

    console.log('Booking deleted successfully. Updating spot availability...')

    // Update the spot to make it available again
    const { error: updateError } = await supabase
      .from('spots')
      .update({ is_available: true })
      .eq('id', booking.spot_id)

    if (updateError) {
      console.error('Spot update error:', updateError)
      // Note: Booking was deleted but spot wasn't updated - this is a partial failure
      return NextResponse.json(
        { error: 'Booking cancelled but failed to update spot availability' },
        { status: 500 }
      )
    }

    console.log(`Successfully cancelled booking ${id} and made spot ${booking.spot_id} available`)

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
