import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id (Next.js 15 requirement)
    const { id } = await params

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
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ spot: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params

    // Create Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in to delete a spot' },
        { status: 401 }
      )
    }

    // Get the spot to verify ownership
    const { data: spot, error: fetchError } = await supabase
      .from('spots')
      .select('id, owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !spot) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      )
    }

    // Verify the spot belongs to the current user
    if (spot.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own spots' },
        { status: 403 }
      )
    }

    // Check for active bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('spot_id', id)

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to check for active bookings' },
        { status: 500 }
      )
    }

    // Delete any associated bookings first (cascade delete)
    if (bookings && bookings.length > 0) {
      const { error: deleteBookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('spot_id', id)

      if (deleteBookingsError) {
        console.error('Error deleting bookings:', deleteBookingsError)
        return NextResponse.json(
          { error: 'Failed to delete associated bookings' },
          { status: 500 }
        )
      }
    }

    // Delete the spot
    console.log('Attempting to delete spot:', { id, owner_id: user.id })
    const { data: deleteData, error: deleteError } = await supabase
      .from('spots')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id) // Double-check ownership
      .select()

    console.log('Delete result:', { data: deleteData, error: deleteError })

    if (deleteError) {
      console.error('Spot deletion error:', deleteError)
      return NextResponse.json(
        {
          error: 'Failed to delete spot: ' + deleteError.message,
          details: deleteError,
          hint: deleteError.hint
        },
        { status: 500 }
      )
    }

    if (!deleteData || deleteData.length === 0) {
      console.error('No spot was deleted - possible RLS policy issue')
      return NextResponse.json(
        {
          error: 'Failed to delete spot - no rows affected. This may be a permission issue with Supabase Row Level Security.',
          hint: 'Check your Supabase RLS policies for the spots table - you need a DELETE policy that allows: (auth.uid() = owner_id)'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Spot deleted successfully',
      hadBookings: bookings && bookings.length > 0
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
