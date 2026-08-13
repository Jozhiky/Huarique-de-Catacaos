# Regla de Producto: El Huarique de Catacaos

## Fuente Principal de Verdad

Esta regla se deriva y complementa a `docs/PROJECT_SPEC.md` (Versión 1.2). Toda decisión funcional debe alinearse con la especificación maestra.

## Contexto y Alcance Operativo

1. **Restaurante Real:** Sistema operativo para **El Huarique de Catacaos** (Catacaos, Piura, Perú), no un demo ni una plantilla genérica.
2. **Capacidad y Salones:** 3 salones, aproximadamente 80 mesas (distribución inicial 30/25/25), 3 tablets Android en modo horizontal.
3. **Flujo Operativo Núcleo:**
   $$\text{Mozo} \to \text{Salón/Mesa} \to \text{Pedido} \to \text{Comanda} \to \text{Cocina} \to \text{Cobro} \to \text{Inventario} \to \text{Reportes}$$
4. **Moneda y Formato:** Soles peruanos (`PEN`), visualmente `S/ 30.00` con cifras tabulares y 2 decimales fijos.
5. **Zona Horaria:** `America/Lima` para todas las aperturas de turno, cierres de caja y timestamps de comanda.

## Reglas No Negociables de Negocio

- Toda la interfaz debe estar en español de Perú.
- Usar exclusivamente los platos e insumos reales de la carta tradicional de Catacaos (tamalito verde, seco de chavelo, majado de yuca, malarabia, ceviches, etc.). Prohibido usar hamburguesas, pizzas o sushi de muestra.
- Los precios manuscritos marcados con `VALIDAR` en la carta son borradores y no deben considerarse definitivos hasta la confirmación de la dueña.
- Fuera de alcance en V1: Facturación electrónica directa SUNAT, delivery, reservas en línea, CRM de puntos y cartas QR públicas.
- Las comandas a cocina nunca se marcan como enviadas sin confirmación del servidor, ni como impresas sin acuse de la cola de impresión.
- Modo Offline Honesto: Si no hay conexión, se muestra un banner superior ámbar permanente: _"SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA"_. No se deduce inventario ni se promete comanda impresa hasta recibir confirmación del backend.
