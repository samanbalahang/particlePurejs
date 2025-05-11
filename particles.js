       // WebGL Setup
        const canvas = document.getElementById('glCanvas');
        const gl = canvas.getContext('webgl');
        
        // Set canvas to full window size
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener('resize', resize);

        // Mouse tracking
        const mouse = { 
            x: 0, 
            y: 0,
            prevX: 0,
            prevY: 0,
            isMoving: false
        };

        window.addEventListener('mousemove', (e) => {
            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;
            mouse.x = (e.clientX / canvas.width) * 2 - 1;
            mouse.y = -(e.clientY / canvas.height) * 2 + 1;
            mouse.isMoving = Math.abs(mouse.x - mouse.prevX) > 0.001 || 
                            Math.abs(mouse.y - mouse.prevY) > 0.001;
        });

        // Particle system
        const PARTICLE_COUNT = 2000;
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 2);
        const basePositions = new Float32Array(PARTICLE_COUNT * 2);

        // Initialize particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Random base positions (where particles return to)
            basePositions[i * 2] = Math.random() * 2 - 1;
            basePositions[i * 2 + 1] = Math.random() * 2 - 1;
            
            // Current positions
            positions[i * 3] = basePositions[i * 2];
            positions[i * 3 + 1] = basePositions[i * 2 + 1];
            positions[i * 3 + 2] = 0; // Z-coordinate
            
            // Random colors
            colors[i * 3] = Math.random() * 0.5 + 0.5; // R (warm colors)
            colors[i * 3 + 1] = Math.random() * 0.3;    // G
            colors[i * 3 + 2] = Math.random() * 0.5;    // B
            
            // Initial velocities
            velocities[i * 2] = 0;
            velocities[i * 2 + 1] = 0;
        }

        // Shaders
        const vertexShader = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            void main() {
                gl_Position = vec4(aPosition, 1.0);
                gl_PointSize = 3.0;
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

        // Compile shaders and create program
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexShader);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fragmentShader);
        gl.compileShader(fs);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Create buffers
        const buffers = {
            position: gl.createBuffer(),
            color: gl.createBuffer()
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        const aColor = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);

        // Animation loop
        function animate() {
            // Update particles
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                if (mouse.isMoving) {
                    // Calculate direction to mouse with some noise
                    const dx = mouse.x - positions[i * 3];
                    const dy = mouse.y - positions[i * 3 + 1];
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Only react when mouse is close enough
                    if (dist < 0.5) {
                        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
                        const force = 0.01 * (1 - dist/0.5);
                        
                        velocities[i * 2] += Math.cos(angle) * force;
                        velocities[i * 2 + 1] += Math.sin(angle) * force;
                    }
                }
                
                // Return to base position when mouse stops
                if (!mouse.isMoving) {
                    const returnSpeed = 0.02;
                    velocities[i * 2] += (basePositions[i * 2] - positions[i * 3]) * returnSpeed;
                    velocities[i * 2 + 1] += (basePositions[i * 2 + 1] - positions[i * 3 + 1]) * returnSpeed;
                }
                
                // Apply velocity with damping
                velocities[i * 2] *= 0.95;
                velocities[i * 2 + 1] *= 0.95;
                
                positions[i * 3] += velocities[i * 2];
                positions[i * 3 + 1] += velocities[i * 2 + 1];
            }
            
            // Update buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
            
            // Render
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
            
            requestAnimationFrame(animate);
        }

        animate();