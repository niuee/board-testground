import { World, Polygon } from "@niuee/bolt";
import { Point } from "point2point";

let world = new World(25000, 25000);
let time = Date.now();

for (let index = 0; index < 1000; index++){
    let vertices = [{x: 10, y: 10}, {x: -10, y: 10}, {x: -10, y: -10}, {x: 10, y: -10}];
    world.addRigidBody(index.toString(), new Polygon(getRandomPoint(-25000, 25000), vertices));
}

let timeInterval = setInterval(()=>{
    let now = Date.now();
    let deltaTime = now - time;
    time = now;
    deltaTime /= 1000;
    console.time();
    world.step(deltaTime);
    console.timeEnd();
}, 16.6);


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