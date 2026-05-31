# WhatsApp Bridge - Setup Instructions

## Resolución de Errores TypeScript

Los errores actuales en el IDE son normales y se resuelven instalando las dependencias:

### 1. Instalar Dependencias
```bash
cd whatsapp-bridge
npm install
```

Esto instalará:
- `@whiskeysockets/baileys` - Cliente de WhatsApp
- `@hapi/boom` - Manejo de errores HTTP
- `express` - Servidor web
- `pino` - Logging
- `qrcode-terminal` - Generación de QR en terminal
- `@types/node` - Tipos de Node.js (resuelve error de `process`)

### 2. Compilar TypeScript
```bash
npm run build
```

### 3. Ejecutar en Desarrollo
```bash
npm run dev
```

## Errores Esperados vs Reales

### ✅ Errores que se resolverán con `npm install`:
- `Cannot find module '@whiskeysockets/baileys'`
- `Cannot find module '@hapi/boom'`
- `Cannot find module 'pino'`
- `Cannot find module 'express'`
- `Cannot find module 'qrcode-terminal'`
- `Cannot find name 'process'`

### ✅ Errores ya corregidos:
- Type annotations en funciones
- Parámetros tipados correctamente
- Importaciones genéricas en Java

## Flujo Completo de Uso

### Desarrollo Local:
```bash
# 1. Instalar dependencias
cd whatsapp-bridge
npm install

# 2. Ejecutar en desarrollo
npm run dev

# 3. Escanear QR cuando aparezca en terminal
# 4. Probar endpoint
curl -X POST http://localhost:3500/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+584141234567", "code": "123456"}'
```

### Docker:
```bash
# 1. Construir y ejecutar
docker compose up whatsapp-bridge

# 2. Ver logs para QR
docker logs saludtech-whatsapp-bridge

# 3. Escanear QR con WhatsApp móvil
```

### Integración Completa:
```bash
# 1. Iniciar toda la infraestructura
docker compose up

# 2. Esperar a que whatsapp-bridge esté healthy
# 3. Establecer OTP_SEND_REAL=true en .env
# 4. Reiniciar backend
docker compose restart backend

# 5. Probar desde Flutter app
```

## Verificación

Una vez instaladas las dependencias, todos los errores de TypeScript deberían desaparecer. El proyecto compilará correctamente y estará listo para uso.
