export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* border-[--text] was v3 syntax for a token that doesn't exist, so the
          spinner had no visible colour. */}
      <div className="size-16 animate-spin rounded-full border-4 border-border border-t-brand"></div>
    </div>
  );
}
