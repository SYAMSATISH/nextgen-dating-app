const { createCanvas } = require('canvas');
const fs = require('fs');

function drawLogo(size, radius, heartScale, fontSize1, fontSize2, outPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  const cx = size / 2;
  const cy = size * 0.38;
  const s = heartScale;
  ctx.fillStyle = '#E91E63';
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.2);
  ctx.bezierCurveTo(cx, cy - s * 0.1, cx - s * 0.5, cy - s * 0.5, cx - s * 0.5, cy - s * 0.1);
  ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.5, cx, cy - s * 0.3, cx, cy + s * 0.2);
  ctx.bezierCurveTo(cx, cy - s * 0.3, cx + s * 0.5, cy - s * 0.5, cx + s * 0.5, cy - s * 0.1);
  ctx.bezierCurveTo(cx + s * 0.5, cy - s * 0.5, cx, cy - s * 0.1, cx, cy + s * 0.2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold ' + fontSize1 + 'px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('NextGen', cx, size * 0.68);
  ctx.fillStyle = '#E91E63';
  ctx.backgroundColor = '#02020a';
  ctx.font = fontSize2 + 'px Arial';
  ctx.fillText('DATING', cx, size * 0.82);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Created: ' + outPath);
}

drawLogo(1024, 200, 280, 120, 60, 'assets/images/icon.png');
drawLogo(1024, 200, 280, 120, 60, 'assets/images/adaptive-icon.png');
drawLogo(300, 60, 80, 36, 18, 'assets/images/splash-icon.png');
drawLogo(64, 12, 16, 8, 4, 'assets/images/favicon.png');
console.log('All logos created!');
