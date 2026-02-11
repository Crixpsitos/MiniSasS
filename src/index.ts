import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,


    "/api/upload": {
      async POST(req) {
        try {
          const formData = await req.formData();
          const files = formData.getAll("uploads") as File[] | null;
          const uploadDir = "./uploads";
          
          

          if (!files || files.length === 0) {
            return Response.json({
              message: "No files uploaded.",
            }, { status: 400 });
          }





          return Response.json({
            message: "File uploaded successfully!",
            files: files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
            })),
          });
        } catch (error) {
          return Response.json({
            message: "Error uploading file.",
            error: error instanceof Error ? error.message : String(error),
          }, { status: 500 });
        }

      }
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
