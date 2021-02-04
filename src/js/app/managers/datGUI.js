import Config from '../../data/config';

const params = {
    snapshot: false
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
        labelsFolder
            .add(Config, 'isShowingLables')
            .name('All Labels');
        labelsFolder
            .add(Config, 'isShowingObstacleLables')
            .name('Obstacle Labels')
            .onChange((value) => {
                console.log('show obs labels', value);
        });
        labelsFolder
            .add(Config, 'isShowingRobotLables')
            .name('Robot Labels')
            .onChange((value) => {
                console.log('show robot labels', value);
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
