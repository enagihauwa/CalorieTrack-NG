import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-profile";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">
        {profile ? "Your profile" : "Set up your profile"}
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        {profile
          ? "Update your details — we'll recalculate your daily calorie target."
          : "Tell us a bit about yourself so we can calculate your daily calorie target."}
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
