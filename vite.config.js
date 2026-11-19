import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import emailHandler from "./api/check-email.js";

function localEmailApi() {
  return {
    name: "local-email-api",
    configureServer(server) {
      server.middlewares.use("/api/check-email", async (request, response, next) => {
        const apiResponse = {
          setHeader: response.setHeader.bind(response),
          status(statusCode) {
            response.statusCode = statusCode;
            return this;
          },
          json(data) {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(data));
            return this;
          },
        };

        if (request.method !== "POST") {
          await emailHandler(request, apiResponse);
          return;
        }

        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > 8192) {
              response.statusCode = 413;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ error: "Request body is too large." }));
              return;
            }
            chunks.push(chunk);
          }

          request.body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          await emailHandler(request, apiResponse);
        } catch (error) {
          if (error instanceof SyntaxError) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: "Request body must be valid JSON." }));
            return;
          }
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ABSTRACT_API_KEY) {
    process.env.ABSTRACT_API_KEY = env.ABSTRACT_API_KEY;
  }

  return {
    plugins: [react(), localEmailApi()],
  };
});
