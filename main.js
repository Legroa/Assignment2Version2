//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;


//-- GUI PARAMETERS
const parameters = {
  boxHeight: 150,
  boxLength: 150,
  boxDepth: 150,
  reductionFactor: 0.8,
  cylinderThickness: 5,
  itterations: 15


}

const colorFormats = {
  string: '#ff0000',
  int: 0xffffff,
  object: { r: 1, g: 1, b: 1 },
  array: [ 1, 1, 1 ]
}


//-- SCENE VARIABLES
var gui;
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;

let boxHeigth = parameters.boxHeight;
let boxLength = parameters.boxLength;
let boxDepth = parameters.boxDepth;
let reductionFactor = parameters.reductionFactor;
let itterations = parameters.itterations;
let cylinderThickness = parameters.cylinderThickness;
let color = colorFormats.string;
const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: color, wireframe: false });



//CREATE GUI
gui = new GUI;
  gui.add(parameters, 'boxHeight', 1,200,1); 
  gui.add(parameters, 'boxLength', 1, 200, 1); 
  gui.add(parameters, 'boxDepth', 1, 200, 1);    
  gui.add(parameters, 'reductionFactor', 0, 1, 0.01);  
  gui.add(parameters, 'cylinderThickness', 1,10,0.1);
  gui.add(parameters, 'itterations', 0, 100, 1);   


 gui.addColor( colorFormats, 'string' );  //three is almost always to much
  

// GUI UPDATE CHECKER
gui.onFinishChange(() => {
  // Update parameters based on GUI values
  boxHeigth = parameters.boxHeight;
  boxLength = parameters.boxLength;
  boxDepth = parameters.boxDepth;
  reductionFactor = parameters.reductionFactor;
  itterations = parameters.itterations;
  cylinderThickness = parameters.cylinderThickness;
  color = colorFormats.string;
  

  // CLEAR EVERYTHING VISSIBLE 
  scene.clear();
  renderer.clear(true,true);

  scene.add(directionalLight);
  scene.add(directionalLight.target);
  scene.add(ambientLight);

  // RESTART WITH UPDATED PARAMETERS

  generateBox(boxHeigth,boxLength,boxDepth,reductionFactor,itterations,cylinderThickness,color)
});




function main() {
  //GUI

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100000);
  camera.position.set(0, 0, 50);

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 5, 5);
  directionalLight.target.position.set(-1, -1, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
   var location = new THREE.Vector3(0, 0, 0);

  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);

  //CREATE MOUSE CONTROL
  control = new OrbitControls(camera, renderer.domElement);
  //EXECUTE THE UPDATE
  generateBox(boxHeigth,boxLength,boxDepth,reductionFactor,itterations,cylinderThickness,color)

  animate();
}

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------
function generateBox(boxHeigth, boxLength, boxDepth, reductionFactor, iterations, cylinderThickness, color) {

  let thicknessDivisionalt = cylinderThickness;

  // Convert the hex color to a THREE.Color instance
  let colorAdjusted = new THREE.Color(color);

  createBox(boxHeigth, boxLength, boxDepth);

  let startingPoint = generateStartingpoint(boxHeigth, boxLength, boxDepth, cylinderThickness,colorAdjusted);

  for (let i = 0; i < iterations; i++) {

    // Adjust this factor as needed
    const adjustedThickness = thicknessDivisionalt * reductionFactor;

    const randomVecor = chooseSide(boxHeigth, boxLength, boxDepth, adjustedThickness,colorAdjusted);
    const randomLine = createLine(startingPoint, randomVecor, adjustedThickness, thicknessDivisionalt,colorAdjusted);

    var hsl = {};
    colorAdjusted.getHSL(hsl);
    hsl.l = Math.min(1, hsl.l + 0.01); // Ensure lightness doesn't exceed 1
    colorAdjusted.setHSL(hsl.h, hsl.s, hsl.l);
    
    
    startingPoint = randomVecor;


    thicknessDivisionalt = adjustedThickness;

    console.log(thicknessDivisionalt);
  }

  console.log(scene);

};


function createBox(boxHeigth,boxLength,boxDepth){

  let geometry = new THREE.BoxGeometry(boxLength, boxHeigth, boxDepth);

  let edges = new THREE.EdgesGeometry(geometry);
  
  let lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
  
  let wireframe = new THREE.LineSegments(edges, lineMaterial);
  
  scene.add(wireframe);

}

function generateStartingpoint(boxHeight,boxLength,boxDepth,cylinderThickness,colorAdjusted){

 
  const vector = new THREE.Vector3( boxLength/2-cylinderThickness,boxHeight/2-cylinderThickness, boxDepth/2-cylinderThickness);

  createPoint(vector,cylinderThickness,colorAdjusted);

  return vector;
}

function createPoint(vector,thicknessDivisionalt,colorAdjusted) {
 




  const sphereGeometry = new THREE.SphereGeometry(thicknessDivisionalt, 32, 32);

  const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: colorAdjusted });

  const point = new THREE.Mesh(sphereGeometry, sphereMaterial);

  point.position.copy(vector);

  scene.add(point);
}

function chooseSide(boxHeigth,boxLength,boxDepth,thicknessDivisionalt,colorAdjusted) {

  const halfHeight = boxHeigth/2;
  const halfLength = boxLength/2;
  const halftDepth = boxDepth/2;
  var zufallszahl = Math.floor(Math.random() * 6);
  let randomX,randomZ, randomY;
  const vector = new THREE.Vector3(0, 0, 0);


    switch (zufallszahl) {
      case 0:
        //oben
        vector.x = Math.random() * (halfLength-thicknessDivisionalt - (-halfLength+thicknessDivisionalt)) + (-halfLength+thicknessDivisionalt);
        vector.z= Math.random() * (halftDepth-thicknessDivisionalt - (-halftDepth+thicknessDivisionalt)) + (-halftDepth+thicknessDivisionalt);
        vector.y = halfHeight-thicknessDivisionalt;
        break ;
      case 1:
        //unten
        vector.x = Math.random() * (halfLength-thicknessDivisionalt - (-halfLength+thicknessDivisionalt)) + (-halfLength+thicknessDivisionalt);
        vector.z= Math.random() * (halftDepth-thicknessDivisionalt - (-halftDepth+thicknessDivisionalt)) + (-halftDepth+thicknessDivisionalt);
        vector.y = -halfHeight+thicknessDivisionalt;
      break;
      case 2:
        //links
        vector.x = Math.random() * (halfLength-thicknessDivisionalt - (-halfLength+thicknessDivisionalt)) + (-halfLength+thicknessDivisionalt);
        vector.z= halftDepth-thicknessDivisionalt;
        vector.y = Math.random() * (halfHeight-thicknessDivisionalt - (-halfHeight+thicknessDivisionalt)) + (-halfHeight+thicknessDivisionalt);
 
      break;
      case 3:
        //rechts
        vector.x = Math.random() * (halfLength-thicknessDivisionalt - (-halfLength+thicknessDivisionalt)) + (-halfLength+thicknessDivisionalt);
        vector.z= -halftDepth+thicknessDivisionalt;
        vector.y = Math.random() * (halfHeight-thicknessDivisionalt - (-halfHeight+thicknessDivisionalt)) + (-halfHeight+thicknessDivisionalt);
      break;
      case 4:
        //vorne
        vector.x =halfLength-thicknessDivisionalt;
        vector.z= Math.random() * (halftDepth-thicknessDivisionalt - (-halftDepth+thicknessDivisionalt)) + (-halftDepth+thicknessDivisionalt);
        vector.y = Math.random() * (halfHeight-thicknessDivisionalt - (-halfHeight+thicknessDivisionalt)) + (-halfHeight+thicknessDivisionalt);
      break;
      case 5:
        //hinten
        vector.x = -halfLength+thicknessDivisionalt;
        vector.z= Math.random() * (halftDepth-thicknessDivisionalt - (-halftDepth+thicknessDivisionalt)) + (-halftDepth+thicknessDivisionalt);
        vector.y = Math.random() * (halfHeight-thicknessDivisionalt - (-halfHeight+thicknessDivisionalt)) + (-halfHeight+thicknessDivisionalt);
      break;
      default:
      break;
    }
createPoint(vector,thicknessDivisionalt,colorAdjusted);
  return vector;
}
// function movePoint(point, direction, distance) {

//   console.log(direction);

//   var secondPoint = point.clone().add(direction.clone().multiplyScalar(distance));
  
//   return secondPoint;
// }


function createLine(startingPoint, randomVecor, cylinderThickness, alt,colorAdjusted){
  
  console.log(randomVecor)

  const direction = new THREE.Vector3().subVectors(startingPoint, randomVecor);
  const heightOg = direction.length();
  let height = Math.abs(heightOg)
  // console.log(height);
  const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: colorAdjusted, wireframe: false });
  const cylinderGeometry = new THREE.CylinderGeometry(alt, cylinderThickness, height, 32);




  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder.position.copy(randomVecor);
  cylinder.position.addScaledVector(direction, 0.5);

  // Align the cylinder to the direction vector
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  scene.add(cylinder);
}
//RECURSIVE ATTRACTOR GENERATION


//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}

//RANDOM INTEGER IN A RANGE


//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

//-----------------------------------------------------------------------------------
// EXECUTE MAIN
//-----------------------------------------------------------------------------------

main();
