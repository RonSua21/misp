import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { Megaphone, Calendar } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  const dbUser = await getMispUser();
  if (!dbUser || dbUser.role !== "SUPER_ADMIN") redirect("/admin");

  const db = createAdminClient();
  const { data: announcements } = await db
    .from("announcements")
    .select("id, title, content, imageUrl, isPublished, createdAt")
    .order("createdAt", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Public announcements shown on the landing page</p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        To add or edit announcements, use the <strong>Supabase Table Editor → announcements</strong> table directly.
      </div>

      {/* List */}
      <div className="space-y-4">
        {(announcements ?? []).length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            No announcements yet. Add them in the Supabase Table Editor.
          </div>
        ) : (
          (announcements ?? []).map((ann) => (
            <div key={ann.id} className="card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-makati-blue/10 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4 text-makati-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{ann.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(ann.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </div>
              </div>

              {ann.imageUrl && (
                <img
                  src={ann.imageUrl}
                  alt={ann.title}
                  className="mt-4 rounded-lg w-full max-h-48 object-cover"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
