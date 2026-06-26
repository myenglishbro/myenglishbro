import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}", "./app/**/*.{ts,tsx,js,jsx}", "./src/**/*.{ts,tsx,js,jsx}"],
  // Word Survivor shop "frame" cosmetics store their ring classes as data in
  // word_survivor_shop_items.value, so they never appear in scanned source —
  // safelist them explicitly or Tailwind purges them and the frames render invisibly.
  safelist: [
    "ring-2",
    "ring-4",
    "ring-slate-300",
    "ring-sky-400",
    "ring-emerald-400",
    "ring-violet-400",
    "ring-amber-400",
    "ring-fuchsia-400",
    "shadow-[0_0_20px_6px_rgba(217,70,239,0.5)]",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          soft: "hsl(var(--background-soft))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          soft: "hsl(var(--secondary-soft))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          sky: "hsl(var(--accent-sky))",
          foreground: "hsl(var(--accent-foreground))",
        },
        /* Dashboard Light Theme Colors */
        "dashboard-bg": "hsl(var(--dashboard-bg))",
        "dashboard-sidebar": "hsl(var(--dashboard-sidebar))",
        "dashboard-card": "hsl(var(--dashboard-card))",
        "dashboard-chip": "hsl(var(--dashboard-chip))",
        "dashboard-input": "hsl(var(--dashboard-input))",
        "dashboard-text": "hsl(var(--dashboard-text-primary))",
        "dashboard-muted": "hsl(var(--dashboard-text-muted))",
        "dashboard-accent-primary": "hsl(var(--dashboard-accent-primary))",
        "dashboard-accent-secondary": "hsl(var(--dashboard-accent-secondary))",
        "dashboard-accent-amber": "hsl(var(--dashboard-accent-amber))",
        "dashboard-accent-sky": "hsl(var(--dashboard-accent-sky))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Education Academy Colors */
        "education-primary": "hsl(207 79% 28%)",
        "education-secondary": "hsl(180 68% 39%)",
        "education-light": "hsl(210 20% 98%)",
        "certification-gold": "hsl(38 92% 50%)",
        "certification-light": "hsl(38 92% 97%)",
        "landing-light": "hsl(210 20% 98%)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px) rotate(-2deg)" },
          "40%": { transform: "translateX(6px) rotate(2deg)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(0.9)", opacity: "1" },
          "30%": { transform: "translateY(-10px) scale(1.1)", opacity: "1" },
          "100%": { transform: "translateY(-48px) scale(1)", opacity: "0" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "60%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,102,241,0.55)" },
          "50%": { boxShadow: "0 0 0 12px rgba(99,102,241,0)" },
        },
        "idle-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(-1.5deg)" },
        },
        "defeat-burst": {
          "0%": { transform: "scale(1) rotate(0deg)", opacity: "1", filter: "brightness(1)" },
          "40%": { transform: "scale(1.3) rotate(8deg)", opacity: "1", filter: "brightness(2)" },
          "100%": { transform: "scale(0.2) rotate(25deg)", opacity: "0", filter: "brightness(2)" },
        },
        "boss-entrance": {
          "0%": { transform: "scale(0.3) translateY(40px)", opacity: "0" },
          "60%": { transform: "scale(1.15) translateY(-6px)", opacity: "1" },
          "80%": { transform: "scale(0.96) translateY(0)" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "toast-slide": {
          "0%": { transform: "translateY(-16px) scale(0.95)", opacity: "0" },
          "15%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "85%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-16px) scale(0.95)", opacity: "0" },
        },
        "level-up-burst": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "50%": { transform: "scale(1.25)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "screen-flash": {
          "0%": { opacity: "0.55" },
          "100%": { opacity: "0" },
        },
        "combo-punch": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "tower-breathe": {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.04)", filter: "brightness(1.15)" },
        },
        "treasure-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in": "slide-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        "float-up": "float-up 0.9s ease-out forwards",
        "pop-in": "pop-in 0.35s ease-out",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        "idle-bob": "idle-bob 2.8s ease-in-out infinite",
        "defeat-burst": "defeat-burst 0.6s ease-in forwards",
        "boss-entrance": "boss-entrance 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "toast-slide": "toast-slide 1.8s ease-in-out forwards",
        "level-up-burst": "level-up-burst 1s ease-out forwards",
        "screen-flash": "screen-flash 0.35s ease-out forwards",
        "combo-punch": "combo-punch 0.3s ease-out",
        "tower-breathe": "tower-breathe 3.5s ease-in-out infinite",
        "treasure-shimmer": "treasure-shimmer 2.5s ease-in-out infinite",
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'primary': '0 10px 30px -10px hsl(207 79% 28% / 0.3)',
        'secondary': '0 10px 30px -10px hsl(180 68% 39% / 0.3)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;