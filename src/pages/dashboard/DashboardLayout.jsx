import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Globe,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Menu,
  LogOut,
  Home,
  BookOpen,
  Mail,
  MessageSquare,
  X,
  Send,
  Bug,
  Lightbulb,
  Heart,
  Sparkles,
  Shield,
  Package,
  Code,
} from "lucide-react";
import XsblBull from "../../components/landing/XsblBull";
import HelpSearch from "../../components/ui/HelpSearch";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Sites", path: "/dashboard/sites", icon: Globe },
  { label: "Element Tester", path: "/dashboard/tester", icon: Code },
  {
    label: "Audit Log",
    path: "/dashboard/audit-log",
    icon: Shield,
    plans: ["agency"],
    hideForClient: true,
  },
  {
    label: "Evidence Export",
    path: "/dashboard/evidence",
    icon: Package,
    plans: ["agency"],
    hideForClient: true,
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    hideForClient: true,
  },
  {
    label: "Billing",
    path: "/dashboard/billing",
    icon: CreditCard,
    hideForClient: true,
    ownerOnly: true,
  },
];

/* ââ Feedback Modal ââ */
function FeedbackModal({ onClose, t, user }) {
  var [type, setType] = useState("suggestion");
  var [message, setMessage] = useState("");
  var [sending, setSending] = useState(false);
  var [sent, setSent] = useState(false);

  var handleSubmit = async function () {
    if (!message.trim()) return;
    setSending(true);
    try {
      await supabase.from("feedback").insert({
        user_id: user?.id || null,
        email: user?.email || null,
        type: type,
        message: message.trim(),
        page_url: window.location.href,
      });

      /* Also email the feedback to