
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

      this.client = new MQTT.Client(mqtt_server, mqtt_port, "");

      this.client.connect({
         userName: "swarm_user",
         password: "swarm_usere15",
         onSuccess: () => {
            console.log('MQTT: connected');
            //this.publish('v1/localization/info', 'hello !');

            // Subscribe to topics
            this.client.subscribe(TOPIC_INFO);
            this.client.subscribe(TOPIC_CREATE);

            this.client.onMessageArrived = this.onMessageArrived;
            this.client.onConnectionLost = this.onConnectionLost;
         }
      });
   }

   onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
         console.log("MQTT: onConnectionLost:" + responseObject.errorMessage);
      }
   }

   updateRobot(data) {
      console.log(scene);//(data.id, data.x, data.y);
   }
   onMessageArrived(packet) {
      const msg = packet.payloadString.trim();
      const topic = packet.destinationName;
      console.log('MQTT: ' + topic + ' > ' + msg);

      if (topic == TOPIC_CREATE) {
         var data = JSON.parse(msg);
         console.log(this);
         var geometry = new THREE.CylinderGeometry(5, 5, 8, 32);
         var material = new THREE.MeshPhongMaterial({
            color: 0xD3D3D3, flatShading: true, morphTargets: true
         });
         var robot = new THREE.Mesh(geometry, material);
         robot.name = "id_" + data.id;
         robot.position.set(data.x, 4, data.y);

         //test-------------
         console.log("robot name " +robot.name);
         console.log("x: "+ robot.position.x + " y: "+ robot.position.y + " z: "+ robot.position.z);
         scene.add(robot);
      } else if (topic == TOPIC_INFO) {
         console.log('Info msg invoked');
      }
   }

   publish(topic, message) {
      var payload = new MQTT.Message(message);
      payload.destinationName = topic;
      this.client.send(payload);

      console.log('MQTT: published');
   }

}
