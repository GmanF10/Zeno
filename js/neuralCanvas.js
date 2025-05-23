const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;
const MAX_DISTANCE_SQ = MAX_DISTANCE * MAX_DISTANCE;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any previous transforms
  ctx.scale(dpr, dpr);
}

function randomNeonGreen() {
  const r = Math.floor(Math.random() * 30);
  const g = 200 + Math.floor(Math.random() * 55);
  const b = Math.floor(Math.random() * 40);
  return `rgba(${r},${g},${b},0.8)`;
}

class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = 1 + Math.random() * 4;
    this.color = randomNeonGreen();
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x <= 0 || this.x >= width) this.vx *= -1;
    if (this.y <= 0 || this.y >= height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
  }
}

function connectNodes() {
  ctx.lineWidth = 1;
  ctx.shadowColor = 'rgba(57, 255, 20, 0.6)';
  ctx.shadowBlur = 6;

  const len = nodes.length;
  for (let i = 0; i < len; i++) {
    const nodeA = nodes[i];
    const ax = nodeA.x;
    const ay = nodeA.y;
    for (let j = i + 1; j < len; j++) {
      const nodeB = nodes[j];
      const dx = ax - nodeB.x;
      const dy = ay - nodeB.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < MAX_DISTANCE_SQ) {
        const opacity = 1 - distSq / MAX_DISTANCE_SQ;
        ctx.strokeStyle = `rgba(57, 255, 20, ${opacity.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      }
    }
  }

  ctx.shadowBlur = 0; // Reset shadow after drawing lines
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  const len = nodes.length;
  for (let i = 0; i < len; i++) {
    nodes[i].move();
    nodes[i].draw();
  }
  connectNodes();
  requestAnimationFrame(animate);
}

// Debounced resize event for better performance
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resize();
    // Reset node positions within new bounds
    nodes.forEach(node => {
      node.x = Math.min(node.x, width);
      node.y = Math.min(node.y, height);
    });
  }, 150);
});

function init() {
  resize();
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
  }
  animate();
}

init();
