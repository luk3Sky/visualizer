import Config from '../../data/config';

let realities = {
    physical: false,
    virtual: false,
    mixed: true
};

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
        labelsFolder.add(Config, 'isShowingLables').name('All Labels');
        labelsFolder
            .add(Config, 'isShowingObstacleLables')
            .name('Obstacle Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Obstacle', value);
            });
        labelsFolder
            .add(Config, 'isShowingRobotLables')
            .name('Robot Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Robot', value);
            });
        /* Reality Folder */
        const realityFolder = this.gui.addFolder('Reality');
        realityFolder
            .add(realities, 'physical')
            .name('Physical Reality')
            .listen()
            .onChange((value) => {
                this.toggleReality('physical', 'P');
            });
        realityFolder
            .add(realities, 'virtual')
            .name('Virtual Reality')
            .listen()
            .onChange((value) => {
                this.toggleReality('virtual', 'V');
            });
        realityFolder
            .add(realities, 'mixed')
            .listen()
            .name('Mixed Reality')
            .onChange((value) => {
                this.toggleReality('mixed', 'M');
            });

        this.gui.open();

        /* Global */
        //this.gui.close();

        // this.model = main.model;
        // this.meshHelper = main.meshHelper;
    }

    toggleLabels(objects, type, value) {
        if (Array.isArray(objects) && type !== undefined && type !== '') {
            for (var variable of objects) {
                if (variable.name.startsWith(type)) {
                    variable.children[0].visible = value;
                }
            }
        }
    }

    toggleRobotsByRealm(objects, type) {
        if (Array.isArray(objects) && type !== undefined && type !== '') {
            for (let variable of objects) {
                // TODO:
            }
        }
    }

    toggleReality(reality, selected) {
        window.selectedReality = selected;
        for (let attrib in realities) {
            realities[attrib] = false;
        }
        realities[reality] = true;
        console.log(window.selectedReality, realities);
    }

    show() {
        this.gui.show();
    }

    unload() {
        this.gui.destroy();
        this.gui = new dat.GUI();
    }
}
