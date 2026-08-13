# Regla de Frontend y Diseño Visual: El Huarique de Catacaos

## Referencia

Esta regla implementa las directrices de interfaz y diseño visual de `docs/PROJECT_SPEC.md` (Sección 14 y 15).

## Identidad Visual y Tokens de Marca

La paleta institucional oficial está compuesta por:

- `brand.navy`: `#0B3156` (encabezados, navegación principal, fondo oficial del logo).
- `brand.gold`: `#C3A55F` (símbolo, wordmark y acentos de marca).
- `brand.coastal`: `#1677A6` (acciones secundarias, enlaces, salón activo).
- `brand.cream`: `#F6F0E4` (fondo cálido principal).
- `brand.sand`: `#D9C79D` (superficies cálidas secundarias y bordes suaves).
- `surface`: `#FFFFFF` (tarjetas y modales).
- `neutral.900`: `#1F2933` (texto principal).
- `neutral.600`: `#5B6872` (texto secundario).
- `neutral.200`: `#DCE2E6` (bordes).
- `success`: `#287A4B` (libre, impreso, pagado).
- `warning`: `#C98316` (en cocina, cuenta, stock bajo).
- `danger`: `#B83838` (error, anulación, agotado).

_Prohibido usar `#F2C94C` y `#8A4B35` como colores principales._

## Activo Oficial del Logo

- Archivo: `apps/web/public/brand/huarique-logo-transparente.png`.
- Posee transparencia alfa real. El color azul marino `#0B3156` pertenece a los contenedores de la interfaz, no está incrustado en el PNG.
- No deformar, no redibujar, no alterar su geometría, tipografía, símbolo ni la letra `Q` especial de Catacaos. Wordmark exacto: `HUARIQUE DE CATACAOS`.

## Ergonomía Táctil y Directrices de Maquetación

1. **Dispositivos Objetivo:** Tablets Android en orientación horizontal ($1280 \times 800$ y $1024 \times 600$).
2. **Targets Táctiles:** Mínimo absoluto de $48 \times 48\text{ px}$ para botones, tarjetas de mesa, selector de platos y teclados numéricos.
3. **Cero Degradados:** Sin degradados, sin brillos tipo neón ni fondos de vidrio translúcido con desenfoques pesados.
4. **Layout Estable:** Evitar scroll global en las pantallas operativas (mesas, toma de pedidos, caja). El scroll debe quedar estrictamente confinado a los contenedores internos de contenido.
5. **Tipografía Local (Offline-Ready):** Títulos en **Barlow Condensed**, interfaz y tablas en **Inter**. No depender de Google Fonts en tiempo de ejecución.
6. **Estados Visuales Accesibles:** Nunca depender exclusivamente del color para comunicar estados; incluir siempre texto descriptivo y/o iconos (cumplimiento WCAG AA).
