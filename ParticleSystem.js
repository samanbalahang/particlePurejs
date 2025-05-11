class ParticleSystem {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      particleCount: 2000,
      baseColor: [0.75, 0.15, 0.25], // Base RGB color (values 0-1)
      colorVariation: 0.5, // How much colors vary from base
      pointSize: 3.0,
      mouseRadius: 0.5, // How close mouse needs to be to affect particles
      mouseForce: 0.01, // Strength of mouse influence
      returnSpeed: 0.02, // How quickly particles return to base
      velocityDamping: 0.95, // How quickly velocity slows down
      noiseAmount: 0.5, // Randomness in particle movement
      ...config
    };

    this.initWebGL();
    this.initParticles();
    this.initShaders();
    this.initBuffers();
    this.setupEventListeners();
  }

  initWebGL() {
    this.canvas = document.getElementById('glCanvas');
    this.gl = this.canvas.getContext('webgl');
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());

    this.mouse = { 
      x: 0, 
      y: 0,
      prevX: 0,
      prevY: 0,
      isMoving: false
    };

    window.addEventListener('mousemove', (e) => {
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = (e.clientX / this.canvas.width) * 2 - 1;
      this.mouse.y = -(e.clientY / this.canvas.height) * 2 + 1;
      this.mouse.isMoving = Math.abs(this.mouse.x - this.mouse.prevX) > 0.001 || 
                           Math.abs(this.mouse.y - this.mouse.prevY) > 0.001;
    });
  }

  initParticles() {
    const { particleCount, baseColor, colorVariation } = this.config;
    
    this.positions = new Float32Array(particleCount * 3);
    this.colors = new Float32Array(particleCount * 3);
    this.velocities = new Float32Array(particleCount * 2);
    this.basePositions = new Float32Array(particleCount * 2);

    for (let i = 0; i < particleCount; i++) {
      // Random base positions
      this.basePositions[i * 2] = Math.random() * 2 - 1;
      this.basePositions[i * 2 + 1] = Math.random() * 2 - 1;
      
      // Current positions
      this.positions[i * 3] = this.basePositions[i * 2];
      this.positions[i * 3 + 1] = this.basePositions[i * 2 + 1];
      this.positions[i * 3 + 2] = 0;
      
      // Colors based on base color with variation
      this.colors[i * 3] = baseColor[0] + (Math.random() - 0.5) * colorVariation;
      this.colors[i * 3 + 1] = baseColor[1] + (Math.random() - 0.5) * colorVariation;
      this.colors[i * 3 + 2] = baseColor[2] + (Math.random() - 0.5) * colorVariation;
      
      // Clamp colors between 0 and 1
      this.colors[i * 3] = Math.max(0, Math.min(1, this.colors[i * 3]));
      this.colors[i * 3 + 1] = Math.max(0, Math.min(1, this.colors[i * 3 + 1]));
      this.colors[i * 3 + 2] = Math.max(0, Math.min(1, this.colors[i * 3 + 2]));
      
      // Initial velocities
      this.velocities[i * 2] = 0;
      this.velocities[i * 2 + 1] = 0;
    }
  }

  initShaders() {
    const vertexShader = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      varying vec3 vColor;
      uniform float uPointSize;
      
      void main() {
        gl_Position = vec4(aPosition, 1.0);
        gl_PointSize = uPointSize;
        vColor = aColor;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      varying vec3 vColor;
      
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

    const gl = this.gl;
    
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    // Get uniform location for point size
    this.uPointSize = gl.getUniformLocation(this.program, "uPointSize");
  }

  initBuffers() {
    const gl = this.gl;
    
    this.buffers = {
      position: gl.createBuffer(),
      color: gl.createBuffer()
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
    const aPosition = gl.getAttribLocation(this.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    const aColor = gl.getAttribLocation(this.program, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
  }

  updateParticles() {
    const { 
      mouseRadius, 
      mouseForce, 
      returnSpeed, 
      velocityDamping, 
      noiseAmount 
    } = this.config;

    for (let i = 0; i < this.config.particleCount; i++) {
      if (this.mouse.isMoving) {
        const dx = this.mouse.x - this.positions[i * 3];
        const dy = this.mouse.y - this.positions[i * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouseRadius) {
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * noiseAmount;
          const force = mouseForce * (1 - dist/mouseRadius);
          
          this.velocities[i * 2] += Math.cos(angle) * force;
          this.velocities[i * 2 + 1] += Math.sin(angle) * force;
        }
      }
      
      if (!this.mouse.isMoving) {
        this.velocities[i * 2] += (this.basePositions[i * 2] - this.positions[i * 3]) * returnSpeed;
        this.velocities[i * 2 + 1] += (this.basePositions[i * 2 + 1] - this.positions[i * 3 + 1]) * returnSpeed;
      }
      
      this.velocities[i * 2] *= velocityDamping;
      this.velocities[i * 2 + 1] *= velocityDamping;
      
      this.positions[i * 3] += this.velocities[i * 2];
      this.positions[i * 3 + 1] += this.velocities[i * 2 + 1];
    }
  }

  render() {
    const gl = this.gl;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
    
    gl.uniform1f(this.uPointSize, this.config.pointSize);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, this.config.particleCount);
  }

  animate() {
    this.updateParticles();
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    this.animate();
  }
}