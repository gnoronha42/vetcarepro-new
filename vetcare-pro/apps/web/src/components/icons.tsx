import {
  LayoutDashboard, PawPrint, Users, Calendar, Brain, Bell, CreditCard,
  Package, Wallet, Clock, Menu, LogOut, X, MessageCircle, Send, Sparkles,
  Search, ChevronRight, Activity, Plus, Minus, Trash2, Check, Pencil,
  ArrowRight, ArrowLeft, Thermometer, Scale, Tag, User, Cat, Dog, Bird,
  Stethoscope, type LucideProps,
} from 'lucide-react';

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  logo: Stethoscope,
  dashboard: LayoutDashboard,
  patients: PawPrint,
  tutors: Users,
  calendar: Calendar,
  brain: Brain,
  bell: Bell,
  billing: CreditCard,
  inventory: Package,
  money: Wallet,
  clock: Clock,
  menu: Menu,
  logout: LogOut,
  close: X,
  chat: MessageCircle,
  send: Send,
  sparkles: Sparkles,
  search: Search,
  chevron: ChevronRight,
  activity: Activity,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  check: Check,
  edit: Pencil,
  arrowRight: ArrowRight,
  back: ArrowLeft,
  thermometer: Thermometer,
  weight: Scale,
  tag: Tag,
  user: User,
  cat: Cat,
  dog: Dog,
  bird: Bird,
};

export function Icon({ name, size = 20, ...props }: LucideProps & { name: string }) {
  const Cmp = MAP[name] ?? LayoutDashboard;
  return <Cmp size={size} strokeWidth={1.75} {...props} />;
}
