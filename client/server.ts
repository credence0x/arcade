import express, { Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import satori from "satori";
import sharp from "sharp";
import React from "react"; // Needed for JSX transformation

import { HelmetData } from "react-helmet-async";
// Import the template component (adjust path as needed)
import OgImageTemplate from "./src/components/OgImageTemplate.tsx";

const isProduction = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : await fs.readFile(path.resolve(__dirname, "./index.html"), "utf-8");

// --- Font Loading --- TODO: Replace with your actual font path
// Make sure to have a font file (e.g., Inter-Regular.ttf) accessible
const fontPath = path.resolve(__dirname, "./assets/Inter-Regular.ttf"); // ADJUST THIS PATH
let fontData: Buffer | null = null;
try {
  fontData = await fs.readFile(fontPath);
} catch (error) {
  console.error(`Error loading font from ${fontPath}:`, error);
  console.error(
    "Ensure the font file exists. You might need to create an /assets folder."
  );
  // Handle font loading failure appropriately (e.g., exit or use fallback)
}
// ---------------------

// --- Mock Data Fetching --- TODO: Replace with actual data fetching
async function getOgData(type, id) {
  console.log(`Fetching data for type: ${type}, id: ${id}`);
  // Replace with your actual database or API calls
  if (type === "game") {
    return {
      title: `Game: ${id.replace("-", " ")}`, // Example title
      description: "This is an amazing game available on Arcade. Play now!",
      imageUrl: "/cover.png", // Default image, fetch actual one based on id
      type: "game",
    };
  } else if (type === "player") {
    return {
      title: `Player: ${id.substring(0, 6)}...`, // Example title
      description:
        "Check out this player's profile and achievements on Arcade.",
      imageUrl: "/favicon.svg", // Default image, fetch actual avatar
      type: "player",
    };
  }
  return {
    title: "Arcade Platform",
    description: "Discover amazing onchain games and players.",
    imageUrl: "/cover.png",
    type: "default",
  };
}
// -------------------------

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    root: path.resolve(__dirname, ".."),
    // Ensure Vite's alias works during SSR for component imports
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });

  app.use(vite.middlewares);

  // --- OG Image API Route ---
  app.get("/api/og/:type/:id", async (req: Request, res: Response) => {
    const { type, id } = req.params;

    if (!fontData) {
      return res.status(500).send("Server error: Font not loaded");
    }

    try {
      // 1. Fetch data based on type and id
      const data = await getOgData(type, id);
      if (!data) {
        return res.status(404).send("Data not found");
      }

      // 2. Generate SVG using Satori and the React template
      const svg = await satori(
        React.createElement(OgImageTemplate, { ...data }), // Pass props to the template
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Inter",
              data: fontData,
              weight: 400,
              style: "normal",
            },
            // Add more fonts/weights if your template uses them
          ],
        }
      );

      // 3. Convert SVG to PNG using Sharp
      const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

      // 4. Send the PNG response
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      res.status(200).end(pngBuffer);
    } catch (error) {
      console.error(`Error generating OG image for ${type}/${id}:`, error);
      vite.ssrFixStacktrace(error); // Helps map error to source in dev
      res.status(500).send("Error generating image");
    }
  });
  // ------------------------

  // Placeholder for other API routes
  app.get("/api/hello", (_: Request, res: Response) => {
    res.json({ message: "Hello from server!" });
  });

  // Main SSR Handler (ensure types match entry-server.tsx export)
  app.use("*all", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    // Skip SSR for API routes or static assets handled by Vite
    if (url.startsWith("/api/") || url.includes(".")) {
      return next();
    }

    try {
      let template = "";
      // Adjust the expected type signature for render based on entry-server.tsx
      let render: (
        url: string,
        context?: unknown
      ) => { html: string; helmet: HelmetData };

      if (!isProduction) {
        template = templateHtml;

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
        //    and also applies HTML transforms from Vite plugins, e.g. global
        //    preambles from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Load the server entry. ssrLoadModule automatically transforms
        //    ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        const entryServerModule = await vite.ssrLoadModule(
          "/client/src/entry-server.tsx"
        );
        // Check if render function exists
        if (
          !entryServerModule.render ||
          typeof entryServerModule.render !== "function"
        ) {
          throw new Error(
            "render function not found or not a function in entry-server.tsx"
          );
        }
        render = entryServerModule.render;
      } else {
        // Production logic remains placeholder
        template = templateHtml;
        render = (await import("./dist/server/entry-server.js")).render;
      }

      // Import HelmetData type for use below (if not already globally available)
      // Might need: import { HelmetData } from 'react-helmet-async';

      const { html: appHtml, helmet } = render(url);

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace(`<!--helmet-outlet:title-->`, helmet.title.toString())
        .replace(`<!--helmet-outlet:meta-->`, helmet.meta.toString())
        .replace(`<!--helmet-outlet:link-->`, helmet.link.toString())
        .replace(`<!--helmet-outlet:style-->`, helmet.style.toString())
        .replace(`<!--helmet-outlet:script-->`, helmet.script.toString());

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
