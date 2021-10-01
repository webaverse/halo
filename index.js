import * as THREE from 'three';
// import easing from './easing.js';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useActivate, useLoaders, usePhysics, useCleanup} = metaversefile;

export default () => {
  const app = useApp();
  
  const radius = 0.5;
  const segments = 12;
  const color = 0x29b6f6;
  // const opacity = 0.5;
  const height = 0.5;
  const skirtGeometry = new THREE.CylinderBufferGeometry(radius, radius, height, segments, 1, true)
    .applyMatrix4(new THREE.Matrix4().makeTranslation(0, height/2, 0));
  const ys = new Float32Array(skirtGeometry.attributes.position.array.length/3);
  for (let i = 0; i < skirtGeometry.attributes.position.array.length/3; i++) {
    ys[i] = 1-skirtGeometry.attributes.position.array[i*3+1]/height;
  }
  skirtGeometry.setAttribute('y', new THREE.BufferAttribute(ys, 1));
  // skirtGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, height/2, 0));
  const skirtMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uAnimation: {
        type: 'f',
        value: 0,
        needsUpdate: true,
      },
    },
    vertexShader: `\
      #define PI 3.1415926535897932384626433832795
      uniform float uAnimation;
      attribute float y;
      attribute vec3 barycentric;
      varying float vY;
      varying float vUv;
      varying float vOpacity;
      void main() {
        vY = y;
        vUv = uv.x + uAnimation;
        // vOpacity = ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `\
      #define PI 3.1415926535897932384626433832795
      uniform float uAnimation;
      varying float vY;
      varying float vUv;
      varying float vOpacity;
      vec3 c = vec3(${new THREE.Color().setHex(color).toArray().join(', ')});
      void main() {
        float a = pow(vY, 0.5) * (0.5 + 0.5*(sin(vUv*PI*2.0/0.02) + 1.0)/2.0) * (0.5 + 0.5*sin(uAnimation*5.*PI*2.0)+1.0)/2.0 * 1.5;
        gl_FragColor = vec4(c, a);
      }
    `,
    side: THREE.DoubleSide,
    /* polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4, */
    transparent: true,
    // depthWrite: false,
    /* extensions: {
      derivatives: true,
    }, */
  });
  const skirtMesh = new THREE.Mesh(skirtGeometry, skirtMaterial);
  skirtMesh.frustumCulled = false;
  app.add(skirtMesh);
  
  useFrame(({timestamp}) => {
    // const {timestamp} = e.data;
    skirtMesh.material.uniforms.uAnimation.value = ((timestamp/1000) % 10)/10;
    skirtMesh.material.uniforms.uAnimation.needsUpdate = true;
  });

  return app;
};