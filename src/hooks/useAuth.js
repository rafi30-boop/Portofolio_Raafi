// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fungsi untuk membuat profile otomatis
  const createProfileIfNotExists = async (user) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    // Jika profile belum ada, buat baru
    if (!data) {
      const defaultProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        bio: "",
        title: "",
        photo_url: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([defaultProfile]);
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
      } else {
        console.log("Profile created for user:", user.id);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
      
      // ✅ Buat profile jika perlu
      if (currentUser) {
        await createProfileIfNotExists(currentUser);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
      
      // ✅ Buat profile jika perlu
      if (currentUser) {
        await createProfileIfNotExists(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // ✅ Buat profile setelah login
    if (data.user) {
      await createProfileIfNotExists(data.user);
    }
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const register = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    
    // ✅ Profile akan dibuat otomatis oleh trigger atau saat login pertama
    return data;
  };

  return { user, loading, login, logout, register };
};