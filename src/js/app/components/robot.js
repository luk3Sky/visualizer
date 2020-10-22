import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

var STLLoader = require('three-stl-loader')(THREE)
//var scene;

const TOPIC_INFO = 'v1/localization/info';
const TOPIC_CREATE = 'v1/gui/create';

export default class Robot {
   constructor(scene) {
      this.scene = scene;
   }

   changeColor(id, R, G, B, ambient, callback) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         r.material.color.setRGB(R/256, G/256, B/265);
         if (callback != null) callback('success');
      } else {
         if (callback != null) callback('undefined');
      }

      return r;
   }

   create(id, x, y, heading, callback) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r == undefined) {
         // Create only if not exists
         var loader = new STLLoader();
         loader.load('./assets/models/model.stl', function (geometry, scene) {
            var material = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });

            var r = new THREE.Mesh(geometry, material);
            r.receiveShadow = true;
            r.name = "id_" + id;
            r.position.set(x, 0, y);
            r.rotation.y = heading * THREE.Math.DEG2RAD;
            window.scene.add(r);

            // Callback function
            if (callback != null) callback('success');
         });
      } else {
         if (callback != null) callback('already defined');
      }
      return r;
   }

   move(id, x, y, heading, callback) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         const newHeading = heading * THREE.Math.DEG2RAD;
         var position = { x: r.position.x, y: r.position.z, heading: r.rotation.y };

         const speed = 10;
         const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2));

         // TODO: If distance is 0, need to handle only the rotation

         if (distance != 0) {
            var tween = new TWEEN.Tween(position).to({ x: x, y: y, heading: newHeading }, 1000 * (distance / speed))
            /*.easing(TWEEN.Easing.Quartic.InOut)*/
            .onUpdate(function () {
               r.position.x = position.x;
               r.position.z = position.y;
               r.rotation.y = position.heading;

            }).onComplete(() => {
               if (callback != null) callback('success');

            }).delay(50).start();
         } else {
            // No move, only the rotation
            r.rotation.y = newHeading;
         }
         return r;

      } else {
         if (callback != null) callback('undefined');
      }
   }

   get_coordinates(id) {
      var r = this.scene.getObjectByName("id_" + id);
      if (r != undefined) {
         console.log(`${r.position.x},${r.position.y},${r.position.z}`);
         return r;
      } else {
         return null;
      }
   }

   update() {
      TWEEN.update();
   }
}
