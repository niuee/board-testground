import { InteractiveUIComponent, vCanvas, UIComponent } from "@niuee/vcanvas";
import { Point, PointCal } from "point2point";
import { World, QuadTree, Polygon } from "@niuee/vphysics";

type Identifier = {
    index: number;
    type: "CP" | "LH" | "RH";
}

customElements.define('v-canvas', vCanvas);

let element = document.getElementById("test-graph") as vCanvas;

const canvasStepFn = element.getStepFunction();
const context = element.getContext();

function step(timestamp: number){
    canvasStepFn(timestamp);
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
