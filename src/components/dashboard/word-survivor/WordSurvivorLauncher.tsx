import { useState } from "react";
import { Swords } from "lucide-react";
import { WordSurvivorGame } from "./WordSurvivorGame";

export const WordSurvivorLauncher = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 mt-4"
      >
        <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Swords className="h-5 w-5" />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-bold">🎮 Word Survivor</span>
          <span className="block text-xs text-white/80">Practica inglés en un minijuego de 3-4 min</span>
        </span>
      </button>

      <WordSurvivorGame open={open} onOpenChange={setOpen} />
    </>
  );
};
