(function() {
  const canvasManager = (() => {
    let canvas;
    let ctx;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let nodes = [];
    let particles = [];
    const NODE_COUNT = 100;
    const PARTICLE_COUNT = 120; // Number of background particles
    const MAX_DISTANCE = 120; // Maximum distance for node connections
    const GRID_SIZE = 150; // Size of each grid cell for spatial partitioning
    let grid = {};

    // Initialize the canvas and context
    function init() {
      canvas = document.getElementById('neuralCanvas');
      if (canvas) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas context is invalid. Replacing the canvas element.');
          canvas.remove();
          canvas = null;
        }
      }
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'neuralCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.background = 'transparent';
        document.body.appendChild(canvas);
      }
      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('2D context not available for neuralCanvas.');
        return;
      }
      resize();
      setupListeners();
    }

    // Mouse repulsion interaction for nodes
    const mouse = {
      x: 0,
      y: 0,
      active: false
    };

    // Update the grid to optimize node proximity checks
    function updateGrid() {
      grid = {};
      nodes.forEach((node) => {
        const gridX = Math.floor(node.x / GRID_SIZE);
        const gridY = Math.floor(node.y / GRID_SIZE);
        const key = `${gridX},${gridY}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(node);
      });
    }

    // Handle mouse repulsion based on grid cells
    function repelFromMouse(node) {
      if (!mouse.active) return;
      const gridX = Math.floor(mouse.x / GRID_SIZE);
      const gridY = Math.floor(mouse.y / GRID_SIZE);
      const nearbyCells = [
        `${gridX},${gridY}`,
        `${gridX - 1},${gridY}`,
        `${gridX + 1},${gridY}`,
        `${gridX},${gridY - 1}`,
        `${gridX},${gridY + 1}`,
        `${gridX - 1},${gridY - 1}`,
        `${gridX + 1},${gridY + 1}`,
        `${gridX - 1},${gridY + 1}`,
        `${gridX + 1},${gridY - 1}`,
      ];

      const repelRadius = 150;
      const repelRadiusSquared = repelRadius * repelRadius;

      nearbyCells.forEach((key) => {
        if (grid[key]) {
          grid[key].forEach((otherNode) => {
            const dx = otherNode.x - mouse.x;
            const dy = otherNode.y - mouse.y;
            const distSquared = dx * dx + dy * dy;
            if (distSquared < repelRadiusSquared) {
              const dist = Math.sqrt(distSquared);
              const force = (repelRadius - dist) / repelRadius;
              const angle = Math.atan2(dy, dx);
              otherNode.vx += Math.cos(angle) * force * 0.5;
              otherNode.vy += Math.sin(angle) * force * 0.5;
            }
          });
        }
      });
    }

    // Set up event listeners for mouse interaction
    function setupListeners() {
      if (!canvas) return;
      canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      });

      canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
      });
    }

    // Node class for the moving points
    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.baseRadius = 1 + Math.random() * 2.5;
        this.radius = this.baseRadius;
        this.pulseDirection = 1;
        this.colorHue = 140 + Math.random() * 60; // green to cyan hues
      }

      move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x <= 0 || this.x >= width) this.vx *= -1;
        if (this.y <= 0 || this.y >= height) this.vy *= -1;

        // Pulse radius gently
        this.radius += 0.02 * this.pulseDirection;
        if (this.radius > this.baseRadius * 1.3 || this.radius < this.baseRadius * 0.7) {
          this.pulseDirection *= -1;
        }

        // Slowly shift color hue
        this.colorHue += 0.2;
        if (this.colorHue > 200) this.colorHue = 140; // Reset to the lower bound of the initialization range
      }

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
        ctx.shadowBlur = 0;
        ctx.shadowColor = `hsl(${this.colorHue}, 100%, 70%)`;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `hsla(${this.colorHue}, 100%, 70%, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    }

    // Particle class for background effect
    class Particle {
      static CONSTANTS = {
        RADIUS_MIN: 0.3,
        RADIUS_MAX: 1.1, // RADIUS_MIN + 0.8
        OPACITY_MIN: 0.1,
        OPACITY_MAX: 0.4, // OPACITY_MIN + 0.3
      };

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * (Particle.CONSTANTS.RADIUS_MAX - Particle.CONSTANTS.RADIUS_MIN) + Particle.CONSTANTS.RADIUS_MIN;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * (Particle.CONSTANTS.OPACITY_MAX - Particle.CONSTANTS.OPACITY_MIN) + Particle.CONSTANTS.OPACITY_MIN;
      }

      move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57, 255, 20, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Connect nodes with lines if they're close enough
    function connectNodes() {
      const nearbyCellsOffsets = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]
      ];

      Object.keys(grid).forEach((key) => {
        const [gridX, gridY] = key.split(',').map(Number);
        const currentCellNodes = grid[key];

        nearbyCellsOffsets.forEach(([offsetX, offsetY]) => {
          const neighborKey = `${gridX + offsetX},${gridY + offsetY}`;
          if (grid[neighborKey]) {
            const neighborNodes = grid[neighborKey];
            currentCellNodes.forEach((nodeA) => {
              neighborNodes.forEach((nodeB) => {
                if (nodeA !== nodeB) {
                  const dx = nodeA.x - nodeB.x;
                  const dy = nodeA.y - nodeB.y;
                  const distSquared = dx * dx + dy * dy;
                  if (distSquared < MAX_DISTANCE * MAX_DISTANCE) {
                    const dist = Math.sqrt(distSquared);
                    const alpha = 1 - dist / MAX_DISTANCE;
                    ctx.strokeStyle = `hsla(${nodeA.colorHue}, 100%, 70%, ${alpha * 0.7})`;
                    ctx.lineWidth = 1;
                    ctx.shadowColor = `hsl(${nodeA.colorHue}, 100%, 70%)`;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                  }
                }
              });
            });
          }
        });
      });
    }

    // Animation loop function
    let animationFrameId = null;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Draw particles first (background)
      particles.forEach((p) => {
        p.move();
        p.draw();
      });

      // Move and draw nodes
      nodes.forEach((node) => {
        repelFromMouse(node);
        node.move();
        node.draw();
      });

      updateGrid();
      connectNodes();

      animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize the canvas, nodes, and particles
    function initNodesParticles() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node());
      }

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    // Resize the canvas and reinitialize nodes/particles if needed
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      if (canvas && ctx) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (dpr !== 1) ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
      }
      // Reinitialize nodes and particles to fit new size
      if (ctx) {
        nodes.forEach((node) => {
          node.x = Math.random() * width;
          node.y = Math.random() * height;
          node.vx = (Math.random() - 0.5) * 0.6;
          node.vy = (Math.random() - 0.5) * 0.6;
        });

        particles.forEach((particle) => {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          particle.vx = (Math.random() - 0.5) * 0.15;
          particle.vy = (Math.random() - 0.5) * 0.15;
        });
      }
    }

    return {
      initCanvas: init,
      initializeCanvas: init,
      initializeEntities: initNodesParticles,
      resize: resize,
      resizeCanvas: resize
    };
  })();

  canvasManager.initCanvas();
  document.addEventListener('DOMContentLoaded', () => {
    canvasManager.initializeCanvas();
  });

  // Resize event handling
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      canvasManager.resizeCanvas();
    }, 300);
  });
})();
