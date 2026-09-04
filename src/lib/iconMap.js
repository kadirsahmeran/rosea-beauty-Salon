import {
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Leaf,
  Clock,
  Users,
  Award,
  Heart,
  Star,
  MessageCircle,
} from "lucide-react";
import { InstagramIcon, FacebookIcon } from "../components/SocialIcons";

// Supabase'de metin olarak saklanan ikon adlarını (ör. "shield-check")
// gerçek lucide-react bileşenlerine eşler.
const iconMap = {
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  "heart-handshake": HeartHandshake,
  leaf: Leaf,
  clock: Clock,
  users: Users,
  award: Award,
  heart: Heart,
  star: Star,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  whatsapp: MessageCircle,
};

export function getIcon(name) {
  return iconMap[name] ?? Sparkles;
}
