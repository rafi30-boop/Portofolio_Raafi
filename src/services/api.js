// src/services/api.js
import { supabase } from "./supabase";

let certificatesCache = null;
let projectsCache = null;

// ─── Certificates ───────────────────────────────────────────
export const certificatesAPI = {
  getAll: async () => {
    console.log("🔵 [API] certificatesAPI.getAll() dipanggil");

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("issue_date", { ascending: false });

      if (error) {
        console.error("❌ [API] Supabase error:", error);
        throw error;
      }

      console.log("✅ [API] Data dari Supabase:", data?.length || 0, "items");
      return data || [];
    } catch (err) {
      console.error("❌ [API] Catch error:", err);
      throw err;
    }
  },

  // ✅ Tambahkan method getById untuk Certificate Detail
  getById: async (id) => {
    console.log("🔵 [API] certificatesAPI.getById() dipanggil untuk id:", id);

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("❌ [API] Supabase error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Certificate not found");
      }

      console.log("✅ [API] Data certificate:", data);
      return data;
    } catch (err) {
      console.error("❌ [API] Catch error:", err);
      throw err;
    }
  },

  create: async (certificateData) => {
    certificatesCache = null;
    const { data, error } = await supabase
      .from("certificates")
      .insert([certificateData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, certificateData) => {
    certificatesCache = null;
    const { data, error } = await supabase
      .from("certificates")
      .update(certificateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    certificatesCache = null;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) throw error;
  },

  uploadImage: async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("certificates")
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);
    return data.publicUrl;
  },
};

// ─── Projects ────────────────────────────────────────────────
export const projectsAPI = {
  getAll: async (forceRefresh = false) => {
    if (projectsCache && !forceRefresh) {
      return projectsCache;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    projectsCache = data;
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  create: async (projectData) => {
    projectsCache = null;
    const { data, error } = await supabase
      .from("projects")
      .insert([projectData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, projectData) => {
    projectsCache = null;
    const { data, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    projectsCache = null;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  uploadImage: async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("projects")
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("projects").getPublicUrl(fileName);
    return data.publicUrl;
  },
};

// ─── Messages ────────────────────────────────────────────────
export const messagesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (messageData) => {
    console.log("📤 [API] Creating message:", messageData);

    // Pastikan data yang dikirim sesuai
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          name: messageData.name,
          email: messageData.email,
          subject: messageData.subject || "",
          message: messageData.message,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("❌ [API] Supabase error:", error);
      throw error;
    }

    console.log("✅ [API] Message created:", data);
    return data?.[0] || null;
  },

  markAsRead: async (id) => {
    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Profile ─────────────────────────────────────────────────
export const profileAPI = {
  getProfile: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const defaultProfile = {
          id: user.id,
          full_name:
            user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          bio: "",
          title: "",
          photo_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([defaultProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }

      return data;
    } catch (error) {
      console.error("Error in getProfile:", error);
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          title: profileData.title,
          photo_url: profileData.photo_url,
          updated_at: new Date(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
};
