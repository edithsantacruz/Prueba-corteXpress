const session = require("express-session");
const Keycloak = require("keycloak-connect");

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: "CorteXpress",
    "auth-server-url": "http://localhost:8080", // sin /auth al final si estás en Keycloak 17+
    "ssl-required": "external",
    resource: "cortexpress-app",
    credentials: {
      secret: "xjurXxgNfSjVnkkBLCp2h6prfPAHBQl9",
    },
    "confidential-port": 0,
    "bearer-only": true
  }
);

module.exports = { keycloak, memoryStore };
