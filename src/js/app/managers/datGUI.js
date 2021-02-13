import Config from '../../data/config';
const storedConfig = window.localStorage;
console.log('storedConfig', storedConfig, JSON.parse(storedConfig.getItem(`${window.location.href}.gui`)));

// COMMENT(NuwanJ)
// Store the last state of the toggles in the window.localStorage
// Refer: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// Refer: https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+useLocalStorage

let realities = {
    physical: true,
    virtual: true
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

    toggleReality(reality, selected) {
        // by default visualizer will intercept all the communication coming to the channel regardless of the reality.
        // this control panel will only toggle the 'visibility' of objects in the selected realities.
        window.selectedRealities = realities;
        const objects = scene.children;
        Object.entries(objects).forEach((obj) => {
            const name = obj[1]['name'];
            const reality = obj[1]['reality'];
            if (reality !== undefined && reality === 'P') {
                obj[1].visible = realities.physical;
            } else if (reality !== undefined && reality === 'V') {
                obj[1].visible = realities.virtual;
            }
        });
    }

    show() {
        this.gui.show();
    }

    unload() {
        this.gui.destroy();
        this.gui = new dat.GUI();
    }
}
