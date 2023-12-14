import { InteractiveUIComponent, vCanvas, UIComponent } from "@niuee/vcanvas";
import { Point, PointCal } from "point2point";
import { World, QuadTree, Polygon } from "@niuee/vphysics";

type Identifier = {
    index: number;
    type: "CP" | "LH" | "RH";
}

customElements.define('v-canvas', vCanvas);

let element = document.getElementById("test-graph") as vCanvas;
let keyController: Map<string, boolean>;
keyController = new Map<string, boolean>();

keyController.set("KeyA", false);
keyController.set("KeyW", false);
keyController.set("KeyS", false);
keyController.set("KeyD", false);
keyController.set("KeyQ", false);
keyController.set("KeyE", false);

window.addEventListener('keypress', (e)=>{
    if(keyController.has(e.code)){
        keyController.set(e.code, true);
    }
});

window.addEventListener('keyup', (e)=>{
    if(keyController.has(e.code)){
        keyController.set(e.code, false);
    }
})


let world = new World(25000, 25000);
for (let index = 0; index < 1000; index++){
    let vertices = [{x: 10, y: 10}, {x: -10, y: 10}, {x: -10, y: -10}, {x: 10, y: -10}];
    world.addRigidBody(index.toString(), new Polygon(getRandomPoint(-25000, 25000), vertices));
}

const canvasStepFn = element.getStepFunction();
const context = element.getContext();

function step(timestamp: number){
    canvasStepFn(timestamp);
    let rigidBodies = world.getRigidBodyList();
    if(keyController.get("KeyW")){
        rigidBodies[0].applyForceInOrientation(10000);
    } 
    if(keyController.get("KeyA")){
        rigidBodies[0].applyForceInOrientation({x: 0, y: 10000});
    }
    if(keyController.get("KeyS")){
        rigidBodies[0].applyForceInOrientation({x: -10000, y: 0});
    }
    if(keyController.get("KeyD")){
        rigidBodies[0].applyForceInOrientation({x: 0, y: -10000});
    }
    console.time();
    world.step(0.016);
    console.timeEnd();
    world.getRigidBodyList().forEach((body)=>{
        let polygon = body as Polygon;
        let vertices = polygon.getVerticesAbsCoord();
        vertices.forEach((vertex, index)=>{
            let endPoint = vertices[vertices.length - 1];
            if(index > 0) {
                endPoint = vertices[index - 1];
            }
            context.strokeStyle = "rgb(0, 0, 0)";
            context.beginPath();
            context.moveTo(vertex.x, -vertex.y);
            context.lineTo(endPoint.x, -endPoint.y);
            context.stroke();
        })
    })
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(min: number, max: number){
    return Math.random() * (max - min) + min;
}

function getRandomPoint(min: number, max: number): Point{
    return {x: getRandom(min, max), y: getRandom(min, max)};
}


// let worker = new Worker("./physicsWorker.js");
