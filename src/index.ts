import { serve } from "bun";
import index from "./index.html";
import db from "./db/db";
import { unlink } from "node:fs/promises";

function getAllowedOrigins() {
  return new Set(
    (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function isOriginAllowed(req: Request, allowedOrigins: Set<string>) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  if (allowedOrigins.size > 0) return allowedOrigins.has(origin);
  return origin === new URL(req.url).origin;
}

function corsHeadersForApi(req: Request) {
  const origin = req.headers.get("origin");
  return new Headers({
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") ?? "content-type",
    "Access-Control-Max-Age": "600",
  });
}

function lastNDaysIsoDates(days: number) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function corsHeadersForPublicVideo() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    "Access-Control-Max-Age": "600",
  });
}

function jsonError(req: Request, status: number, message: string, error?: unknown) {
  return Response.json(
    {
      message,
      error: error instanceof Error ? error.message : typeof error === "string" ? error : error ? String(error) : message,
    },
    { status, headers: corsHeadersForApi(req) }
  );
}

const allowedOrigins = getAllowedOrigins();

const server = serve({
  routes: {
    "/v/*": async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeadersForPublicVideo() });
      }

      if (req.method !== "GET" && req.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405, headers: corsHeadersForPublicVideo() });
      }

      const corsHeaders = corsHeadersForPublicVideo();

      const url = new URL(req.url);
      const rawName = url.pathname.replace(/^\/v\//, "");
      const filename = decodeURIComponent(rawName);

      if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return new Response("Invalid filename", { status: 400, headers: corsHeaders });
      }

      const file = Bun.file(`./uploads/${filename}`);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }

      const size = file.size;
      const headers = new Headers(corsHeaders);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Type", "video/mp4");

      const range = req.headers.get("range");
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/i.exec(range);
        if (!match) {
          return new Response("Invalid Range", { status: 416, headers });
        }

        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : size - 1;

        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
          headers.set("Content-Range", `bytes */${size}`);
          return new Response("Invalid Range", { status: 416, headers });
        }

        if (start >= size) {
          headers.set("Content-Range", `bytes */${size}`);
          return new Response("Range Not Satisfiable", { status: 416, headers });
        }

        const clampedEnd = Math.min(end, size - 1);
        const chunk = file.slice(start, clampedEnd + 1);
        headers.set("Content-Range", `bytes ${start}-${clampedEnd}/${size}`);
        headers.set("Content-Length", String(clampedEnd - start + 1));

        if (req.method === "HEAD") {
          return new Response(null, { status: 206, headers });
        }

        return new Response(chunk, { status: 206, headers });
      }

      headers.set("Content-Length", String(size));
      if (req.method === "HEAD") {
        return new Response(null, { headers });
      }

      return new Response(file, { headers });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,


    "/api/upload": {
      async OPTIONS(req) {
        if (!isOriginAllowed(req, allowedOrigins)) {
          return new Response("CORS blocked", { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeadersForApi(req) });
      },
      async POST(req) {
        try {
          if (!isOriginAllowed(req, allowedOrigins)) {
            return new Response("CORS blocked", { status: 403 });
          }

          const formData = await req.formData();
          const files = formData.getAll("uploads") as File[] | null;
          const uploadDir = "./uploads";
          const savedFiles: { filename: string; originalName: string; url: string; copyCount: number }[] = [];
          const insert = db.prepare("INSERT INTO videos (filename, original_name, url) VALUES ($filename, $original, $url)");


          if (!files || files.length === 0) {
            return Response.json({
              message: "No files uploaded.",
            }, { status: 400, headers: corsHeadersForApi(req) });
          }

          for (const file of files) {
            const fileName = `${crypto.randomUUID()}-${file.name}`;
            const url = new URL(`/v/${encodeURIComponent(fileName)}`, server.url).toString();

            await Bun.write(`${uploadDir}/${fileName}`, file);

            insert.run({
              $filename: fileName,
              $original: file.name,
              $url: url
            });

            savedFiles.push({
              filename: fileName,
              originalName: file.name,
              url: url,
              copyCount: 0,
            });

          }


          return Response.json({
            message: "File uploaded successfully!",
            files: savedFiles,
          }, { headers: corsHeadersForApi(req) });
        } catch (error) {
          return Response.json({
            message: "Error uploading file.",
            error: error instanceof Error ? error.message : String(error),
          }, { status: 500, headers: corsHeadersForApi(req) });
        }

      }
    },
    "/api/videos": {
      async OPTIONS(req) {
        if (!isOriginAllowed(req, allowedOrigins)) {
          return new Response("CORS blocked", { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeadersForApi(req) });
      },
      async GET(req) {
        try {
          if (!isOriginAllowed(req, allowedOrigins)) {
            return new Response("CORS blocked", { status: 403 });
          }

          const url = new URL(req.url);
          const page = Number(url.searchParams.get("page") ?? "1");
          const limit = Number(url.searchParams.get("limit") ?? "10");

          if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1) {
            return jsonError(req, 400, "Invalid pagination parameters.");
          }

          const offset = (page - 1) * limit;
          const totalRow = db.prepare("SELECT COUNT(*) AS total FROM videos").get() as { total: number };
          const total = Number(totalRow?.total ?? 0);
          const videos = db
            .prepare(
              "SELECT id, original_name AS originalName, url, COALESCE(copy_count, 0) AS copyCount FROM videos ORDER BY id DESC LIMIT $limit OFFSET $offset"
            )
            .all({ $limit: limit, $offset: offset });

          const hasPrev = page > 1;
          const hasNext = offset + (Array.isArray(videos) ? videos.length : 0) < total;

          return Response.json(
            {
              videos,
              pagination: {
                page,
                limit,
                total,
                hasPrev,
                hasNext,
              },
            },
            { headers: corsHeadersForApi(req) }
          );
        } catch (error) {
          return jsonError(req, 500, "Error fetching videos.", error);
        }
      }
      ,
      async DELETE(req) {
        try {
          if (!isOriginAllowed(req, allowedOrigins)) {
            return new Response("CORS blocked", { status: 403 });
          }

          const url = new URL(req.url);
          const rawId = url.searchParams.get("id");
          const id = Number(rawId);
          if (!rawId || !Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
            return jsonError(req, 400, "Invalid id.");
          }

          const row = db
            .prepare("SELECT id, filename, url FROM videos WHERE id = $id")
            .get({ $id: id }) as null | { id: number; filename: string | null; url: string | null };

          if (!row) {
            return jsonError(req, 404, "Video not found.");
          }

          if (typeof row.filename === "string" && row.filename.length > 0) {
            const filePath = `./uploads/${row.filename}`;
            try {
              const file = Bun.file(filePath);
              if (await file.exists()) {
                await unlink(filePath);
              }
            } catch (error) {
              return jsonError(req, 500, "Error deleting video file.", error);
            }
          }

          db.prepare("DELETE FROM videos WHERE id = $id").run({ $id: id });

          db.prepare("INSERT INTO video_events (type, video_url) VALUES ($type, $video_url)").run({
            $type: "deleted",
            $video_url: typeof row.url === "string" ? row.url : null,
          });

          return Response.json({ message: "Deleted." }, { headers: corsHeadersForApi(req) });
        } catch (error) {
          return jsonError(req, 500, "Error deleting video.", error);
        }
      },
    },

    "/api/analytics": {
      async OPTIONS(req) {
        if (!isOriginAllowed(req, allowedOrigins)) {
          return new Response("CORS blocked", { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeadersForApi(req) });
      },
      async GET(req) {
        if (!isOriginAllowed(req, allowedOrigins)) {
          return new Response("CORS blocked", { status: 403 });
        }

        const headers = corsHeadersForApi(req);

        const totalVideosRow = db.prepare("SELECT COUNT(*) AS total FROM videos").get() as { total: number };
        const copiedTotalRow = db
          .prepare("SELECT COUNT(*) AS total FROM video_events WHERE type = 'copied'")
          .get() as { total: number };
        const deletedTotalRow = db
          .prepare("SELECT COUNT(*) AS total FROM video_events WHERE type = 'deleted'")
          .get() as { total: number };

        const last7 = lastNDaysIsoDates(7);

        const uploadsRows = db
          .prepare(
            "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM videos WHERE created_at >= datetime('now', '-6 days') GROUP BY day ORDER BY day"
          )
          .all() as { day: string; count: number }[];

        const copiedRows = db
          .prepare(
            "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM video_events WHERE type = 'copied' AND created_at >= datetime('now', '-6 days') GROUP BY day ORDER BY day"
          )
          .all() as { day: string; count: number }[];

        const deletedRows = db
          .prepare(
            "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM video_events WHERE type = 'deleted' AND created_at >= datetime('now', '-6 days') GROUP BY day ORDER BY day"
          )
          .all() as { day: string; count: number }[];

        const uploadsMap = new Map(uploadsRows.map((r) => [r.day, Number(r.count)]));
        const copiedMap = new Map(copiedRows.map((r) => [r.day, Number(r.count)]));
        const deletedMap = new Map(deletedRows.map((r) => [r.day, Number(r.count)]));

        const series = last7.map((day) => ({
          day,
          uploaded: uploadsMap.get(day) ?? 0,
          copied: copiedMap.get(day) ?? 0,
          deleted: deletedMap.get(day) ?? 0,
        }));

        return Response.json(
          {
            totals: {
              videos: Number(totalVideosRow?.total ?? 0),
              copied: Number(copiedTotalRow?.total ?? 0),
              deleted: Number(deletedTotalRow?.total ?? 0),
            },
            last7Days: series,
          },
          { headers }
        );
      },
    },

    "/api/events": {
      async OPTIONS(req) {
        if (!isOriginAllowed(req, allowedOrigins)) {
          return new Response("CORS blocked", { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeadersForApi(req) });
      },
      async POST(req) {
        try {
          if (!isOriginAllowed(req, allowedOrigins)) {
            return new Response("CORS blocked", { status: 403 });
          }

          const body = (await req.json().catch(() => null)) as null | { type?: string; videoUrl?: string };
          const type = body?.type;
          const videoUrl = body?.videoUrl;

          if (type !== "copied" && type !== "deleted") {
            return Response.json({ message: "Invalid event type." }, { status: 400, headers: corsHeadersForApi(req) });
          }

          db.prepare("INSERT INTO video_events (type, video_url) VALUES ($type, $video_url)").run({
            $type: type,
            $video_url: typeof videoUrl === "string" ? videoUrl : null,
          });

          if (type === "copied" && typeof videoUrl === "string") {
            db.prepare("UPDATE videos SET copy_count = COALESCE(copy_count, 0) + 1 WHERE url = $url").run({
              $url: videoUrl,
            });
          }

          return new Response(null, { status: 204, headers: corsHeadersForApi(req) });
        } catch (error) {
          return Response.json(
            { message: "Error saving event.", error: error instanceof Error ? error.message : String(error) },
            { status: 500, headers: corsHeadersForApi(req) }
          );
        }
      },
    },

  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
