# 💰 Proyecto MiBolsillo – API de Finanzas Personales

## 📘 Descripción general
**MiBolsillo** es una API desarrollada en **NestJS + TypeORM + MySQL** que permite a los usuarios gestionar sus finanzas personales.  
El sistema incluye módulos para **usuarios, autenticación, ingresos, egresos y ahorros**.

---

## 👩‍💻 Equipo de desarrollo
| Módulo | Responsable | Descripción |
|--------|--------------|-------------|
| **Auth/Users** | Sofía Castellanos | Registro, login, autenticación JWT |
| **Ingresos** | Valeria González | CRUD de ingresos, filtros, totales |
| **Egresos** | Marcela Ramírez | CRUD de gastos, filtros y totales |
| **Ahorros** | Heidy Romero | Metas de ahorro, aportes y progreso |

---

## 🚀 Tecnologías principales
- **NestJS** (framework backend)
- **TypeORM** (ORM para MySQL)
- **MySQL** (base de datos relacional)
- **JWT** (autenticación)
- **Class Validator / Transformer**
- **Swagger** (documentación de endpoints)

---

## ⚙️ Requisitos previos
- Node.js 18 o superior  
- MySQL instalado localmente  
- DBeaver o MySQL Workbench (para gestionar la base de datos)

---

## 🔧 Configuración inicial

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Dani-02R/Mi-bolsillo.git
cd MiBolsillo
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```
Luego edita el archivo `.env` con tus credenciales de MySQL:
```env
DB_USER=root
DB_PASS=tu_contraseña
```

### 4️⃣ Crear la base de datos
En MySQL o DBeaver:
```sql
CREATE DATABASE mibolsillo;
```

### 5️⃣ Ejecutar el proyecto
```bash
npm run start:dev
```

---

## 📁 Estructura del proyecto
```
src/
 ├── auth/          # Login, registro y JWT
 ├── users/         # Gestión de usuarios
 ├── incomes/       # Módulo de ingresos
 ├── expenses/      # Módulo de egresos
 ├── savings/       # Módulo de ahorros
 ├── common/        # Decorators, pipes, interceptors
 └── app.module.ts  # Módulo raíz
```

---

## 🧠 Flujo de trabajo en equipo (Git Flow)
- **main** → rama estable (solo merges finales)
- **develop** → integración del equipo
- **heidy / valeria / marcela / sofia** → ramas personales

Pasos:
1. Antes de trabajar:  
   ```bash
   git checkout develop
   git pull --rebase origin develop
   ```
2. Crear o actualizar tu rama personal:  
   ```bash
   git checkout <tu-rama>
   ```
3. Subir cambios y abrir Pull Request hacia `develop`.

---

## ✅ Checklist antes de subir cambios
- [ ] Código formateado con Prettier  
- [ ] App corre sin errores  
- [ ] Endpoint probado en Swagger o Postman  
- [ ] Commit descriptivo (`feat:`, `fix:`, `chore:`)  
- [ ] PR creado hacia `develop`  

---

## 🧾 Ejemplo de commit
```
feat(savings): crear endpoint para registrar aportes
```

---

> 💡 Consejo: Si tienes dudas con Git o el flujo de trabajo.
