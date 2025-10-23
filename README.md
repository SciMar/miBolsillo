🪙 Mi Bolsillo — Backend API (NestJS + TypeORM + JWT)
📘 Descripción General

Mi Bolsillo es una aplicación backend desarrollada en NestJS para la gestión financiera personal.
Permite registrar ingresos y gastos, administrar presupuestos, clasificar transacciones por categorías y generar reportes, todo bajo un sistema de autenticación seguro con JWT y control de roles.

⚙️ Tecnologías Utilizadas

NestJS — Framework principal (arquitectura modular y escalable)

TypeORM — ORM para conexión y manejo de base de datos

MySQL / PostgreSQL — Base de datos relacional

JWT (JSON Web Token) — Autenticación y autorización

Bcrypt — Encriptación de contraseñas

Class Validator / Transformer — Validación de datos DTO

Dotenv — Manejo de variables de entorno

🧩 Módulos Principales
1. Auth

Login y logout.

Generación y validación de tokens JWT.

Uso de guards para proteger rutas.

Control de acceso según rol del usuario (admin, premium, estándar).

2. Users

Registro de nuevos usuarios.

Gestión de roles (user, premium, admin).

Asociación con transacciones, presupuestos y notificaciones.

Encriptación de contraseñas mediante bcrypt.

3. Transactions

Registro, actualización y eliminación de transacciones.

Soporte para tipos: income (ingreso) y expense (gasto).

Asociación con categorías y usuarios.

Cálculo del balance general del usuario.

4. Categories

Creación y gestión de categorías personalizadas.

Asociación con transacciones.

Clasificación automática de movimientos según tipo (ingreso/gasto).

5. Budgets

Creación de presupuestos mensuales o por categoría.

Seguimiento del gasto frente al presupuesto asignado.

Notificaciones automáticas al superar límites definidos.

6. Reports

Generación de reportes financieros personalizados.

Estadísticas de ingresos, gastos y balances.

Filtrado por fechas, categorías y tipos de transacción.

7. Settings

Configuración de preferencias de usuario.

Cambios de idioma, moneda y formato de visualización.

Actualización de información personal o de seguridad.

8. Notifications

Envío de alertas sobre movimientos, presupuestos o recordatorios.

Asociación con usuarios.

Control de estado (leído / no leído).

🔐 Autenticación y Roles

El sistema utiliza JWT para autenticar usuarios.
Cada token incluye información básica del usuario y su rol.

Roles disponibles:

Admin: Acceso total al sistema (gestión de usuarios y configuraciones globales).

Premium: Acceso completo a transacciones, presupuestos, reportes y notificaciones.

User: Acceso limitado a transacciones y configuración básica.

Protección de rutas:
Mediante guards (AuthGuard y RolesGuard), las rutas sensibles requieren un token válido y rol autorizado.

🧠 Estructura del Proyecto
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

🧾 Variables de Entorno (.env)

Ejemplo:

PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_NAME=mi_bolsillo
JWT_SECRET_KEY=SECRETKEY123
JWT_EXPIRES_IN=1h

🚀 Ejecución del Proyecto
Instalar dependencias:
npm install

Ejecutar el servidor en modo desarrollo:
npm run start:dev

Compilar para producción:
npm run build
npm run start:prod

📊 Futuras Implementaciones

Integración con API de tasas de cambio.

Reportes descargables (PDF/Excel).

Módulo de metas de ahorro.

Notificaciones push y recordatorios automáticos.

👩‍💻 Autoras

Marcela Ramírez Anzola, Daniela, Melissa y Ana 
Proyecto académico — Programa Mujeres Digitales 2025
Desarrollado con ❤️ usando NestJS y TypeORM.
