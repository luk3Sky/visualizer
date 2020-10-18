import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

var scene;

// Sets up and places all lights in scene
export default class Robot {
   constructor(scene) {
      this.scene = scene;
   }

   create(id, x, y) {
      var geometry = new THREE.CylinderGeometry(5, 5, 8, 32);
      var material = new THREE.MeshPhongMaterial({
         color: 0xD3D3D3,flatShading: true,morphTargets: true
      });
      var robot1 = new THREE.Mesh(geometry, material);
      robot1.name = "id_" + id;
      robot1.position.set(x, 4, y);

      this.scene.add(robot1);
      return robot;
   }

   update_robot(id, x, y) {
      var robot = this.scene.getObjectByName("id_" + id);
      var position = { x : robot.position.x, y: robot.position.z };
      var tween = new TWEEN.Tween(position).to({x:x, y:y}, 1000)

      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate(function(){
         robot.position.x = position.x;
         robot.position.z = position.y;
      }).delay(500).start();
      return robot;
   }

   get_coordinates(id) {
      var robot = this.scene.getObjectByName("id_" + id);
      if (robot != undefined) {
         console.log(`${robot.position.x},${robot.position.y},${robot.position.z}`);
      }
      return robot;
   }
}
