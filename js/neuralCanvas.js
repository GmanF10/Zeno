const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;
const dpr = window.devicePixelRatio || 1;

const mouse = {
  x: 0,
  y: 0,
  active: false,
};

// Canvas Resize Function
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Node Class Definition
class Node {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = 2 + Math.random() * 3;
    const colors = ['#39ff14', '#00ffe7', '#00ffa0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    repelFromMouse(this, mouse);

    // Bounce off edges
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

// Mouse Interaction
function repelFromMouse(node, mouse) {
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

  // Smooth deceleration
  node.vx *= 0.95;
  node.vy *= 0.95;
}

// Connect Nodes with lines
function connectNodes() {
  for (let i = 0; i < NODE_COUNT - 1; i++) {
    const nodeA = nodes[i];
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const nodeB = nodes[j];
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const dist = Math.hypot(dx, dy);

      if (dist < MAX_DISTANCE) {
        ctx.strokeStyle = `rgba(57, 255, 20, ${1 - dist / MAX_DISTANCE})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      }
    }
  }
}

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, width, height);
  nodes.forEach((node) => {
    node.move();
    node.draw();
  });
  connectNodes();
  requestAnimationFrame(animate);
}

// Initialization Function
function init() {
  resize();
  nodes.length = 0; // Clear existing nodes
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
  }
  animate();
}

// Debounce Resize Event for Performance
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(init, 200);
});

// Mouse Event Listeners
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener('mouseleave', () => {
  mouse.active = false;
});

// Start Animation
init();
