import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

var STLLoader = require('three-stl-loader')(THREE)

var scene;

const TOPIC_INFO = 'v1/localization/info';
const TOPIC_CREATE = 'v1/gui/create';

// Sets up and places all lights in scene
export default class Robot {
   constructor(scene) {
      this.scene = scene;
   }

   create(id, x, y) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r == undefined) {
         // Create only if not exists

         var loader = new STLLoader();
         loader.load('./assets/models/model.stl', function (geometry, scene) {
            var material = new THREE.MeshPhongMaterial({ color: 0x1B3AE3, specular: 0x111111, shininess: 200 });
            var r = new THREE.Mesh(geometry, material);
            r.name = "id_" + id;
            r.position.set(x, 4, y);
            window.scene.add(r);
         });

        /* var geometry = new THREE.CylinderGeometry(5, 5, 8, 32);
         var material = new THREE.MeshPhongMaterial({
            color: 0x1B3AE3, flatShading: true, morphTargets: true
         });
         var r = new THREE.Mesh(geometry, material);
         r.name = "id_" + id;
         r.position.set(x, 4, y);

         this.scene.add(r);*/
      }
      return r;
   }

   move(id, x, y, callback) {

      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         var position = { x: r.position.x, y: r.position.z };

         const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2));
         const speed = 10;

         var tween = new TWEEN.Tween(position).to({ x: x, y: y }, 1000 * (distance / speed))
            /*.easing(TWEEN.Easing.Quartic.InOut)*/
            .onUpdate(function () {
               r.position.x = position.x;
               r.position.z = position.y;

            }).onComplete(() => {
               if (callback != null) callback();

            }).delay(500).start();
         return r;
      }
   }

   get_coordinates(id) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         console.log(`${r.position.x},${r.position.y},${r.position.z}`);
      }
      return r;
   }

   update() {
      TWEEN.update();
   }
}
