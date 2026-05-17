import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookAppointmentForm from "@/components/dashboard/BookAppointmentForm";

export default async function NewAppointmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Book an Appointment</h1>
      <BookAppointmentForm />
    </div>
  );
}

