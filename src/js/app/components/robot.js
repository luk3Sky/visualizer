import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

import Config from '../../data/config';

var STLLoader = require('three-stl-loader')(THREE);

export default class Robot {
    constructor(scene) {
        this.scene = scene;
    }

    changeColor(id, R, G, B, ambient, callback) {
        var r = this.scene.getObjectByName('id_' + id);
        if (r != undefined) {
            r.material.color.setRGB(R / 256, G / 256, B / 265);
            //console.log("Color> id:", id, " | R:", R, "G:", G, "B:", B);

            if (callback != null) callback('success');
        } else {
            if (callback != null) callback('undefined');
        }

        return r;
    }

    create(id, x, y, heading, callback) {
        var r = this.scene.getObjectByName('id_' + id);
        if (r == undefined) {
            // Create only if not exists

            // Limit the arena that robot can go
            x = Math.min(Math.max(x, Config.arena.minX), Config.arena.maxX);
            y = Math.min(Math.max(y, Config.arena.minY), Config.arena.maxY);

            var loader = new STLLoader();
            loader.load('./assets/models/model.stl', function (geometry, scene) {
                var material = new THREE.MeshStandardMaterial({ color: 0x5877d2 });

                var r = new THREE.Mesh(geometry, material);
                r.receiveShadow = true;
                r.name = 'id_' + id;
                r.position.set(x, y, 0);
                r.rotation.x = 90 * THREE.Math.DEG2RAD;
                r.rotation.y = (heading - 90) * THREE.Math.DEG2RAD;
                window.scene.add(r);

                console.log('Created> id:', id, ' | x:', x, 'y:', y, 'heading:', heading);

                // Callback function
                if (callback != undefined) callback('success');
            });
        } else {
            if (callback != undefined) callback('already defined');
        }
        return r;
    }

    delete(id, callback) {
        if (id != undefined) {
            var r = this.scene.getObjectByName('id_' + id);

            if (r != undefined) {
                scene.remove(r);
                console.log('Deleted> id:', id);
                if (callback != undefined) callback('success');
            } else {
                if (callback != undefined) callback('not found');
            }
        } else {
            if (callback != undefined) callback('id not specified');
        }
    }

    exists(id) {
        var r = this.scene.getObjectByName('id_' + id);
        return r;
    }

    move(id, x, y, heading, callback) {
        var r = this.scene.getObjectByName('id_' + id);
        if (r != undefined) {
            const newHeading = (heading - 90) * THREE.Math.DEG2RAD;
            var position = { x: r.position.x, y: r.position.y, heading: r.rotation.y };

            // Limit the arena that robot can go
            x = Math.min(
                Math.max(Math.round(x * 10) / 10, Config.arena.minX),
                Config.arena.maxX
            );
            y = Math.min(
                Math.max(Math.round(y * 10) / 10, Config.arena.minY),
                Config.arena.maxY
            );
            heading = Math.round(heading * 10) / 10;

            // const speed = 10;
            const distance = Math.sqrt(
                Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
            );

            const moveTime = 1; //distance / speed;
            // TODO: If distance is 0, need to handle only the rotation

            if (distance != 0) {
                var tween = new TWEEN.Tween(position)
                    .to({ x: x, y: y, heading: newHeading }, 1000 * moveTime)
                    /*.easing(TWEEN.Easing.Quartic.InOut)*/
                    .onUpdate(function () {
                        r.position.x = position.x;
                        r.position.y = position.y;
                        r.rotation.y = position.heading;
                    })
                    .onComplete(() => {
                        //console.log('Move> id:',id,'x:',x,'y:',y,'heading:',heading);
                        if (callback != null) callback('success');
                    })
                    .delay(50)
                    .start();
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
        var r = this.scene.getObjectByName('id_' + id);
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
