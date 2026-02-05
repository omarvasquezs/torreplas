# SIGC Torreplas

Sistema Integral de Gestión Comercial para Torreplas SAC.

## Requisitos del Sistema

- PHP 8.2+
- Node.js 18+
- Composer
- MySQL / MariaDB

## Instalación en Producción

Sigue estos pasos para desplegar el proyecto en un servidor de producción después de clonar el repositorio:

1. **Instalar dependencias de PHP (Optimizadas):**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

2. **Instalar dependencias de Frontend:**
   ```bash
   npm install
   ```

3. **Compilar assets para producción:**
   ```bash
   npm run build
   ```

4. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus credenciales de base de datos y configuración de producción
   nano .env
   ```

5. **Generar clave de aplicación:**
   ```bash
   php artisan key:generate
   ```

6. **Migrar la base de datos:**
   ```bash
   php artisan migrate --force
   ```

7. **Poblar la base de datos (Solo primera vez):**
   ```bash
   php artisan db:seed --class=DatabaseSeeder
   php artisan db:seed --class=AdditionalSeeder
   ```

8. **Crear enlace simbólico para almacenamiento:**
   ```bash
   php artisan storage:link
   ```

9. **Asignar permisos a carpetas de escritura:**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

10. **Optimizar caché de configuración y rutas:**
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

## Desarrollo Local (con DDEV)

1. Iniciar el entorno: `ddev start`
2. Instalar dependencias: `ddev composer install && ddev npm install`
3. Migrar y poblar: `ddev artisan migrate:fresh --seed && ddev artisan db:seed --class=AdditionalSeeder`
4. Ejecutar frontend: `ddev npm run dev`
