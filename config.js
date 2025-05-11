// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  var CalmOcean= {
        particleCount: 5000,
        baseColor: [0.1, 0.3, 0.7],
        colorVariation: 0.2,
        pointSize: 2.0,
        mouseRadius: 0.5,
        mouseForce: 0.01,
        returnSpeed: 0.02,
        velocityDamping: 0.95,
        noiseAmount: 0.2
  }
  var FireEffect={
        particleCount: 2000,
        baseColor: [0.9, 0.3, 0.1],
        colorVariation: 0.6,
        pointSize: 8.0,
        mouseRadius: 1.0,
        mouseForce: 0.03,
        returnSpeed: 0.01,
        velocityDamping: 0.88,
        noiseAmount: 0.5
  }  

  var particleConfig = {
    particleCount: 3000,// 500 - 10000 
    baseColor: [0.2, 0.6, 0.9],// RGB RED:0.0 TO 1 and so on
    colorVariation: 0.3, // HOW MANY COLOR WE SEE 0 is one color and 1 Is  MAXimum
    pointSize: 5.0,//Sets the size of each particle in pixels Any positive number
    mouseRadius: 0.7,//Determines how close the mouse needs to be to affect particles Value between 0.1 (small area) to 2.0 (large area)
    mouseForce: 0.015,//Controls how strongly particles are repelled by the mouse  0.001 - 0.1 0.005 = Slow, lazy movement 0.05 = Fast, energetic reactions
    returnSpeed: 0.03,//How quickly particles return to their original positions  0.001-  0.1
    velocityDamping: 0.92,//How quickly particles lose momentum (like friction)  0.8 (lots of friction) to 0.99 (very slippery)
    noiseAmount: 0.3//Adds randomness to particle movements 0 - 1 0 = Perfect geometric patterns 0.5 = Moderate organic randomness - 1 = Complete chaos
  };

  var MODparticleConfig = {
    particleCount: 3000,
    baseColor: [0.2, 0.6, 0.9],
    colorVariation: 0.3,
    pointSize: 5.0,
    mouseRadius: 0.5,       // Area where particles are actively pushed
    mouseForce: 0.015,      // Strength of push
    returnSpeed: 0.03,      // Speed of returning to original position
    velocityDamping: 0.92,  // How quickly movement slows down
    noiseAmount: 0.3        // Randomness in movement
};

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

  var test={
        particleCount: 300,
        baseColor: [0.2, 0.6, 0.9],
        colorVariation: 0.3,
        pointSize: 5.0,
        mouseRadius: 0.3,       // Area where particles are actively pushed
        mouseForce: 0.015,      // Strength of push
        returnSpeed: 0.03,      // Speed of returning to original position
        velocityDamping: 0.92,  // How quickly movement slows down
        noiseAmount: 0.3,        // Randomness in movement
        shape: 'circle', // Options: 'circle', 'square', 'triangle', 'star'
        shapeSize: 1.0,  // Scale factor for shapes (0.5-2.0)
        shapeRotation: 0  // Rotation in radians (0-2π)

  }  
    var particleSystem = new ParticleSystem(test);  // Fixed: Changed 'test' to 'SHAPE'
    particleSystem.start();

    // Make available globally for debugging if needed
    window.particleSystem = particleSystem;
});