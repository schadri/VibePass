# Pecado & Perreo - Sistema de Gestión de Entradas 🎟️

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-blue?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Development-blue?style=for-the-badge&logo=typescript)

Una plataforma moderna y robusta diseñada para la gestión de eventos, enfocada en la modalidad de **Promoción 2x1**. El sistema permite el registro de asistentes, generación automática de códigos QR, control de acceso y un panel administrativo completo.

## Características Principales

- **Registro 2x1:** Flujo optimizado para registrar grupos de dos personas como una única unidad de gestión.
- **Escáner QR Integrado:** Herramienta de control de acceso en tiempo real para validación de entradas en la puerta.
- **Panel Administrativo:** Dashboard con métricas clave, visualización de ingresos y gestión de asistentes.
- **Automatización de Emails:** Envío automático de confirmaciones y entradas mediante integración con Gmail/Resend.
- **Sistema de Aprobación:** Control jerárquico para la validación manual de registros y pagos.
- **Diseño Premium:** Interfaz oscura, moderna y responsiva construida con Tailwind CSS.

## Tech Stack

- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Base de Datos & Auth:** [Supabase](https://supabase.com/)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
- **QR Engine:** `html5-qrcode` & `qrcode`
- **Emails:** `nodemailer` & `resend`
- **Iconos:** `lucide-react`

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/entradas.git
cd entradas/webapp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la carpeta `webapp` con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Gmail App Password)
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=tu_clave_de_aplicacion

# Administración
ADMIN_PASSWORD=tu_password_admin
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

## Estructura del Proyecto

```
/webapp
├── /app             # Rutas y páginas de Next.js
│   ├── /admin       # Dashboard, Login y Scanner
│   ├── /registro    # Flujo de registro para usuarios
│   └── /api         # Endpoints de backend
├── /components      # Componentes de UI reutilizables
├── /lib             # Configuraciones de Supabase y utilidades
└── /public          # Activos estáticos (imágenes, logos)
```

## Seguridad

El sistema utiliza **Supabase RLS (Row Level Security)** para asegurar que los datos de los asistentes solo sean accesibles por administradores autorizados. El acceso al escáner y al dashboard está protegido mediante una capa de autenticación administrativa.

---

Desarrollado con ❤️ para **Pecado & Perreo**.
