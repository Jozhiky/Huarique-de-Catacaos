const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawFn) {
  // Buffer de píxeles RGBA (4 bytes por píxel)
  const buffer = Buffer.alloc(width * height * 4, 0); // Todo 0 = Transparencia alfa real (RGBA: 0,0,0,0)

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
    // Alpha blending
    const existingA = buffer[idx + 3] / 255;
    const newA = a / 255;
    const outA = newA + existingA * (1 - newA);
    if (outA > 0) {
      buffer[idx] = Math.round((r * newA + buffer[idx] * existingA * (1 - newA)) / outA);
      buffer[idx + 1] = Math.round((g * newA + buffer[idx + 1] * existingA * (1 - newA)) / outA);
      buffer[idx + 2] = Math.round((b * newA + buffer[idx + 2] * existingA * (1 - newA)) / outA);
      buffer[idx + 3] = Math.round(outA * 255);
    }
  }

  function drawLine(x0, y0, x1, y1, r, g, b, a = 255, thickness = 1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;

    while (true) {
      for (let tx = -Math.floor(thickness / 2); tx <= Math.floor(thickness / 2); tx++) {
        for (let ty = -Math.floor(thickness / 2); ty <= Math.floor(thickness / 2); ty++) {
          setPixel(x + tx, y + ty, r, g, b, a);
        }
      }
      if (Math.abs(x - x1) < 1 && Math.abs(y - y1) < 1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius) {
          setPixel(cx + x, cy + y, r, g, b, a);
        }
      }
    }
  }

  function fillEllipse(cx, cy, rx, ry, r, g, b, a = 255) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
          setPixel(cx + x, cy + y, r, g, b, a);
        }
      }
    }
  }

  function drawArc(cx, cy, radius, startAngle, endAngle, r, g, b, a = 255, thickness = 2) {
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / steps;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      for (let tx = -Math.floor(thickness / 2); tx <= Math.floor(thickness / 2); tx++) {
        for (let ty = -Math.floor(thickness / 2); ty <= Math.floor(thickness / 2); ty++) {
          setPixel(x + tx, y + ty, r, g, b, a);
        }
      }
    }
  }

  drawFn({ setPixel, drawLine, fillCircle, fillEllipse, drawArc, width, height });

  // Crear scanlines PNG (1 byte de filtro 0 por fila + ancho*4 bytes)
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowStart = y * scanlineLength;
    rawData[rowStart] = 0; // Filter: None
    buffer.copy(rawData, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  // PNG Chunks
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  // CRC32 table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = crcTable[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Gold Color #C3A55F -> R: 195, G: 165, B: 95
const GOLD_R = 195;
const GOLD_G = 165;
const GOLD_B = 95;

const pngBuffer = createPng(600, 200, ({ drawLine, fillCircle, fillEllipse, drawArc }) => {
  // 1. Arco decorativo superior
  drawArc(100, 150, 60, Math.PI, 2 * Math.PI, GOLD_R, GOLD_G, GOLD_B, 255, 4);
  drawArc(100, 150, 50, Math.PI, 2 * Math.PI, GOLD_R, GOLD_G, GOLD_B, 255, 2);

  // 2. Vasija tradicional inclinada
  fillEllipse(85, 95, 22, 28, GOLD_R, GOLD_G, GOLD_B, 255);
  // Boca y asa de vasija
  drawLine(75, 68, 95, 68, GOLD_R, GOLD_G, GOLD_B, 255, 4);
  drawLine(77, 60, 93, 60, GOLD_R, GOLD_G, GOLD_B, 255, 4);

  // 3. Flujo de Chicha
  drawLine(106, 105, 126, 142, GOLD_R, GOLD_G, GOLD_B, 255, 4);

  // 4. Recipiente / Poto receptor
  fillEllipse(128, 148, 12, 10, GOLD_R, GOLD_G, GOLD_B, 255);

  // 5. Base
  drawLine(30, 156, 170, 156, GOLD_R, GOLD_G, GOLD_B, 255, 3);
  fillCircle(100, 156, 3, GOLD_R, GOLD_G, GOLD_B, 255);

  // 6. Wordmark "HUARIQUE DE CATACAOS" en Dorado #C3A55F
  // Línea separadora decorativa
  drawLine(198, 124, 570, 124, GOLD_R, GOLD_G, GOLD_B, 180, 2);
});

const outDir = path.resolve(__dirname, '../apps/web/public/brand');
fs.mkdirSync(outDir, { recursive: true });
const targetFile = path.join(outDir, 'huarique-logo-transparente.png');
fs.writeFileSync(targetFile, pngBuffer);
console.log('Logo PNG con transparencia alfa generado exitosamente en:', targetFile);
