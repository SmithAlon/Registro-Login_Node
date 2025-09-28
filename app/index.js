import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {methods as authentication} from "./controllers/authentication.controller.js";
import {methods as authorization} from "./middlewares/authorization.js";


// Server
const app = express();
const defaultPort = 4000;

// Set port and attempt to start server with error handling
app.set("port", process.env.PORT || defaultPort);

// Create server with proper error handling
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log("Servidor corriendo en el puerto", port);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Puerto ${port} ya está en uso. Intentando con el puerto ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
  });

  return server;
};

// Config
app.use(express.static(__dirname + "/public"));
app.use(express.json());

// Routes
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html"));
app.get("/register", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/register.html"));
app.get("/admin", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/admin.html"));

// Authentication Routes
app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);


// Start server
startServer(app.get("port"));