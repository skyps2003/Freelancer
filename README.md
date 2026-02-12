# Plataforma de Freelance (Freelance Marketplace)

Una plataforma web completa construida con el stack MERN (MongoDB, Express, React, Node.js) que conecta a Freelancers con Empresas para la gestión de proyectos y servicios profesionales.

## 🚀 Características Principales

*   **Autenticación Segura**: Registro e inicio de sesión con JWT para Freelancers y Empresas.
*   **Roles de Usuario**: Paneles de control personalizados para cada tipo de usuario (`FreelancerDashboard` y `CompanyDashboard`).
*   **Gestión de Proyectos**: Las empresas pueden publicar ofertas de trabajo y proyectos.
*   **Sistema de Propuestas**: Los freelancers pueden enviar propuestas a las ofertas disponibles.
*   **Chat en Tiempo Real**: Comunicación instantánea entre usuarios mediante Socket.io.
*   **Subida de Archivos**: Capacidad para subir fotos de perfil, CVs y archivos adjuntos a las propuestas.
*   **Pagos Integrados**: Módulo de checkout para procesar pagos de servicios.
*   **Notificaciones**: Sistema de alertas para actualizaciones importantes (mensajes, estados de propuestas).

## 🛠 Tecnologías Utilizadas

### Frontend (Client)
*   **React** (con Vite)
*   **Tailwind CSS** (Estilos y diseño responsivo)
*   **Framer Motion** (Animaciones fluidas)
*   **Lucide React** (Iconos)
*   **React Router DOM** (Navegación)
*   **Socket.io Client** (Websockets)

### Backend (Server)
*   **Node.js & Express**
*   **MongoDB & Mongoose** (Base de datos)
*   **Socket.io** (Comunicación en tiempo real)
*   **Multer** (Gestión de subida de archivos)
*   **JWT & Bcrypt** (Seguridad y autenticación)

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:
*   [Node.js](https://nodejs.org/) (Versión 14 o superior recomendada)
*   [MongoDB](https://www.mongodb.com/) (Instancia local ejecutándose o una URI de MongoDB Atlas)

## 📥 Instalación

1.  **Clonar el repositorio** (si aplica) o descargar el código fuente.

2.  **Instalar dependencias del Servidor (Server)**
    ```bash
    cd server
    npm install
    ```

3.  **Instalar dependencias del Cliente (Client)**
    ```bash
    cd ../client
    npm install
    ```

## ⚙️ Configuración

Para un funcionamiento óptimo, se recomienda crear un archivo `.env` en la carpeta `server` con las siguientes variables. Si no se crea, el sistema usará valores por defecto.

**Archivo: `server/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/c2b-freelance  # O tu conexión a Atlas
JWT_SECRET=tu_clave_secreta_super_segura
```

> **Nota**: El cliente (`client`) está configurado para conectarse al proxy en `localhost:5000` automáticamente.

## 🏃‍♂️ Cómo Correr el Proyecto

Necesitarás dos terminales abiertas para ejecutar el frontend y el backend simultáneamente.

### 1. Iniciar el Servidor (Backend)
En la carpeta `server`:
```bash
npm run dev
```
*Esto iniciará el servidor en modo desarrollo usando nodemon en el puerto 5000.*

### 2. Iniciar el Cliente (Frontend)
En la carpeta `client`:
```bash
npm run dev
```
*Esto abrirá la aplicación de React (Vite), generalmente en `http://localhost:5173`.*

## 📂 Estructura del Proyecto

*   `/client`: Código fuente del frontend (React).
    *   `/src/pages`: Vistas principales (Home, Auth, Dashboards, Chat, etc.).
    *   `/src/components`: Componentes reutilizables.
*   `/server`: Código fuente del backend (Express).
    *   `/models`: Esquemas de base de datos Mongoose.
    *   `/routes`: Rutas de la API REST.
    *   `/controllers`: Lógica de los controladores (si aplica).
    *   `/uploads`: Carpeta donde se almacenan los archivos subidos.

---
*Generado automáticamente para documentar la estructura y uso del proyecto.*
# Freelancer

## 🚀 Despliegue en Red Local (Demo)

Para ejecutar este proyecto en un entorno de demostración con 3 computadoras (1 Servidor, 2 Clientes), consulta la [Guía de Despliegue](docs/DEPLOYMENT_GUIDE.md).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
