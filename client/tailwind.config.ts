import { cartridgeTWPreset } from "@cartridge/ui/preset";
import { Config } from "tailwindcss";

const config = {
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
  theme: {
    screens: {
      // https://v3.tailwindcss.com/docs/responsive-design#customizing-your-theme
      lg: "1160px",
    },
    extend: {
      width: {
        desktop: "432px",
      },
      height: {
        desktop: "600px",
      },
    },
  },
} satisfies Config;

export default config;
