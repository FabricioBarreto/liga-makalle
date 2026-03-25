# Sistema de Venta de Entradas - Fútbol Local

Stack: Next.js 15 · Prisma · PostgreSQL (Supabase) · Mercado Pago Checkout Pro · Gmail SMTP · Vercel

---

## Setup inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Crear las tablas en Supabase

```bash
npm run db:push
```

### 4. Correr en desarrollo

```bash
npm run dev
```

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL de Supabase |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago (producción o TEST-...) |
| `GMAIL_USER` | Email de Gmail para enviar entradas |
| `GMAIL_APP_PASSWORD` | App Password de Google (no la contraseña normal) |
| `NEXT_PUBLIC_BASE_URL` | URL del sitio en producción (sin barra final) |
| `ADMIN_SECRET` | Clave para proteger las rutas de admin |

---

## Cómo obtener el Gmail App Password

1. Ir a: https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos" si no está activa
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear una nueva App Password → "Otra aplicación" → "Entradas Futbol"
5. Copiar el código de 16 caracteres generado

---

## API Admin - Crear partido nuevo

```bash
curl -X POST https://tudominio.com/api/admin/matches \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: TU_ADMIN_SECRET" \
  -d '{
    "opponent": "vs. Atlético Charata",
    "date": "2025-09-14T17:00:00",
    "venue": "Estadio Municipal Makallé",
    "round": "Cuartos de Final",
    "isHome": true,
    "earlyBirdPrice": 2500,
    "matchDayPrice": 3500,
    "earlyBirdDeadline": "2025-09-13T23:59:00",
    "totalCapacity": 300
  }'
```

## API Admin - Cambiar estado de partido

```bash
# Marcar como terminado
curl -X PATCH https://tudominio.com/api/admin/matches \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: TU_ADMIN_SECRET" \
  -d '{"id": "MATCH_ID", "status": "FINISHED"}'
```

---

## Lógica de precios

- **Precio anticipado**: aplica desde que se crea el partido hasta `earlyBirdDeadline`
- **Precio normal/día del partido**: aplica desde que vence el early bird, y el mismo día del partido
- Si el equipo avanza de ronda → agregar nuevo partido desde la API admin

---

## Validación QR en la puerta

```bash
GET /api/tickets/validate?qr=CODIGO_QR

# Respuesta si es válido:
{
  "valid": true,
  "buyer": "Juan Pérez",
  "dni": "32456789",
  "match": "vs. Atlético Charata - Cuartos de Final",
  "quantity": 2
}
```

Se puede hacer una página simple con cámara que lea el QR y consulte este endpoint.

---

## Deploy en Vercel

```bash
vercel --prod
# Configurar variables de entorno en vercel.com/dashboard
```

**Importante**: configurar el webhook de Mercado Pago apuntando a:
`https://tudominio.com/api/webhook/mp`
