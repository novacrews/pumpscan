import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">404</h1>
        <p className="text-sm text-gray-400 mb-6">Page not found</p>
        <Link href="/" className="px-4 py-2 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 rounded-lg text-xs hover:bg-accent-cyan/20 transition-colors">
          ← Back to Scanner
        </Link>
      </div>
    </div>
  );
}
