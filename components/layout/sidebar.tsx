
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PiggyBank, 
  ArrowUpDown, 
  TrendingUp, 
  FileText,
  CreditCard,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Depósito', href: '/deposit', icon: PiggyBank },
  { name: 'Saque', href: '/withdraw', icon: Wallet },
  { name: 'Transferência', href: '/transfer', icon: ArrowUpDown },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp },
  { name: 'Relatórios', href: '/reports', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-[#F18805] text-white"
                        : "text-[#333533] hover:bg-[#CFDBD5] hover:text-[#333533]"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <item.icon 
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive ? "text-white" : "text-[#F18805]"
                      )} 
                    />
                    <span className="lg:block">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};
