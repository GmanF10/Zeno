(function() {
  const canvasManager = (() => {
    let canvas, ctx;
    let width = window.innerWidth, height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let nodes = [], particles = [];
    const NODE_COUNT = 100, PARTICLE_COUNT = 120, MAX_DISTANCE = 120, GRID_SIZE = 150;
    let grid = {};
    let lastMouseMoveTime = 0;
    let lastMousePosition = { x: 0, y: 0 };
    const mouseMoveThreshold = 30; // pixels

    function init() {
      // Check if canvas already exists
      canvas = document.getElementById('neuralCanvas');
      if (!canvas) {
        canvas = createCanvas();  // Only create canvas if it doesn't exist
      }

      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('2D context not available for neuralCanvas.');
        return;
      }

      console.log('Canvas:', canvas);
      console.log('Context:', ctx);

      resize();
      setupListeners();
      initNodesParticles();
    }

    function createCanvas() {
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'neuralCanvas';
      newCanvas.style.position = 'fixed';
      newCanvas.style.top = '0';
      newCanvas.style.left = '0';
      newCanvas.style.width = '100vw';
      newCanvas.style.height = '100vh';
      newCanvas.style.zIndex = '-1';  // Ensure it's behind other content
      newCanvas.style.background = 'transparent'; // Make the background transparent
      document.body.appendChild(newCanvas);
      return newCanvas;
    }

    const mouse = { x: 0, y: 0, active: false };
    function setupListeners() {
      canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
        console.log('Mouse Position:', mouse.x, mouse.y);  // Debugging log for mouse position
      });

      canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
      });
    }

    function updateGrid() {
      grid = {};  // Reset the grid each time
      nodes.forEach((node) => {
        const gridX = Math.floor(node.x / GRID_SIZE);
        const gridY = Math.floor(node.y / GRID_SIZE);
        const key = `${gridX},${gridY}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(node);  // Add node to the grid cell
      });
    }

    function repelFromMouse() {
      if (!mouse.active) return;

      const currentTime = Date.now();
      if (currentTime - lastMouseMoveTime > 50 || 
          (Math.abs(mouse.x - lastMousePosition.x) > mouseMoveThreshold || Math.abs(mouse.y - lastMousePosition.y) > mouseMoveThreshold)) {
        lastMouseMoveTime = currentTime;
        lastMousePosition = { x: mouse.x, y: mouse.y };

        const gridX = Math.floor(mouse.x / GRID_SIZE);
        const gridY = Math.floor(mouse.y / GRID_SIZE);
        const nearbyCells = [
          `${gridX},${gridY}`, `${gridX-1},${gridY}`, `${gridX+1},${gridY}`,
          `${gridX},${gridY-1}`, `${gridX},${gridY+1}`, `${gridX-1},${gridY-1}`,
          `${gridX+1},${gridY+1}`, `${gridX-1},${gridY+1}`, `${gridX+1},${gridY-1}`
        ];

        const repelRadius = 150, repelRadiusSquared = repelRadius * repelRadius;

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
    }

    function initNodesParticles() {
      nodes = Array.from({ length: NODE_COUNT }, () => new Node());
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

      console.log('Created nodes:', nodes);
      console.log('Created particles:', particles);

      requestAnimationFrame(animate);  // Start the animation loop
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (dpr !== 1) ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      console.log('Canvas dimensions:', width, height);
      console.log('Device Pixel Ratio:', dpr);

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

    function animate() {
      console.log('Animating...');
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => { p.move(); p.draw(); });
      nodes.forEach((node) => {
        repelFromMouse();
        node.move();
        node.draw();
      });

      updateGrid();  // Update the grid
      connectNodes();
      requestAnimationFrame(animate);  // Continue the animation
    }

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

        this.radius += 0.02 * this.pulseDirection;
        if (this.radius > this.baseRadius * 1.3 || this.radius < this.baseRadius * 0.7) {
          this.pulseDirection *= -1;
        }

        this.colorHue += 0.2;
        if (this.colorHue > 200) this.colorHue = 140;
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

    class Particle {
      static CONSTANTS = {
        RADIUS_MIN: 0.3,
        RADIUS_MAX: 1.1,
        OPACITY_MIN: 0.1,
        OPACITY_MAX: 0.4,
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

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      canvasManager.resizeCanvas();
    }, 300);
  });
})();
