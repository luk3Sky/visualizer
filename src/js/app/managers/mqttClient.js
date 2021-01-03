import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

import Config from '../../data/config';
import MQTT from 'paho-mqtt';

import Obstacle from '../components/obstacle';
import Robot from '../components/robot';

// -----------------------------------------------------------------------------
// MQTT Topics
// -----------------------------------------------------------------------------
// This will provide location data to the GUI
const TOPIC_INFO = 'localization/info';

// Create and delete robot objects
const TOPIC_CREATE = 'robot/create';
const TOPIC_DELETE = 'robot/delete';

// This will request the localization data update from the server
const TOPIC_LOC_REQUEST = 'localization/?';

// This will request obstacle data from the server
const TOPIC_OBSTACLE_REQUEST = 'obstacles/?';

// This will send obstacle data as a JSON list
const TOPIC_OBSTACLES_LIST = 'obstacles/';

// TODO: need to map with the server
const TOPIC_CHANGE_COLOR = 'sensor/color';

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
                this.client.subscribe(TOPIC_INFO);
                this.client.subscribe(TOPIC_CREATE);
                this.client.subscribe(TOPIC_DELETE);
                this.client.subscribe(TOPIC_CHANGE_COLOR);
                this.client.subscribe(TOPIC_OBSTACLES_LIST);

                // Request for obstacle data
                this.publish(TOPIC_OBSTACLE_REQUEST, '?');

                // Request for coordinate data
                this.publish(TOPIC_LOC_REQUEST, '?');

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
            this.channel = channelHash.substring(1);
        } else {
            this.channel = Config.mqtt.channel;
        }
        console.log('MQTT: channel=', this.channel);
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
        const topic = this.channel + '/' + packet.destinationName;

        if (topic == TOPIC_CREATE) {
            //console.log('MQTT: ' + topic + ' > ' + msg);
            try {
                var data = JSON.parse(msg);
                window.robot.create(data.id, data.x, data.y, data.heading);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_DELETE) {
            try {
                var data = JSON.parse(msg);
                window.robot.delete(data.id);
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_INFO) {
            //console.log('MQTT: ' + topic + ' > ' + msg);
            try {
                var data = JSON.parse(msg);

                Object.entries(data).forEach((entry) => {
                    // Update each robot
                    const r = entry[1];

                    if (window.robot.exists(r.id) == undefined) {
                        window.robot.create(r.id, r.x, r.y, r.heading);
                    } else {
                        window.robot.move(r.id, r.x, r.y, r.heading);
                    }
                });
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
        } else if (topic == TOPIC_CHANGE_COLOR) {
            try {
                var data = JSON.parse(msg);
                window.robot.changeColor(data.id, data.R, data.G, data.B, data.ambient);
            } catch (e) {
                console.error(e);
            }
        }
    }

    publish(topic, message, callback) {
        var payload = new MQTT.Message(message);
        const pubTopic = this.channel + '/' + topic;
        payload.destinationName = pubTopic;
        this.client.send(payload);
        console.log('MQTT: published', pubTopic);

        if (callback != null) callback();
    }
}
