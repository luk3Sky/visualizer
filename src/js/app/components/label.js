import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default function () {
    let renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    return renderer;
}

export const addLabel = (prefix, object, mesh) => {
    if (mesh !== undefined) {
        const element = document.createElement('div');
        element.className = 'label';
        console.log(object);
        element.textContent = `${prefix}_${object.id}`;
        element.style.marginTop = '-1.2em';
        const elementLabel = new CSS2DObject(element);
        elementLabel.position.set(0, 1, 0);
        mesh.add(elementLabel);
    }
};
