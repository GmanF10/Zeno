// ZENØ neuralCanvas.js – with enhancements

const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Canvas context not supported');
}

let width, height;
let nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;

const mouse = { x: 0, y: 0, active: false };

// Resize Canvas Function
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
  canvas.style.display = 'block'; // prevent scrollbars
}

// Node Class Definition
class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = 2 + Math.random() * 2;
    const colors = ['#39ff14', '#00ffe7', '#00ffa0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    repelFromMouse(this);

    if (this.x <= 0 || this.x >= width) this.vx *= -1;
    if (this.y <= 0 || this.y >= height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Repel effect from mouse
function repelFromMouse(node) {
  if (!mouse.active) return;

  const dx = node.x - mouse.x;
  const dy = node.y - mouse.y;
  const dist = Math.hypot(dx, dy);

  const repelRadius = 150;
  if (dist < repelRadius) {
    const force = (repelRadius - dist) / repelRadius;
    const angle = Math.atan2(dy, dx);
    node.vx += Math.cos(angle) * force * 0.3;
    node.vy += Math.sin(angle) * force * 0.3;
  }

  node.vx *= 0.95;
  node.vy *= 0.95;
}

// Connect Nodes Function
function connectNodes() {
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < MAX_DISTANCE) {
        ctx.strokeStyle = `rgba(57, 255, 20, ${1 - dist / MAX_DISTANCE})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
}

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, width, height);
  nodes.forEach(node => {
    node.move();
    node.draw();
  });
  connectNodes();
  requestAnimationFrame(animate);
}

// Initialize Nodes
function init() {
  resize();
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
  }
  animate();
}

// Event Listeners
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(init, 200);
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener('mouseleave', () => {
  mouse.active = false;
});

// Start the animation on page load
window.addEventListener('load', init);
