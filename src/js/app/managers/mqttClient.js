
import * as THREE from 'three';
import TWEEN, { update } from '@tweenjs/tween.js';

import MQTT from 'paho-mqtt';

const mqtt_server = "68.183.188.135";
const mqtt_port = 9001;

const TOPIC_INFO = 'v1/localization/info';
const TOPIC_CREATE = 'v1/gui/create';

var client;
var scene;
var robot;

export default class MQTTClient {

   constructor(scene, robot) {

      this.scene = scene;
      this.robot = robot;

      console.log(this.robot);
      const client_id = 'client_' + Math.random().toString(36).substring(2, 15);

      this.client = new MQTT.Client(mqtt_server, mqtt_port, "", client_id);

      this.client.connect({
         userName: "swarm_user",
         password: "swarm_usere15",
         reconnect : true,
         onSuccess: () => {
            console.log('MQTT: connected');
            //this.publish('v1/localization/info', 'hello !');

            // Subscribe to topics
            this.client.subscribe(TOPIC_INFO);
            this.client.subscribe(TOPIC_CREATE);

            window.robot = this.robot;

            this.client.onMessageArrived = this.onMessageArrived;
            this.client.onConnectionLost = this.onConnectionLost;
            //this.client.reconnect = this.reconnect;
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
      console.log('MQTT: ' + topic + ' > ' + msg);

      if (topic == TOPIC_CREATE) {
         var data = JSON.parse(msg);
         //console.log('Crerate msg invoked');
         window.robot.create(data.id, data.x, data.y)

      } else if (topic == TOPIC_INFO) {
         console.log('Info msg invoked');
         var data = JSON.parse(msg);

         //console.log(Object.keys(data).length)

         Object.entries(data).forEach(entry => {
            // Update each robot
            console.log(entry[1]);
            const r = entry[1];
            window.robot.move(r.id, r.x, r.y);
         });

      }

   }

   publish(topic, message) {
      var payload = new MQTT.Message(message);
      payload.destinationName = topic;
      this.client.send(payload);

      console.log('MQTT: published');
   }

}
