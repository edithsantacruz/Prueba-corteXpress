require("dotenv").config(); // Para cargar variables de entorno desde el archivo .env
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const axios = require("axios");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger.json");


// Configuración de la aplicación
const app = express();
const port = process.env.PORT || 3000;

// Keycloak
const { keycloak, memoryStore } = require("./config/keycloak");

// Middlewares
app.use(cors());
app.use(express.json());

// Sesión para Keycloak
app.use(
  session({
    secret: "mi_clave_super_secreta", // Cambia esto por una clave más segura
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.use(keycloak.middleware());

// Rutas protegidas con Keycloak (puedes elegir proteger las que quieras)
const clienteRoutes = require("./routes/clientes");
const barberoRoutes = require("./routes/barberos");
const servicioRoutes = require("./routes/servicios");
const citaRoutes = require("./routes/citas");
const pagoRoutes = require("./routes/pagos");
const horarioRoutes = require("./routes/horarios");

app.use("/clientes", keycloak.protect(), clienteRoutes);

app.use("/barberos", keycloak.protect(), barberoRoutes);
app.use("/servicios", keycloak.protect(), servicioRoutes);
app.use("/citas", keycloak.protect(), citaRoutes);
app.use("/pagos", keycloak.protect(), pagoRoutes);
app.use("/horarios", keycloak.protect(), horarioRoutes);

// Ruta pública
app.get("/", (req, res) => {
  res.send("¡Bienvenido a CorteXpres API!");
});

// Ruta para obtener el token de acceso usando client_credentials
app.post("/get-token", async (req, res) => {
  const url = "http://localhost:8080/realms/CorteXpress/protocol/openid-connect/token";

  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");
  data.append("client_id", process.env.CLIENT_ID);  // Tu client_id
  data.append("client_secret", process.env.CLIENT_SECRET);  // Tu client_secret

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("Error obteniendo el token:", error.response ? error.response.data : error.message);
    res.status(500).send("Error obteniendo el token");
  }
});

// Test DB
const db = require("./config/db");
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      res.status(500).send("Error conectando a la base de datos");
    } else {
      res.send("Conexión exitosa a la base de datos");
    }
  });
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
