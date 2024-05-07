import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

class LoadModelDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight * (1/2));

    document.getElementById('canvas-container').appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = window.innerWidth / (window.innerHeight * (1/2));
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.updateProjectionMatrix();
    this._camera.position.set(75, 20, 0);

    this._scene = new THREE.Scene();

    const skyTexture = this._createSkyTexture();
    const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
    const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);

    this._scene.add(skybox);

    this._mixers = [];
    this._previousRAF = null;

    this._mixers = [];
    this._previousRAF = null;

    this._LoadModel();
    this._SetupLighting();
    this._RAF();
  }

  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('/Sean-C-Portfolio/animatedtree.glb', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true; // Allow objects to receive shadows
      });

      gltf.scene.position.set(170, 0, -115);
      gltf.scene.rotation.y = Math.PI / 16;
      this._scene.add(gltf.scene);

      // Create an AnimationMixer for each animation clip
      gltf.animations.forEach((clip) => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(clip);
        action.play(); // Start playing the animation
        this._mixers.push(mixer);
      });
    });
  }


  _createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create a gradient for the skybox texture
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ffccaa'); // Light orange
    gradient.addColorStop(0.5, '#ff6600'); // Orange
    gradient.addColorStop(1, '#663300'); // Dark brown

    // Fill the canvas with the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }




  _SetupLighting() {
    // Create a directional light simulating sunlight
    const directionalLight = new THREE.DirectionalLight(0xffccaa, 1); // Warm light color
    directionalLight.position.set(0, 100, 50); // Adjust light position
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Adjust shadow map size
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5; // Adjust shadow camera settings
    directionalLight.shadow.camera.far = 500;
    this._scene.add(directionalLight);

    // Add an additional directional light to fill in shadows
    const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.5); // Cooler light color
    fillLight.position.set(-50, 50, 100); // Adjust light position
    this._scene.add(fillLight);

    // Add an ambient light to provide general illumination
    const ambientLight = new THREE.AmbientLight(0x404040); // Neutral ambient light
    this._scene.add(ambientLight);
  }


  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / (window.innerHeight * (1/2));
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight * (1/2));
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}



let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});