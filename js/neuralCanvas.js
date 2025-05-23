const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
const NODE_COUNT = 100;
const MAX_DISTANCE = 150;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = 2 + Math.random() * 2;
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
    ctx.fillStyle = '#39ff14';
    ctx.fill();
  }
}

function connectNodes() {
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
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

function animate() {
  ctx.clearRect(0, 0, width, height);
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

window.addEventListener('resize', () => {
  resize();
});

init();
