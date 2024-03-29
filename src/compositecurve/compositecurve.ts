import Board from "@niuee/board/boardify";
import { CompositeBCurve, ControlPoint } from "@niuee/bend";
import { Point, PointCal } from "point2point";

type Identifier = {
    index: number;
    type: "CP" | "LH" | "RH";
}

class TestBCurve {

    private compositeCurve: CompositeBCurve;
    private raycastThreshold: number = 5;

    constructor(){
        this.compositeCurve = new CompositeBCurve();
    }

    appendControlPointAt(pos: Point){
        this.compositeCurve.appendControlPoint(pos);
    }

    draw(context: CanvasRenderingContext2D, zoomLevel: number): void {
        this.drawControlPoints(context, zoomLevel);
        this.drawControlPointHandles(context, zoomLevel);
        this.drawCurve(context, zoomLevel);
    }

    drawCurve(context: CanvasRenderingContext2D, zoomLevel: number): void{
        const cps = this.compositeCurve.getControlPoints();
        for(let index = 0; index < cps.length; index++){
            if(index < cps.length - 1){
                const startPoint = cps[index];
                const startPos = startPoint.getPosition();
                const endPoint = cps[index + 1];
                const endPos = endPoint.getPosition();
                const firstHandle = startPoint.getRightHandle();
                const secondHandle = endPoint.getLeftHandle();
                context.strokeStyle = "rgb(0, 0, 0)";
                context.beginPath();
                context.moveTo(startPos.x, -startPos.y);
                context.bezierCurveTo(firstHandle.position.x, -firstHandle.position.y, secondHandle.position.x, -secondHandle.position.y, endPos.x, -endPos.y);
                context.stroke();
            }
        }
    }

    drawControlPoints(context: CanvasRenderingContext2D, zoomLevel: number): void{
        this.compositeCurve.getControlPoints().forEach((controlPoint)=>{
            context.strokeStyle = `rgb(0, 0, 0)`;
            const cpPos = controlPoint.getPosition();
            context.beginPath();
            context.arc(cpPos.x, -cpPos.y, 8, 0, Math.PI * 2);
            context.stroke();
        });
    }

    drawControlPointHandles(context: CanvasRenderingContext2D, zoomLevel: number): void{
        this.compositeCurve.getControlPoints().forEach((controlPoint)=>{
            const cpPos = controlPoint.getPosition();
            const lhPos = controlPoint.getLeftHandle().position;
            const rhPos = controlPoint.getRightHandle().position;
            switch(controlPoint.getLeftHandle().type){
            case "ALIGNED":
                context.strokeStyle = "rgb(237, 185, 71)";
                break;
            case "FREE":
                context.strokeStyle = "rgb(189, 68, 86)";
                break;
            case "VECTOR":
                context.strokeStyle = "rgb(124, 153, 113)";
                break;
            default:
                context.strokeStyle = "rgb(0, 0, 0)";
                break;
            }
            context.beginPath();
            context.arc(lhPos.x, -lhPos.y, 5, 0, Math.PI * 2);
            context.stroke();
            context.beginPath();
            context.moveTo(cpPos.x, -cpPos.y);
            context.lineTo(lhPos.x, -lhPos.y);
            context.stroke();
            switch(controlPoint.getRightHandle().type){
            case "ALIGNED":
                context.strokeStyle = "rgb(237, 185, 71)";
                break;
            case "FREE":
                context.strokeStyle = "rgb(189, 68, 86)";
                break;
            case "VECTOR":
                context.strokeStyle = "rgb(124, 153, 113)";
                break;
            default:
                context.strokeStyle = "rgb(0, 0, 0)";
                break;
            }
            context.beginPath();
            context.arc(rhPos.x, -rhPos.y, 5, 0, Math.PI * 2);
            context.stroke();
            context.beginPath();
            context.moveTo(cpPos.x, -cpPos.y);
            context.lineTo(rhPos.x, -rhPos.y);
            context.stroke();
        });
    }

    update(deltaTime: number): void {
        
    }

    moveControlPoint(destPos: Point, index: number, type: "CP" | "LH" | "RH"){
        switch(type){
        case "CP":
            this.compositeCurve.setPositionOfControlPoint(index, destPos);
            break;
        case "LH":
            this.compositeCurve.setLeftHandlePositionOfControlPoint(index, destPos);
            break;
        case "RH":
            this.compositeCurve.setRightHandlePositionOfControlPoint(index, destPos);
            break;
        default:
            throw new Error("unknown control point type");
            break;
        }
    }

    clickPoint(cursorPoint: Point): Identifier | undefined{
        const cps = this.compositeCurve.getControlPoints();
        for(let index = 0; index < cps.length; index++){
            const controlPoint = cps[index];
            const cpDistance = PointCal.distanceBetweenPoints(controlPoint.getPosition(), cursorPoint);
            const lhDistance = PointCal.distanceBetweenPoints(controlPoint.getLeftHandle().position, cursorPoint);
            const rhDistance = PointCal.distanceBetweenPoints(controlPoint.getRightHandle().position, cursorPoint);
            if(cpDistance <= this.raycastThreshold){
                return {index: index, type: "CP"};
            }
            if(lhDistance <= this.raycastThreshold){
                return {index: index, type: "LH"};
            }
            if(rhDistance <= this.raycastThreshold){
                return {index: index, type: "RH"};
            }
        }
        return undefined;
    }
}


let canvas = document.getElementById("test-graph") as HTMLCanvasElement;
let element = new Board(canvas);
element.restrictZoom = true;
element.restrictRotation = true;
element.fullScreen = true;
let button = document.getElementById("start-appending") as HTMLButtonElement;
let dragButton = document.getElementById("start-dragging") as HTMLButtonElement;
let testCurve = new TestBCurve();
let appendNewControlPoint = false;
let dragControlPoint = false;
let dragPoint: Identifier | undefined = undefined;
if(button){
    button.onclick = ()=>{
        dragControlPoint = false;
        appendNewControlPoint = !appendNewControlPoint;
    }
}
if(dragButton){
    dragButton.onclick = ()=>{
        appendNewControlPoint = false;
        dragControlPoint = !dragControlPoint;
        if(dragControlPoint){
            element.getCamera().lockTranslationFromGesture();
        } else {
            element.getCamera().releaseLockOnTranslationFromGesture();
        }
    }
}
canvas.addEventListener('pointerdown', (e)=>{
    const worldPos = element.convertWindowPoint2WorldCoord({x: e.clientX, y: e.clientY});
    if(appendNewControlPoint){
        testCurve.appendControlPointAt(worldPos);
    }
    if(dragControlPoint){
        const res = testCurve.clickPoint(worldPos);
        dragPoint = res;
    }
});

canvas.addEventListener('pointerup', (e)=>{
    dragPoint = undefined;
});

canvas.addEventListener('pointermove', (e)=>{
    const worldPos = element.convertWindowPoint2WorldCoord({x: e.clientX, y: e.clientY});

    if(dragPoint){
        testCurve.moveControlPoint(worldPos, dragPoint.index, dragPoint.type);
    }
});

const canvasStepFn = element.getStepFunction();
const context = element.getContext();

function step(timestamp: number){
    canvasStepFn(timestamp);
    testCurve.draw(context, element.getCamera().getZoomLevel());
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);