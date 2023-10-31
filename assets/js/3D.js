import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';import { RenderPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/shaders/CopyShader.js'
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import * as dat from '../../node_modules/dat.gui/build/dat.gui.module.js'

let camera, scene, renderer, labelRenderer, modalRenderer, light, lightBack;
let composer, outlinePass, highlightOutlinePass, effectFXAA;

const loader = new GLTFLoader();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x5e42a6);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / 400, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, 400);
	document.getElementById('intro-3d-container').appendChild(renderer.domElement);

    //Lights
    let lightFactor = 4;
	light = new THREE.PointLight(0xffffff, 1 * lightFactor, 100 * lightFactor);
    light.position.set( 0, 0, 8 );
    lightBack = new THREE.PointLight(0xffffff, 1 * lightFactor, 100 * lightFactor);
    lightBack.position.set( 0, 0, -8 );
	scene.add(light);
    scene.add(lightBack);

    

    let objMenuFolder;
    try {
        objMenuFolder = gui.addFolder(modelToLoad + Math.random());
    } catch (error) {
        console.log("Error loading objmenu folder");
    }

    var modelToLoad = "Lako2.glb";
	loader.load( './assets/models/' + modelToLoad, function ( gltf ) {
        let objMenuFolder;
		try {
			objMenuFolder = gui.addFolder(modelToLoad + Math.random());
		} catch (error) {
			console.log("Error loading objmenu folder");
		}

        let model = gltf.scene;


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

    /* Toon Shader Setup */
	/*const threeTone = new THREE.TextureLoader().load('./assets/vfx/threeTone.jpg');
	threeTone.minFilter = THREE.NearestFilter;
	threeTone.magFilter = THREE.NearestFilter;
	const toonMaterial = new THREE.MeshToonMaterial();
	toonMaterial.gradientMap = threeTone;*/

    const gui = new dat.GUI();

    // Set camera position
    //camera.position.set = 2.33,2.33,8.95;
    camera.position.x = 0;
    camera.position.y = 4.54;
    camera.position.z = 2.33;
    //camera.lookAt(new THREE.Vector3(0,0,0));

    // Camera GUI
    setupCameraGUI(gui);

    //Light GUI
    setupLightsGUI(gui);


	animate();
    document.body.append(document.getElementsByClassName("dg ac")[0]);
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
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