"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapError } from "@/lib/utils";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  if (!email || !password || password.length < 8) {
    return { error: "Email và mật khẩu (tối thiểu 8 ký tự) là bắt buộc." };
  }
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/bang-dieu-khien");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email hoặc mật khẩu không đúng." };
  redirect(next.startsWith("/") ? next : "/bang-dieu-khien");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Vui lòng nhập email." };
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dat-lai-mat-khau`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "Mật khẩu tối thiểu 8 ký tự." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/bang-dieu-khien");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: oauthMessage(error.message) };
  if (data.url) redirect(data.url);
  return { error: "Không khởi tạo được Google đăng nhập." };
}

function oauthMessage(message: string) {
  const text = message.toLowerCase();
  if (
    text.includes("provider is not enabled") ||
    text.includes("unsupported provider") ||
    text.includes("validation_failed")
  ) {
    return "Đăng nhập Google chưa được bật trên hệ thống. Hãy dùng email và mật khẩu, hoặc bật Google trong Supabase → Authentication → Providers.";
  }
  if (message.startsWith("{") && message.includes("msg")) {
    try {
      const parsed = JSON.parse(message) as { msg?: string };
      if (parsed.msg) return oauthMessage(parsed.msg);
    } catch {
      /* keep original */
    }
  }
  return "Không đăng nhập được bằng Google. Vui lòng thử lại hoặc dùng email.";
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const skills = String(formData.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    full_name: String(formData.get("full_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    bio: String(formData.get("bio") || "").trim() || null,
    area: String(formData.get("area") || "").trim() || null,
    availability: String(formData.get("availability") || "").trim() || null,
    skills,
  };
  if (!payload.full_name) return { error: "Họ tên không được để trống." };

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
  if (error) return { error: mapError(error.message) };
  revalidatePath("/ho-so");
  revalidatePath("/cai-dat");
  return { ok: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Chọn một ảnh đại diện." };
  if (file.size > 3 * 1024 * 1024) return { error: "Ảnh tối đa 3MB." };
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
  revalidatePath("/ho-so");
  return { ok: true };
}
