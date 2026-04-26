"use client";

import { Sun, Moon, Monitor, User, Bell, HelpCircle, LogOut, ChevronRight, Shield, Loader2 } from "@/lib/icons";
import Image from "next/image";
import { useTheme } from "@/providers/theme";
import { useEffect, useState } from "react";
import { PageHeader }     from "@/components/elevo/shared/page-header";
import { ExamLoading }    from "@/components/elevo/shared/exam-loading";
import { useAuthStore }   from "@/store/auth.store";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { getDisplayName, getInitial } from "@/types/auth.types";

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">
        {title}
      </p>
      <div className="elevo-card elevo-card-border overflow-hidden divide-y divide-outline-variant/20">
        {children}
      </div>
    </div>
  );
}

/* ── Menu row ────────────────────────────────────────────────── */
function MenuRow({
  icon: Icon,
  label,
  sublabel,
  danger,
  onClick,
  right,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  danger?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-surface-container-high transition-colors text-left"
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? "bg-error/10" : "bg-primary/10"
      }`}>
        <Icon className={`w-4 h-4 ${danger ? "text-error" : "text-primary"}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold ${danger ? "text-error" : "text-on-surface"}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-[11px] text-on-surface-variant mt-0.5">{sublabel}</p>
        )}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 text-on-surface-variant/50 shrink-0" />}
    </button>
  );
}

/* ── Theme Switcher ──────────────────────────────────────────── */
const THEMES = [
  { key: "light" as const, label: "Kunduzgi", icon: Sun   },
  { key: "dark" as const,  label: "Tungi",    icon: Moon  },
] as const;

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 rounded-xl bg-surface-container-high animate-pulse mx-4 mb-3 mt-1" />;
  }

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex gap-2">
        {THEMES.map(({ key, label, icon: Icon }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-black transition-all ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const { isLoading } = useCurrentUser();
  const [showLoadingPreview, setShowLoadingPreview] = useState(false);

  const displayName = getDisplayName(user);
  const initial     = getInitial(user);
  const subtitle    = user?.telegram_username
    ? `@${user.telegram_username}`
    : user?.email ?? user?.telegram_phone ?? "";

  const statusLabel: Record<string, string> = {
    NEW: "Yangi", UNPAID: "Obuna yo'q", PAID: "Obunador",
  };

  // Show loading preview
  if (showLoadingPreview) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeader title="Loading Preview" icon={Loader2} />
        <ExamLoading />
        <button
          onClick={() => setShowLoadingPreview(false)}
          className="elevo-card elevo-card-border p-4 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
        >
          Yopish
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Profil" icon={User} />

      {/* ── User card ──────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {user?.photo ? (
            <Image
              src={user.photo}
              alt={displayName}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary/15 border-2 border-primary/25 rounded-full flex items-center justify-center">
              <span className="text-2xl font-black text-primary">{initial}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isLoading && !user ? (
            <div className="h-5 w-32 bg-surface-container-high rounded animate-pulse mb-1" />
          ) : (
            <h2 className="text-lg font-bold text-on-surface truncate">{displayName}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-on-surface-variant truncate">{subtitle}</p>
          )}
          {user?.status && (
            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {statusLabel[user.status] ?? user.status}
            </span>
          )}
        </div>
      </div>

      {/* ── Telegram info ──────────────────────────────────── */}
      {user?.telegram_id && (
        <Section title="Telegram">
          <div className="px-4 py-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-on-surface-variant">ID</span>
              <span className="text-[13px] font-mono font-semibold text-on-surface">{user.telegram_id}</span>
            </div>
            {user.telegram_username && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Username</span>
                <span className="text-[13px] font-semibold text-primary">@{user.telegram_username}</span>
              </div>
            )}
            {user.telegram_phone && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Telefon</span>
                <span className="text-[13px] font-semibold text-on-surface">{user.telegram_phone}</span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Sozlamalar ─────────────────────────────────────── */}
      <Section title="Sozlamalar">
        {/* Theme row header */}
        <div className="px-4 pt-3.5 pb-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <Sun className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <p className="text-[14px] font-semibold text-on-surface">Interfeys rejimi</p>
        </div>
        <ThemeSwitcher />

        <MenuRow icon={Bell}   label="Bildirishnomalar" sublabel="Push va ovozli xabarlar" />
        <MenuRow icon={Shield} label="Xavfsizlik"       sublabel="Parol va autentifikatsiya" />
      </Section>

      {/* ── Boshqa ─────────────────────────────────────────── */}
      <Section title="Boshqa">
        <MenuRow icon={HelpCircle} label="Yordam markazi" sublabel="FAQ va qo'llab-quvvatlash" />
        <MenuRow
          icon={Loader2}
          label="Loading State Preview"
          sublabel="Development uchun loading ko'rinishi"
          onClick={() => setShowLoadingPreview(true)}
        />
        <MenuRow
          icon={LogOut}
          label="Chiqish"
          danger
          onClick={logout}
          right={<span />}
        />
      </Section>
    </div>
  );
}
