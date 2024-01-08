import { vCanvas, vCamera } from "@niuee/vcanvas";
import { vDial, Point } from "@niuee/vcanvas";
import { Line } from "@niuee/bcurve";
import { Bezier } from "bezier-js";

customElements.define('v-canvas', vCanvas);
customElements.define('v-dial', vDial);

let element = document.getElementById("test-graph") as vCanvas;
const canvasStepFn = element.getStepFunction();
const context = element.getContext();
const camera = element.getCamera();
const testCamera = new vCamera();
const bcurve = new Bezier(0, 0, 100, 100, 200, 100, 300, 0);
console.log(camera);

class TestClass {
    constructor(){}
}
const test = new TestClass();
const test2 = new Line({x: 0, y: 0}, {x: 100, y: 100});
const image = new Image();
image.src = "./obihiro.jpeg";

let clipWidth = 100;
let clipHeight = 100;

function step(timestamp: number) {
    canvasStepFn(timestamp);
    if (image.complete) {
        const imageWidth = image.width;
        const imageHeight = image.height;
        context.save();
        context.beginPath();
        context.rect(-clipWidth / 2, -clipHeight / 2, clipWidth, clipHeight);
        context.closePath();
        context.clip();
        context.drawImage(image, -imageWidth / 2, -imageHeight / 2);
        context.restore();
    }
    window.requestAnimationFrame(step);
}
element.addEventListener("wheel", (event: WheelEvent)=>{
    if(event.ctrlKey){
        let zoomAmount = event.deltaY * 0.1 * 5;
        zoomAmount *= 2;
        clipWidth -= zoomAmount;
        clipHeight -= zoomAmount;
    }
});

window.requestAnimationFrame(step);