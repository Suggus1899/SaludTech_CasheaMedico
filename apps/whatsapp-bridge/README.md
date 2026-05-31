# WhatsApp OTP Bridge

Un microservicio Node.js basado en **OpenWA** (`@open-wa/wa-automate`) que expone un endpoint REST para enviar OTPs vía WhatsApp.

## Arquitectura

```
Flutter → POST /auth/verify-otp
             ↑
         OtpService.java  ←→  Redis (TTL 10 min)
             |
          send-real=true
             ↓
    POST http://whatsapp-bridge:3500/send-otp
             ↓
         OpenWA → WhatsApp Web → teléfono del usuario
```

## Endpoints

### POST /send-otp

Envía un código OTP vía WhatsApp.

**Body:**

```json
{
  "phone": "+584141234567",
  "code": "483921"
}
```

**Response 200:**

```json
{
  "ok": true
}
```

**Response 400/500:**

```json
{
  "ok": false,
  "error": "Error description"
}
```

### GET /health

Verifica el estado del servicio y la conexión a WhatsApp.

**Response:**

```json
{
  "status": "healthy",
  "whatsapp": {
    "connected": true,
    "status": "Connected"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Primer Arranque

1. **Iniciar el servicio:**

   ```bash
   docker compose up whatsapp-bridge
   ```

2. **Escanear QR:**
   - Ver los logs del contenedor: `docker logs saludtech-whatsapp-bridge`
   - Aparecerá un código QR en la terminal
   - Abrir WhatsApp → Dispositivos vinculados → Escanear QR

3. **Verificar conexión:**

   ```bash
   curl http://localhost:3500/health
   ```

4. **Activar envío real:**
   - Establecer `OTP_SEND_REAL=true` en `.env`

## Desarrollo

### Instalación local

```bash
cd whatsapp-bridge
pnpm install
pnpm run dev
```

### Build

```bash
pnpm run build
pnpm start
```

### Nota sobre dependencias
Este microservicio ahora utiliza `pnpm` y usa Chromium para inicializar OpenWA.

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 3500)

## Sesión WhatsApp

Las credenciales se guardan en la carpeta `session/` y persisten entre reinicios del contenedor gracias al volumen en Docker.

## Manejo de Reconexión

- Reconexión automática con backoff exponencial
- Máximo 5 intentos de reconexión
- Si la sesión expira, requerirá escanear QR nuevamente

## Integración con Backend

El servicio `OtpService.java` llama automáticamente al bridge cuando `OTP_SEND_REAL=true`:

```java
// En OtpService.java
@Value("${saludtech.otp.whatsapp-bridge-url:http://localhost:3500}")
private String whatsappBridgeUrl;

private void sendViaWhatsApp(String phone, String code) {
    // Llama POST /send-otp al bridge
}
```

## Troubleshooting

### WhatsApp no conecta

- Verificar que el QR fue escaneado correctamente
- Revisar logs: `docker logs saludtech-whatsapp-bridge`
- Si la sesión expira, eliminar carpeta `session/` y reiniciar

### OTP no se envía

- Verificar que `OTP_SEND_REAL=true`
- Chequear conexión al bridge: `curl http://localhost:3500/health`
- Revisar logs del backend y del bridge

### Errores comunes

- **404**: Bridge no está corriendo
- **503**: WhatsApp no conectado
- **400**: Formato de teléfono o código inválido
