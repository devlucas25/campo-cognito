import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { responses } = await req.json();
    
    if (!responses || !Array.isArray(responses)) {
      throw new Error('Invalid request: responses array is required');
    }

    const results = [];

    for (const responseData of responses) {
      try {
        // Validate required fields
        if (!responseData.survey_id || !responseData.consent_given) {
          throw new Error('Invalid response data: missing required fields');
        }

        // Insert response
        const { data: response, error: responseError } = await supabaseClient
          .from('responses')
          .insert({
            survey_id: responseData.survey_id,
            interviewer_id: responseData.interviewer_id,
            org_id: responseData.org_id,
            consent_given: responseData.consent_given,
            device_id: responseData.device_id,
            collected_at: responseData.collected_at,
            location: responseData.location,
            location_accuracy: responseData.location_accuracy,
            app_version: responseData.app_version,
            metadata: responseData.metadata || {}
          })
          .select()
          .single();

        if (responseError) throw responseError;

        // Insert answers if provided
        if (responseData.responses && Array.isArray(responseData.responses)) {
          const answers = responseData.responses.map((answer: any) => ({
            response_id: response.id,
            question_id: answer.question_id,
            value: answer.value
          }));

          const { error: answersError } = await supabaseClient
            .from('answers')
            .insert(answers);

          if (answersError) throw answersError;
        }

        results.push({ 
          status: 'success', 
          id: response.id,
          device_id: responseData.device_id
        });

      } catch (error) {
        console.error('Error processing response:', error);
        results.push({ 
          status: 'error', 
          error: error.message,
          device_id: responseData.device_id
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        synced: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});