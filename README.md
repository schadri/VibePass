# Pecado & Perreo - Sistema de Gestión de Entradas 🎟️

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-blue?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Development-blue?style=for-the-badge&logo=typescript)

Una plataforma moderna y robusta diseñada para la gestión de eventos de la fiesta **Pecado & Perreo**. El sistema abarca todo el ciclo de vida de las entradas: desde la venta online y promociones, hasta el control de acceso en puerta y la gestión administrativa avanzada.

## Características Principales

- **Registro Flexible de Entradas:** Flujos de venta para entradas individuales, promociones 2x1 (registro de grupos de dos personas como una unidad), y opciones de "Promo en Puerta".
- **Gestión Dinámica de Precios y Fechas:** Panel administrativo que permite modificar en tiempo real el valor de las entradas (individuales, dobles, en puerta, promo en puerta) y la fecha del próximo evento.
- **Escáner QR Integrado y en Vivo:** Herramienta de control de acceso en tiempo real para validación de entradas en la puerta, con feedback visual instantáneo.
- **Panel Administrativo Integral:** Dashboard con métricas clave, visualización de ingresos, gestión de asistentes, aprobación manual de pagos, y acciones avanzadas como cargar listas o enviar links.
- **Automatización de Emails y Tickets:** Envío automático de confirmaciones, entradas con códigos QR y notificaciones utilizando integración con correos transaccionales.
- **Compartir Entradas:** Funcionalidad integrada para compartir fácilmente las entradas generadas a los asistentes vía enlaces directos.
- **Diseño Premium:** Interfaz oscura, moderna y responsiva construida con Tailwind CSS, fuertemente optimizada para uso móvil.

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
│   ├── /admin       # Dashboard, Login, control de precios, fechas y Scanner
│   ├── /registro    # Flujo de registro individual y promociones
│   ├── /grupo       # Gestión de entradas para grupos (2x1)
│   ├── /ticket      # Visualización de tickets y QR para los clientes
│   └── /api         # Endpoints de backend y correos
├── /components      # Componentes de UI reutilizables
│   └── /admin       # Componentes exclusivos del panel de control
├── /lib             # Configuraciones de Supabase y utilidades
└── /public          # Activos estáticos (imágenes, logos, fuentes)
```

## Seguridad

El sistema utiliza **Supabase RLS (Row Level Security)** para asegurar que los datos de los asistentes solo sean accesibles por administradores autorizados. El acceso al escáner, al dashboard y a las configuraciones de precios/eventos está protegido mediante una capa de autenticación administrativa y contraseñas.

---

Desarrollado con ❤️ para **Pecado & Perreo**.
