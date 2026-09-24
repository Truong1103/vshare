"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { hoursToCredit, mapError } from "@/lib/utils";

async function requireUser() {
  const ctx = await getSessionUser();
  if (!ctx.user || !ctx.profile) return { error: "Bạn cần đăng nhập." as const, ...ctx };
  if (ctx.profile.is_banned) return { error: "Tài khoản đang bị khóa." as const, ...ctx };
  return { error: null as string | null, ...ctx };
}

export async function createSkill(formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) return { error: "Tiêu đề và mô tả là bắt buộc." };
  const { error, data } = await ctx.supabase
    .from("skill_posts")
    .insert({
      user_id: ctx.user!.id,
      title,
      description,
      category_id: String(formData.get("category_id") || "") || null,
      area: String(formData.get("area") || "") || null,
      mode: String(formData.get("mode") || "both"),
      availability: String(formData.get("availability") || "") || null,
      status: "active",
    })
    .select("id")
    .single();
  if (error) return { error: mapError(error.message) };
  revalidatePath("/ky-nang");
  redirect(`/ky-nang/${data.id}`);
}

export async function updateSkill(id: string, formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase
    .from("skill_posts")
    .update({
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      category_id: String(formData.get("category_id") || "") || null,
      area: String(formData.get("area") || "") || null,
      mode: String(formData.get("mode") || "both"),
      availability: String(formData.get("availability") || "") || null,
      status: String(formData.get("status") || "active"),
    })
    .eq("id", id)
    .eq("user_id", ctx.user!.id);
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/ky-nang/${id}`);
  return { ok: true };
}

export async function deleteSkill(id: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase
    .from("skill_posts")
    .update({ status: "deleted" })
    .eq("id", id)
    .eq("user_id", ctx.user!.id);
  if (error) return { error: mapError(error.message) };
  revalidatePath("/ky-nang");
  redirect("/ky-nang");
}

export async function createRequest(formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const hours = Number(formData.get("duration_hours") || 0);
  if (!title || !description) return { error: "Tiêu đề và mô tả là bắt buộc." };
  if (!hours || hours <= 0) return { error: "Thời lượng phải lớn hơn 0." };
  const credit = hoursToCredit(hours);
  if (Number(ctx.profile?.time_credit) < credit) {
    return { error: "Bạn không đủ Time Credit cho yêu cầu này." };
  }
  const { error, data } = await ctx.supabase
    .from("help_requests")
    .insert({
      user_id: ctx.user!.id,
      title,
      description,
      category_id: String(formData.get("category_id") || "") || null,
      area: String(formData.get("area") || "") || null,
      mode: String(formData.get("mode") || "both"),
      duration_hours: credit,
      time_credit: credit,
      desired_time: String(formData.get("desired_time") || "") || null,
      status: "open",
    })
    .select("id")
    .single();
  if (error) return { error: mapError(error.message) };
  revalidatePath("/yeu-cau");
  redirect(`/yeu-cau/${data.id}`);
}

export async function updateRequest(id: string, formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const hours = Number(formData.get("duration_hours") || 0);
  const credit = hoursToCredit(hours);
  const { error } = await ctx.supabase
    .from("help_requests")
    .update({
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      category_id: String(formData.get("category_id") || "") || null,
      area: String(formData.get("area") || "") || null,
      mode: String(formData.get("mode") || "both"),
      duration_hours: credit,
      time_credit: credit,
      desired_time: String(formData.get("desired_time") || "") || null,
      status: String(formData.get("status") || "open"),
    })
    .eq("id", id)
    .eq("user_id", ctx.user!.id);
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/yeu-cau/${id}`);
  return { ok: true };
}

export async function acceptRequest(requestId: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { data, error } = await ctx.supabase.rpc("accept_help_request", {
    p_request_id: requestId,
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/giao-dich");
  redirect(`/giao-dich/${data}`);
}

export async function requestFromSkill(skillId: string, formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const hours = Number(formData.get("hours") || 0);
  const note = String(formData.get("note") || "");
  const { data, error } = await ctx.supabase.rpc("request_from_skill", {
    p_skill_id: skillId,
    p_hours: hours,
    p_note: note,
  });
  if (error) return { error: mapError(error.message) };
  redirect(`/giao-dich/${data}`);
}

export async function helperAccept(txId: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.rpc("helper_accept_transaction", { p_tx: txId });
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/giao-dich/${txId}`);
  return { ok: true };
}

export async function startTx(txId: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.rpc("start_transaction", { p_tx: txId });
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/giao-dich/${txId}`);
  return { ok: true };
}

export async function cancelTx(txId: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.rpc("cancel_transaction", { p_tx: txId });
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/giao-dich/${txId}`);
  return { ok: true };
}

export async function confirmTx(txId: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.rpc("confirm_transaction", { p_tx: txId });
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/giao-dich/${txId}`);
  revalidatePath("/vi");
  return { ok: true };
}

export async function submitReview(txId: string, formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "");
  const { error } = await ctx.supabase.rpc("submit_review", {
    p_tx: txId,
    p_rating: rating,
    p_comment: comment,
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath(`/giao-dich/${txId}`);
  return { ok: true };
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Nhập nội dung tin nhắn." };
  const { error } = await ctx.supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: ctx.user!.id,
    body,
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/chat");
  revalidatePath("/", "layout");

  const { data: tx } = await ctx.supabase
    .from("transactions")
    .select("id, requester_id, helper_id")
    .eq("conversation_id", conversationId)
    .maybeSingle();
  if (tx) {
    const other = tx.requester_id === ctx.user!.id ? tx.helper_id : tx.requester_id;
    await ctx.supabase.from("notifications").insert({
      user_id: other,
      type: "message",
      title: "Tin nhắn mới",
      body: body.slice(0, 80),
      link: `/chat/${conversationId}`,
    });
  }
  return { ok: true };
}

export async function markNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  revalidatePath("/thong-bao");
}

export async function createReport(formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.from("reports").insert({
    reporter_id: ctx.user!.id,
    target_type: String(formData.get("target_type")),
    target_id: String(formData.get("target_id")),
    reason: String(formData.get("reason") || "").trim(),
  });
  if (error) return { error: mapError(error.message) };
  return { ok: true };
}

export async function adminSetUser(formData: FormData) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  if (ctx.profile.role !== "admin") return { error: "Không có quyền quản trị." };
  const { error } = await ctx.supabase.rpc("admin_set_user", {
    p_user: String(formData.get("user_id")),
    p_banned: String(formData.get("is_banned")) === "true",
    p_role: String(formData.get("role")),
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/admin/nguoi-dung");
  return { ok: true };
}

export async function adminSetListing(kind: string, id: string, status: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  if (ctx.profile.role !== "admin") return { error: "Không có quyền quản trị." };
  const { error } = await ctx.supabase.rpc("admin_set_listing", {
    p_kind: kind,
    p_id: id,
    p_status: status,
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminHideReview(id: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  if (ctx.profile.role !== "admin") return { error: "Không có quyền quản trị." };
  const { error } = await ctx.supabase.rpc("admin_hide_review", { p_id: id });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/admin/danh-gia");
  return { ok: true };
}

export async function adminResolveReport(id: string, status: string, note: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  if (ctx.profile.role !== "admin") return { error: "Không có quyền quản trị." };
  const { error } = await ctx.supabase
    .from("reports")
    .update({ status, admin_note: note })
    .eq("id", id);
  if (error) return { error: mapError(error.message) };
  revalidatePath("/admin/bao-cao");
  return { ok: true };
}

export async function redeemReward(slug: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.rpc("redeem_reward", { p_slug: slug });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/doi-qua");
  revalidatePath("/vi");
  revalidatePath("/bang-dieu-khien");
  return { ok: true };
}

export async function submitContact(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_contact", {
    p_name: String(formData.get("name") || ""),
    p_email: String(formData.get("email") || ""),
    p_body: String(formData.get("body") || ""),
  });
  if (error) return { error: mapError(error.message) };
  return { ok: true };
}

export async function adminSetRedemption(id: string, status: string, note: string) {
  const ctx = await requireUser();
  if (ctx.error) return { error: ctx.error };
  if (ctx.profile.role !== "admin") return { error: "Không có quyền quản trị." };
  const { error } = await ctx.supabase.rpc("admin_set_redemption", {
    p_id: id,
    p_status: status,
    p_note: note,
  });
  if (error) return { error: mapError(error.message) };
  revalidatePath("/admin/doi-qua");
  return { ok: true };
}
