    document.addEventListener('DOMContentLoaded', function() {
    var SHAPE = {
        particleCount: 3000,
        baseColor: [0.2, 0.6, 0.9],
        colorVariation: 0.3,
        pointSize: 5.0,
        mouseRadius: 0.5,       // Area where particles are actively pushed
        mouseForce: 0.015,      // Strength of push
        returnSpeed: 0.03,      // Speed of returning to original position
        velocityDamping: 0.92,  // How quickly movement slows down
        noiseAmount: 0.3,        // Randomness in movement
        shape: 'circle', // Options: 'circle', 'square', 'triangle', 'star'
        shapeSize: 1.0,  // Scale factor for shapes (0.5-2.0)
        shapeRotation: 0  // Rotation in radians (0-2π)
    };


    var particleSystem = new ParticleSystem(SHAPE);  // Fixed: Changed 'test' to 'SHAPE'
    particleSystem.start();

    // Make available globally for debugging if needed
    window.particleSystem = particleSystem;
});