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

| Acción                            | Dueña/administradora |                  Cajero |                  Mozo |
| --------------------------------- | -------------------: | ----------------------: | --------------------: |
| Ver todos los salones             |                   Sí |                      Sí |                    Sí |
| Crear o ampliar pedido            |                   Sí |                Opcional |                    Sí |
| Cambiar mesa o unir mesas         |                   Sí |                      Sí |      Sí, con registro |
| Solicitar cuenta                  |                   Sí |                      Sí |                    Sí |
| Registrar/cerrar pago             |                   Sí |                      Sí |        No por defecto |
| Aplicar descuento                 |                   Sí | Con límite configurable |                    No |
| Anular después de enviar a cocina |                   Sí |        Con autorización | Solicita autorización |
| Editar carta y precios            |                   Sí |                      No |                    No |
| Marcar plato agotado              |                   Sí |                      Sí |         Solo informar |
| Registrar compras                 |                   Sí |                Opcional |                    No |
| Registrar mermas y ajustes        |                   Sí |                Opcional |                    No |
| Ver dashboard financiero          |                   Sí |                 Parcial |                    No |
| Gestionar usuarios                |                   Sí |                      No |                    No |
| Ver auditoría                     |                   Sí |                      No |                    No |

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
- `printed`.
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
- `print_jobs.idempotency_key` único.
- Reclamo atómico de trabajo para impedir dos impresiones.
- Máximo tres reintentos automáticos con espera incremental.
- Reimpresión manual marcada como `COPIA`.
- `printed_at`, `printer_id`, `attempt_count` y error final auditables.
- Latido del agente local cada 30 segundos.
- Alerta si el agente no reporta durante más de 90 segundos.
- Adaptador de impresora simulada para pruebas automatizadas.
- Nunca colocar el secreto de Supabase en el navegador; solamente en el agente local protegido.

---

## 11. Modelo de datos mínimo

Todas las tablas transaccionales deben llevar `restaurant_id`, `created_at`, `updated_at` cuando corresponda y claves UUID. Usar `numeric(12,2)` para dinero y `numeric(12,3)` para cantidades; nunca `float` para dinero o inventario.

| Tabla                     | Propósito                                           |
| ------------------------- | --------------------------------------------------- |
| `restaurants`             | Negocio y configuración general.                    |
| `profiles`                | Perfil, rol, estado y relación con Auth.            |
| `dining_rooms`            | Los tres salones.                                   |
| `restaurant_tables`       | Mesas, número, capacidad, posición y estado.        |
| `shifts`                  | Apertura/cierre por fecha y usuario.                |
| `menu_categories`         | Entradas, ceviches, etc.                            |
| `products`                | Plato principal, descripción, disponibilidad.       |
| `product_variants`        | Personal, media fuente, fuente y precio.            |
| `modifier_groups`         | Acompañamientos, punto de cocción, extras.          |
| `modifiers`               | Opciones concretas y recargos.                      |
| `product_modifier_groups` | Relación entre platos y grupos.                     |
| `ingredients`             | Insumos y unidad base.                              |
| `recipe_items`            | Consumo de ingrediente por variante.                |
| `suppliers`               | Proveedores.                                        |
| `purchases`               | Cabecera de compra.                                 |
| `purchase_items`          | Detalle de insumos comprados.                       |
| `inventory_movements`     | Diario inmutable de entradas/salidas/mermas.        |
| `inventory_balances`      | Saldo materializado actualizado transaccionalmente. |
| `orders`                  | Cabecera de pedido y mesa.                          |
| `order_revisions`         | Cada envío inicial o adicional.                     |
| `order_items`             | Ítems con nombre y precio congelados.               |
| `order_item_modifiers`    | Opciones y recargos congelados.                     |
| `payments`                | Pagos por método y usuario.                         |
| `print_jobs`              | Cola idempotente de impresión.                      |
| `printer_agents`          | Impresoras, latidos y estado.                       |
| `audit_logs`              | Acciones sensibles y valores antes/después.         |

### Restricciones importantes

- Un número de mesa no se repite dentro del mismo salón.
- Una mesa no puede tener dos pedidos abiertos, salvo una función explícita de cuentas separadas.
- `order_items` conserva `product_name_snapshot`, `variant_name_snapshot`, `unit_price_snapshot` y `tax_snapshot` si se añade impuesto.
- Un pago debe ser positivo.
- La suma de pagos debe coincidir con el total antes de cerrar.
- El total se calcula en servidor; el cliente no es fuente de verdad.
- `inventory_movements` es append-only.
- Productos y usuarios transaccionalmente usados se desactivan; no se borran.
- Índices compuestos por `restaurant_id`, estado y fecha en consultas operativas.
- Índices parciales para pedidos abiertos y tareas de impresión pendientes.
- Índices sobre columnas usadas por políticas RLS.

### Operaciones transaccionales recomendadas

- `submit_order(order_id, idempotency_key)`.
- `append_order_revision(order_id, items, idempotency_key)`.
- `cancel_order_item(item_id, reason, approver_id)`.
- `request_bill(order_id)`.
- `close_order(order_id, payments, idempotency_key)`.
- `record_purchase(purchase_payload, idempotency_key)`.
- `adjust_inventory(ingredient_id, quantity, reason, approver_id)`.
- `claim_print_job(agent_id)`.
- `ack_print_job(job_id, result)`.

Estas operaciones críticas deben ejecutarse en una sola transacción de servidor.

---

## 12. Seguridad de Supabase/PostgreSQL

- Habilitar RLS en toda tabla expuesta.
- Conceder acceso a la Data API de manera explícita; no asumir exposición automática.
- Combinar `TO authenticated` con condiciones reales de restaurante y rol.
- No usar `user_metadata` para autorizar.
- Usar `app_metadata` administrado por servidor o tablas de perfil verificadas.
- Las políticas `UPDATE` deben incluir `USING` y `WITH CHECK`, además de una política `SELECT` compatible.
- Las vistas expuestas deben usar `security_invoker = true`.
- Evitar `SECURITY DEFINER`; si es indispensable, ubicar la función en un esquema privado, comprobar `auth.uid()` y revocar `EXECUTE` público.
- No exponer `service_role` ni secretos en variables `VITE_*`.
- Limitar funciones administrativas por rol y registrar auditoría.
- Filtrar consultas por `restaurant_id`, incluso si RLS ya aplica el filtro.
- Ejecutar asesores de seguridad/rendimiento antes de cerrar cada migración.
- Probar RLS como dueña, cajero, mozo y usuario no autenticado.
- Probar acceso cruzado con un segundo restaurante ficticio para evitar IDOR/BOLA.

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

### Normas

- Cada ingrediente tiene una unidad base: kg, g, l, ml o unidad.
- Las conversiones deben ser explícitas.
- Cada variante de plato puede tener receta distinta.
- El consumo se genera una sola vez por revisión de pedido.
- Una reversión genera otro movimiento; no edita el movimiento original.
- Una anulación después de preparar se convierte en merma.
- El conteo físico genera un ajuste con responsable y motivo.
- Alertas por stock bajo se configuran por ingrediente.
- El historial debe mostrar fecha, usuario, origen y saldo resultante.
- El costo promedio es opcional para la primera versión; no bloquear el piloto por contabilidad avanzada.

---

## 14. Identidad visual

### Logo oficial adoptado

Se utilizará el logo localizado en el Instagram del restaurante, sin rediseñarlo ni sustituirlo por una interpretación generativa. El símbolo integra un arco, una vasija vertiendo hacia un pequeño recipiente y el wordmark `HUARIQUE DE CATACAOS`.

La adaptación aprobada conserva exactamente la silueta, tipografía, composición y dorado originales, elimina por completo el fondo negro y utiliza transparencia alfa real. El azul marino pertenece a los fondos y componentes de la interfaz; no debe estar incorporado dentro del archivo del logo. El archivo principal del proyecto será:

```text
apps/web/public/brand/huarique-logo-transparente.png
```

### Paleta de marca

| Token           | Color     | Uso principal                                         |
| --------------- | --------- | ----------------------------------------------------- |
| `brand.navy`    | `#0B3156` | Fondo oficial del logo, encabezados y navegación.     |
| `brand.gold`    | `#C3A55F` | Símbolo, wordmark y acentos principales de marca.     |
| `brand.coastal` | `#1677A6` | Acciones secundarias, enlaces y salón activo.         |
| `brand.cream`   | `#F6F0E4` | Fondo cálido principal.                               |
| `brand.sand`    | `#D9C79D` | Superficies cálidas secundarias y detalles discretos. |
| `neutral.900`   | `#1F2933` | Texto general.                                        |
| `neutral.600`   | `#5B6872` | Texto secundario.                                     |
| `neutral.200`   | `#DCE2E6` | Bordes.                                               |
| `surface`       | `#FFFFFF` | Tarjetas y paneles.                                   |
| `success`       | `#287A4B` | Libre, impreso, pagado.                               |
| `warning`       | `#C98316` | Pendiente, stock bajo.                                |
| `danger`        | `#B83838` | Error, anulación, agotado.                            |

### Tipografía

- Títulos y etiquetas de categoría: **Barlow Condensed** o una alternativa local equivalente.
- Interfaz, números y tablas: **Inter** o una alternativa local equivalente.
- Empaquetar las fuentes localmente para que la PWA no dependa de Google Fonts durante el servicio.
- Usar cifras tabulares en precios y totales.

### Reglas visuales

- Sin degradados, brillos, neón o vidrio translúcido.
- Grilla de 8 px.
- Radio de tarjetas: 12 a 16 px.
- Sombras muy suaves solamente para jerarquía.
- Objetivos táctiles mínimos de 48 x 48 px.
- Contraste WCAG AA.
- Motivo de ondas inspirado en la carta, con opacidad máxima de 5 %, solo en encabezados o pantallas vacías.
- No repetir el logo dentro de cada tarjeta.
- No abusar del dorado; usarlo para marca, selección y acentos importantes.
- En cocina y alertas, priorizar legibilidad sobre decoración.

### Reglas de uso del logo

- Texto exacto del wordmark: `HUARIQUE DE CATACAOS`.
- No agregar `EL` dentro del logo.
- No agregar el descriptor `RESTAURANTE TURÍSTICO` dentro del archivo del logo.
- No cambiar la tipografía ni reconstruir las letras con una fuente aproximada.
- No alterar la forma especial de la letra `Q`.
- No deformar, rotar, aplicar sombras, degradados, brillos o texturas.
- No colocar el logo dentro de otra insignia, tarjeta o contenedor ornamental.
- Mantener espacio libre alrededor equivalente, como mínimo, a la altura de la letra `H` dividida entre cuatro.
- Usar como versión principal el PNG dorado con fondo transparente aprobado.
- Colocarlo preferentemente sobre `brand.navy` (`#0B3156`) dentro de la interfaz para obtener el contraste de la carta, sin modificar el PNG.
- Preparar posteriormente una versión monocroma para la cabecera de la comanda térmica, conservando la misma geometría.
- Si se requiere un SVG para impresión de gran formato, vectorizar el archivo oficial de manera fiel y verificarlo visualmente; no pedir a una IA que lo rediseñe.

---

## 15. Pantallas y composición

### 15.1 Inicio de sesión

- Fondo crema con detalle sutil de ondas.
- Logo oficial PNG transparente colocado sobre un área azul marino en la parte superior, sin modificar su composición.
- Selector rápido de usuario o código de mozo.
- Teclado numérico grande para PIN.
- Estado de conexión, versión y estado del servicio.

### 15.2 Salones y mesas

- Pestañas `Salón 1`, `Salón 2`, `Salón 3`.
- Cuadrícula configurable de mesas.
- Número, estado, tiempo ocupado, mozo y total visible.
- Filtros por estado y buscador de mesa.
- Leyenda visible; no depender solo del color.

### 15.3 Toma de pedido

Diseño horizontal en tres zonas:

1. Categorías a la izquierda.
2. Platos en el centro.
3. Pedido actual fijo a la derecha.

Cada plato muestra nombre, precio desde, disponibilidad y presentaciones. Evitar fotos en la primera versión salvo que existan fotos reales consistentes. Los modificadores se abren en un panel táctil. El botón **Enviar a cocina** siempre muestra cantidad de ítems y total.

### 15.4 Caja

- Pedidos pendientes a la izquierda.
- Detalle y pagos a la derecha.
- Métodos: efectivo, Yape, Plin, tarjeta y mixto.
- Teclado numérico, vuelto y validación.
- Historial de cierre y reimpresión controlada.

### 15.5 Dashboard de la dueña

- Ventas del día.
- Pedidos cerrados y abiertos.
- Ticket promedio.
- Ventas por salón.
- Ventas, pedidos y ticket promedio por mozo.
- Platos más vendidos.
- Horas de mayor demanda.
- Descuentos y anulaciones.
- Compras y mermas.
- Stock bajo y diferencias de inventario.
- Estado del agente de impresión.

No premiar al mozo solamente por cantidad de pedidos; mostrar un conjunto equilibrado de métricas.

### 15.6 Inventario

- Resumen por ingrediente.
- Stock esperado y físico.
- Compras.
- Movimientos.
- Mermas.
- Conteo de cierre.
- Recetas.
- Alertas.

### 15.7 Administración

- Carta, categorías, variantes, modificadores y días de disponibilidad.
- Salones y mesas.
- Usuarios y permisos.
- Impresoras.
- Proveedores.
- Auditoría.

---

## 16. Dashboard: definiciones exactas

| Métrica             | Definición                                                      |
| ------------------- | --------------------------------------------------------------- |
| Ventas del día      | Suma de pedidos pagados según hora de cierre en `America/Lima`. |
| Pedidos del día     | Cantidad de pedidos pagados; mostrar abiertos por separado.     |
| Ticket promedio     | Ventas pagadas / pedidos pagados.                               |
| Ventas por mozo     | Total de pedidos atribuibles al mozo; anulados excluidos.       |
| Mesas atendidas     | Pedidos únicos atendidos por mozo.                              |
| Tasa de anulaciones | Ítems anulados / ítems enviados por mozo.                       |
| Plato más vendido   | Cantidad neta de unidades no anuladas.                          |
| Tiempo de ocupación | Cierre o momento actual menos apertura de mesa.                 |
| Consumo teórico     | Suma de movimientos originados por recetas.                     |
| Diferencia de stock | Conteo físico menos stock esperado.                             |

Todo reporte debe permitir rango de fechas y exportación CSV. PDF puede añadirse después de validar los reportes.

---

## 17. Carta inicial transcrita

Los valores con `VALIDAR` provienen de etiquetas manuscritas o de una zona parcialmente cubierta. No publicarlos en producción sin confirmación de la dueña.

### Entradas

| Producto             |   Precio | Disponibilidad/nota                                   |
| -------------------- | -------: | ----------------------------------------------------- |
| Tamalito verde       |  S/ 3.00 | Humita con chifles, zarza criolla y guiso de cabrito. |
| Papa a la huancaína  | S/ 10.00 |                                                       |
| Leche de tigre       | S/ 18.00 |                                                       |
| Sarandaja acevichada |  S/ 7.00 |                                                       |
| Patita en fiambre    | S/ 15.00 |                                                       |
| Causa acevichada     | S/ 20.00 |                                                       |
| Shambar              | S/ 10.00 |                                                       |
| Chilcano             | S/ 20.00 |                                                       |
| Mondonguito piurano  | S/ 20.00 | Solo lunes.                                           |

### Ceviches

| Producto          | Personal | Media fuente |    Fuente | Nota                            |
| ----------------- | -------: | -----------: | --------: | ------------------------------- |
| Simple            | S/ 30.00 |     S/ 59.00 | S/ 100.00 |                                 |
| Mixto             | S/ 38.00 |     S/ 75.00 | S/ 120.00 |                                 |
| Caballa saltpresa | S/ 25.00 |     S/ 50.00 | S/ 100.00 | Media fuente y fuente: VALIDAR. |
| Maruchitas        | S/ 15.00 |            — |         — |                                 |
| Conchas negras    | S/ 25.00 |            — |         — |                                 |

### Chicharrones

| Producto              | Personal | Media fuente |    Fuente |
| --------------------- | -------: | -----------: | --------: |
| Chicharrón de pescado | S/ 30.00 |     S/ 60.00 | S/ 100.00 |
| Chicharrón mixto      | S/ 40.00 |     S/ 75.00 | S/ 120.00 |
| Chicharrón de pollo   | S/ 25.00 |     S/ 50.00 |  S/ 80.00 |
| Hueveras              | S/ 20.00 |            — |         — |
| Jalea mixta           | S/ 45.00 |            — |         — |

### Tradición piurana

| Producto                 |   Precio | Nota                                   |
| ------------------------ | -------: | -------------------------------------- |
| Seco de chavelo          | S/ 30.00 |                                        |
| Majado de yuca           | S/ 30.00 | Chicharrón de chancho: + S/ 5.00.      |
| Majado de plátano        | S/ 35.00 | Acompañamiento seleccionable.          |
| Malarabia piurana        | S/ 40.00 |                                        |
| Cabrito piurano          | S/ 30.00 |                                        |
| Pasado por agua caliente | S/ 25.00 |                                        |
| Toyo aliñado             | S/ 30.00 | VALIDAR.                               |
| Jalea piurana            | S/ 30.00 | VALIDAR.                               |
| Atamalado                | S/ 35.00 | VALIDAR; acompañamiento seleccionable. |
| Cecina                   | S/ 25.00 |                                        |
| Carne aliñada            | S/ 30.00 |                                        |
| Cachema encebollada      | S/ 32.00 | VALIDAR.                               |
| Frito piurano            | S/ 25.00 |                                        |
| Tallarín con pavo        | S/ 25.00 |                                        |
| Sopa de novios           | S/ 30.00 | Sábados y domingos.                    |
| Copús                    | S/ 40.00 | Sábados y domingos.                    |
| Majarisco                | S/ 40.00 |                                        |

### Especialidades

| Producto                 |   Precio | Nota     |
| ------------------------ | -------: | -------- |
| Arroz con conchas negras | S/ 30.00 |          |
| Pulpo parrillero         | S/ 40.00 |          |
| Arroz con mariscos       | S/ 38.00 | VALIDAR. |
| Causa en lapa            | S/ 30.00 | VALIDAR. |
| Cangrejo reventado       | S/ 35.00 | VALIDAR. |
| Chaufa de mariscos       | S/ 38.00 | VALIDAR. |

### Tradición criolla

| Producto                     |   Precio | Nota                          |
| ---------------------------- | -------: | ----------------------------- |
| Cuy frito                    | S/ 30.00 |                               |
| Frejolada de pato            | S/ 30.00 |                               |
| Tacu tacu                    | S/ 30.00 | Acompañamiento seleccionable. |
| Fettuccini a la huancaína    | S/ 30.00 | Acompañamiento seleccionable. |
| Lomo saltado                 | S/ 33.00 |                               |
| Pollo a la plancha           | S/ 28.00 |                               |
| Chuleta, churrasco o bisteck | S/ 30.00 | Variante de proteína.         |
| Bisteck a lo pobre           | S/ 40.00 | VALIDAR.                      |
| Tallarín con pato            | S/ 30.00 |                               |

### Rondas

| Producto               |   Precio | Nota                                   |
| ---------------------- | -------: | -------------------------------------- |
| Ronda criolla especial | S/ 80.00 | VALIDAR.                               |
| Ronda criolla          | S/ 50.00 |                                        |
| Ronda marina           | S/ 80.00 | VALIDAR; acompañamiento seleccionable. |
| Dúo marino             | S/ 35.00 | Combinación seleccionable.             |
| Trío marino            | S/ 50.00 | VALIDAR.                               |

### Sopas

| Producto          |   Precio | Nota                                |
| ----------------- | -------: | ----------------------------------- |
| Sudado de pescado | S/ 38.00 | VALIDAR; consultar pescado del día. |
| Parihuela         | S/ 45.00 | VALIDAR; consultar pescado del día. |
| Guisada           | S/ 20.00 | VALIDAR.                            |

### Guarniciones

| Producto                 |  Precio |
| ------------------------ | ------: |
| Chifles                  | S/ 5.00 |
| Yuca frita               | S/ 6.00 |
| Sarandaja                | S/ 5.00 |
| Arroz blanco             | S/ 5.00 |
| Choclo o cancha          | S/ 5.00 |
| Yuca sancochada          | S/ 5.00 |
| Plátano maduro frito     | S/ 6.00 |
| Camote o papa sancochada | S/ 5.00 |

### Datos faltantes de la carta

- Bebidas.
- Cervezas y tragos, si existen.
- Postres.
- Promociones o menús del día.
- Fotografías oficiales.
- Disponibilidad y precios definitivos de etiquetas manuscritas.

---

## 18. Datos de demostración permitidos

La base de desarrollo debe usar contexto peruano realista:

- Salones: `Salón Principal`, `Salón Familiar`, `Salón Terraza` como nombres temporales, marcados para confirmar.
- Mesas: 1 a 80 distribuidas temporalmente 30/25/25, marcadas para confirmar.
- Mozos ficticios: Ana, Carlos, Milagros y José.
- Métodos de pago: Efectivo, Yape, Plin, Tarjeta.
- No usar clientes extranjeros, dólares, pizzas, hamburguesas o sushi como ejemplos.

---

## 19. Estrategia de implementación

### Fase 0 — Descubrimiento y decisiones

**Resultado:** decisiones pendientes resueltas y criterios de aceptación aprobados.

- Confirmar hardware.
- Confirmar carta.
- Dibujar distribución de mesas.
- Definir roles.
- Medir Internet.
- Determinar si habrá caja desde el piloto.
- Registrar decisiones en `docs/ADR/`.

### Fase 1 — Repositorio y diseño base

**Resultado:** monorepo ejecutable, tokens de marca, navegación y catálogo visual de componentes.

- Configurar herramientas, lint, formato, pruebas y CI.
- Crear reglas de Antigravity.
- Implementar temas y componentes táctiles.
- No crear todavía lógica falsa de negocio.

### Fase 2 — Base de datos y carta

**Resultado:** esquema reproducible, RLS probado y carta inicial cargada.

- Migraciones.
- Semillas.
- Tipos TypeScript generados.
- Pruebas de restricciones y políticas.
- Pantalla administrativa básica de carta.

### Fase 3 — Usuarios, salones y mesas

**Resultado:** acceso por rol y mapa operativo de 80 mesas.

- Sesiones.
- Estados visuales.
- Apertura y transferencia de mesa.
- Auditoría.

### Fase 4 — Pedidos y comandas

**Resultado:** pedido completo, revisiones, adicionales y anulaciones.

- Borrador.
- Variantes y modificadores.
- Envío transaccional.
- Cola idempotente de impresión.

### Fase 5 — Agente de impresión

**Resultado:** impresión real y recuperable en cocina.

- Configuración de impresora.
- Reintentos.
- Heartbeat.
- Reimpresión.
- Simulador y prueba real.

### Fase 6 — Caja

**Resultado:** cuentas, pagos, cierre y trazabilidad.

- Formas de pago.
- Pago mixto.
- Vuelto.
- Cierre de mesa.
- Reporte de turno.

### Fase 7 — Inventario

**Resultado:** compras, recetas, consumo, merma y conteo.

- Empezar con 10 a 20 ingredientes críticos.
- Validar recetas con cocina.
- Comparar consumo teórico y real.

### Fase 8 — Dashboard

**Resultado:** métricas verificables y exportación CSV.

- Consultas filtradas por fecha/restaurante.
- Vistas seguras.
- Métricas definidas en la sección 16.

### Fase 9 — PWA, resiliencia y QA

**Resultado:** aplicación instalable y piloto aprobado.

- Caché.
- Borradores offline con advertencia.
- Pruebas E2E.
- Prueba de carga moderada.
- Accesibilidad.
- Capacitación.

### Fase 10 — Piloto

- Día 1 y 2: un salón, proceso manual paralelo.
- Día 3 y 4: dos salones.
- Día 5 en adelante: tres salones si no hay errores críticos.
- Registrar incidencias, tiempos y comentarios de mozos/cocina.
- No retirar el talonario de contingencia durante el piloto.

---

## 20. Estrategia de pruebas

### Unitarias

- Totales y redondeo.
- Modificadores.
- División de cuenta.
- Conversión de unidades.
- Consumo por receta.
- Reversión y merma.
- Estados permitidos.

### Integración

- Envío idempotente.
- Pedido adicional.
- Dos tablets intentando editar la misma mesa.
- Cierre con pagos exactos e inexactos.
- Reclamo de impresión concurrente.
- RLS por rol y restaurante.

### E2E

- Login de mozo -> mesa -> pedido -> comanda confirmada.
- Adicional -> segunda impresión solamente con los nuevos ítems.
- Anulación aprobada -> impresión y ajuste de inventario.
- Cuenta -> Yape/efectivo -> mesa libre.
- Compra de pollo -> venta -> merma -> conteo -> diferencia.
- Corte de Internet -> borrador claramente no enviado -> recuperación controlada.

### Visuales

- Viewports de tablets reales.
- Retratos y horizontal, aunque el flujo principal sea horizontal.
- Texto largo y precios grandes.
- Estados sin depender solo del color.
- Sin scroll global accidental.
- Sin botones fuera de pantalla.

---

## 21. Definición de terminado por fase

Una fase está terminada solo si:

- Cumple criterios funcionales.
- No hay errores de TypeScript, lint o consola.
- Pasan pruebas unitarias e integración relevantes.
- Se verificó visualmente en navegador con capturas.
- No hay datos genéricos visibles.
- Las migraciones se ejecutan desde cero.
- La seguridad/RLS fue probada cuando aplique.
- Se documentaron variables de entorno sin incluir secretos.
- El README explica cómo ejecutar y probar.
- Se creó un commit claro antes de iniciar la siguiente fase.

---

## 22. Prompts secuenciales para Antigravity

### Prompt 0 — Comprensión y plan

```text
Trabajaremos sobre el proyecto El Huarique de Catacaos.

Lee completamente @docs/PROJECT_SPEC.md antes de proponer cualquier cambio. Usa Planning Mode y no escribas código todavía.

Tu tarea es:
1. Resumir el producto y los límites de la versión 1.
2. Enumerar decisiones confirmadas, supuestos y bloqueos.
3. Proponer un plan por fases que respete exactamente el documento.
4. Detectar contradicciones técnicas, especialmente impresión, modo offline, autenticación, inventario e idempotencia.
5. Proponer criterios de aceptación verificables para la Fase 1.
6. Señalar qué información del restaurante debo confirmar antes de la Fase 4 y antes del piloto.

No generes una aplicación demo. No cambies el stack sin justificarlo. No implementes hasta que yo apruebe el Artifact de Implementation Plan.
```

### Prompt 1 — Repositorio, reglas y calidad

```text
Lee @docs/PROJECT_SPEC.md y el plan aprobado. Implementa solamente la Fase 1.

Crea el monorepo con pnpm para apps/web, apps/print-bridge y paquetes compartidos. Verifica primero las versiones estables actuales y fija dependencias y lockfile. Configura TypeScript estricto, lint, formato, Vitest, Playwright y scripts claros.

Crea reglas breves en .agents/rules, cada una por debajo de 12 000 caracteres, que referencien @docs/PROJECT_SPEC.md. Crea workflows implement-phase y release-check. Añade .env.example sin secretos.

Implementa el sistema visual propio con los tokens exactos de la sección 14 y un catálogo local de componentes: botón, campo, tarjeta, badge de estado, modal, tabla, teclado numérico y shell de tablet. No uses una plantilla genérica ni degradados.

Al terminar:
- ejecuta typecheck, lint y tests;
- abre la aplicación en el navegador integrado;
- valida 1280x800 y 1024x600;
- entrega capturas y lista exacta de archivos cambiados;
- detente y solicita revisión.
```

### Prompt 2 — Supabase, migraciones y semillas

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 2.

Antes de escribir SQL, revisa el changelog y la documentación oficial actual de Supabase para Auth, RLS, Realtime, Data API y CLI. No inventes comandos: consulta --help.

Diseña migraciones reproducibles para el modelo mínimo de la sección 11. Usa UUID, timestamptz, numeric para dinero/cantidades, restricciones, índices compuestos y parciales. Habilita RLS en todas las tablas expuestas y concede Data API explícitamente. Crea políticas por restaurant_id y rol; prueba aislamiento con dos restaurantes.

Crea seed.sql con la carta real de la sección 17. Marca los precios VALIDAR como datos de borrador y no como precios confirmados. Crea los tres salones temporales y 80 mesas 30/25/25.

Implementa la administración básica de categorías, platos, variantes, disponibilidad y precios; no implementes todavía pedidos.

Genera tipos TypeScript desde el esquema. Ejecuta migraciones desde una base vacía, pgTAP y asesores de seguridad/rendimiento. Documenta cualquier diferencia entre el plan y las APIs actuales. Detente para revisión.
```

### Prompt 3 — Usuarios, roles, salones y mesas

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 3.

Construye autenticación por rol: dueña con correo/contraseña y mozos con código + PIN seguro, sin guardar PIN en texto plano. No uses user_metadata para autorización. Implementa bloqueo por intentos, cierre por inactividad y auditoría.

Construye la pantalla de salones y 80 mesas para tablet horizontal. Debe mostrar estado, número, tiempo, mozo y total cuando corresponda; nunca depender solo del color. Implementa apertura, cambio y unión de mesas con controles de concurrencia y registro de auditoría.

Usa el diseño de marca; no uses datos genéricos. Prueba permisos por rol, acceso cruzado entre restaurantes y edición concurrente. Realiza QA visual 1280x800 y 1024x600 y entrega capturas. Detente para revisión.
```

### Prompt 4 — Toma de pedidos

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 4, excepto el ejecutable físico del agente de impresión.

Construye el compositor de pedido en tres zonas: categorías, platos y pedido actual. Usa exclusivamente la carta real. Soporta variantes, modificadores, acompañamientos, observaciones, cantidades, agotados y disponibilidad por día.

Implementa submit_order y append_order_revision como operaciones atómicas e idempotentes. Congela nombres y precios en order_items. Calcula totales en servidor. Cada envío crea exactamente un print_job; los adicionales incluyen solamente ítems nuevos. Implementa solicitud y aprobación de anulaciones con motivo y auditoría.

Simula la confirmación de impresión mediante el adaptador de pruebas, sin afirmar que existe impresión real. Prueba doble toque, reintento de red, dos tablets en una mesa y adicional. Haz QA visual y detente para revisión.
```

### Prompt 5 — Agente real de impresión

```text
Lee @docs/PROJECT_SPEC.md y @docs/RUNBOOK_PRINTING.md. Implementa solamente la Fase 5.

Construye apps/print-bridge en Node.js/TypeScript. Debe reclamar print_jobs atómicamente, imprimir ESC/POS de 80 mm por TCP/IP, confirmar printed_at y soportar polling como respaldo de Realtime. Implementa idempotency_key única, máximo tres reintentos, estado failed, reimpresión COPIA y heartbeat cada 30 segundos.

Nunca expongas service_role al frontend. Agrega adaptador de impresora falsa para CI y una plantilla exacta para NUEVO, ADICIONAL y ANULACIÓN. Crea un runbook de instalación en Windows, IP fija, autoarranque, diagnóstico y reemplazo de papel.

Primero valida con la impresora falsa. Para declarar lista la fase, solicita una prueba manual con el modelo real; no inventes el resultado. Detente para revisión.
```

### Prompt 6 — Caja y pagos

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 6.

Construye caja para pedidos pendientes, solicitud de cuenta, pagos en efectivo, Yape, Plin, tarjeta y mixto. Calcula vuelto. Impide cerrar si pagos != total. Soporta división por monto y deja la división por ítems detrás de una bandera si incrementa el riesgo.

Descuentos y anulaciones requieren autorización según rol y quedan auditados. La mesa se libera solamente tras close_order transaccional e idempotente.

Prueba pagos exactos, insuficientes, excedentes, mixtos, doble envío y permisos. Verifica interfaz táctil y detente para revisión.
```

### Prompt 7 — Inventario y recetas

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 7.

Crea ingredientes, unidades, conversiones, proveedores, compras, recetas, movimientos, saldos, mermas, ajustes y conteos físicos. inventory_movements debe ser inmutable y cada reversión debe generar un nuevo movimiento.

Empieza con un conjunto de demostración controlado: pollo, pescado, arroz, papa, yuca, plátano, aceite, cebolla, limón y sarandaja. Las cantidades de receta deben quedar claramente marcadas como NO CONFIRMADAS hasta que cocina las valide.

Implementa el ejemplo completo de pollo de la sección 13 y un reporte de diferencias. Prueba que reintentos no dupliquen consumo, que una anulación temprana revierta y que una anulación preparada genere merma. Detente para revisión.
```

### Prompt 8 — Dashboard y reportes

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la Fase 8.

Construye el dashboard de la dueña usando las definiciones exactas de la sección 16. Incluye filtros de fecha en America/Lima, ventas, pedidos, ticket promedio, salones, mozos, platos, horas, anulaciones, compras, mermas, stock bajo y estado de impresión.

Usa vistas security_invoker o funciones seguras. No expongas datos financieros a mozos. Añade índices según las consultas y verifica planes cuando sea necesario. Implementa exportación CSV.

No agregues gráficos decorativos. Cada gráfico debe responder una pregunta operativa. Valida cálculos contra consultas SQL de control y detente para revisión.
```

### Prompt 9 — PWA y pérdida de conexión

```text
Lee @docs/PROJECT_SPEC.md. Implementa solamente la parte PWA y resiliencia de la Fase 9.

Configura manifiesto, instalación Android y caché de shell/carta. Implementa borradores en IndexedDB. Cuando no haya red, mostrar de forma persistente: “SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA”. No enviar automáticamente un borrador antiguo al recuperar la conexión: pedir confirmación.

No marcar pedido submitted, inventario consumido ni comanda impresa sin acuse del servidor/agente. Prueba actualización de service worker, datos obsoletos, recuperación, conflicto de mesa y doble toque. Documenta exactamente qué funciona y qué no funciona offline. Detente para revisión.
```

### Prompt 10 — Auditoría, seguridad y pruebas finales

```text
Lee @docs/PROJECT_SPEC.md. Completa la Fase 9 sin agregar funcionalidades fuera de alcance.

Ejecuta revisión de seguridad: secretos, Auth, RLS, IDOR/BOLA, service_role, funciones privilegiadas, vistas, permisos de mozos y acceso cruzado. Ejecuta asesores Supabase y pruebas pgTAP.

Ejecuta typecheck, lint, unitarias, integración y Playwright. Prueba flujo completo, concurrencia, idempotencia, anulaciones, pagos, inventario, errores de impresión y corte de red. Realiza auditoría de accesibilidad y QA visual en tablets.

No ocultes pruebas fallidas. Corrige dentro del alcance y produce un informe con evidencia, riesgos pendientes y checklist de piloto. Detente para aprobación de despliegue.
```

### Prompt 11 — Preparación del piloto

```text
Lee @docs/PROJECT_SPEC.md y @docs/PILOT_CHECKLIST.md.

Prepara un release candidate sin datos de demostración visibles. Verifica configuración de producción, variables, backups, monitoreo, impresora, IP fija, router, UPS, usuarios reales, carta confirmada y numeración real de mesas.

Crea material de capacitación de una página para mozos, caja, dueña y cocina. Incluye procedimiento manual cuando no hay Internet o impresora. No actives los tres salones de inmediato: configura el piloto progresivo de la Fase 10.

Entrega checklist de go/no-go. No declares el sistema listo si falta la prueba de impresión física, una restauración de backup o la confirmación de precios VALIDAR.
```

---

## 23. Preguntas que deben resolverse antes de programar pedidos

1. ¿Cómo se llaman los tres salones y qué mesas pertenecen a cada uno?
2. ¿Las tablets serán compartidas por salón o asignadas a mozos?
3. ¿Quién cobra y con qué métodos?
4. ¿Existe una computadora Windows encendida durante toda la atención?
5. ¿Qué impresora comprarán? Solicitar marca, modelo, ancho, Ethernet/Wi-Fi y ESC/POS.
6. ¿Una sola impresora recibirá todo o habrá cocina/barra/cevichería?
7. ¿Qué sucede actualmente cuando un plato se agota?
8. ¿Se permiten cuentas separadas y unión de mesas?
9. ¿Quién autoriza descuentos y anulaciones?
10. ¿En qué momento cocina considera que un plato ya fue preparado?
11. ¿La dueña necesita consultar el dashboard fuera del restaurante?
12. ¿Qué insumos se medirán en la primera semana?
13. ¿Las recetas tienen cantidades estandarizadas?
14. ¿Qué precios manuscritos de la carta son definitivos?
15. ¿Faltan bebidas, postres o platos del día?

---

## 24. Checklist de compra de hardware

### Tablets

- Android con soporte vigente.
- Pantalla de 10 pulgadas o más.
- Wi-Fi 5/6 estable.
- Al menos 4 GB de RAM.
- Funda resistente y soporte/correa.
- Cargadores identificados.
- Modo kiosco o acceso restringido recomendado.

### Impresora

- Térmica de 80 mm.
- Ethernet preferida.
- ESC/POS.
- Corte automático.
- Puerto 9100 o protocolo documentado.
- Repuestos y rollos disponibles localmente.

### Infraestructura

- Router con red de operación separada.
- Respaldo 4G/5G.
- UPS.
- Computadora o mini-PC para el agente de impresión.
- Cableado Ethernet para impresora cuando sea posible.

No comprar un modelo específico antes de comprobar compatibilidad con ESC/POS por red.

---

## 25. Fuentes técnicas de referencia

- Antigravity — Getting Started: https://antigravity.google/docs/getting-started
- Antigravity — Rules and Workflows: https://antigravity.google/docs/rules-workflows
- Antigravity — Artifact Review: https://antigravity.google/docs/artifact-review
- Antigravity — Skills: https://antigravity.google/docs/skills
- Supabase — Changelog: https://supabase.com/changelog
- Supabase — Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase — Realtime Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase — Local Development: https://supabase.com/docs/guides/local-development

---

## 26. Resultado esperado

Al finalizar, El Huarique de Catacaos tendrá una PWA instalada en sus tablets, una operación de mesas y pedidos adaptada a su carta, comandas de cocina trazables, caja controlada, inventario por recetas y un dashboard útil para la dueña. La aplicación debe sentirse creada para este restaurante, no adaptada superficialmente desde un ejemplo genérico.
