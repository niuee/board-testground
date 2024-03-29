import { CameraPanEventPayload, CameraState, CameraUpdateNotification, CameraZoomEventPayload } from "@niuee/board";
import Board from "@niuee/board/boardify";
import vCamera, { CameraLockableObject } from "@niuee/board/board-camera";
import { Point, PointCal } from "point2point";
import { World, QuadTree, Polygon, Circle, VisaulCircleBody, VisualPolygonBody } from "@niuee/bolt";

let canvas = document.querySelector("canvas");
let board = new Board(canvas);
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


board.on("pan", (event: CameraPanEventPayload, cameraState)=>{
    console.log(cameraState.position);
});
board.debugMode = true;
board.alignCoordinateSystem = true;
board.displayRuler = true;
board.displayGrid = true;
board.camera.spinDeg(45);
// board.displayGrid = true;
// board.displayRuler = true;
// board.restrictRelativeXTranslation = true;
board.fullScreen = true;
board.height = 500;
board.setMaxTransHeightAlignedMin(15000);
board.limitEntireViewPort = true;
const canvasStepFn = board.getStepFunction();
const context = board.getContext();
let world = new World(300, 300);
world._context = context;
for (let index = 0; index < 10; index++){
    if(index == 0){
        let vertices = [{x: 20, y: 10}, {x: -20, y: 10}, {x: -20, y: -10}, {x: 20, y: -10}];
        // let body = new VisaulCircleBody(getRandomPoint(0, 100), 5, context, 0, 200);
        let initialCenter = getRandomPoint(0, 300);
        initialCenter.z = 100;
        let body = new VisualPolygonBody(initialCenter, vertices, context, 0, 300);
        world.addRigidBody(index.toString(), body);
        
    } else {
        // let body = new VisaulCircleBody(getRandomPoint(0, 100), 5, context, 0, 50);
        let body = new VisualPolygonBody(getRandomPoint(0, 300), [{x: 20, y: 10}, {x: -20, y: 10}, {x: -20, y: -10}, {x: 20, y: -10}], context, 0, 50, false);
        world.addRigidBody(index.toString(), body);
    }
}
const initCameraPos = world.getRigidBodyList()[0].center;
// element.getCamera().setPositionWithClamp(initCameraPos);
function step(timestamp: number){
    canvasStepFn(timestamp);
    // console.log(world.getRigidBodyList()[0].center);

    let rigidBodies = world.getRigidBodyList();
    if(keyController.get("KeyW")){
        rigidBodies[0].applyForceInOrientation({x: 3000, y: 0});
    } 
    if(keyController.get("KeyA")){
        rigidBodies[0].applyForceInOrientation({x: 0, y: 3000});
    }
    if(keyController.get("KeyS")){
        rigidBodies[0].applyForceInOrientation({x: -3000, y: 0});
    }
    if(keyController.get("KeyD")){
        rigidBodies[0].applyForceInOrientation({x: 0, y: -3000});
    }
    if(keyController.get("KeyQ")){
        rigidBodies[0].angularVelocity = 0.5;
    }
    if(keyController.get("KeyE")){
        rigidBodies[0].angularVelocity = -0.5;
    }
    world.step(0.016);
    window.requestAnimationFrame(step);
}

step(0);

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

