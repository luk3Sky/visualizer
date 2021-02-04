import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Config from '../../data/config';

export default function () {
    let renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.isShowingLables = Config.isShowingLables;
    renderer.isShowingObstacleLables = Config.isShowingObstacleLables;
    renderer.isShowingRobotLables = Config.isShowingRobotLables;
    return renderer;
}

export const addLabel = (prefix, object, mesh) => {
    if (mesh !== undefined) {
        let element = document.createElement('div');
        element.className = 'label';
        element.textContent = `${prefix}[${object.id}]`;
        element.style.marginTop = '-1.2em';
        const elementLabel = new CSS2DObject(element);
        elementLabel.name = `Label[${object.id}]`;
        elementLabel.position.set(0, 1, 0);
        mesh.add(elementLabel);
        mesh.removeLabel = () => {
            mesh.remove(elementLabel);
        }
    }
};

export const removeLabel = (mesh) => {
    if(mesh !== undefined && mesh.removeLabel !== undefined) {
        mesh.removeLabel();
    }
}
