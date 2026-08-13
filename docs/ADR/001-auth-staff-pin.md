# ADR 001: Arquitectura de Autenticación, Roles y Acceso con PIN de Personal

## Estado
Aprobado

## Contexto
El Huarique de Catacaos opera con 3 salones, 80 mesas y tablets Android horizontales compartidas por el personal de sala. El flujo de servicio exige cambios rápidos de usuario entre mozos sin comprometer la seguridad ni exponer contraseñas en texto plano. Se requiere un modelo de autenticación unificado en Supabase Auth con 4 roles bien diferenciados (`admin`, `cashier`, `waiter`, `printer_agent`), protección contra ataques de fuerza bruta, bloqueo por inactividad y un mecanismo canónico para la desactivación inmediata de personal.

## Decisión
1. **Identidad Unificada:**
   - Todos los usuarios humanos (dueña, cajero, mozos) y agentes de impresión pertenecen a `auth.users` en Supabase Auth.
   - Dueña y Cajero acceden con `email` + `password` fuerte.
   - Mozos acceden mediante `código de mozo` + `PIN` (6–8 dígitos). Cada mozo posee una cuenta Auth interna gestionada por el servidor (formato: `staff_{staff_code}_{restaurant_id}@internal.huarique.pe`).
2. **Creación y Gestión Segura:**
   - La creación de cuentas de personal se realiza exclusivamente desde el backend mediante `supabase.auth.admin.createUser`.
   - El PIN **no se almacena en `public.profiles`** ni se valida mediante RPCs públicas abiertas.
3. **Flujo de Acceso para Mozos:**
   `Tablet Mozo` $\to$ `Edge Function segura login-staff` $\to$ `Supabase Auth signInWithPassword` $\to$ `Sesión oficial Supabase`.
   - La Edge Function aplica rate limiting (5 intentos fallidos = 15 min de bloqueo en BD), valida `profiles.active = true`, ejecuta `signInWithPassword` internamente y devuelve mensajes genéricos de error (*"Credenciales inválidas"*).
   - No se generan ni firman JWTs artesanales en PL/pgSQL.
   - La clave `service_role` nunca se expone al cliente frontend.
4. **Claims JWT y Roles:**
   - Se preserva el claim estándar de Supabase: `role = 'authenticated'`.
   - Se inyectan claims canónicos mediante el **Custom Access Token Hook**:
     - `auth.jwt()->>'restaurant_id'`
     - `auth.jwt()->>'staff_role'`
   - Roles válidos: `admin`, `cashier`, `waiter`, `printer_agent`.
5. **Mecanismo Canónico de Desactivación:**
   - Al establecer `public.profiles.active = false`:
     1. El Custom Access Token Hook rechaza nuevas emisiones y renovaciones de token.
     2. `login-staff` bloquea inicios de sesión inmediatos.
     3. Todas las políticas RLS y el 100% de las RPCs transaccionales validan activamente `profiles.active = true` para el `auth.uid()` invocador en la base de datos (Zero-Stale-Trust).
     4. Los JWTs emitidos tienen expiración corta controlada (1 hora).
6. **Políticas de Sesión:**
   - Cierre/bloqueo de pantalla por inactividad a los 90 segundos de inoperancia táctil, retornando la tablet al teclado numérico de PIN.

## Consecuencias
- Máxima seguridad cumpliendo estándares enterprise y protegiendo credenciales.
- Compatibilidad nativa con los planes Free/Pro de Supabase mediante Custom Access Token Hook y lógica atómica en base de datos.
- Trazabilidad y auditoría completa de cada acción por usuario y rol.
