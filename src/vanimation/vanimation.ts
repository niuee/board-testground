import Board from "@niuee/board/boardify";
import { Point, PointCal } from "point2point";
import {EasingFunctions, Keyframe, NumberAnimationHelper, AnimatableAttributeHelper}from "@niuee/bounce";
import { Animator, Animation, CompositeAnimation } from "@niuee/bounce";
import { bCurve } from "@niuee/bend";

type CurveAnimationAttribute = {
    currentCurvePercentage: number;
    curveLength: number;
}

class CurveAttributeHelper implements AnimatableAttributeHelper<CurveAnimationAttribute>{

    constructor(){}

    lerp(ratio: number, start: Keyframe<CurveAnimationAttribute>, end: Keyframe<CurveAnimationAttribute>): CurveAnimationAttribute {
        let res: CurveAnimationAttribute = {
            currentCurvePercentage: start.value.currentCurvePercentage + (ratio - start.percentage) / (end.percentage - start.percentage) * (end.value.currentCurvePercentage - start.value.currentCurvePercentage),
            curveLength: start.value.curveLength + (ratio - start.percentage) / (end.percentage - start.percentage) * (end.value.curveLength - start.value.curveLength)
        };
        return res;
    }
}



let element = document.getElementById("test-graph") as HTMLCanvasElement;
let board = new Board(element);
board.fullScreen = true;

const canvasStepFn = board.getStepFunction();

const width = window.innerWidth;
const height = window.innerHeight;
const widthHeightRatio = width / height;
const boxWidth = 2000;
const boxHeight = boxWidth / widthHeightRatio;
const boxCenter: Point = {x: -3000, y: 5000};
const context = board.getContext();
const camera = board.getCamera();

const clipPathKeyframes: Keyframe<number>[] = [
    {
        percentage: 0,
        value: 100
    },
    {
        percentage: 0.5,
        value: 300
    },
    {
        percentage: 1,
        value: 100
    }
];

const bezierCurvePathFrames: Keyframe<CurveAnimationAttribute>[] = [
    {
        percentage: 0,
        value: {
            currentCurvePercentage: 0,
            curveLength: 0,
        },
    },
    {
        percentage: 1,
        value: {
            currentCurvePercentage: 1,
            curveLength: 50,
        }
    }
];
let radius = 100;

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
function getRandomQuadraticControlPoints(min: number, max: number): Point[]{
    return getRandomControlPoints(min, max, 3);
}

function getRandomCubicControlPoints(min: number, max: number): Point[]{
    return getRandomControlPoints(min, max, 4);
}

function getRandomControlPoints(min: number, max: number, num?: number): Point[]{
    if (num == undefined){
        num = 1;
    }
    const res: Point[] = [];
    for(let index = 0; index < num; index++){
        res.push({x: getRandom(min, max), y: getRandom(min, max)});
    }
    return res;
}

let controlPoints = getRandomCubicControlPoints(-500, 500);
let testBCurve = new bCurve(controlPoints);


const numberAnimationHelper = new NumberAnimationHelper();
let curvePoints: Point[] = [];


const pathAnimation = new Animation(bezierCurvePathFrames, 
    (value: CurveAnimationAttribute)=>{
        curvePoints.push(testBCurve.getPointbyPercentage(value.currentCurvePercentage));
        while(curvePoints.length > value.curveLength){
            curvePoints.shift();
        }
    }, new CurveAttributeHelper(), 1, true, undefined,  ()=>{curvePoints = [];});

const clipPathAnimation2 = new Animation(clipPathKeyframes, (value: number)=>{ radius = value; }, numberAnimationHelper);
let animationMap = new Map<string, {animator: Animator, startTime: number}>();
animationMap.set("first", {animator: pathAnimation, startTime: 0});
animationMap.set("second", {animator: clipPathAnimation2, startTime: 0});
const composite = new CompositeAnimation(animationMap, true);
composite.drag(1);
composite.toggleReverse(true);
console.log("duration", composite.duration);
camera.setZoomLevel(0.03);
let imgObject = new Image();
imgObject.src = "./fuku.jpeg";
let tabHiddenTime = 0;
let elapsedTime = 0;
let lastupdate = 0;
function step(timestamp: number){
    let deltaTime = timestamp - lastupdate;
    lastupdate = timestamp;
    composite.animate(deltaTime / 1000);
    canvasStepFn(timestamp);
    if(imgObject.complete){
        context.save();
        context.beginPath();
        context.arc(boxCenter.x, -boxCenter.y, radius, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(imgObject, boxCenter.x - boxWidth / 2, -(boxCenter.y + boxHeight / 2), boxWidth, boxHeight);
        context.restore();
    }
    
    context.beginPath();
    if(curvePoints.length > 0){
        context.moveTo(curvePoints[0].x, -curvePoints[0].y);
        for(let index = 1; index < curvePoints.length; index++){
            context.lineTo(curvePoints[index].x, -curvePoints[index].y);
        }
    }
    context.stroke();
    
    context.lineWidth = 1 / camera.getZoomLevel();
    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(boxCenter.x - boxWidth / 2, -(boxCenter.y - boxHeight / 2));
    context.lineTo(boxCenter.x + boxWidth / 2, -(boxCenter.y - boxHeight / 2));
    context.lineTo(boxCenter.x + boxWidth / 2, -(boxCenter.y + boxHeight / 2));
    context.lineTo(boxCenter.x - boxWidth / 2, -(boxCenter.y + boxHeight / 2));
    context.lineTo(boxCenter.x - boxWidth / 2, -(boxCenter.y - boxHeight / 2));
    context.stroke();
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

element.addEventListener("pointerdown", (e: PointerEvent) => {
    if(e.pointerType == "mouse" && e.button != 2){
        const targetZoomLevel = (width - 0) / boxWidth;
        composite.startAnimation();
    }
});

element.addEventListener("contextmenu", (e: Event) => {
    e.preventDefault();
});

document.addEventListener("visibilitychange", tabSwitchingHandler);

function tabSwitchingHandler(){
    if (document.hidden){
        console.log("Browser tab is hidden");
        tabHiddenTime = Date.now();
    } else {
        console.log("Browser tab is visible");
        elapsedTime = Date.now() - tabHiddenTime;
        lastupdate += elapsedTime;
    }
}