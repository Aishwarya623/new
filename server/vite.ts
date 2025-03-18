import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger, defineConfig } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logger instance
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer(
    defineConfig({
      server: {
        middlewareMode: true,
        hmr: { server },
        proxy: {
          "/api": "http://localhost:5000", // ✅ Proxy API requests to backend
        },
        allowedHosts: ["localhost"], // ✅ Fixed TypeScript error
      },
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      appType: "custom",
    })
  );

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      if (!fs.existsSync(clientTemplate)) {
        throw new Error(`index.html not found at ${clientTemplate}`);
      }

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error(`Build directory missing: ${distPath}`);
    return;
  }

  app.use(express.static(distPath));

  // Fall back to index.html if the requested file does not exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      console.error(`index.html missing in: ${distPath}`);
      res.status(404).send("index.html not found.");
      return;
    }

    res.sendFile(indexPath);
  });
}
