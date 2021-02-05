import Config from '../../data/config';

const toggleLabels = (objects, type, value) => {
    if(Array.isArray(objects) && type !== undefined && type !== ''){
        for (var variable of objects) {
            if(variable.name.startsWith(type)){
                variable.children[0].visible = value;
            }
        }
    }
}

// Manages all dat.GUI interactions
export default class DatGUI {
    constructor(main) {
        this.gui = new dat.GUI();

        this.camera = main.camera.threeCamera;
        this.controls = main.controls.threeControls;
        this.light = main.light;
        this.scene = main.scene;

        this.model = null;
        this.meshHelper = null;
    }

    load(main, mesh) {
        // Add folders
        this.gui.add(Config, 'isShowingRobotSnapshots').name('Robot Snapshots');
        /* Labels Folder */
        const labelsFolder = this.gui.addFolder('Labels');
        labelsFolder
            .add(Config, 'isShowingLables')
            .name('All Labels');
        labelsFolder
            .add(Config, 'isShowingObstacleLables')
            .name('Obstacle Labels')
            .onChange((value) => {
                toggleLabels(this.scene.children, 'Obstacle', value);
        });
        labelsFolder
            .add(Config, 'isShowingRobotLables')
            .name('Robot Labels')
            .onChange((value) => {
                toggleLabels(this.scene.children, 'Robot', value);
        });

        this.gui.open();

        /* Global */
        //this.gui.close();

        // this.model = main.model;
        // this.meshHelper = main.meshHelper;
    }

    show() {
        this.gui.show();
    }

    unload() {
        this.gui.destroy();
        this.gui = new dat.GUI();
    }
}
