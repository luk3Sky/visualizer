import * as THREE from 'three';
import TWEEN, { update }  from '@tweenjs/tween.js';

var scene;

const TOPIC_INFO = 'v1/localization/info';
const TOPIC_CREATE = 'v1/gui/create';

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
      var r = new THREE.Mesh(geometry, material);
      r.name = "id_" + id;
      r.position.set(x, 4, y);

      this.scene.add(r);
      return r;
   }

   update_robot(id, x, y) {

      var r = this.scene.getObjectByName("id_" + id);
      var position = { x : r.position.x, y: r.position.z };
      var tween = new TWEEN.Tween(position).to({x:x, y:y}, 1000)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate(function(){
         r.position.x = position.x;
         r.position.z = position.y;
      }).delay(500).start();
      return r;
      
   }

   get_coordinates(id) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         console.log(`${r.position.x},${r.position.y},${r.position.z}`);
      }
      return r;
   }

   update(){
      TWEEN.update();
   }
}
