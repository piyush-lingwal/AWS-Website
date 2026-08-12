"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface SuggestEventInput {
  name: string;
  email: string;
  title: string;
  category: string;
  description: string;
}

export async function submitEventSuggestion(data: SuggestEventInput) {
  const { name, email, title, category, description } = data;

  // 1. Basic validation
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Please enter your name." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!title || title.trim().length < 3) {
    return { success: false, error: "Please provide an event topic or title." };
  }

  if (!description || description.trim().length < 10) {
    return { success: false, error: "Please provide a description (at least 10 characters)." };
  }

  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: "Database admin client is not configured.",
      };
    }

    // 2. Insert into Supabase table 'event_suggestions'
    const { error } = await supabaseAdmin
      .from("event_suggestions")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          title: title.trim(),
          category: category || "workshop",
          description: description.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("[SuggestEvent] Supabase insert error:", error);
      // If table doesn't exist yet, we still provide clear response
      if (error.code === "42P01") {
        return {
          success: false,
          error: "Database table 'event_suggestions' is not initialized. Please set up the table in Supabase.",
        };
      }
      return {
        success: false,
        error: error.message || "Failed to save suggestion to database.",
      };
    }

    return {
      success: true,
      message: "Thank you! Your event suggestion has been submitted successfully.",
    };
  } catch (err) {
    console.error("[SuggestEvent] Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
