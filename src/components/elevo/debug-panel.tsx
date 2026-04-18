"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/api/endpoints";
import { useAuthStore } from "@/store/auth.store";
import { getAccessToken } from "@/lib/api/client";

export function DebugPanel() {
  const [initData, setInitData] = useState<string>("Loading...");
  const [backendStatus, setBackendStatus] = useState<string>("Boshlanmadi");
  const [tgUser, setTgUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const appUser = useAuthStore(s => s.user);

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console.error
    const origError = console.error;
    console.error = (...args) => {
      setLogs(prev => [...prev, args.join(" ")].slice(-5));
      origError.apply(console, args);
    };

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      try {
        const tg = (window as typeof window & { Telegram?: any }).Telegram?.WebApp;
        if (tg?.initData) {
          setInitData(tg.initData.substring(0, 30) + "... (topildi)");
          if (tg.initDataUnsafe?.user) {
            setTgUser(tg.initDataUnsafe.user);
          }
          clearInterval(interval);
        } else if (attempts >= 10) {
          setInitData("Topilmadi (Telegram ichida emassiz yoki yuklanmadi)");
          clearInterval(interval);
        }
      } catch (e: any) {
        setInitData("Xatolik: " + e.message);
        clearInterval(interval);
      }
    }, 500);

    setHasToken(!!getAccessToken());

    return () => {
      clearInterval(interval);
      console.error = origError;
    };
  }, []);

  const pingBackend = async () => {
    setBackendStatus("Ulanilmoqda...");
    try {
      const res = await axios.get(`${API_BASE}/api/exams/`);
      setBackendStatus(`Ishlayapti (Status: ${res.status})`);
    } catch (err: any) {
      if (err.response) {
        setBackendStatus(`Backend ishladi, lekin xato qaytardi (Status: ${err.response.status}) - ${JSON.stringify(err.response.data)}`);
      } else {
        setBackendStatus(`Ulanib bo'lmadi! Xato: ${err.message}`);
      }
    }
  };

  return (
    <div className="mt-8 p-4 bg-surface-container rounded-xl border border-error/30 text-xs overflow-hidden break-words mb-20">
      <h3 className="font-bold text-error mb-2 text-sm uppercase">DEBUG PANEL (DEV)</h3>
      
      <div className="space-y-3">
        <div>
          <span className="font-bold">Backend API URL:</span>
          <code className="block bg-background p-2 rounded mt-1 select-all">{API_BASE}</code>
        </div>
        
        <div>
          <span className="font-bold">Telegram initData:</span>
          <code className="block bg-background p-2 rounded mt-1 text-warning">{initData}</code>
        </div>
        
        {tgUser && (
          <div>
            <span className="font-bold">Telegram User (Unsafe):</span>
            <code className="block bg-background p-2 rounded mt-1">{tgUser.first_name} (@{tgUser.username})</code>
          </div>
        )}

        <div>
          <span className="font-bold">App Login Holati:</span>
          <code className="block bg-background p-2 rounded mt-1 text-primary">
            {isAuthenticated ? `✅ Tizimga kirdi (${appUser?.full_name || appUser?.username})` : `❌ Hali kirmadi`}
            {hasToken === null ? "" : hasToken ? ` (Token bor)` : ` (Token yo'q)`}
          </code>
        </div>

        <div>
          <span className="font-bold">Backend Aloqa:</span>
          <code className="block bg-background p-2 rounded mt-1 text-primary">{backendStatus}</code>
          <button 
            onClick={pingBackend}
            className="mt-2 bg-primary/20 text-primary px-3 py-1 rounded font-bold"
          >
            Backendni tekshirish
          </button>
        </div>

        {logs.length > 0 && (
          <div className="mt-4 border-t border-error/30 pt-2">
            <span className="font-bold text-error">Console Xatoliklar:</span>
            <div className="bg-background p-2 rounded mt-1 text-error text-[10px] space-y-1">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
