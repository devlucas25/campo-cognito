import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Point-in-polygon algorithm
function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
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

    const { lat, lng, assignment_id, accuracy } = await req.json();
    
    if (!lat || !lng || !assignment_id) {
      throw new Error('Missing required parameters: lat, lng, assignment_id');
    }

    // Fetch assignment with target area
    const { data: assignment, error } = await supabaseClient
      .from('assignments')
      .select('target_area, assigned_neighborhoods')
      .eq('id', assignment_id)
      .single();

    if (error) {
      throw new Error(`Assignment not found: ${error.message}`);
    }

    let isValidLocation = true;
    let validationMessage = 'Localização válida';

    // Check if assignment has geographic constraints
    if (assignment.target_area && assignment.target_area.coordinates) {
      const coordinates = assignment.target_area.coordinates[0]; // Assuming first polygon
      isValidLocation = pointInPolygon([lng, lat], coordinates);
      
      if (!isValidLocation) {
        validationMessage = 'Você está fora da área designada para esta pesquisa';
      }
    }

    // Check GPS accuracy
    const accuracyThreshold = 50; // meters
    const hasGoodAccuracy = accuracy ? accuracy <= accuracyThreshold : false;

    if (!hasGoodAccuracy) {
      validationMessage = accuracy 
        ? `GPS impreciso (±${Math.round(accuracy)}m). Mova-se para área aberta.`
        : 'Precisão do GPS não disponível';
    }

    return new Response(
      JSON.stringify({
        valid: isValidLocation && hasGoodAccuracy,
        location_valid: isValidLocation,
        accuracy_valid: hasGoodAccuracy,
        accuracy_threshold: accuracyThreshold,
        current_accuracy: accuracy,
        message: validationMessage,
        assigned_area: assignment.target_area ? 'defined' : 'any',
        neighborhoods: assignment.assigned_neighborhoods || []
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Location validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false,
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