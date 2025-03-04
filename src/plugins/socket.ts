import { FastifyInstance } from "fastify";
import { Server as IOServer, Socket } from "socket.io";
import axios from "axios";
import { validateToken } from "../plugins/auth"; // Import JWT validation function

/**
 * Custom Socket.io plugin for Fastify with JWT authentication.
 *
 * This plugin integrates Socket.io with Fastify, adding token validation on connection.
 *
 * @param fastify - Fastify instance
 */
export default async function socketPlugin(fastify: FastifyInstance) {
  // Create a new Socket.io instance attached to Fastify's underlying HTTP server.
  const io = new IOServer(fastify.server, {
    cors: {
      origin: "http://localhost:5173", // For production, restrict this to allowed origins.
      methods: ["GET", "POST"],
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    },
  });

  // Optionally, decorate Fastify with the Socket.io instance.
  fastify.decorate("io", io);

  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      // Extract the token from the cookie header
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        fastify.log.warn(`Socket ${socket.id} missing authentication token.`);
        return next(new Error("Missing authentication token"));
      }

      // Parse cookies manually (basic method)
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("="))
      );
      const token = cookies.authToken;

      if (!token) {
        fastify.log.warn(`Socket ${socket.id} missing authToken cookie.`);
        return next(new Error("Missing authentication token"));
      }

      // Validate JWT token
      const user = await validateToken(token);
      if (!user) {
        fastify.log.warn(`Socket ${socket.id} provided an invalid token.`);
        return next(new Error("Invalid authentication token"));
      }

      // Attach user to socket instance
      (socket as any).user = user;
      fastify.log.info(`Socket authenticated: User ${user.sub}`);
      next();
    } catch (error) {
      fastify.log.error(`Socket authentication failed: ${error.message}`);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    fastify.log.info(`Socket connected: ${socket.id}, User: ${user.sub}`);

    // Listen for a custom event sent by the client.
    socket.on("customEvent", async (data) => {
      // Mark function as async
      fastify.log.info(
        `Received customEvent from ${user.sub} (${socket.id}): ${JSON.stringify(
          data
        )}`
      );

      try {
        // Make a streaming request to DeepSeek
        const response = await axios.post(
          "http://localhost:11434/api/generate",
          {
            model: "deepseek-r1",
            prompt: data,
          },
          { responseType: "stream" } // Enable streaming response
        );

        // Process the stream line by line
        response.data.on("data", (chunk: Buffer) => {
          const lines = chunk
            .toString()
            .split("\n")
            .filter((line) => line.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                socket.emit("customResponse", { message: parsed.response });
              }
            } catch (err) {
              fastify.log.error(`Error parsing stream chunk: ${err.message}`);
            }
          }
        });

        response.data.on("end", () => {
          socket.emit("customResponse", { message: "[DONE]" });
        });
      } catch (error) {
        fastify.log.error(`DeepSeek API request failed: ${error.message}`);
        socket.emit("customResponse", {
          message: "Error fetching response from DeepSeek",
        });
      }
    });
  });
}
