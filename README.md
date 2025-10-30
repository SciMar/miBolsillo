# 🪙 Mi Bolsillo — Backend API
**Gestión financiera personal con presupuestos, categorías y transacciones**

> Desarrollado con **NestJS**, **TypeORM** y **JWT**, este backend permite administrar ingresos, gastos y presupuestos de usuarios con autenticación segura y control de roles.

---

## 📘 Descripción General

**Mi Bolsillo** es una API REST modular para el manejo de finanzas personales.  
Permite a los usuarios:

- Registrar **ingresos y gastos**
- Crear y gestionar **presupuestos mensuales o por categoría**
- Clasificar transacciones mediante **categorías dinámicas**
- Calcular **balances financieros**
- Proteger el acceso mediante **autenticación JWT**
- Controlar roles (**user**, **premium**, **admin**) con **guards** personalizados

---

## ⚙️ Tecnologías Utilizadas

| Tecnología | Descripción |
|-------------|-------------|
| **NestJS** | Framework backend modular y escalable |
| **TypeORM** | ORM para conexión y manejo de base de datos |
| **MySQL** | Base de datos relacional principal |
| **JWT (JSON Web Token)** | Autenticación y autorización de usuarios |
| **Bcrypt** | Encriptación segura de contraseñas |
| **Class Validator / Transformer** | Validación de DTOs |
| **Dotenv** | Manejo de variables de entorno |
| **Passport.js** | Middleware de autenticación |
| **TypeScript** | Tipado estático y mantenibilidad del proyecto |

---

## 🧩 Módulos Principales

### 🔐 Auth
- Registro e inicio de sesión de usuarios.
- Generación y validación de tokens JWT.
- Recuperación y actualización de contraseñas.
- Obtención del perfil del usuario autenticado.

**Endpoints:**
```
POST /auth/register
POST /auth/login
POST /auth/updatePassword
GET  /auth/profile
```

---

### 👤 Users
- CRUD completo para administradores.
- Gestión de roles (`user`, `premium`, `admin`).
- Visualización y edición del perfil personal.

**Endpoints:**
```
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
PATCH  /users/:id/role
DELETE /users/:id
GET    /users/profile/me
```

---

### 💰 Budgets
- Creación y seguimiento de presupuestos.
- Filtros por usuario o por nombre.
- Relación con categorías (vía `budgetId`).
- Control de límites de gasto.

**Endpoints:**
```
POST   /budgets
GET    /budgets
GET    /budgets/user/:userId
GET    /budgets/buscar?q={nombre}
GET    /budgets/:id
PATCH  /budgets/:id
DELETE /budgets/:id
```

**Ejemplo Body (POST /budgets):**
```json
{
  "userId": 1,
  "name": "Presupuesto Noviembre",
  "amount": 1200000,
  "categoryId": 3,
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

---

### 🏷️ Categories
- Clasificación de transacciones en `ingreso` o `gasto`.
- Asociación opcional a un presupuesto (`budgetId`).
- CRUD completo con roles administrativos.

**Endpoints:**
```
GET    /categories
GET    /categories/all
GET    /categories/type/:type
GET    /categories/:id
GET    /categories/name/:name
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

**Ejemplo Body (POST /categories):**
```json
{
  "name": "Transporte",
  "type": "gasto",
  "budgetId": 5
}
```

---

### 💳 Transactions
- Registro de ingresos y gastos.
- Cálculo automático de balance.
- Agrupación por categoría o fecha.
- Acceso limitado por usuario.

**Endpoints:**
```
POST   /transactions
GET    /transactions/user/:userId/grouped
GET    /transactions/my-balance
GET    /transactions/balance/:userId
GET    /transactions/:id
PATCH  /transactions/:id
DELETE /transactions/:id
```

---

### 📊 Reports (en progreso)
- Generación de reportes financieros personalizados.

### ⚙️ Settings / Notifications (en progreso)
- Configuraciones del usuario y alertas automáticas.

---

## 🧠 Relaciones Principales (ERD)

```
User (1) ────< (N) Budget (1) ────< (N) Category (1) ────< (N) Transaction
```

- Un **usuario** puede tener varios **presupuestos**.  
- Un **presupuesto** puede agrupar varias **categorías**.  
- Cada **categoría** puede contener muchas **transacciones**.

---

## 🚀 Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/SciMar/miBolsillo.git
cd miBolsillo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (Editar con tu configuración MySQL y JWT_SECRET)

# 4. Ejecutar migraciones
npm run typeorm migration:run

# 5. Iniciar el servidor
npm run start:dev
```

Servidor en: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Variables de Entorno (`.env`)

```env
# 🌍 App
NODE_ENV=development
PORT=3000

# 🐬 Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=toor
DB_NAME=mi_bolsillo_db

# 🔐 JWT
JWT_SECRET_KEY=supersecret
JWT_EXPIRES_IN=1d

```

---

## 🧪 Pruebas con Postman

Incluye los siguientes headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

> Puedes importar la colección `MiBolsillo.postman_collection.json` (adjunta).

--


## 👩‍💻 Autoras

| Nombre | Rol / Participación |
|--------|----------------------|
| **Ana Sofía Castellanos** | Backend Developer |
| **Claudia Marcela Ramírez Anzola** | Backend Developer |
| **Heidy Daniela Romero Aguiar** | Backend Developer |
| **Valeria Carolina González González** | Backend Developer |

---
## 🧾 Licencia

📚 *Proyecto académico del programa **Mujeres Digitales 2025***  
💻 Desarrollado con ❤️ usando **NestJS**, **TypeORM** y **MySQL**.
