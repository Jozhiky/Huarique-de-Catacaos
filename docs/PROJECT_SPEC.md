# Plan maestro de implementación en Antigravity

## Sistema de comandas, caja e inventario — El Huarique de Catacaos

**Versión del documento:** 1.2  
**Fecha:** 13 de agosto de 2026  
**Zona horaria operativa:** `America/Lima`  
**Moneda:** sol peruano (`PEN`, visualmente `S/`)  
**Idioma de la interfaz:** español de Perú  
**Estado:** especificación para validación e implementación por fases

**Cambio 1.1:** se adopta el logo oficial encontrado en Instagram. Se conserva exactamente su símbolo y wordmark dorados; únicamente se sustituye el fondo negro por el azul marino de la carta `#0B3156`.

**Cambio 1.2:** el archivo principal del logo pasa a ser un PNG con transparencia real. El fondo azul pertenece a la interfaz y no debe quedar incorporado dentro del logo.

---

## 1. Cómo utilizar este archivo

Este documento es la fuente principal de verdad del proyecto. Debe guardarse dentro del repositorio en:

```text
docs/PROJECT_SPEC.md
```

No se debe pegar todo el documento dentro de una regla de Antigravity. Las reglas de Workspace tienen un límite de 12 000 caracteres por archivo. En su lugar:

1. Crear el proyecto local `el-huarique-pos`.
2. Guardar este archivo como `docs/PROJECT_SPEC.md`.
3. Guardar el logo aprobado como `apps/web/public/brand/huarique-logo-transparente.png`.
4. Abrir esa carpeta como proyecto en Antigravity.
5. Configurar la política de revisión como **Request Review**.
6. Trabajar en **Planning Mode** para cada fase grande.
7. En cada conversación mencionar `@docs/PROJECT_SPEC.md`.
8. Enviar los prompts de la sección 22 de uno en uno.
9. No aprobar una fase hasta comprobar sus criterios de aceptación.

Antigravity deberá generar reglas cortas en `.agents/rules/` que apunten a este documento, sin copiarlo íntegramente.

---

## 2. Instrucción maestra para la IA

Construir una aplicación operativa para el restaurante **El Huarique de Catacaos**, no un dashboard demostrativo ni una plantilla genérica de restaurante.

La solución debe conectar en un mismo flujo:

```text
mozo -> salón y mesa -> pedido -> comanda -> cocina -> cobro -> inventario -> reportes
```

### Reglas no negociables

- Usar el nombre real **El Huarique de Catacaos**.
- Usar los platos reales incluidos en este documento.
- Toda la interfaz debe estar en español.
- Mostrar precios en soles con formato `S/ 30.00`.
- Diseñar primero para tablets Android en orientación horizontal.
- No usar lorem ipsum, nombres genéricos ni datos extranjeros.
- No usar degradados.
- No usar plantillas visuales de administración sin personalización.
- No exponer claves secretas o `service_role` en el frontend.
- No permitir eliminar transacciones, pedidos, pagos o movimientos de inventario sin auditoría.
- No marcar una comanda como enviada si el servidor no la confirmó.
- No marcar una comanda como impresa si el agente de impresión no la confirmó.
- No asumir que el modo offline puede imprimir en cocina: debe comunicar claramente sus límites.
- No implementar facturación electrónica SUNAT en la primera versión.
- No continuar a la siguiente fase con errores de TypeScript, lint, pruebas o consola.
- Cada cambio de esquema debe estar en una migración versionada.
- Las dependencias deben fijarse y el lockfile debe mantenerse en Git.
- Antes de ejecutar comandos destructivos, pedir aprobación y comprobar la ruta exacta.

---

## 3. Contexto real del restaurante

- Restaurante pequeño/mediano ubicado en el contexto de Catacaos, Piura, Perú.
- Tres salones.
- Aproximadamente 80 mesas.
- Tres tablets Android para registrar pedidos.
- Proceso actual: pedidos escritos manualmente.
- Destino de comandas: impresora térmica en cocina.
- Usuarios principales: dueña, mozos y, si corresponde, cajero.
- La dueña necesita conocer pedidos, ventas, productividad por mozo y consumo de insumos.
- Ejemplo prioritario de inventario: cuánto pollo se compra, cuánto se consume, cuánto debería quedar y qué diferencia existe frente al conteo físico.
- La carta incluye comida piurana, marina y criolla, presentaciones múltiples, acompañamientos y platos disponibles solamente determinados días.

### Datos aún por confirmar

- Nombre y numeración exacta de los tres salones.
- Distribución y numeración final de las 80 mesas.
- Cantidad de mozos por turno.
- Existencia de una computadora encendida permanentemente en caja o cocina.
- Modelo de impresora térmica y tipo de conexión.
- Estabilidad de Internet y disponibilidad de respaldo 4G.
- Si caja y cobros formarán parte del primer piloto.
- Carta completa de bebidas, postres y promociones.
- Precios escritos a mano señalados en la sección 17.
- Insumos que se controlarán desde el primer día.

---

## 4. Objetivo del producto

Reducir errores y tiempos en la toma de pedidos, entregar comandas legibles a cocina, conservar trazabilidad sobre cada operación y dar a la dueña una visión confiable de ventas e inventario.

### Indicadores de éxito del piloto

- Cero pedidos perdidos durante la prueba controlada.
- Cero comandas duplicadas por reintentos.
- Tiempo medio desde confirmación del mozo hasta impresión menor de 5 segundos con conectividad normal.
- El 100 % de anulaciones y descuentos quedan auditados.
- Diferencias de caja identificables por usuario y turno.
- Inventario teórico calculable al cierre.
- Una persona nueva puede registrar un pedido básico tras una capacitación de 15 minutos.
- Las acciones frecuentes requieren pocos toques y objetivos táctiles de al menos 48 px.

### Fuera de alcance de la versión 1

- Facturación electrónica SUNAT.
- Delivery y seguimiento de repartidores.
- Reservas en línea.
- Programa de puntos o fidelización.
- Carta pública mediante QR.
- Contabilidad completa.
- Planillas o asistencia laboral.
- Predicción mediante inteligencia artificial.

---

## 5. Roles y permisos

| Acción | Dueña/administradora | Cajero | Mozo |
|---|---:|---:|---:|
| Ver todos los salones | Sí | Sí | Sí |
| Crear o ampliar pedido | Sí | Opcional | Sí |
| Cambiar mesa o unir mesas | Sí | Sí | Sí, con registro |
| Solicitar cuenta | Sí | Sí | Sí |
| Registrar/cerrar pago | Sí | Sí | No por defecto |
| Aplicar descuento | Sí | Con límite configurable | No |
| Anular después de enviar a cocina | Sí | Con autorización | Solicita autorización |
| Editar carta y precios | Sí | No | No |
| Marcar plato agotado | Sí | Sí | Solo informar |
| Registrar compras | Sí | Opcional | No |
| Registrar mermas y ajustes | Sí | Opcional | No |
| Ver dashboard financiero | Sí | Parcial | No |
| Gestionar usuarios | Sí | No | No |
| Ver auditoría | Sí | No | No |

### Acceso

- **Dueña:** correo y contraseña fuerte; MFA recomendado.
- **Cajero:** usuario personal; nunca compartir el usuario de la dueña.
- **Mozo:** código corto de trabajador + PIN personal de 6 a 8 dígitos.
- Bloquear temporalmente después de cinco intentos fallidos.
- Cerrar la sesión rápida del mozo por inactividad configurable.
- No almacenar el PIN en texto plano.
- El rol debe almacenarse en datos administrados por el servidor, no en metadatos editables por el usuario.
- El sistema debe registrar quién realizó cada acción, incluso si varios trabajadores comparten la misma tablet.

---

## 6. Flujos operativos

### 6.1 Apertura de mesa y pedido

1. El mozo inicia sesión.
2. Selecciona Salón 1, 2 o 3.
3. Selecciona una mesa libre.
4. Indica opcionalmente la cantidad de comensales.
5. Busca platos por categoría o nombre.
6. Selecciona presentación, acompañamientos y adicionales.
7. Agrega observaciones, por ejemplo: `sin picante`, `sin cebolla`, `bien cocido`.
8. Revisa cantidades y subtotal.
9. Pulsa **Enviar a cocina**.
10. El servidor crea una revisión inmutable del pedido y una tarea de impresión.
11. El agente de impresión reclama la tarea una sola vez, imprime y confirma el resultado.
12. La tablet muestra **Comanda impresa** solamente después de recibir la confirmación.

### 6.2 Pedido adicional

- Un pedido enviado no se reescribe silenciosamente.
- Los nuevos ítems generan una revisión adicional.
- La impresión debe llevar la palabra `ADICIONAL` en tamaño visible.
- Se imprime únicamente lo agregado, no todo el pedido.

### 6.3 Anulación

- El mozo solicita la anulación e introduce un motivo.
- La dueña o un usuario autorizado aprueba con su credencial.
- Se genera un registro de auditoría.
- Si el plato ya llegó a cocina, se imprime una comanda `ANULACIÓN`.
- Si todavía no se preparó, el consumo teórico se revierte.
- Si ya fue preparado, no se repone como stock disponible: se registra merma.

### 6.4 Cuenta y pago

1. El mozo solicita la cuenta.
2. El cajero revisa el detalle.
3. Puede dividirse por montos o ítems si esa opción está habilitada.
4. Se registra efectivo, Yape, Plin, tarjeta o pago mixto.
5. Se calcula vuelto cuando corresponda.
6. El pedido se cierra solamente cuando la suma de pagos coincide con el total.
7. La mesa vuelve a libre.

### 6.5 Compra e inventario

1. La dueña registra proveedor, fecha y número de documento opcional.
2. Añade insumos, cantidad, unidad y costo.
3. La compra genera movimientos positivos de inventario.
4. Las recetas generan consumo teórico cuando el pedido es confirmado para cocina.
5. Mermas y ajustes exigen motivo.
6. Al cierre se registra conteo físico.
7. El sistema muestra stock teórico, físico y diferencia.

---

## 7. Estados del sistema

### Mesa

- `free`: libre.
- `occupied`: ocupada con pedido abierto.
- `waiting_kitchen`: comanda pendiente de impresión o confirmación.
- `served`: atención servida.
- `waiting_payment`: cuenta solicitada.
- `blocked`: fuera de servicio.

### Pedido

- `draft`: borrador local o en servidor, aún no enviado.
- `submitted`: confirmado por el servidor.
- `in_preparation`: aceptado/impreso en cocina.
- `served`: servido.
- `payment_pending`: cuenta solicitada.
- `paid`: pagado.
- `cancelled`: anulado con autorización.

### Impresión

- `pending`.
- `claimed`.
- `sent_unconfirmed`.
- `printed_assumed`.
- `printed_confirmed`.
- `failed`.
- `cancelled`.

No usar solamente colores para comunicar estados; incluir texto o icono.

---

## 8. Arquitectura recomendada

### Decisión para la versión 1

Aplicación web instalable **PWA**, base de datos en Supabase/PostgreSQL y un agente local de impresión en la computadora o mini-PC del restaurante.

```text
Tablets Android (PWA)
        |
        | HTTPS
        v
Supabase: Auth + Postgres + Realtime + funciones/RPC
        |
        | suscripción segura + polling de respaldo
        v
Agente local de impresión (Node.js)
        |
        | TCP/IP ESC/POS, puerto 9100
        v
Impresora térmica de cocina de 80 mm
```

### Stack propuesto

- Monorepo con `pnpm` workspaces.
- Frontend: React + TypeScript + Vite.
- Diseño: Tailwind CSS con tokens propios y primitivas accesibles; no usar una plantilla prediseñada.
- Navegación y datos: TanStack Router/Query o equivalentes estables verificados al comenzar.
- Formularios: React Hook Form + Zod o equivalentes estables.
- PWA: service worker y manifiesto; IndexedDB para caché y borradores.
- Backend administrado: Supabase Auth, Postgres, Realtime y Edge Functions/RPC cuando corresponda.
- Agente de impresión: Node.js + TypeScript, adaptador ESC/POS por red, polling de respaldo y endpoint de salud.
- Pruebas: Vitest, Testing Library, Playwright y pgTAP para políticas/funciones críticas.
- Fechas: guardar `timestamptz`; presentar en `America/Lima`.

Al iniciar el repositorio, Antigravity debe comprobar las versiones estables actuales, fijarlas en `package.json` y guardar el lockfile. No debe inventar APIs de librerías ni usar versiones recordadas sin validación.

### Estructura esperada

```text
el-huarique-pos/
├── .agents/
│   ├── rules/
│   │   ├── 00-product.md
│   │   ├── 10-frontend.md
│   │   ├── 20-database-security.md
│   │   └── 30-testing.md
│   └── workflows/
│       ├── implement-phase.md
│       └── release-check.md
├── apps/
│   ├── web/
│   │   └── public/brand/huarique-logo-transparente.png
│   └── print-bridge/
├── packages/
│   ├── domain/
│   ├── ui/
│   └── config/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   └── seed.sql
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── ADR/
│   ├── RUNBOOK_PRINTING.md
│   └── PILOT_CHECKLIST.md
├── .env.example
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 9. Conectividad y funcionamiento offline

### Comportamiento honesto de la versión 1

- La PWA debe conservar en caché la estructura de salones, mesas y carta para consulta.
- Puede guardar un pedido como borrador local cuando no hay conexión.
- Un borrador offline debe llevar un aviso persistente: **SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA**.
- No cambiar a `submitted` hasta recibir confirmación del servidor.
- No descontar inventario hasta confirmar la transacción del servidor.
- Al volver Internet, mostrar los borradores y pedir confirmación antes de enviarlos para evitar pedidos tardíos accidentales.
- Nunca prometer impresión offline si la ruta tablet -> nube -> agente local no está disponible.

### Medidas operativas recomendadas

- Router con respaldo 4G/5G.
- UPS para router, computadora/mini-PC e impresora.
- Impresora con IP fija.
- Red exclusiva para operación, separada de la Wi-Fi de clientes.
- Procedimiento manual de contingencia visible en caja.

Si las caídas de Internet son frecuentes, diseñar una versión 2 con gateway local y sincronización posterior. No incluir esa complejidad en el primer piloto sin validar la necesidad.

---

## 10. Impresión de comandas

### Formato mínimo de 80 mm

```text
EL HUARIQUE DE CATACAOS
COMANDA N.° 00428
NUEVO / ADICIONAL / ANULACIÓN

SALÓN 2 — MESA 17
MOZO: CARLOS
13/08/2026  1:42 p. m.
--------------------------------
2  CEVICHE MIXTO
   PERSONAL
   ** SIN PICANTE **

1  MAJADO DE YUCA
   CON CABRITO
--------------------------------
TOTAL DE PLATOS: 3
REVISIÓN DEL PEDIDO: 2
```

### Requisitos técnicos

- Papel térmico de 80 mm.
- ESC/POS por TCP/IP, preferentemente puerto 9100.
- `print_jobs.client_submission_id` único por restaurante y `UNIQUE (order_revision_id, job_type, destination_printer_id)`.
- Reclamo atómico de trabajo con leasing para impedir dos impresiones concurrentes.
- Máximo tres reintentos automáticos con espera incremental.
- Reimpresión manual o trabajo recuperado marcado como `*** COPIA / POSIBLE DUPLICADO ***`.
- `printed_at`, `destination_printer_id`, `attempt_count` y error final auditables.
- Latido del agente local cada 30 segundos.
- Alerta si el agente no reporta durante más de 90 segundos.
- Adaptador de impresora simulada para pruebas automatizadas.
- Nunca colocar el secreto de Supabase en el navegador; solamente en el agente local protegido.

---

## 11. Modelo de datos mínimo

Todas las tablas transaccionales deben llevar `restaurant_id`, `created_at`, `updated_at` cuando corresponda y claves UUID. Usar `numeric(12,2)` para dinero y `numeric(12,3)` para cantidades; nunca `float` para dinero o inventario.

| Tabla | Propósito |
|---|---|
| `restaurants` | Negocio y configuración general. |
| `profiles` | Perfil, rol, estado y relación con Auth. |
| `dining_rooms` | Los tres salones. |
| `restaurant_tables` | Mesas, número, capacidad, posición y estado. |
| `shifts` | Apertura/cierre por fecha y usuario. |
| `menu_categories` | Entradas, ceviches, etc. |
| `products` | Plato principal, descripción, disponibilidad. |
| `product_variants` | Personal, media fuente, fuente y precio. |
| `modifier_groups` | Acompañamientos, punto de cocción, extras. |
| `modifiers` | Opciones concretas y recargos. |
| `product_modifier_groups` | Relación entre platos y grupos. |
| `ingredients` | Insumos y unidad base. |
| `recipe_items` | Consumo de ingrediente por variante. |
| `suppliers` | Proveedores. |
| `purchases` | Cabecera de compra. |
| `purchase_items` | Detalle de insumos comprados. |
| `inventory_movements` | Diario inmutable de entradas/salidas/mermas. |
| `inventory_balances` | Saldo materializado actualizado transaccionalmente. |
| `orders` | Cabecera de pedido y mesa. |
| `order_revisions` | Cada envío inicial o adicional. |
| `order_items` | Ítems con nombre y precio congelados. |
| `order_item_modifiers` | Opciones y recargos congelados. |
| `payments` | Pagos por método y usuario. |
| `print_jobs` | Cola idempotente de impresión. |
| `printer_agents` | Impresoras, latidos y estado. |
| `audit_logs` | Acciones sensibles y valores antes/después. |

---

## 12. Seguridad de Supabase/PostgreSQL

- Habilitar RLS explícito en toda tabla expuesta.
- Conceder acceso a la Data API de manera explícita (`GRANT SELECT TO authenticated`).
- Prohibir `INSERT`/`UPDATE` directo sobre `orders`, `order_items` e `inventory_movements`.
- Funciones transaccionales con `SECURITY DEFINER SET search_path = ''`.
- Vistas analíticas con `security_invoker = true`.
- Pruebas RLS y aislamiento multi-tenant en pgTAP.

---

## 13. Reglas de inventario

### Fórmula

```text
stock inicial + compras - consumo teórico - mermas +/- ajustes = stock esperado
```

### Ejemplo de pollo

```text
Stock inicial:       30.000 kg
Compra:              20.000 kg
Consumo por recetas: 32.000 kg
Merma:                2.000 kg
Stock esperado:      16.000 kg
Conteo físico:       15.000 kg
Diferencia:          -1.000 kg
```

---

## 14. Identidad visual

### Logo oficial adoptado

Se utilizará el logo localizado en el Instagram del restaurante, sin rediseñarlo ni sustituirlo por una interpretación generativa. El símbolo integra un arco, una vasija vertiendo hacia un pequeño recipiente y el wordmark `HUARIQUE DE CATACAOS`.

La adaptación aprobada conserva exactamente la silueta, tipografía, composición y dorado originales, elimina por completo el fondo negro y utiliza transparencia alfa real. El azul marino pertenece a los fondos y componentes de la interfaz; no debe estar incorporado dentro del archivo del logo. El archivo principal del proyecto será:

```text
apps/web/public/brand/huarique-logo-transparente.png
```

### Paleta de marca

| Token | Color | Uso principal |
|---|---|---|
| `brand.navy` | `#0B3156` | Fondo oficial del logo, encabezados y navegación. |
| `brand.gold` | `#C3A55F` | Símbolo, wordmark y acentos principales de marca. |
| `brand.coastal` | `#1677A6` | Acciones secundarias, enlaces y salón activo. |
| `brand.cream` | `#F6F0E4` | Fondo cálido principal. |
| `brand.sand` | `#D9C79D` | Superficies cálidas secundarias y detalles discretos. |
| `neutral.900` | `#1F2933` | Texto general. |
| `neutral.600` | `#5B6872` | Texto secundario. |
| `neutral.200` | `#DCE2E6` | Bordes. |
| `surface` | `#FFFFFF` | Tarjetas y paneles. |
| `success` | `#287A4B` | Libre, impreso, pagado. |
| `warning` | `#C98316` | Pendiente, stock bajo. |
| `danger` | `#B83838` | Error, anulación, agotado. |

### Tipografía

- Títulos y etiquetas de categoría: **Barlow Condensed**
- Interfaz, números y tablas: **Inter**
- Empaquetar las fuentes localmente para que la PWA no dependa de Google Fonts durante el servicio.
- Usar cifras tabulares en precios y totales.

---

## 15. Pantallas y composición

1. **Inicio de sesión:** Fondo crema, logo PNG transparente sobre contenedor azul marino, selector rápido, teclado numérico para PIN.
2. **Salones y mesas:** Pestañas de 3 salones, 80 mesas, filtros por estado, layout táctil.
3. **Toma de pedido:** 3 zonas (categorías izquierda, platos centro, pedido fijo derecha).
4. **Caja:** Pedidos pendientes, cuenta, pagos mixtos (Yape, Plin, Efectivo, Tarjeta), vuelto.
5. **Dashboard:** Métricas en `America/Lima`, ticket promedio, ventas por mozo, exportación CSV.
6. **Inventario:** Stock esperado, físico, compras, mermas, recetas y conteo de cierre.
7. **Administración:** Carta, salones, mesas, usuarios, impresoras, auditoría.

---

## 16. Carta inicial transcrita

Se implementa la carta real tradicional de Catacaos transcrita en la especificación (Entradas, Ceviches, Chicharrones, Tradición Piurana, Especialidades, Tradición Criolla, Rondas, Sopas y Guarniciones).
