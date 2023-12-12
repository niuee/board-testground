import { vCanvas } from "@niuee/vcanvas";
import { vDial, Point } from "@niuee/vcanvas";

customElements.define('v-canvas', vCanvas);
customElements.define('v-dial', vDial);

let element = document.getElementById("test-graph") as vCanvas;
let button = document.querySelector("#start-recording") as HTMLButtonElement;
let clearCanvasbutton = document.querySelector("#clear-canvas-button") as HTMLButtonElement;
let recording = false;
let startTime = 0;
let curTime = 0;
let pathPoints: PathPoint[] = [];
let recordedPath: PathPoint[] = [];
if (button) {
    button.onclick = ()=>{
        if(recording){
            console.log("recorder path", recordedPath);
        }
        startTime = curTime;
        recordedPath = [];
        recording = !recording;
    }
}
if(clearCanvasbutton){
    clearCanvasbutton.onclick = ()=>{
        pathPoints = [];
    }
}

let isDrawing = false;
let hue = 0;
let lastPoint: Point = undefined;
type PathPoint = {
    startPoint: Point;
    endPoint: Point;
    strokeStyle: string;
    timePercentage: number;
}

element.addEventListener('touchstart', (e)=>{
    isDrawing = true;
    lastPoint = element.convertWindowPoint2WorldCoord({x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY});
});

element.addEventListener('touchend', (e)=>{
    isDrawing = false;
});

element.addEventListener('touchcancel', (e)=>{
    isDrawing = false;
});

element.addEventListener('touchmove', (e)=>{
    if(e.targetTouches.length == 1 && isDrawing){
        let curPoint = element.convertWindowPoint2WorldCoord({x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY});
        pathPoints.push({
            startPoint: {...lastPoint},
            endPoint: {...curPoint},
            strokeStyle: `hsl(${hue}, 60%, 60%)`,
            timePercentage: 0
        })
        // Array destructuring
        if (recording){
            recordedPath.push({
                startPoint: {...lastPoint},
                endPoint: {...curPoint},
                strokeStyle: `hsl(${hue}, 60%, 60%)`,
                timePercentage: curTime - startTime,
            })
        }
        lastPoint = curPoint;
        hue = (hue + 1) % 360;
    }
});

const canvasStepFunction = element.getStepFunction();
const ctx = element.getContext();
function step(timestamp: number){
    canvasStepFunction(timestamp);
    curTime = timestamp;
    pathPoints.forEach((point)=>{
        ctx.strokeStyle = point.strokeStyle;
        ctx.beginPath();
        // start from
        ctx.moveTo(point.startPoint.x, -point.startPoint.y);
        // go to
        ctx.lineTo(point.endPoint.x, -point.endPoint.y);
        ctx.stroke();
    });
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);