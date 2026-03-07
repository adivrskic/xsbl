import { supabase } from "./supabase";

/*
  logAudit — records an event to the audit_log table.
  
  Called from client components after mutations (site add/delete,
  issue status change, settings update, etc.) and from edge
  functions after server-side actions (scans, PRs, plan changes).
  
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

    // Get org_id from the user's membership
    var { data: mem } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", session.user.id)
      .limit(1)
      .single();

    if (!mem) return;

    await supabase.from("audit_log").insert({
      org_id: mem.org_id,
      user_id: session.user.id,
      action: action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      description: description || null,
      metadata: metadata || {},
    });
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
