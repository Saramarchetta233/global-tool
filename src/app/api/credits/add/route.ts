import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, description, operation = 'add' } = body;

    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid fields', required: ['userId', 'amount'] },
        { status: 400 }
      );
    }

    // Check if profile exists, if not create it
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      const userDataHeader = req.headers.get('X-User-Data');
      let userEmail = 'unknown@email.com';
      
      if (userDataHeader) {
        try {
          const userData = JSON.parse(userDataHeader);
          userEmail = userData.email || userEmail;
        } catch (e) {
          console.log('Could not parse user data header');
        }
      }

      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          credits: 120 // Start with 120 credits
        }]);

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
    } else if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'Profile lookup failed' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .rpc('add_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description || 'Credits added',
        p_operation: operation
      });

    if (error) {
      console.error('Credit addition error:', error);
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      creditsAdded: data.credits_added,
      newBalance: data.new_balance,
      message: `${amount} crediti aggiunti con successo`
    });

  } catch (error) {
    console.error('API Error in credits/add:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: profile.credits
    });

  } catch (error) {
    console.error('API Error in credits/get:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}