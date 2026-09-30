import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  const email = process.argv[2] || process.env.GMAIL_USER || "admin@sbg.tulas.edu.in";
  const password = process.argv[3] || "Admin@SBG2026!";

  console.log(`Creating / confirming admin user: ${email}...`);

  // Check if user already exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`User ${email} already exists. Updating password...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Failed to update user:", updateError.message);
      process.exit(1);
    }
    console.log(`✅ Admin password successfully updated for: ${email}`);
    console.log(`Credentials:\nEmail: ${email}\nPassword: ${password}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm email so no verification link is needed
    user_metadata: { role: "admin", name: "AWS SBG Admin" },
  });

  if (error) {
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  console.log(`✅ Admin user successfully created!`);
  console.log(`----------------------------------------`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`----------------------------------------`);
}

createAdmin();
