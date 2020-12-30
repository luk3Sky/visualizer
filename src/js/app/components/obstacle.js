import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

import Config from '../../data/config';

export default class Obstacle {
    constructor(scene, callback) {
        this.scene = scene;

        if (callback != undefined) {
            callback();
        }
    }

    // Create a given list of obstacles
    createList(obstacles) {
        Object.entries(obstacles).forEach((obs) => {
            if (obs != undefined) {
                //console.log(obs[1]);
                this.create(obs[1]);
            }
        });
    }

    // Create a obstacle
    create(obstacle) {
        const geometry = this.createGeometry(obstacle.geometry);
        const material = this.createMaterial(obstacle.material);
        const id = obstacle.id || 1000 + Math.floor(900 * Math.random());

        const mesh = new THREE.Mesh(geometry, material);

        mesh.name = 'obstacle_' + id;

        // Remove if object is already defined
        this.deleteIfExists(mesh.name);

        // Add the mesh object to arena
        this.scene.add(mesh);

        // update the position of the object
        if (obstacle.position != undefined) {
            const { x, y } = obstacle.position;
            const z = this.calculateZ(obstacle);

            mesh.position.set(x, y, z);
        }

        // Rotate the object, after translate degrees into radians
        if (obstacle.rotation != undefined) {
            const { x, y, z } = obstacle.rotation;
            const radX = ((90 + x) / 360) * 2 * Math.PI; // transformation due to coordinate system
            const radY = (y / 360) * 2 * Math.PI;
            const radZ = (z / 360) * 2 * Math.PI;

            mesh.rotation.set(radX, radY, radZ);
        }

        // Enable shadows for the object
        if (Config.shadow.enabled) mesh.receiveShadow = true;

        console.log('Created> Obstacle:', id);
    }

    createGeometry(g) {
        if (g.type == undefined) throw new TypeError('type unspecified');

        if (g.type == 'BoxGeometry') {
            if (g.width == undefined) throw new TypeError('width unspecified');
            if (g.height == undefined) throw new TypeError('height unspecified');
            if (g.depth == undefined) throw new TypeError('depth unspecified');

            // https://threejs.org/docs/#api/en/geometries/BoxGeometry
            return new THREE.BoxGeometry(g.width, g.height, g.depth);
        } else if (g.type == 'CylinderGeometry') {
            if (g.radiusTop == undefined) throw new TypeError('radiusTop unspecified');
            if (g.radiusBottom == undefined) throw new TypeError('radiusBottom unspecified');
            if (g.height == undefined) throw new TypeError('height unspecified');

            // https://threejs.org/docs/#api/en/geometries/CylinderGeometry
            const heightSegments = g.heightSegments || 2;
            const radialSegments = g.radialSegments || 16;

            return new THREE.CylinderGeometry(g.radiusTop, g.radiusBottom, g.height, radialSegments, heightSegments);
        } else if (g.type == 'SphereGeometry') {
            if (g.radius == undefined) throw new TypeError('radius unspecified');

            // https://threejs.org/docs/#api/en/geometries/SphereGeometry
            const widthSegments = g.widthSegments || 16;
            const heightSegments = g.heightSegments || 16;
            return new THREE.SphereGeometry(g.radius, widthSegments, heightSegments);
        } else {
            throw new TypeError('unsupported geometry type');
        }
    }

    createMaterial(m) {
        if (m.type == 'MeshBasicMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
            return new THREE.MeshBasicMaterial(m.properties);
        } else if (m.type == 'MeshNormalMaterial') {
            // https://threejs.org/docs/api/en/materials/MeshNormalMaterial.html
            return new THREE.MeshNormalMaterial(m.properties);
        } else if (m.type == 'MeshPhongMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshPhongMaterial
            return new THREE.MeshPhongMaterial(m.properties);
        } else if (m.type == 'MeshPhysicalMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
            return new THREE.MeshPhysicalMaterial(m.properties);
        } else if (m.type == 'MeshStandardMaterial') {
            // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
            return new THREE.MeshStandardMaterial(m.properties);
        } else {
            // Default material type
            return new THREE.MeshStandardMaterial(m.properties);
        }
    }

    calculateZ(obstacle) {
        // If z is undefined, place the object in top of the arena
        if (obstacle.position.z == undefined) {
            if (obstacle.geometry.height != undefined) {
                // Box and Cylinder objects
                return obstacle.geometry.height / 2;
            } else if (obstacle.geometry.radius != undefined) {
                // Sphere objects
                return obstacle.geometry.radius;
            } else {
                return 0;
            }
        }
        return obstacle.position.z;
    }

    deleteIfExists(id) {
        var obstacle = this.scene.getObjectByName(id);
        if (obstacle != undefined) this.scene.remove(obstacle);
    }
}
