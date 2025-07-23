import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@1.1.0";

serve(async (req) => {
  const { name, email, subject, message, replyBody } = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    const { data, error } = await resend.emails.send({
      from: Deno.env.get("MESSAGE_SENDER_EMAIL") || "onboarding@resend.dev",
      to: email,
      subject: `Re: ${subject}`,
      html: `
        <p>Dear ${name},</p>
        <p>${replyBody}</p>
        <br/>
        <p>--- Original Message ---</p>
        <p>From: ${name} (${email})</p>
        <p>Subject: ${subject}</p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
