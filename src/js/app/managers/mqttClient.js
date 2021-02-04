import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';
import MQTT from 'paho-mqtt';

import Config from '../../data/config';
import Obstacle from '../components/obstacle';
import Robot from '../components/robot';

// -----------------------------------------------------------------------------
// MQTT Topics

// Create and delete robot objects
const TOPIC_ROBOT_CREATE = 'robot/create';
const TOPIC_ROBOT_DELETE = 'robot/delete';
const TOPIC_ROBOT_BROADCAST = 'robot/msg/broadcast';

// This will provide location data to the GUI
const TOPIC_LOC_INFO_FROM_SERVER = 'localization/data';
const TOPIC_LOC_INFO_FROM_LOC_SYSTEMS = 'localization/update';

// This will request the localization data update from the server
const TOPIC_LOC_REQUEST = 'localization/data/?';

// This will request obstacle data from the server
const TOPIC_OBSTACLE_REQUEST = 'obstacles/?';

// This will send obstacle data as a JSON list
const TOPIC_OBSTACLES_LIST = 'obstacles';
const TOPIC_OBSTACLES_DELETE = 'obstacles/delete';
const TOPIC_OBSTACLES_DELETE_ALL = 'obstacles/delete/all';

// Robot Color - NeoPixel
const TOPIC_CHANGE_COLOR = 'output/neopixel';

// This will help to remote update the parameters in here
const TOPIC_MANAGEMENT_VISUALIZER = 'mgt/visualizer';

// -----------------------------------------------------------------------------

export default class MQTTClient {
    constructor(scene) {
        this.scene = scene;
        this.robot = new Robot(scene);
        this.obstacles = new Obstacle(scene);

        this.updateChannel();

        // create a random client Id
        const client_id = 'client_' + Math.random().toString(36).substring(2, 15);
        this.client = new MQTT.Client(Config.mqtt.server, Config.mqtt.port, Config.mqtt.path, client_id);

        window.mqtt = this.client;

        this.client.connect({
            userName: Config.mqtt.user,
            password: Config.mqtt.password,
            reconnect: true,
            useSSL: true,
            cleanSession: false,
            onSuccess: () => {
                console.log('MQTT: connected');

                // Subscribe to topics
                this.subscribe(TOPIC_LOC_INFO_FROM_SERVER);
                this.subscribe(TOPIC_LOC_INFO_FROM_LOC_SYSTEMS);

                this.subscribe(TOPIC_ROBOT_CREATE);
                this.subscribe(TOPIC_ROBOT_DELETE);
                this.subscribe(TOPIC_ROBOT_BROADCAST);

                this.subscribe(TOPIC_CHANGE_COLOR);
                this.subscribe(TOPIC_OBSTACLES_LIST);
                this.subscribe(TOPIC_OBSTACLES_DELETE);
                this.subscribe(TOPIC_OBSTACLES_DELETE_ALL);
                this.subscribe(TOPIC_MANAGEMENT_VISUALIZER);

                // Request for obstacle data
                this.publish(TOPIC_OBSTACLE_REQUEST, Config.mixedReality.obstacles);

                // Request for coordinate data
                this.publish(TOPIC_LOC_REQUEST, Config.mixedReality.robots);

                // Access globally
                window.robot = this.robot;
                window.obstacles = this.obstacles;

                this.client.onMessageArrived = this.onMessageArrived;
                this.client.onConnectionLost = this.onConnectionLost;
            },
            onFailure: () => {
                console.log('MQTT: connection failed');
            }
        });
    }

    updateChannel() {
        const channelHash = window.location.hash;
        if ((channelHash != '') & (channelHash.length > 1)) {
            window.channel = channelHash.substring(1);
        } else {
            window.channel = Config.mqtt.channel;
        }
        console.log('MQTT: channel=', window.channel);
        return true;
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log('MQTT: onConnectionLost:' + responseObject.errorMessage);
            console.log('MQTT: reconnecting');
        }
    }

    onMessageArrived(packet) {
        const msg = packet.payloadString.trim();
        const t = packet.destinationName;
        const topic = t.substring(t.indexOf('/') + 1);

        // console.log('MQTT: ' + topic + ' > ' + msg);

        if (topic == TOPIC_ROBOT_CREATE) {
            try {
                const data = JSON.parse(msg);
                window.robot.create(data.id, data.x, data.y, data.heading, data.reality);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_ROBOT_DELETE) {
            try {
                var data = JSON.parse(msg);
                window.robot.delete(data.id);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_LOC_INFO_FROM_LOC_SYSTEMS || topic == TOPIC_LOC_INFO_FROM_SERVER) {
            //Data from the localization server or virtual robots
            try {
                const { data, reality } = JSON.parse(msg);
                const REALITY = Config.mixedReality.robots;

                // Render only the received data is same as configured reality
                // or configuration allowed mixed reality
                if (data != undefined && (reality == REALITY || REALITY == 'M')) {
                    // Have data on this reality
                    Object.entries(data).forEach((entry) => {
                        const r = entry[1];

                        if (window.robot.exists(r.id) == undefined) {
                            window.robot.create(r.id, r.x, r.y, r.heading, reality);
                        } else {
                            window.robot.move(r.id, r.x, r.y, r.heading);
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_OBSTACLES_LIST) {
            // Create obstacles in the arena
            try {
                const data = JSON.parse(msg);
                window.obstacles.createList(data);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_OBSTACLES_DELETE) {
            // Delete obstacle given in the id
            const data = JSON.parse(msg);
            console.log(data);

            window.obstacles.deleteIfExists(data.id);
        } else if (topic == TOPIC_OBSTACLES_DELETE_ALL) {
            // Delete all obstacles
            window.obstacles.deleteAll();
        } else if (topic == TOPIC_CHANGE_COLOR) {
            try {
                const data = JSON.parse(msg);
                window.robot.changeColor(data.id, data.R, data.G, data.B, data.ambient);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_ROBOT_BROADCAST) {
            // Display a popup message
            // TODO: Do this by a generalized function call

            if (msg != 'ID? -1') {
                const m = 'Broadcast Message: ' + msg.split(' ')[0];
                const t = 1000 + msg.length * 95;

                let disp = document.querySelector('#msg-box');
                disp.innerHTML = m;
                disp.style.display = 'block';

                setTimeout(function () {
                    document.querySelector('#msg-box').style.display = 'none';
                }, t);
            }
        } else if (topic == TOPIC_MANAGEMENT_VISUALIZER) {
            if (msg === 'REFRESH') {
                console.log('page refresh request');
                location.reload();
            } else if (msg.startsWith('MSG')) {
                const m = 'Notice: ' + msg.substring(4);
                const t = 2000 + m.length * 95;

                // Display a popup message
                // TODO: Do this by a generalized function call
                let disp = document.querySelector('#msg-box');
                disp.innerHTML = m;
                disp.style.display = 'block';

                setTimeout(function () {
                    document.querySelector('#msg-box').style.display = 'none';
                }, t);
            } else {
                console.log('>Management:', msg);
            }
        }
    }

    subscribe(topic, callback) {
        const subTopic = window.channel + '/' + topic;
        this.client.subscribe(subTopic);
        console.log('MQTT: subscribed', subTopic);
        if (callback != null) callback();
    }

    publish(topic, message, callback) {
        var payload = new MQTT.Message(message);
        const pubTopic = window.channel + '/' + topic;
        payload.destinationName = pubTopic;
        this.client.send(payload);
        console.log('MQTT: published', pubTopic);

        if (callback != null) callback();
    }
}
