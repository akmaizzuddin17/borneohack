import { MessageSquare, ListChecks, FileText, Home as HomeIcon, BadgeCheck, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../lib/LanguageContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useLang();

  const links = [
    { to: '/',            icon: <HomeIcon className="h-5 w-5" />,      label: t.navHome      },
    { to: '/qna',         icon: <MessageSquare className="h-5 w-5" />, label: t.navAsk       },
    { to: '/checklist',   icon: <ListChecks className="h-5 w-5" />,    label: t.navChecklist },
    { to: '/countries',   icon: <MapPin className="h-5 w-5" />,        label: t.navCountries },
    { to: '/form-d',      icon: <BadgeCheck className="h-5 w-5" />,    label: t.navFormD     },
    { to: '/translation', icon: <FileText className="h-5 w-5" />,      label: t.navLetter    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-center border-t border-[#1B433219] bg-white px-1 pb-2 pt-2 shadow-[0_-4px_20px_#0000000D] dark:bg-slate-900 dark:border-slate-800">
      <div className="flex w-full max-w-[600px] items-center justify-between px-2">
        {links.map(({ to, icon, label }) => (
          <Link key={to} to={to} className="group flex flex-col items-center gap-0.5 min-w-[50px]">
            <div className={`flex items-center justify-center rounded-xl p-2 transition-all ${pathname === to ? 'bg-primary/15 text-primary' : 'text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
              {icon}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-[0.5px] transition-colors ${pathname === to ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
