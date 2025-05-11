// particle.js

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
            shape: 'circle',
            shapeSize: 1.0,
            shapeRotation: 0,
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
            isMoving: false,
            movementTimeout: null
        };

        window.addEventListener('mousemove', (e) => {
            // Clear any existing timeout
            if (this.mouse.movementTimeout) {
                clearTimeout(this.mouse.movementTimeout);
            }

            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.mouse.x = (e.clientX / this.canvas.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.canvas.height) * 2 + 1;

            // Set moving to true immediately
            this.mouse.isMoving = true;

            // Set a timeout to mark as not moving after a short delay
            this.mouse.movementTimeout = setTimeout(() => {
                this.mouse.isMoving = false;
            }, 50); // 50ms delay after last movement
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
precision highp float;
varying vec3 vColor;
uniform float uPointSize;
uniform float uShape;
uniform float uShapeSize;
uniform float uRotation;

// Shape functions
float circle(vec2 uv, float radius) {
  return step(length(uv), radius);
}

float square(vec2 uv, float size) {
  vec2 d = abs(uv) - size;
  return step(max(d.x, d.y), 0.0);
}

float triangle(vec2 uv, float size) {
  uv.y += 0.15;
  float q = max(abs(uv.x) * 0.866025 + uv.y * 0.5, -uv.y * 0.5);
  return step(q, size * 0.57735);
}

float star(vec2 uv, float size) {
  float d = (abs(uv.x) + abs(uv.y)) * 0.7071;
  float r = length(uv);
  float s = size * 0.382;
  return step(min(d, r), s);
}

void main() {
  // Normalized pixel coordinates
  vec2 uv = (gl_PointCoord - 0.5) * 2.0;
  
  // Apply rotation
  float c = cos(uRotation);
  float s = sin(uRotation);
  uv = mat2(c, -s, s, c) * uv;
  
  // Scale
  uv /= uShapeSize;
  
  float alpha = 0.0;
  int shape = int(uShape + 0.5); // Properly convert to integer
  
  if (shape == 0) {
    alpha = circle(uv, 0.9);
  } else if (shape == 1) {
    alpha = square(uv, 0.9);
  } else if (shape == 2) {
    alpha = triangle(uv, 0.9);
  } else if (shape == 3) {
    alpha = star(uv, 0.9);
  }
  
  if (alpha < 0.5) discard;
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

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Shader linking failed:', gl.getProgramInfoLog(this.program));
    }

    gl.useProgram(this.program);

    // Get uniform locations
    this.uPointSize = gl.getUniformLocation(this.program, "uPointSize");
    this.uShape = gl.getUniformLocation(this.program, "uShape");
    this.uShapeSize = gl.getUniformLocation(this.program, "uShapeSize");
    this.uRotation = gl.getUniformLocation(this.program, "uRotation");

}

initBuffers() {
    const gl = this.gl;

    this.buffers = {
        position: gl.createBuffer(),
        color: gl.createBuffer()
    };

    // Position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
    this.aPosition = gl.getAttribLocation(this.program, "aPosition");
    gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPosition);

    // Color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    this.aColor = gl.getAttribLocation(this.program, "aColor");
    gl.vertexAttribPointer(this.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aColor);
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
        // Always apply return force to base position
        const returnX = (this.basePositions[i * 2] - this.positions[i * 3]) * returnSpeed;
        const returnY = (this.basePositions[i * 2 + 1] - this.positions[i * 3 + 1]) * returnSpeed;

        // Only apply mouse force if mouse is moving and close enough
        let mouseForceX = 0;
        let mouseForceY = 0;

        if (this.mouse.isMoving) {
            const dx = this.mouse.x - this.positions[i * 3];
            const dy = this.mouse.y - this.positions[i * 3 + 1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouseRadius) {
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * noiseAmount;
                const force = mouseForce * (1 - dist / mouseRadius);
                mouseForceX = Math.cos(angle) * force;
                mouseForceY = Math.sin(angle) * force;
            }
        }

        // Apply forces to velocity
        this.velocities[i * 2] += returnX + mouseForceX;
        this.velocities[i * 2 + 1] += returnY + mouseForceY;

        // Apply damping
        this.velocities[i * 2] *= velocityDamping;
        this.velocities[i * 2 + 1] *= velocityDamping;

        // Update positions
        this.positions[i * 3] += this.velocities[i * 2];
        this.positions[i * 3 + 1] += this.velocities[i * 2 + 1];
    }
}


render() {
    const gl = this.gl;
    const shapeMap = {
        'circle': 0,
        'square': 1,
        'triangle': 2,
        'star': 3
    };
    const uShape = gl.getUniformLocation(this.program, "uShape");
    const uShapeSize = gl.getUniformLocation(this.program, "uShapeSize");
    const uRotation = gl.getUniformLocation(this.program, "uRotation");

    gl.uniform1f(uShape, shapeMap[this.config.shape]);
    gl.uniform1f(uShapeSize, this.config.shapeSize);
    gl.uniform1f(uRotation, this.config.shapeRotation);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.uPointSize, this.config.pointSize);
    gl.drawArrays(gl.POINTS, 0, this.config.particleCount);
}

animate() {
    this.updateParticles();
    this.render();
    requestAnimationFrame(() => this.animate());
}

start() {
    // Shape mapping
    this.shapeMap = {
        'circle': 0,
        'square': 1,
        'triangle': 2,
        'star': 3
    };
    this.animate();
}
}