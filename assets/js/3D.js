import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';import { RenderPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/shaders/CopyShader.js'
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import * as dat from '../../node_modules/dat.gui/build/dat.gui.module.js'

let camera, scene, renderer, labelRenderer, modalRenderer, light, lightBack, lightFactor;
let composer, outlinePass, highlightOutlinePass, effectFXAA;
const clock = new THREE.Clock(); // Create a Clock instance.
let animationMixer;

const loader = new GLTFLoader();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x5e42a6);

    let containerWidth = document.getElementById('intro').offsetWidth;
    let containerHeight = document.getElementById('intro').offsetHeight;

    console.log("Container Width: ", containerWidth);
    console.log("Container Height: ", containerHeight);

	camera = new THREE.PerspectiveCamera(75, containerWidth/ containerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
	document.getElementById('intro-3d-container').appendChild(renderer.domElement);

    //Lights
    lightFactor = 1;
	//light = new THREE.PointLight(0xffffff, 1 * lightFactor, 50 * lightFactor);
    light = new THREE.DirectionalLight(0xffffff, Math.PI * lightFactor);
	scene.add(light);

    var modelToLoad = "Lako2.glb";
	loader.load( './assets/models/' + modelToLoad, function ( gltf ) {
        let objMenuFolder;
		try {
			objMenuFolder = gui.addFolder(modelToLoad + Math.random());
		} catch (error) {
			console.log("Error loading objmenu folder");
		}

        let model = gltf.scene.children[0];
        let animations = gltf.animations;

        console.log("Animations", animations);

        // Create an animation mixer and add the animations to it.
        animationMixer = new THREE.AnimationMixer(model);

        if (animations && animations.length > 0) {
            animations.forEach((clip) => {
                animationMixer.clipAction(clip).play(); // Play all available animations.
            });
        }


        /* Toon Shader Setup */
		const threeTone = new THREE.TextureLoader().load('./assets/vfx/threeTone.jpg');
        const texture = new THREE.TextureLoader().load('./assets/textures/Lako_Tex.png');
		threeTone.minFilter = THREE.NearestFilter;
		threeTone.magFilter = THREE.NearestFilter;

		model.traverse((child, i) => {            
		    if (child.isMesh) {

                console.log("Mesh value: ", child);

                let toonMaterial = new THREE.MeshToonMaterial({map:child.material.map,color:child.material.color});
                toonMaterial.gradientMap = threeTone;

                switch (child.name) {
                    case "Glasses":
                        toonMaterial.transparent = true;
                        toonMaterial.opacity = 0.5;
                        break;
                    default:
                        break;
                }

                child.material = toonMaterial;
			}
		});


        model.position.x = 0;
        model.position.y = 0;
        model.position.z = 0;

        model.scale.x = 1;
        model.scale.y = 1;
        model.scale.z = 1;

        console.log("Model, ", model);

		//The below logic should only be enabled when one desires to manipulate an objects position manually */
		objMenuFolder.add(model.position, 'x').min(-3).max(3).step(0.01).name(modelToLoad + "X");
		objMenuFolder.add(model.position, 'y').min(-3).max(3).step(0.01).name(modelToLoad + "Y");
		objMenuFolder.add(model.position, 'z').min(-3).max(3).step(0.01).name(modelToLoad + "Z");
		objMenuFolder.add(model.rotation, 'x').min(-2).max(2).step(0.01).name(modelToLoad + "RotX");
		objMenuFolder.add(model.rotation, 'y').min(-2).max(2).step(0.01).name(modelToLoad + "RotY");
		objMenuFolder.add(model.rotation, 'z').min(-2).max(2).step(0.01).name(modelToLoad + "RotZ");
		objMenuFolder.add(model.scale, 'x').min(0).max(2).step(0.01).name(modelToLoad + "ScaleX");
		objMenuFolder.add(model.scale, 'y').min(0).max(2).step(0.01).name(modelToLoad + "ScaleY");
		objMenuFolder.add(model.scale, 'z').min(0).max(2).step(0.01).name(modelToLoad + "ScaleZ");
		objMenuFolder.open();
		scene.add( gltf.scene );
	}, undefined, function ( error ) {
		console.error( error );
	} );

    //Post processing
	composer = new EffectComposer( renderer );

	const renderPass = new RenderPass( scene, camera );
	composer.addPass( renderPass );

    const gui = new dat.GUI();

    // Set camera position
    camera.position.x = 0;
    camera.position.y = 4.54;
    camera.position.z = 2.33;

    // Camera GUI
    setupCameraGUI(gui);

    // Light GUI
    setupLightsGUI(gui);


	animate();

    //Add gui to element
    document.body.append(document.getElementsByClassName("dg ac")[0]);
}

function animate() {
	

    // Update the animation mixer on each frame.
    if (animationMixer) 
    {
        animationMixer.update(clock.getDelta()); // Update the mixer with the elapsed time.
    }

    resizeCanvasToDisplaySize();
    //var container = document.querySelector('#intro');
    //var canvas = renderer.domElement;
    //scaleToFit(container, canvas);
	renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

//https://stackoverflow.com/questions/54202461/how-to-fit-the-size-of-the-three-js-renderer-to-a-webpage-element
function scaleToFit (container, node) {
    var rect = container.getBoundingClientRect();
    console.log("Rect", rect);
    node.width = rect.width;
    node.height = rect.height;

    renderer.setSize(node.width, node.height, false);
    camera.aspect = node.width / node.height;
    camera.updateProjectionMatrix();
}

//https://stackoverflow.com/questions/29884485/threejs-canvas-size-based-on-container
function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    //const width = document.getElementById('intro').offsetWidth;
    //const height = document.getElementById('intro').offsetHeight;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      console.log("Canvas", canvas);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  
      // update any render target sizes here
    }
}

function setupCameraGUI(gui)
{
    var cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(camera.position, 'x').min(-100).max(100).step(0.01).name("camera" + "X");
    cameraFolder.add(camera.position, 'y').min(-100).max(100).step(0.01).name("camera" + "Y");
    cameraFolder.add(camera.position, 'z').min(-100).max(100).step(0.01).name("camera" + "Z");
    cameraFolder.add(camera.rotation, 'x').min(-100).max(100).step(0.01).name("camera" + "RotX");
    cameraFolder.add(camera.rotation, 'y').min(-100).max(100).step(0.01).name("camera" + "RotY");
    cameraFolder.add(camera.rotation, 'z').min(-100).max(100).step(0.01).name("camera" + "RotZ");
    cameraFolder.add(camera.scale, 'x').min(0).max(2).step(0.01).name("camera" + "ScaleX");
    cameraFolder.add(camera.scale, 'y').min(0).max(2).step(0.01).name("camera" + "ScaleY");
    cameraFolder.add(camera.scale, 'z').min(0).max(2).step(0.01).name("camera" + "ScaleZ");
    cameraFolder.open();
}

function setupLightsGUI(gui)
{
    var lightFolder = gui.addFolder("Light");
    lightFolder.add(light.position, 'x').min(-100).max(100).step(0.01).name("light" + "X");
    lightFolder.add(light.position, 'y').min(-100).max(100).step(0.01).name("light" + "Y");
    lightFolder.add(light.position, 'z').min(-100).max(100).step(0.01).name("light" + "Z");
    lightFolder.add(light.rotation, 'x').min(-100).max(100).step(0.01).name("light" + "RotX");
    lightFolder.add(light.rotation, 'y').min(-100).max(100).step(0.01).name("light" + "RotY");
    lightFolder.add(light.rotation, 'z').min(-100).max(100).step(0.01).name("light" + "RotZ");
    lightFolder.add(light.scale, 'x').min(0).max(2).step(0.01).name("light" + "ScaleX");
    lightFolder.add(light.scale, 'y').min(0).max(2).step(0.01).name("light" + "ScaleY");
    lightFolder.add(light.scale, 'z').min(0).max(2).step(0.01).name("light" + "ScaleZ");
    lightFolder.open();
}



$(document).ready(function(){
    init();
});