
import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

import MQTT from 'paho-mqtt';

const mqtt_server = "68.183.188.135";
const mqtt_port = 8883;

const TOPIC_INFO = 'v1/localization/info';
const TOPIC_CREATE = 'v1/gui/create';
const TOPIC_CHANGE_COLOR = 'v1/sensor/color';

export default class MQTTClient {

    constructor(scene, robot) {

        this.scene = scene;
        this.robot = robot;

        const client_id = 'client_' + Math.random().toString(36).substring(2, 15);
        this.client = new MQTT.Client(mqtt_server, mqtt_port, "", client_id);

        this.client.connect({
            userName: "swarm_user",
            password: "swarm_usere15",
            reconnect: true,
            useSSL: true,
            cleanSession : false,
            onSuccess: () => {
                console.log('MQTT: connected');

                // Subscribe to topics
                this.client.subscribe(TOPIC_INFO);
                this.client.subscribe(TOPIC_CREATE);
                this.client.subscribe(TOPIC_CHANGE_COLOR);

                window.robot = this.robot;
                this.client.onMessageArrived = this.onMessageArrived;
                this.client.onConnectionLost = this.onConnectionLost;
            }
        });
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("MQTT: onConnectionLost:" + responseObject.errorMessage);
            console.log('MQTT: reconnecting');
        }
    }

    onMessageArrived(packet) {
        const msg = packet.payloadString.trim();
        const topic = packet.destinationName;

        if (topic == TOPIC_CREATE) {
            //console.log('MQTT: ' + topic + ' > ' + msg);

            try {
                var data = JSON.parse(msg);
                window.robot.create(data.id, data.x, data.y, data.heading)
            } catch (e) {
                console.error(e);
            }

        } else if (topic == TOPIC_INFO) {
            //console.log('MQTT: ' + topic + ' > ' + msg);
            try {
                var data = JSON.parse(msg);

                Object.entries(data).forEach(entry => {
                    // Update each robot
                    //console.log(entry[1]);
                    const r = entry[1];

                    if(window.robot.exists(r.id)==undefined){
                        window.robot.create(r.id, r.x, r.y, r.heading);
                    }else{
                        window.robot.move(r.id, r.x, r.y, r.heading);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        } else if (topic == TOPIC_CHANGE_COLOR) {
            try {
                var data = JSON.parse(msg);
                window.robot.changeColor(data.id, data.R, data.G, data.B, data.ambient);
                //console.log('R: '+data.R+ ' G: '+data.G+ ' B: '+data.B);
            } catch (e) {
                console.error(e);
            }
        }
    }

    publish(topic, message, callback) {
        var payload = new MQTT.Message(message);
        payload.destinationName = topic;
        this.client.send(payload);
        console.log('MQTT: published');

        if (callback != null) callback();
    }

}
