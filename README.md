# VibePass - Sistema de Gestión de Entradas 🎟️

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-blue?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Development-blue?style=for-the-badge&logo=typescript)

Una plataforma moderna y robusta diseñada para la gestión de eventos de la fiesta **VibePass**. El sistema abarca todo el ciclo de vida de las entradas: desde la venta online y promociones, hasta el control de acceso en puerta y la gestión administrativa avanzada, con soporte completo para **múltiples eventos mensuales**.

## Características Principales

- **Registro Flexible de Entradas:** Flujos de venta para entradas individuales, promociones 2x1 (registro de grupos de dos personas como una unidad), y opciones de "Promo en Puerta".
- **Sistema Multieventos:** Arquitectura que permite crear y gestionar una fiesta por mes de forma totalmente aislada. Cada evento tiene sus propios asistentes, precios, y fecha, sin mezclar datos históricos.
- **Selector de Eventos en el Dashboard:** El administrador puede cambiar qué evento está visualizando con un solo click, o cambiar cuál es el evento **activo** de ventas (al que van los nuevos registros) sin afectar la experiencia del cliente.
- **Creación de Nuevos Eventos:** Modal integrado en el dashboard para crear un nuevo evento con nombre, fecha y precios propios, activándolo instantáneamente para las ventas.
- **Limpieza de Eventos:** Botón con doble confirmación (incluyendo palabra clave de seguridad) para eliminar todas las entradas de un evento específico.
- **Gestión Dinámica de Precios y Fechas:** Los precios y la fecha de cada evento se pueden modificar de forma independiente desde el panel, tanto al crear el evento como editándolo en línea desde el selector.
- **Escáner QR Inteligente:** El escáner solo carga asistentes del evento activo y rechaza automáticamente QR de eventos anteriores con un mensaje claro.
- **Panel Administrativo Integral:** Dashboard con métricas clave, visualización de ingresos reales y proyectados, gestión de asistentes, y aprobación manual de pagos.
- **Carga Masiva de Grupos y Cumpleaños:** Herramienta que permite a los organizadores pegar listas de invitados directamente de WhatsApp, vinculándolos a un anfitrión y generando entradas masivamente de forma inteligente. Toda carga queda asociada al evento activo.
- **Proyecciones de Recaudación:** Cálculo en tiempo real de los ingresos totales (aprobados y pendientes), diferenciando promos simples y dobles.
- **Panel de Distribución para Anfitriones:** Los compradores de grupos o cumpleaños reciben un enlace único donde pueden ver la lista completa de sus invitados, copiar los enlaces de acceso de cada uno, o enviar los QR directamente por WhatsApp con un solo clic.
- **Automatización de Emails y Tickets:** Envío automático de confirmaciones, entradas con códigos QR y notificaciones utilizando integración con correos transaccionales.

## Tech Stack

- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Base de Datos & Auth:** [Supabase](https://supabase.com/) (Postgres + RLS)
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

### 4. Configurar la base de datos
Ejecutar el siguiente script en el **SQL Editor** de Supabase para crear la tabla de eventos y migrar los datos existentes:

```sql
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    fecha_evento TEXT,
    simple INTEGER NOT NULL DEFAULT 5000,
    doble INTEGER NOT NULL DEFAULT 8500,
    puerta INTEGER NOT NULL DEFAULT 10000,
    promo_puerta INTEGER NOT NULL DEFAULT 9000,
    ocultar_promo_puerta BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE asistentes ADD COLUMN evento_id UUID REFERENCES eventos(id);
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## Estructura del Proyecto

```text
/webapp
├── /app                  # Rutas y páginas de Next.js
│   ├── /admin            # Dashboard, scanner, y gestión de eventos
│   ├── /registro         # Flujo de registro individual y promociones
│   ├── /grupo            # Panel de distribución para anfitriones de grupos
│   ├── /ticket           # Visualización individual de tickets y QR
│   └── /api              # Endpoints de backend y correos
├── /components           # Componentes de UI reutilizables
│   └── /admin            # Componentes del panel de control
│       ├── EventSelector.tsx       # Modal de gestión multievento
│       ├── LimpiarEventoBoton.tsx  # Borrado con doble confirmación
│       ├── CargarEventoBoton.tsx   # Carga masiva de grupos
│       ├── CambiarPreciosBoton.tsx # Edición de precios por evento
│       └── ScannerEnVivo.tsx       # Escáner QR en tiempo real
├── /lib                  # Configuraciones de Supabase y utilidades
│   └── /actions          # Server Actions de Next.js
│       ├── admin.ts      # Acciones administrativas y gestión de eventos
│       └── registro.ts   # Acciones públicas y lógica de evento activo
└── /public               # Activos estáticos (imágenes, logos, fuentes)
```

## Flujo Multievento

1. **El cliente** accede a `/` y se registra → la entrada queda ligada automáticamente al **evento activo** sin saber nada del sistema.
2. **El admin** puede crear un nuevo evento desde el Dashboard → al crearlo se convierte en el activo, y el panel queda limpio listo para la nueva fiesta.
3. **Datos históricos** siguen accesibles seleccionando el evento anterior en el selector del Dashboard.
4. **El scanner** al abrirse carga solo la lista del evento activo y rechaza QR de eventos pasados.

## Seguridad

El sistema utiliza **Supabase RLS (Row Level Security)** para asegurar que los datos de los asistentes solo sean accesibles por administradores autorizados. El acceso al escáner, al dashboard y a las configuraciones de precios/eventos está protegido mediante una capa de autenticación administrativa con cookie de sesión (12 hs de duración). El botón de limpieza de evento requiere la confirmación escrita de la palabra `LIMPIAR` para prevenir borrados accidentales.

---

Desarrollado con ❤️ para **VibePass**.
