import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Static assets: CacheFirst with 1-year TTL (PWA-03)
    {
      matcher: ({ request }) =>
        request.destination === "image" || request.destination === "font",
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }),
        ],
      }),
    },
    // Mock API routes: NetworkFirst — data must stay fresh (PWA-04)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/mock-"),
      handler: new NetworkFirst({
        cacheName: "mock-api",
        networkTimeoutSeconds: 10,
      }),
    },
    // Internal API routes: NetworkFirst (PWA-04)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-routes",
        networkTimeoutSeconds: 10,
      }),
    },
    // Supabase API: NetworkOnly — NEVER cache auth tokens
    {
      matcher: ({ url }) => url.hostname.includes("supabase.co"),
      handler: new NetworkFirst({
        cacheName: "supabase-never",
        networkTimeoutSeconds: 0,
      }),
    },
    // Default Next.js cache (RSC, JS, CSS) — app shell (PWA-02)
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
