import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Dark theme color palette
        'primary-bg': '#0D0D0D',      // Almost black primary background
        'secondary-bg': '#1A1A1A',    // Dark grey for cards/containers
        'accent-primary': '#FFC107',   // Mustard yellow for highlights/buttons
        'accent-secondary': '#E5D5B5', // Warm beige for headings
        'accent-brown': '#5A3825',     // Rich brown for hovers/borders
        'text-primary': '#F5F5F5',     // Off-white for body text
        'text-secondary': '#CFCFCF',   // Muted grey for less emphasis
        'text-highlight': '#FFC107',   // Mustard yellow for highlights
        
        // Extended dark theme palette
        palette: {
          'bg-primary': '#0D0D0D',     // Almost black
          'bg-secondary': '#1A1A1A',   // Dark grey
          'accent-1': '#FFC107',       // Mustard yellow
          'accent-2': '#E5D5B5',       // Warm beige
          'accent-3': '#5A3825',       // Rich brown
          'text-1': '#F5F5F5',         // Off-white
          'text-2': '#CFCFCF',         // Muted grey
        },
        
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        shadcn: {
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;