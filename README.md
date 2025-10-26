# 🪙 Mi Bolsillo — Backend API (NestJS + TypeORM + JWT)

> **Mi Bolsillo** es una API RESTful desarrollada con **NestJS** que permite gestionar finanzas personales de manera sencilla, organizada y segura.  
> Ofrece funcionalidades como registro de ingresos y gastos, control de presupuestos, categorización automática de transacciones, generación de reportes financieros y autenticación basada en roles con **JWT**.

---

## 📘 Descripción General

Esta API está diseñada para ser el backend de una aplicación de gestión financiera personal.  
Su objetivo es brindar al usuario una herramienta robusta para:

- Registrar ingresos y gastos.  
- Definir y seguir presupuestos.  
- Clasificar transacciones por categoría.  
- Generar reportes personalizados.  
- Recibir notificaciones de alertas o recordatorios financieros.  

Todo ello bajo un sistema de autenticación seguro y escalable con **JWT** y control de **roles**.

---

## ⚙️ Tecnologías Utilizadas

| Tecnología | Propósito |
|-------------|------------|
| **NestJS** | Framework principal para Node.js (arquitectura modular y escalable). |
| **TypeORM** | ORM para la conexión y manejo de base de datos relacional. |
| **MySQL / PostgreSQL** | Motores de base de datos soportados. |
| **JWT (JSON Web Token)** | Autenticación y autorización basada en tokens. |
| **Bcrypt** | Encriptación segura de contraseñas. |
| **Class Validator / Transformer** | Validación y transformación de datos de entrada (DTOs). |
| **Dotenv** | Gestión de variables de entorno. |

---

## 🧩 Módulos Principales

### 🔑 1. Auth
- Inicio y cierre de sesión.  
- Generación y validación de tokens JWT.  
- Uso de **guards** para protección de rutas.  
- Control de acceso según **rol** del usuario.

### 👥 2. Users
- Registro y gestión de usuarios.  
- Asignación de roles (`user`, `premium`, `admin`).  
- Encriptación de contraseñas con **bcrypt**.  
- Relación con transacciones, presupuestos y notificaciones.

### 💰 3. Transactions
- CRUD completo de transacciones.  
- Tipos de movimiento: `income` (ingreso) y `expense` (gasto).  
- Asociación con **categorías** y **usuarios**.  
- Cálculo automático del balance general.

### 🗂️ 4. Categories
- Creación y gestión de categorías personalizadas.  
- Clasificación automática de transacciones (`ingreso` / `gasto`).  
- Relación directa con el módulo de transacciones.

### 📊 5. Budgets
- Creación de presupuestos mensuales o por categoría.  
- Seguimiento de gasto frente al límite definido.  
- Notificaciones automáticas al superar el presupuesto.

### 📈 6. Reports
- Generación de reportes financieros personalizados.  
- Estadísticas de ingresos, gastos y balances.  
- Filtros por fechas, categorías o tipo de transacción.

### ⚙️ 7. Settings
- Configuración de preferencias del usuario.  
- Ajustes de idioma, moneda y formato de visualización.  
- Actualización de información personal o de seguridad.

### 🔔 8. Notifications
- Envío de alertas por movimientos, presupuestos o recordatorios.  
- Control de estado (leído / no leído).  
- Asociación con usuarios y presupuestos.

---

## 🔐 Autenticación y Roles

El sistema utiliza **JWT** para autenticar y autorizar usuarios.  
Cada token contiene información esencial del usuario y su rol.

### Roles Disponibles
| Rol | Descripción |
|------|--------------|
| **Admin** | Acceso total (gestión de usuarios, configuraciones globales). |
| **Premium** | Acceso completo a transacciones, presupuestos, reportes y notificaciones. |
| **User** | Acceso limitado a funciones básicas. |

**Protección de rutas:**  
Mediante `AuthGuard` y `RolesGuard`, solo los usuarios autenticados y con permisos adecuados pueden acceder a endpoints sensibles.

---

## 🧠 Estructura del Proyecto

```
src/
│
├── app.module.ts
├── main.ts
├── config/
│   └── database.config.ts
└── modules/
    ├── auth/
    ├── users/
    ├── transactions/
    ├── categories/
    ├── budgets/
    ├── reports/
    ├── settings/
    └── notifications/
```

---

## 🧾 Variables de Entorno (`.env`)

Ejemplo de configuración básica:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_NAME=mi_bolsillo

JWT_SECRET_KEY=SECRETKEY123
JWT_EXPIRES_IN=1h
```

---

## 🚀 Ejecución del Proyecto

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Ejecutar el servidor en modo desarrollo
```bash
npm run start:dev
```

### 3️⃣ Compilar y ejecutar en producción
```bash
npm run build
npm run start:prod
```

---

## 📈 Futuras Implementaciones

- 💱 Integración con APIs de tasas de cambio.  
- 📄 Exportación de reportes descargables (PDF / Excel).  
- 🎯 Módulo de metas y objetivos de ahorro.  
- 🔔 Notificaciones push y recordatorios automáticos.  

---

## 👩‍💻 Autoras

| Nombre | Rol / Participación |
|--------|----------------------|
| **Ana Sofía Castellanos** | Backend Developer |
| **Claudia Marcela Ramírez Anzola** | Backend Developer |
| **Heidy Daniela Romero Aguiar** | Backend Developer |
| **Valeria Carolina González González** | Backend Developer |

---

📚 *Proyecto académico del programa **Mujeres Digitales 2025***  
💻 Desarrollado con ❤️ usando **NestJS**, **TypeORM** y **MySQL**.
