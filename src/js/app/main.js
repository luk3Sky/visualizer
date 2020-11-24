// Global imports -
import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';
import Geometry from './components/geometry';

// Helpers
import Stats from './helpers/stats';
import MeshHelper from './helpers/meshHelper';

// Model
import Texture from './model/texture';
import Model from './model/model';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// Implemented by Nuwan
import MQTTClient from './managers/mqttClient';
import Robot from './components/robot';

// Config data
import Config from './../data/config';

// STLLoader
var STLLoader = require('three-stl-loader')(THREE)

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
    constructor(container) {

        // Set container property to container element
        this.container = container;

        // Start Three clock
        this.clock = new THREE.Clock();

        // Main scene creation
        this.scene = new THREE.Scene();
        window.scene = this.scene; // config as a global variable

        this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

        // Defined by Nuwan
        this.robot = new Robot(this.scene);
        this.mqtt = new MQTTClient(this.scene, this.robot);

        // Get Device Pixel Ratio first for retina
        if (window.devicePixelRatio) {
            Config.dpr = window.devicePixelRatio;
        }

        // Main renderer constructor
        this.renderer = new Renderer(this.scene, container);

        // Components instantiations
        this.camera = new Camera(this.renderer.threeRenderer);
        this.controls = new Controls(this.camera.threeCamera, container);
        this.light = new Light(this.scene);

        // Create and place lights in scene
        const lights = ['ambient', 'directional', 'point', 'hemi'];
        lights.forEach((light) => this.light.place(light));

        // Set up rStats if dev environment
        if (Config.isDev && Config.isShowingStats) {
            this.stats = new Stats(this.renderer);
            this.stats.setUp();
        }

        // Set up gui
        //if (Config.isDev) {
            //this.gui = new DatGUI(this)
        //}

        // Instantiate texture class
        this.texture = new Texture();

        // Start loading the textures and then go on to load the model after the texture Promises have resolved
        this.texture.load().then(() => {
            this.manager = new THREE.LoadingManager();

            // Create the environment ---------------------------------------------
            var geometry = new THREE.PlaneBufferGeometry(Config.arena.size, Config.arena.size);
            var material = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
            var ground = new THREE.Mesh(geometry, material);
            ground.position.set(0, 0, 0);
            ground.rotation.x = - Math.PI / 2;
            ground.receiveShadow = true;
            this.scene.add(ground);

            var grid = new THREE.GridHelper(Config.arena.size, 30, 0x000000, 0x5b5b5b);
            grid.position.set(0, 0, 0);
            grid.material.opacity = 0.35;
            grid.material.transparent = true;
            this.scene.add(grid);

            //---------------------------------------
            //this.robot.create(0,80,80);
            //this.robot.create(2,80,60);
            //this.robot.move(2, -50, 50, ()=>{
            //   this.robot.move(2, 0, 0);
            //});

            //this.robot.get_coordinates(2);

            //---------------------------------------
            //this.mqtt.publish('v1/localization/info', 'hello !');

            // -------------------------------------

            // onProgress callback
            this.manager.onProgress = (item, loaded, total) => {
                console.log(`${item}: ${loaded} ${total}`);
            };

            // Controls panel
            //this.gui.load(this, this.model.obj);

            // All loaders done now
            this.manager.onLoad = () => {
                alert('Loaded');

                // Set up interaction manager with the app now that the model is finished loading
                new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

                // Add dat.GUI controls if dev
                if (Config.isDev) {
                    this.meshHelper = new MeshHelper(this.scene, this.model.obj);
                    if (Config.mesh.enableHelper) this.meshHelper.enable();
                    //this.gui.load(this, this.model.obj);
                }

                // Everything is now fully loaded
                Config.isLoaded = true;
                this.container.querySelector('#loading').style.display = 'none';
            };
        });

        // Start render which does not wait for model fully loaded

        this.render();
        this.container.querySelector('#loading').style.display = 'none';
    }

    render() {
        // Render rStats if Dev
        if (Config.isDev && Config.isShowingStats) {
            Stats.start();
        }

        // Call render function and pass in created scene and camera
        this.renderer.render(this.scene, this.camera.threeCamera);

        // rStats has finished determining render call now
        if (Config.isDev && Config.isShowingStats) {
            Stats.end();
        }

        // Delta time is sometimes needed for certain updates
        //const delta = this.clock.getDelta();

        // Call any vendor or module frame updates here
        TWEEN.update();
        this.controls.threeControls.update();

        // RAF
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    }
}
