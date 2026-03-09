import { supabase } from "./supabase";

/*
  logAudit — records an event to the audit_log table.
  
  Uses a SECURITY DEFINER RPC function to bypass RLS, since the
  audit_log table's INSERT policy can block client-side inserts
  when the user's JWT doesn't carry org membership claims.
  
  Falls back to direct insert if the RPC doesn't exist yet (e.g.
  migration hasn't run), and silently handles any errors — audit
  logging should never break the app.
  
  Usage:
    import { logAudit } from "../../lib/audit";
    await logAudit({
      action: "site.created",
      resourceType: "site",
      resourceId: site.id,
      description: "Added site example.com",
      metadata: { domain: "example.com" },
    });
*/

export async function logAudit({
  action,
  resourceType,
  resourceId,
  description,
  metadata,
}) {
  try {
    var {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // Try the RPC route first (SECURITY DEFINER, bypasses RLS)
    var { error: rpcError } = await supabase.rpc("log_audit_event", {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId || null,
      p_description: description || null,
      p_metadata: metadata || {},
    });

    if (!rpcError) return; // Success

    // RPC doesn't exist yet or failed — fall back to direct insert
    if (
      rpcError.code === "42883" || // function does not exist
      rpcError.message.indexOf("function") !== -1
    ) {
      console.log("[audit] RPC not available, falling back to direct insert");
    } else {
      console.log("[audit] RPC failed:", rpcError.message);
    }

    // Fallback: direct insert (may hit RLS issues on some orgs)
    var { data: mem } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", session.user.id)
      .limit(1)
      .single();

    if (!mem) return;

    var { error: insertError } = await supabase.from("audit_log").insert({
      org_id: mem.org_id,
      user_id: session.user.id,
      action: action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      description: description || null,
      metadata: metadata || {},
    });

    if (insertError) {
      // Silently log — don't surface to user
      console.log(
        "[audit] Insert failed (RLS?):",
        insertError.code,
        insertError.message
      );
    }
  } catch (err) {
    // Audit logging should never break the app
    console.log("[audit] Failed to log:", err);
  }
}

/*
  logAuditServer — for use inside edge functions with service role client.
  Pass the supabase client, org_id, and optionally user_id.
*/
export function logAuditServer(supabaseClient, orgId, userId, event) {
  return supabaseClient
    .from("audit_log")
    .insert({
      org_id: orgId,
      user_id: userId || null,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId || null,
      description: event.description || null,
      metadata: event.metadata || {},
      ip_address: event.ip || null,
    })
    .then(function () {})
    .catch(function (err) {
      console.log("[audit] Server log failed:", err);
    });
}
