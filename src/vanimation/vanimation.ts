import { InteractiveUIComponent, vCanvas, UIComponent } from "@niuee/vcanvas";
import { Point, PointCal } from "point2point";

customElements.define('v-canvas', vCanvas);

let element = document.getElementById("test-graph") as vCanvas;

const canvasStepFn = element.getStepFunction();
const context = element.getContext();
const camera = element.getCamera();
function step(timestamp: number){
    canvasStepFn(timestamp); 
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);