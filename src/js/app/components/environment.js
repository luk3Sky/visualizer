import * as THREE from 'three';

import Config from '../../data/config';

export default class Environment {
    constructor() {
        console.log(`Environment: Scale: ${scene_scale}, arenaSize:${Config.arena.size}`);

        var geometry = new THREE.PlaneBufferGeometry(Config.arena.size, Config.arena.size);
        var material = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: false
        });
        material.userData.originalColor = new THREE.Color(0x999999);

        // Ground
        var ground = new THREE.Mesh(geometry, material);
        ground.scale.set(scene_scale, scene_scale, scene_scale);
        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid
        var grid = new THREE.GridHelper(Config.arena.size, Math.round(Config.arena.size/10), 0x000000, 0x5b5b5b);
        grid.rotation.x = -Math.PI / 2;
        grid.scale.set(scene_scale, scene_scale, scene_scale);
        grid.position.set(0, 0, 0);
        grid.material.opacity = 0.35;
        grid.material.transparent = true;
        scene.add(grid);
    }
}
