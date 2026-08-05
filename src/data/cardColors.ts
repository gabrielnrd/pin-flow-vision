export interface CardColorOption {
  id: string;
  label: string;
  /** Tailwind gradient classes for the physical card */
  gradient: string;
  /** Foreground text color class */
  text: string;
  /** Progress bar indicator class */
  progress: string;
  /** Glow utility class defined in index.css */
  glow: string;
  /** Hex used for swatches / charts */
  hex: string;
  group: "banco" | "pantone";
}

export const CARD_COLORS: CardColorOption[] = [
  // Bancos
  { id: "bank-nubank", label: "Nubank", gradient: "from-[hsl(280,97%,38%)] to-[hsl(300,80%,25%)]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-nubank", hex: "#8A05BE", group: "banco" },
  { id: "bank-inter", label: "Inter", gradient: "from-[hsl(27,100%,50%)] to-[hsl(15,90%,40%)]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-inter", hex: "#FF7A00", group: "banco" },
  { id: "bank-c6", label: "C6 Bank", gradient: "from-[hsl(220,10%,20%)] to-[hsl(220,15%,12%)]", text: "text-gray-300", progress: "[&>div]:bg-white/60", glow: "glow-c6", hex: "#2C2C2E", group: "banco" },
  { id: "bank-itau", label: "Itaú", gradient: "from-[#F88104] to-[hsl(25,90%,35%)]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-itau", hex: "#EC7000", group: "banco" },
  { id: "bank-bb", label: "Banco do Brasil", gradient: "from-[hsl(45,100%,45%)] to-[hsl(45,80%,30%)]", text: "text-gray-900", progress: "[&>div]:bg-gray-900/60", glow: "glow-bb", hex: "#FFCD00", group: "banco" },
  { id: "bank-other", label: "Outro", gradient: "from-[hsl(190,65%,31%)] to-[hsl(190,70%,22%)]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-other", hex: "#1C7F8C", group: "banco" },

  // Pantone
  { id: "pantone-classic-blue", label: "Classic Blue 19-4052", gradient: "from-[#0F4C81] to-[#082e4f]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-classic-blue", hex: "#0F4C81", group: "pantone" },
  { id: "pantone-viva-magenta", label: "Viva Magenta 18-1750", gradient: "from-[#BB2649] to-[#6d1329]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-viva-magenta", hex: "#BB2649", group: "pantone" },
  { id: "pantone-ultra-violet", label: "Ultra Violet 18-3838", gradient: "from-[#5F4B8B] to-[#332750]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-ultra-violet", hex: "#5F4B8B", group: "pantone" },
  { id: "pantone-emerald", label: "Emerald 17-5641", gradient: "from-[#009874] to-[#00543f]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-emerald", hex: "#009874", group: "pantone" },
  { id: "pantone-living-coral", label: "Living Coral 16-1546", gradient: "from-[#FF6F61] to-[#c23a2e]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-living-coral", hex: "#FF6F61", group: "pantone" },
  { id: "pantone-greenery", label: "Greenery 15-0343", gradient: "from-[#88B04B] to-[#4d6626]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-greenery", hex: "#88B04B", group: "pantone" },
  { id: "pantone-marsala", label: "Marsala 18-1438", gradient: "from-[#955251] to-[#552b2b]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-marsala", hex: "#955251", group: "pantone" },
  { id: "pantone-mocha-mousse", label: "Mocha Mousse 17-1230", gradient: "from-[#A47864] to-[#5f4337]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-mocha-mousse", hex: "#A47864", group: "pantone" },
  { id: "pantone-very-peri", label: "Very Peri 17-3938", gradient: "from-[#6667AB] to-[#393a68]", text: "text-white", progress: "[&>div]:bg-white/80", glow: "glow-pantone-very-peri", hex: "#6667AB", group: "pantone" },
  { id: "pantone-peach-fuzz", label: "Peach Fuzz 13-1023", gradient: "from-[#FFBE98] to-[#d1815a]", text: "text-gray-900", progress: "[&>div]:bg-gray-900/50", glow: "glow-pantone-peach-fuzz", hex: "#FFBE98", group: "pantone" },
  { id: "pantone-graphite", label: "Graphite 18-0201", gradient: "from-[#3B3B3B] to-[#151515]", text: "text-gray-200", progress: "[&>div]:bg-white/60", glow: "glow-pantone-graphite", hex: "#3B3B3B", group: "pantone" },
];

export const getCardColor = (id: string): CardColorOption =>
  CARD_COLORS.find((c) => c.id === id) || CARD_COLORS[0];
