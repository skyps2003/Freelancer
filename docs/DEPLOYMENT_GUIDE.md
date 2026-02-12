# Guía de Despliegue en Red Local (3 PCs)

Esta guía explica paso a paso cómo configurar y ejecutar el sistema en 3 computadoras diferentes conectadas a la misma red Wi-Fi.

## Requisitos Previos
- 3 Computadoras conectadas a la misma red Wi-Fi.
- Node.js instalado en todas las máquinas.
- MongoDB instalado y corriendo en la **PC 1 (Servidor)**.

---

## 🖥️ PC 1: Servidor (Backend + Base de Datos)

Esta computadora ejecutará el Backend y la base de datos MongoDB.

1.  **Obtener la Dirección IP Local (IPv4):**
    - Abre una terminal (CMD o PowerShell).
    - Ejecuta el comando: `ipconfig`
    - Busca la línea que dice **"Dirección IPv4"** bajo tu adaptador de Wi-Fi. Debería ser algo como `192.168.1.X` (ej. `192.168.1.5`).
    - **ANOTA ESTA IP**. La necesitarás para configurar las otras PCs.

2.  **Iniciar el Servidor:**
    - Abre una terminal en la carpeta del proyecto.
    - Navega a la carpeta del servidor:
      ```bash
      cd server
      ```
    - Instala las dependencias (si no lo has hecho):
      ```bash
      npm install
      ```
    - Inicia el servidor:
      ```bash
      npm run dev
      ```
    - Deberías ver un mensaje indicando que el servidor está corriendo y listando las IPs disponibles (ej. `http://192.168.1.5:5000`).

---

## 💻 PC 2 y PC 3: Clientes (Frontend)

Estas computadoras ejecutarán la aplicación React y se conectarán al servidor en la PC 1.

1.  **Configurar la conexión al Servidor:**
    - Abre el proyecto en la PC Cliente.
    - Navega a la carpeta `client`.
    - Crea un archivo llamado `.env` en la raíz de la carpeta `client` (junto al `package.json`).
    - Agrega la siguiente línea, reemplazando `IP_DEL_SERVIDOR` con la IP que anotaste de la PC 1:

      ```env
      VITE_API_URL=http://<IP_DEL_SERVIDOR>:5000
      ```
      *Ejemplo:* `VITE_API_URL=http://192.168.1.5:5000`

2.  **Iniciar el Cliente:**
    - Abre una terminal en la carpeta `client`.
    - Instala las dependencias (si no lo has hecho):
      ```bash
      npm install
      ```
    - Inicia la aplicación:
      ```bash
      npm run dev
      ```
    - Vite mostrará una URL local (ej. `http://localhost:5173`). Abre esa URL en tu navegador.

3.  **Verificación:**
    - Intenta iniciar sesión o registrarte. Si la configuración es correcta, el cliente se comunicará exitosamente con el backend en la PC 1.
    - **Usuarios distintos:** Asegúrate de loguearte con un usuario distinto en cada PC (ej. "Freelancer" en PC 2 y "Empresa" en PC 3) para probar el chat y las funcionalidades en tiempo real.

---

## Solución de Problemas

- **No conecta al backend:**
    - Asegúrate de que todas las PCs estén en la misma red Wi-Fi.
    - Verifica que el Firewall de Windows en la **PC 1** no esté bloqueando el puerto 5000. Puedes intentar desactivar temporalmente el firewall para probar.
    - Confirma que la IP en el archivo `.env` sea correcta y tenga el puerto `:5000` al final.

- **El Chat no funciona:**
    - Verifica que el servidor esté corriendo y no haya errores en la consola de la PC 1.
    - Asegúrate de que `VITE_API_URL` esté correctamente definido, ya que el socket también lo usa.
