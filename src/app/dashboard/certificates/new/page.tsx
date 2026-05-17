import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewCertificateForm from "@/components/dashboard/NewCertificateForm";

export default async function NewCertificatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Request a Certificate</h1>
      <NewCertificateForm />
    </div>
  );
}

