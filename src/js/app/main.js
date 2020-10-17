// Global imports -


import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

// Local imports -

// MQTT ------------------
/*
var $script = require("scriptjs");
$script("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js", function() {
  $('body').html('It works!')
});
*/
const mqtt_server = "test.mosquitto.org";
const mqtt_port = 8080;

//var mqtt    = require('mqtt');
//var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');


//const client = Paho.MQTT.Client(mqtt_server, mqtt_port, "client31146");

/*
// set event handlers
client.on('connectionLost', (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.log(responseObject.errorMessage);
  }
});
client.on('messageReceived', (message) => {
  console.log(message.payloadString);
});
*/

/*
client.connect()
.then(() => {
   // Once a connection has been made, make a subscription and send a message.
   console.log('onConnect');
   return client.subscribe('World');
})
.then(() => {
   const message = new Message('Hello');
   message.destinationName = 'World';
   client.send(message);
})
.catch((responseObject) => {
   if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
   }
});
*/

// -----------------------








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

// data
import Config from './../data/config';
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
   constructor(container) {
      // Set container property to container element
      this.container = container;

      // Start Three clock
      this.clock = new THREE.Clock();

      // Main scene creation
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

      // Get Device Pixel Ratio first for retina
      if(window.devicePixelRatio) {
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

      // Create and place geo in scene
      //this.geometry = new Geometry(this.scene);
      //this.geometry.make('plane')(150, 150, 10, 10);
      //this.geometry.place([0, 0, 0], [Math.PI / 2, 0, 0]);

      // Set up rStats if dev environment
      if(Config.isDev && Config.isShowingStats) {
         this.stats = new Stats(this.renderer);
         this.stats.setUp();
      }

      // Set up gui
      //if (Config.isDev) {
      //   this.gui = new DatGUI(this)
      //}

      // Instantiate texture class
      this.texture = new Texture();

      // Start loading the textures and then go on to load the model after the texture Promises have resolved
      this.texture.load().then(() => {
         this.manager = new THREE.LoadingManager();

         // Textures loaded, load model
         this.model = new Model(this.scene, this.manager, this.texture.textures);
         //this.model.load(Config.models[Config.model.selected].type);

         // -- Added by Nuwan ---------
         var geometry = new THREE.PlaneBufferGeometry( 150, 150 );
         var material = new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } );
         var ground = new THREE.Mesh(geometry, material );
         ground.position.set( 0,0, 0 );
         ground.rotation.x = - Math.PI / 2;
         ground.receiveShadow = true;
         this.scene.add( ground );

         var grid = new THREE.GridHelper( 150, 15, 0x000000, 0x000000 );
         grid.position.y = - 0;
         grid.material.opacity = 0.2;
         grid.material.transparent = true;
         this.scene.add( grid );

         var geometry = new THREE.BoxGeometry(15,15,15);

         var material = new THREE.MeshPhongMaterial( {
            color: 0x00ff00,
            flatShading: true,
            morphTargets: true
         } );

         var cube = new THREE.Mesh( geometry, material );
         cube.receiveShadow = true;
         cube.position.set(0,7.5,0);
         this.scene.add( cube );

         // -------------------------------------

         // onProgress callback
         this.manager.onProgress = (item, loaded, total) => {
            console.log(`${item}: ${loaded} ${total}`);
         };

         // Controls panel
         this.gui.load(this, this.model.obj);

         // All loaders done now
         this.manager.onLoad = () => {
            alert('Loaded');

            // Set up interaction manager with the app now that the model is finished loading
            new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

            // Add dat.GUI controls if dev
            if(Config.isDev) {
               this.meshHelper = new MeshHelper(this.scene, this.model.obj);
               if (Config.mesh.enableHelper) this.meshHelper.enable();
               this.gui.load(this, this.model.obj);
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
      if(Config.isDev && Config.isShowingStats) {
         Stats.start();
      }

      // Call render function and pass in created scene and camera
      this.renderer.render(this.scene, this.camera.threeCamera);

      // rStats has finished determining render call now
      if(Config.isDev && Config.isShowingStats) {
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
