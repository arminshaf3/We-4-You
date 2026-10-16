import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const vercel = /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
  const listed = ALLOWED_ORIGINS.includes(origin);
  const allow = origin && (local || vercel || listed) ? origin : ALLOWED_ORIGINS[0] || 'https://we-4-you.vercel.app';

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

export async function requireStaff(
  req: Request,
  service: SupabaseClient,
  allowedRoles: Array<'admin' | 'support'>,
): Promise<{ ok: true; userId: string; role: string } | { ok: false; response: Response }> {
  const headers = corsHeaders(req);
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }),
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }),
    };
  }

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  const role = profile?.role as string | undefined;
  if (!role || !allowedRoles.includes(role as 'admin' | 'support')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Staff access required' }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }),
    };
  }

  return { ok: true, userId: userData.user.id, role };
}
