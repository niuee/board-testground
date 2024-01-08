import { PointCal, Point } from "point2point";
import { InteractiveUIComponent, CameraLockableObject } from "@niuee/vcanvas";
import { AnimationGroupLegacy, Keyframe, AnimationSequenceLegacy, PointAnimationHelper} from "@niuee/vanimation";

export class AnimatableInteractiveUIPolygonComponent implements InteractiveUIComponent, CameraLockableObject{

    private position: Point;
    private rotation: number;
    private vertices: Point[];
    private raycastCallback: Function;
    private animator: AnimationGroupLegacy;

    constructor(center: Point, vertices: Point[] = [], rotation: number = 0, raycaseCallback: Function = ()=>{console.log("default raycast callback")}){
        this.position = center;
        this.rotation = rotation;
        this.vertices = vertices;
        this.raycastCallback = raycaseCallback;
        
        let keyframes: Keyframe<Point>[] = [{percentage: 0, value: {x: 100, y: 100}}, {percentage: 1, value: {x: 200, y: 200}}];
        let animationSequence: AnimationSequenceLegacy<Point> = {
            keyframes: keyframes,
            animatableAttributeHelper: new PointAnimationHelper(),
            applyAnimationValue: this.setPosition.bind(this)
        }
        this.animator = new AnimationGroupLegacy([animationSequence], 2, false);

    }

    convertVertices(): Point[]{
        let res = this.vertices.map((vertex)=>{
            return PointCal.addVector(this.position, PointCal.rotatePoint(vertex, this.rotation));
        });
        return res;
    }

    draw(context: CanvasRenderingContext2D, zoomLevel: number): void {
        // console.log("draw component");
        let points = this.convertVertices();
        context.beginPath();
        points.forEach((point, index)=>{
            let prevPoint: Point;
            if(index == 0){
                prevPoint = points[points.length - 1];
            } else{
                prevPoint = points[index - 1];
            }
            context.moveTo(point.x, -point.y);
            context.lineTo(prevPoint.x, -prevPoint.y);
        });
        context.stroke();
    }

    raycast(cursorPosition: Point): boolean {
        if(this.pointInPolygon(this.convertVertices(), cursorPosition)){
            this.raycastCallback(this.position);
            this.animator.startAnimation();
        }
        return this.pointInPolygon(this.convertVertices(), cursorPosition);
    }

    setRayCastCallback(raycastCallback: Function){
        this.raycastCallback = raycastCallback;
    }

    pointInPolygon(polygonVertices: Point[], interestedPoint: Point){
        let angleCheck = polygonVertices.map((point, index, array)=>{
            let endPoint: Point;
            if (index == polygonVertices.length - 1) {
                // last one need to wrap to the first point
                endPoint = array[0];
            }else {
                endPoint = array[index + 1];
            }
            let baseVector = PointCal.subVector(endPoint, point);
            let checkVector = PointCal.subVector(interestedPoint, point);
            return PointCal.angleFromA2B(baseVector, checkVector);
        });
        let outOfPolygon = angleCheck.filter((angle)=>{
            return angle < 0;
        }).length > 0;
    
        return !outOfPolygon;
    }

    update(deltaTime: number): void {
        this.animator.animate(deltaTime);
    }

    getRotation(): number {
        return this.rotation;
    }

    getPosition(): Point {
        return this.position;
    }

    getOptimalZoomLevel(): number {
        let max: Point = {x: -Number.MAX_VALUE, y: -Number.MAX_VALUE};
        let min: Point = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
        this.vertices.forEach((vertex)=>{
            max.x = Math.max(max.x, vertex.x);
            min.x = Math.min(min.x, vertex.x);
            max.y = Math.max(max.y, vertex.y);
            min.y = Math.min(min.y, vertex.y);
        });
        const yDimension = max.y - min.y;
        const xDimentsion = max.x - min.x;
        const decisiveDimension = Math.max(yDimension, xDimentsion);
        let desireLength = 100; // pixel
        return desireLength / decisiveDimension;
    }

    setPosition(position: Point){
        this.position = position;
    }
}