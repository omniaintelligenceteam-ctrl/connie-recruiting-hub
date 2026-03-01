import { MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AIFloatingButton() {
  const location = useLocation();

  if (location.pathname === '/ai') {
    return null;
  }

  return (
    <Link
      to="/ai"
      className="fixed right-4 bottom-20 z-40 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 md:bottom-6"
      aria-label="Open AI assistant"
    >
      <MessageCircle size={24} />
    </Link>
  );
}
