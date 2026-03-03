import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  type: "cohort" | "library";
  cohort_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the caller is admin/facilitator
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "facilitator"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, cohort_id }: ExportRequest = await req.json();

    if (type === "cohort") {
      if (!cohort_id) {
        return new Response(JSON.stringify({ error: "cohort_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const exportData = await exportCohort(supabase, cohort_id);
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="cohort-export-${cohort_id}.json"`,
        },
      });
    } else if (type === "library") {
      const exportData = await exportLibrary(supabase);
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="full-library-export.json"`,
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function exportCohort(supabase: any, cohortId: string) {
  // 1. Get cohort metadata
  const { data: cohort, error: cohortErr } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", cohortId)
    .single();

  if (cohortErr) throw new Error(`Cohort not found: ${cohortErr.message}`);

  // 2. Get all cohort_content (day schedule + content links)
  const { data: cohortContent, error: ccErr } = await supabase
    .from("cohort_content")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });

  if (ccErr) throw new Error(`Content fetch error: ${ccErr.message}`);

  // 3. Collect unique content IDs by type
  const contentByType: Record<string, Set<string>> = {};
  for (const item of cohortContent || []) {
    if (item.content_id && item.content_type) {
      if (!contentByType[item.content_type]) {
        contentByType[item.content_type] = new Set();
      }
      contentByType[item.content_type].add(item.content_id);
    }
  }

  // 4. Fetch all linked content in parallel
  const resolvedContent: Record<string, any[]> = {};

  const contentTableMap: Record<string, string> = {
    module: "modules",
    article: "articles",
    resource: "resources",
    tool: "tools",
    prompt: "prompt_library",
    news: "news",
    learning_plan: "learning_plans",
  };

  const fetchPromises = Object.entries(contentByType).map(
    async ([contentType, ids]) => {
      const tableName = contentTableMap[contentType];
      if (!tableName) {
        console.warn(`Unknown content type: ${contentType}`);
        resolvedContent[contentType] = [];
        return;
      }

      const idArray = Array.from(ids);
      // Fetch in batches of 50 to avoid query size limits
      const batchSize = 50;
      const results: any[] = [];

      for (let i = 0; i < idArray.length; i += batchSize) {
        const batch = idArray.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .in("id", batch);

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
        } else if (data) {
          results.push(...data);
        }
      }

      resolvedContent[contentType] = results;
    }
  );

  await Promise.all(fetchPromises);

  // 5. Get cohort members (without sensitive data)
  const { data: members } = await supabase
    .from("cohort_members")
    .select("id, email, status, enrolled_at")
    .eq("cohort_id", cohortId);

  // 6. Build the export package
  return {
    _export_metadata: {
      export_type: "cohort",
      exported_at: new Date().toISOString(),
      version: "1.0",
      cohort_id: cohortId,
    },
    cohort: {
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status,
      image_url: cohort.image_url,
      video_url: cohort.video_url,
    },
    schedule: (cohortContent || []).map((item: any) => ({
      day_number: item.day_number,
      day_name: item.day_name,
      day_description: item.day_description,
      day_image_url: item.day_image_url,
      content_type: item.content_type,
      content_id: item.content_id,
      order_index: item.order_index,
    })),
    content: resolvedContent,
    members: members || [],
    stats: {
      total_days: new Set((cohortContent || []).map((c: any) => c.day_number)).size,
      total_content_items: (cohortContent || []).length,
      content_breakdown: Object.fromEntries(
        Object.entries(resolvedContent).map(([k, v]) => [k, v.length])
      ),
      total_members: (members || []).length,
    },
  };
}

async function exportLibrary(supabase: any) {
  // Fetch all content tables in parallel
  const [
    { data: modules },
    { data: articles },
    { data: resources },
    { data: tools },
    { data: prompts },
    { data: news },
    { data: learningPlans },
    { data: cohorts },
  ] = await Promise.all([
    supabase.from("modules").select("*").is("deleted_at", null),
    supabase.from("articles").select("*").is("deleted_at", null),
    supabase.from("resources").select("*").is("deleted_at", null),
    supabase.from("tools").select("*").is("deleted_at", null),
    supabase.from("prompt_library").select("*").is("deleted_at", null),
    supabase.from("news").select("*").is("deleted_at", null),
    supabase.from("learning_plans").select("*").is("deleted_at", null),
    supabase.from("cohorts").select("*").is("deleted_at", null),
  ]);

  // Get cohort content for all cohorts
  const { data: allCohortContent } = await supabase
    .from("cohort_content")
    .select("*")
    .order("cohort_id")
    .order("day_number")
    .order("order_index");

  return {
    _export_metadata: {
      export_type: "full_library",
      exported_at: new Date().toISOString(),
      version: "1.0",
    },
    modules: modules || [],
    articles: articles || [],
    resources: resources || [],
    tools: tools || [],
    prompts: prompts || [],
    news: news || [],
    learning_plans: learningPlans || [],
    cohorts: (cohorts || []).map((c: any) => ({
      ...c,
      schedule: (allCohortContent || []).filter(
        (cc: any) => cc.cohort_id === c.id
      ),
    })),
    stats: {
      total_modules: (modules || []).length,
      total_articles: (articles || []).length,
      total_resources: (resources || []).length,
      total_tools: (tools || []).length,
      total_prompts: (prompts || []).length,
      total_news: (news || []).length,
      total_learning_plans: (learningPlans || []).length,
      total_cohorts: (cohorts || []).length,
    },
  };
}
