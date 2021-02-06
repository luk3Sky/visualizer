import Config from '../../data/config';

// COMMENT(NuwanJ)
// Store the last state of the toggles in the window.localStorage
// Refer: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// Refer: https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+useLocalStorage

let realities = {
    physical: false,
    virtual: false,
    mixed: true
};

// Manages all dat.GUI interactions
export default class DatGUI {
    constructor(main) {
        this.gui = new dat.GUI();

        this.gui.useLocalStorage = true;

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
            .add(Config.labelsVisibility, 'obstacles')
            .name('Obstacle Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Obstacle', value);
            });
        labelsFolder
            .add(Config.labelsVisibility, 'robots')
            .name('Robot Labels')
            .onChange((value) => {
                this.toggleLabels(this.scene.children, 'Robot', value);
            });

        /* Reality Folder */
        const realityFolder = this.gui.addFolder('Reality');

        // TODO: mixed reality = p + v
        // No need of additional toggle
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
        // TODO: refer Config.mixedReality for actual changes

        // COMMENT(NuwanJ): My opinion is not to allow toggle for realities,
        //    since it makes the system very complex (need to refresh all things)
        //    and not much useful in practice.
        //    But a label is useful for users to know what is the current reality.

        const objects = scene.children;
        Object.entries(objects).forEach((obj) => {
            const name = obj[1]['name'];
            const reality = obj[1]['reality'];

            if (reality != undefined) {
                // TODO: hide by making opacity = 0 for non-matched obstacles
                // or any other solution
                // obj[1].material.opacity = 0;
            }
        });

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
