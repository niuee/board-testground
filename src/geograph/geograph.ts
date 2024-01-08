import { InteractiveUIComponent, vCanvas, UIComponent } from "@niuee/vcanvas";
import { Point, PointCal } from "point2point";
import { World, QuadTree, Polygon } from "@niuee/vphysics";
import { Path } from "./path";
import { Line, utils } from "@niuee/bcurve";
import { NumberAnimationHelper, Keyframe, AnimationSequenceLegacy, AnimationGroupLegacy, AnimatableAttributeHelper} from "@niuee/vanimation";
import data from "../../geojsons/taiwan_onepercent.json";
import detailedData from "../../geojsons/taiwan.json";
import traTrack from "../../geojsons/tra-network.json";
import mrtTrack from "../../geojsons/taipeiMRT-network.json";
import { parseParenthese, validParenthese, parseGeoCoordinate } from "./parenthesesParser";

const res = parseParenthese(mrtTrack[0].Geometry);
const polyLines = res.map((polyline)=>{
    const coords = parseGeoCoordinate(polyline);
    return coords;
});

type GeoJSONFeature = {
    geometry: { type: string; coordinates: number[][][];};
    properties: {COUNTYID: string; COUNTYCODE: string, COUNTYENG: string;}
    type: string;
}

type GeoJSON = {
    features: GeoJSONFeature[];
    type: string;
}

type GeoCoord = {
    lat: number;
    longi: number;
}

type PathAnimationAttribute = {
    currentCurvePercentage: number;
    curveLength: number;
}

class PathAttributeHelper implements AnimatableAttributeHelper<PathAnimationAttribute>{

    constructor(){}

    lerp(ratio: number, start: Keyframe<PathAnimationAttribute>, end: Keyframe<PathAnimationAttribute>): PathAnimationAttribute {
        let res: PathAnimationAttribute = {
            currentCurvePercentage: start.value.currentCurvePercentage + (ratio - start.percentage) / (end.percentage - start.percentage) * (end.value.currentCurvePercentage - start.value.currentCurvePercentage),
            curveLength: start.value.curveLength + (ratio - start.percentage) / (end.percentage - start.percentage) * (end.value.curveLength - start.value.curveLength)
        };
        return res;
    }
}

const startPoint = mProjection(120.2375, 23);
const startCoord: GeoCoord = {lat: 23, longi: 120.2375};
const endCoord: GeoCoord = {lat: 23.001111, longi: 120.206111};
const haversineDistance = distance(startCoord, endCoord);
const endPoint = mProjection(120.206111,23.001111);
const scaleFactor = 1 / Math.cos(23 * Math.PI / 180);
const distanceInMap = PointCal.distanceBetweenPoints(startPoint, endPoint);
const distanceInWorld = distanceInMap / scaleFactor;
console.log("Distance in map unit (pixel)", distanceInMap);
console.log("Distance in world unit (meter)", distanceInWorld);
console.log("Distance in world unit with haver sine(meter)", haversineDistance);
const offset = mProjection(120.231248, 22.991720);

const taiwan = data as GeoJSON;
const latlngs = (taiwan.features[9]).geometry.coordinates[0];
const coords = latlngs.map((coordinate)=>{
    const res = mProjection(coordinate[0], coordinate[1]);
    res.x -= offset.x;
    res.y -= offset.y;
    return res;
});

const shtrackpolylinesCoverted = polyLines.map((polyline)=>{
    console.log("polyline: ", polyline);
    const coords = polyline.map((coord)=>{
        const res = mProjection(coord.longi, coord.lat);
        res.x -= offset.x;
        res.y -= offset.y;
        return res;
    });
    console.log("coords", coords);
    return coords;
});
console.log("converted: ", shtrackpolylinesCoverted);

const pointPathKeyFrames: Keyframe<PathAnimationAttribute>[] = [
    {
        percentage: 0,
        value: {
            currentCurvePercentage: 0,
            curveLength: 100,
        }
    },
    {
        percentage: 1,
        value: {
            currentCurvePercentage: 1,
            curveLength: 100,
        }
    }
];
let point: Point = {x: 0, y: 0};
let points: Point[] = [];

const lines = coords.map((coord, index)=>{
    return new Line(coord, coords[(index + 1) % coords.length]);
});

const path = new Path(lines);

const pointAnimationSequence: AnimationSequenceLegacy<PathAnimationAttribute> = {
    keyframes: pointPathKeyFrames,
    applyAnimationValue: (value: PathAnimationAttribute)=>{
        point = path.getPointByPercentage(value.currentCurvePercentage);
        points.push(point);
        while(points.length > value.curveLength){
            points.shift();
        }
    },
    animatableAttributeHelper: new PathAttributeHelper,
    easeFn: (t: number)=>{
        return t;
    },
    setUp: ()=>{
        points = [];
    }
}

const animationGroup = new AnimationGroupLegacy([pointAnimationSequence], 3, true);
animationGroup.startAnimation();
customElements.define('v-canvas', vCanvas);

let element = document.getElementById("test-graph") as vCanvas;

const canvasStepFn = element.getStepFunction();
const context = element.getContext();
const camera = element.getCamera();
let lastUpdateTime = Date.now();
function step(timestamp: number){
    let cur = Date.now();
    canvasStepFn(timestamp); 
    animationGroup.animate((cur - lastUpdateTime) / 1000);
    lastUpdateTime = cur; 
    context.beginPath();

    context.lineWidth = 1 / camera.getZoomLevel();
    context.strokeStyle = "rgb(0, 0, 0)";
    context.beginPath();
    context.moveTo(coords[0].x, -coords[0].y);
    for(let index = 1; index < coords.length; index++){
        context.lineTo(coords[index].x, -coords[index].y);
    }
    context.closePath();
    context.stroke();
    context.lineWidth = 3 / camera.getZoomLevel();
    context.strokeStyle = "rgb(0, 0, 0)";
    context.beginPath();
    if(points.length > 0){
        context.moveTo(points[0].x, -points[0].y);
        for(let index = 1; index < points.length; index++){
            context.lineTo(points[index].x, -points[index].y);
        }
    }
    context.stroke();
    
    shtrackpolylinesCoverted.forEach((polyline)=>{
        context.beginPath();
        if(polyline.length > 0){
            context.moveTo(polyline[0].x, -polyline[0].y);
            for(let index = 1; index < polyline.length; index++){
                context.lineTo(polyline[index].x, -polyline[index].y);
            }
        }
        context.stroke();
    });
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);


function mProjection(longitude: number, latitude: number, centerLongitude: number = 0): Point{
    const r = 6371000;
    latitude = latitude * Math.PI / 180;
    longitude = longitude * Math.PI / 180;
    let x = r * (longitude - centerLongitude);
    let y = r * Math.log(Math.tan(Math.PI / 4 + latitude / 2));
    return {x: x, y: y};
}

function distance(startCoord: GeoCoord, endCoord: GeoCoord): number{
    const R = 6371e3; // metres
    const φ1 = startCoord.lat * Math.PI/180; // φ, λ in radians
    const φ2 = endCoord.lat * Math.PI/180;
    const Δφ = (endCoord.lat - startCoord.lat) * Math.PI/180;
    const Δλ = (endCoord.longi - startCoord.longi) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
}

document.addEventListener("visibilitychange", tabSwitchingHandler);

function tabSwitchingHandler(){
    if (document.hidden){
        console.log("Browser tab is hidden");
        animationGroup.pauseAnimation();
    } else {
        console.log("Browser tab is visible");
        lastUpdateTime = Date.now();
        animationGroup.resumeAnimation();
    }
}