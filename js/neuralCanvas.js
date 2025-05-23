// ZENØ neuralCanvas.js – fixed node bounce and movement

console.log("✅ neuralCanvas.js loaded");
const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Canvas context not supported');
}

let width, height;
let nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;

// Global speed multiplier for node movement
const SPEED_MULTIPLIER = 0.2;

const mouse = { x: 0, y: 0, active: false };

// Resize canvas to fill window
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = 'block';

  // Debugging log to ensure resize is happening
  console.log(`Canvas resized: width=${width}, height=${height}`);
}

// Function to generate random velocity for nodes
function getRandomVelocity() {
  let speed;
  do {
    speed = (Math.random() - 0.5) * SPEED_MULTIPLIER;
  } while (Math.abs(speed) < SPEED_MULTIPLIER / 6); // ensure it's not too slow
  return speed;
}

// Node class to represent each animated point
class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = getRandomVelocity();
    this.vy = getRandomVelocity();
    this.radius = 2 + Math.random() * 2; // Random radius between 2 and 4
    const colors = ['#39ff14', '#00ffe7', '#00ffa0'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  // Move node based on velocity
  move() {
    this.x += this.vx;
    this.y += this.vy;

    console.log(`Node position: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}, vx=${this.vx}, vy=${this.vy}`); // Debug position and velocity

    // Repel nodes from the mouse pointer
    repelFromMouse(this);

    // Check for boundary collisions and reverse velocity if needed
    if (this.x <= 0 || this.x >= width) this.vx *= -1;
    if (this.y <= 0 || this.y >= height) this.vy *= -1;
  }

  // Draw the node on the canvas
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Apply repulsion force when mouse hovers over the nodes
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

  // Apply damping to velocities to slow them down over time
  node.vx *= 0.95;
  node.vy *= 0.95;
}

// Connect nodes with lines if they are close enough
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

// Animation loop: updates node positions and redraws canvas
function animate() {
  console.log("⏳ animation frame"); // Debug line to verify animation loop

  ctx.clearRect(0, 0, width, height);
  nodes.forEach(node => {
    node.move();
    node.draw();
  });
  connectNodes();
  requestAnimationFrame(animate);
}

// Initialize the canvas and create nodes
function init() {
  resize();
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
  }
  animate();
}

// Event listeners for resizing canvas and mouse movements
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(init, 200); // debounce resizing
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
