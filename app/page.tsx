"use client";

import { useState, useCallback } from "react";
import { Desktop } from "@/components/desktop/Desktop";
import { BootScreen } from "@/components/boot/BootScreen";
import { LockScreen } from "@/components/desktop/LockScreen";
import { useSettingsStore } from "@/store/settings";
import { playUnlockSound } from "@/lib/sound";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const { locked, unlockScreen } = useSettingsStore();

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleUnlock = useCallback(() => {
    playUnlockSound();
    unlockScreen();
  }, [unlockScreen]);

  return (
    <>
      <Desktop />
      {booted && locked && <LockScreen onUnlock={handleUnlock} />}
      {!booted && <BootScreen onBootComplete={handleBootComplete} />}
    </>
  );
}
