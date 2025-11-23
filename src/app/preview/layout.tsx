export default function Layout({ children }: { children: React.ReactNode }) {
  // full screen, with elements centered in the page
  return (
    <div className="p-4 flex items-center justify-center min-h-screen bg-gray-400">
      {children}
    </div>
  );
}
