# Offline-first Request Manager

Aplicación fullstack para crear solicitudes sin conexión, almacenarlas localmente y sincronizarlas con un backend cuando vuelve la conectividad.

## Servicios y tecnologías

- **Frontend:** React, TypeScript, Vite y localStorage.
- **Backend:** .NET 8, EF Core y SQLite.
- **Pruebas:** Vitest en frontend y xUnit en backend.

La solución está organizada por capas (Domain, Application, Infrastructure y Api) y utiliza abstracciones para facilitar la inyección de dependencias y las pruebas.

Como referencia de diseño se tomaron ideas de Architecture Patterns with Python (accesible mediante la web [Cosmic Python](https://www.cosmicpython.com/book/preface)), especialmente TDD, inversión de dependencias y el patrón Repository.

## Configuración necesaria

Requisitos:

- Node.js y npm.
- .NET SDK 8.

### Frontend

```bash
cd frontend
cp .env.example .env
```

Variable requerida:

```env
VITE_API_BASE_URL=http://localhost:5005
```

### Backend

```bash
cd backend
cp .env.example .env
```

Variables requeridas:

```env
ASPNETCORE_URLS=http://localhost:5005
OFFLINE_REQUESTS_CONNECTION_STRING=Data Source=requests.db
OFFLINE_REQUESTS_CORS_ORIGINS=http://localhost:5173
```

## Ejecución

Desde la raíz del proyecto, en dos termiales:

### Backend

```bash
cd backend
dotnet run --project src/OfflineRequests.Api
```

La API queda disponible en `http://localhost:5005`. Las migraciones de SQLite se aplican automáticamente al iniciar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en la URL local indicada por Vite, normalmente `http://localhost:5173`.

### Health check

El backend expone `GET /health` para comprobar que el servicio está disponible:

```bash
curl http://localhost:5005/health
```

Respuesta esperada:

```json
{"status":"healthy"}
```

## Funcionamiento

Las solicitudes se guardan primero en localStorage, por lo que se conservan al recargar o cerrar el navegador. Al sincronizar, el frontend procesa el payload según `type` y envía el resultado al backend mediante `POST /requests`.

El campo `type` se utiliza únicamente en el frontend para seleccionar el procesador y no se envía al backend. El campo `status` también es local y representa el estado de sincronización.

Los grupos se gestionan localmente, pueden contener solicitudes y otros grupos, y se sincronizan recorriendo sus solicitudes contenidas.

El backend registra las solicitudes en SQLite y aplica idempotencia mediante el `Id`: reenviar el mismo contenido devuelve una confirmación existente; reutilizar el ID con contenido diferente devuelve el error **409 Conflict**.

## Pruebas

Frontend:

```bash
cd frontend
npm test
npm run build
npm run lint
```

Backend:

```bash
dotnet test backend/OfflineRequests.sln
```

## Trabajo futuro

Fuera del alcance actual podrían incorporarse:

- `GET /requests` y `GET /requests/{id}` para consultar solicitudes desde otros clientes.
- Endpoints `PUT` y `DELETE` para editar o eliminar solicitudes ya sincronizadas.
