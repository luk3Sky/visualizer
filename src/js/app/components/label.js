import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default function () {
    let renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    return renderer;
}

export const addLabel = (object, mesh) => {
    const element = document.createElement('div');
    element.className = 'label';
    element.textContent = `Obstacle_${object.id}`;
    element.style.marginTop = '-1em';
    const earthLabel = new CSS2DObject(element);
    earthLabel.position.set(0, 1, 0);
    if (mesh !== undefined) mesh.add(earthLabel);
};
