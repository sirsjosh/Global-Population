import "./style.css";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphereVertex.glsl";
import atmosphereFragment from "./shaders/atmosphereFragment.glsl";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import gsap from "gsap";
import countries from "./countries.json";

/**
 * instantiate a texture loader
 */
const textureLoader = new THREE.TextureLoader();

//textures
// const earthMap = textureLoader.load("./img/earth.jpeg");
// const earthMap2 = textureLoader.load("./img/globe.jpeg");
// const starTexture = textureLoader.load("./img/star.png");

const earthMap2 = textureLoader.load(
  "https://res.cloudinary.com/dxxx1wdbm/image/upload/v1653302568/threejs/globe_sxzp7e.jpg"
);
const starTexture = textureLoader.load(
  "https://res.cloudinary.com/dxxx1wdbm/image/upload/v1653302568/threejs/star_qbpaxl.png"
);

//grouping objects
const group = new THREE.Group();

/**
 * create a scene
 */
const scene = new THREE.Scene();

/**
 * create a camera
 */
const canvasContainer = document.querySelector(".right");
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
);
camera.position.z = 15;

/**
 * create a renderer
 */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("canvas"),
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(devicePixelRatio);

//resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}

/**
 * implement controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
// controls.minDistance = 6;
// controls.maxDistance = 15;

/**
 * create meshes
 */
//sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    uniforms: {
      globeTexture: { value: earthMap2 },
    },
    vertexShader,
    fragmentShader,
  })
);
sphere.rotation.y = -Math.PI * 0.5;

//atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

atmosphere.scale.set(1.1, 1.1, 1.1);

//point
const createBox = ({ lat, lng, city, population }) => {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.8),
    new THREE.MeshBasicMaterial({
      color: "#3BF7FF",
      opacity: 0.4,
      transparent: true,
    })
  );

  const latitude = (lat / 180) * Math.PI;
  const longitude = (lng / 180) * Math.PI;
  const radius = 5;
  const x = radius * Math.cos(latitude) * Math.sin(longitude);
  const y = radius * Math.sin(latitude);
  const z = radius * Math.cos(latitude) * Math.cos(longitude);

  box.position.set(x, y, z);
  box.lookAt(0, 0, 0);
  box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4));
  box.city = city;
  box.population = population;
  group.add(box);

  gsap.to(box.scale, {
    z: Math.random() * 0.8,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "linear",
    delay: Math.random() * 3,
  });
};

//many cities
const createBoxes = (countries) => {
  countries.forEach((country) => {
    const lat = country?.latlng[0];
    const lng = country?.latlng[1];
    const scale = country.population / 1000000000;
    const zScale = 0.8 * scale;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, Math.max(zScale, 0.4)),
      new THREE.MeshBasicMaterial({
        color: "#3BF7FF",
        opacity: 0.4,
        transparent: true,
      })
    );

    const latitude = (lat / 180) * Math.PI;
    const longitude = (lng / 180) * Math.PI;
    const radius = 5;
    const x = radius * Math.cos(latitude) * Math.sin(longitude);
    const y = radius * Math.sin(latitude);
    const z = radius * Math.cos(latitude) * Math.cos(longitude);

    box.position.set(x, y, z);
    box.lookAt(0, 0, 0);
    box.geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, -zScale * 0.5)
    );
    box.country = country.name.common;
    box.flag = country?.flags[0];
    box.population = new Intl.NumberFormat().format(country?.population);
    group.add(box);

    gsap.to(box.scale, {
      z: Math.random() * 0.8,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "linear",
      delay: Math.random() * 3,
    });
  });
};

createBoxes(countries);

//Harare    17.8216° S, 31.0492° E  Harare  23.6345 N   102.5528 W  Mexico 31.2304° N, 121.4737° E Shanghai 25.2048° N, 55.2708° E Dubai
// 26.2041° S, 28.0473° E Johannesburg 39.9042° N, 116.4074° E Beijing  30.5723° N, 104.0665° E  Chengdu 30.2741° N, 120.1552° E Hangzhou
//31.2983° N, 120.5832° E Suzhou 29.7152° N, 118.3387° E Huangshan

//stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  map: starTexture,
});

const stars = new THREE.Points(starGeometry, starMaterial);
const starVertices = [];

for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

group.add(sphere);

/**
 * add stuff to the scene
 */
scene.add(group, atmosphere, stars);

/**
 * animation function
 */
let mouse = {
  x: undefined,
  y: undefined,
};

const raycaster = new THREE.Raycaster();
const popup = document.querySelector("#popup");
const countryName = document.querySelector("#countryName");
const populationNumber = document.querySelector("#population-number");
const populationNumber2 = document.querySelector("#population-number-2");
const countryName2 = document.querySelector("#country");

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  //update controls
  controls.update();

  //rotate the sphere
  // group.rotation.y += 0.001;

  //mouse events
  // if (mouse.x) {
  //   gsap.to(group.rotation, {
  //     x: -mouse.y * 0.3,
  //     y: mouse.x * 0.5,
  //     duration: 2,
  //   });
  // }

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(
    group.children.filter((mesh) => {
      return mesh.geometry.type === "BoxGeometry";
    })
  );

  group.children.forEach((mesh) => {
    mesh.material.opacity = 0.4;
  });

  gsap.set(popup, {
    display: "none",
  });

  for (let i = 0; i < intersects.length; i++) {
    const box = intersects[i].object;
    box.material.opacity = 1;
    gsap.set(popup, {
      display: "block",
    });
    countryName.innerHTML = box.country;
    populationNumber.innerHTML = box.population;
    populationNumber2.innerHTML = box.population;
    countryName2.innerHTML = box.country;
  }
};

animate();

addEventListener("mousemove", (e) => {
  if (innerWidth > 500) {
    mouse.x = ((e.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  } else {
    const offest = canvasContainer.getBoundingClientRect().top;
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -((e.clientY - offest) / innerHeight) * 2 + 1;
  }

  gsap.set(popup, {
    x: e.clientX,
    y: e.clientY,
  });
});

addEventListener("touchstart", (e) => {
  e.clientX = e.touches[0].clientX;
  e.clientY = e.touches[0].clientY;
  if (innerWidth > 500) {
    mouse.x = ((e.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  } else {
    const offest = canvasContainer.getBoundingClientRect().top;
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -((e.clientY - offest) / innerHeight) * 2 + 1;
  }

  gsap.set(popup, {
    x: e.clientX,
    y: e.clientY,
  });
});
