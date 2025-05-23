// ZENØ neuralCanvas.js – fixed node bounce and movement

console.log("✅ neuralCanvas.js loaded");
const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d'); // ctx is still needed for rendering

let width, height;
let nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;

// Global speed multiplier for node movement
const SPEED_MULTIPLIER = 0.1;  // Slower speed for smoother movement

// Resize canvas to fill window
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;  // Set canvas width to window width
  canvas.height = height;  // Set canvas height to window height
  canvas.style.display = 'block'; // Ensure canvas is visible

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
    this.x = Math.random() * width;  // Initial X position
    this.y = Math.random() * height;  // Initial Y position
    this.vx = getRandomVelocity();  // Horizontal velocity
    this.vy = getRandomVelocity();  // Vertical velocity
    this.radius = 2 + Math.random() * 2;  // Random radius between 2 and 4
    this.pulseDirection = 1;
    this.colorHue = 140 + Math.random() * 60; // green to cyan hues
  }

  // Move node based on velocity
  move() {
    this.x += this.vx;
    this.y += this.vy;

    // Pulse radius gently
    this.radius += 0.02 * this.pulseDirection;
    if (this.radius > this.baseRadius * 1.3 || this.radius < this.baseRadius * 0.7) {
      this.pulseDirection *= -1;
    }

    // Slowly shift color hue
    this.colorHue += 0.2;
    if (this.colorHue > 200) this.colorHue = 140;

    // Check for boundary collisions and reverse velocity if needed
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx *= -1;  // Reverse horizontal velocity
    }
    if (this.x + this.radius >= width) {
      this.x = width - this.radius;
      this.vx *= -1;  // Reverse horizontal velocity
    }

    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.vy *= -1;  // Reverse vertical velocity
    }
    if (this.y + this.radius >= height) {
      this.y = height - this.radius;
      this.vy *= -1;  // Reverse vertical velocity
    }
  }

  // Draw the node on the canvas
  draw() {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
    gradient.addColorStop(0, `hsla(${this.colorHue}, 100%, 70%, 0.9)`);
    gradient.addColorStop(1, `hsla(${this.colorHue}, 100%, 70%, 0)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${this.colorHue}, 100%, 70%)`;
    ctx.shadowColor = `hsl(${this.colorHue}, 100%, 70%)`;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Connect nodes with lines if they are close enough
function connectNodes() {
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < MAX_DISTANCE) {
        const alpha = 1 - dist / MAX_DISTANCE;
        ctx.strokeStyle = `hsla(${nodes[i].colorHue}, 100%, 70%, ${alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Move and draw nodes
  nodes.forEach((node) => {
    node.move();
    node.draw();
  });

  connectNodes();

  requestAnimationFrame(animate);
}

function init() {
  resize();

  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Node());
  }

  animate();
}

window.addEventListener('resize', resize);
init();
