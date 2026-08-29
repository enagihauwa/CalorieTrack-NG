export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-lg font-semibold tracking-tight">
          CalorieTrack <span className="text-emerald-600">NG</span>
        </div>
        {children}
      </div>
    </div>
  );
}
