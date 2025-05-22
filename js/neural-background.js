// neural-background.js

const canvas = document.createElement('canvas');
canvas.id = 'neuralCanvas';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let width, height;
let nodes = [];
const numNodes = 100;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function createNodes() {
  nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
}

function drawConnections() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    ctx.beginPath();
    ctx.arc(nodeA.x, nodeA.y, 2, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const opacity = 1 - distance / 100;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      }
    }
  }
}

function updateNodes() {
  for (let node of nodes) {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  }
}

function animate() {
  updateNodes();
  drawConnections();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createNodes();
});

resizeCanvas();
createNodes();
animate();
