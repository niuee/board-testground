import { InteractiveUIComponent, vCanvas, UIComponent } from "@niuee/vcanvas";
import { Point, PointCal } from "point2point";
import { World, QuadTree, Polygon } from "@niuee/vphysics";

import data from "./taiwan.json";


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
    res.x *= 0.1;
    res.y *= 0.1;
    return res;
});

customElements.define('v-canvas', vCanvas);

let element = document.getElementById("test-graph") as vCanvas;

const canvasStepFn = element.getStepFunction();
const context = element.getContext();
const camera = element.getCamera();
function step(timestamp: number){
    canvasStepFn(timestamp); 
    context.beginPath();

    context.lineWidth = 1 / camera.getZoomLevel();
    context.strokeStyle = "rgb(0, 0, 0)";
    coords.forEach((coord, index)=>{
        if (index == 0){ 
            context.moveTo(coord.x, -coord.y);
        } else {
            context.lineTo(coord.x, -coord.y);
        }
    });
    context.closePath();
    context.stroke();
    context.fillStyle = "green";
    context.fill();
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);


function mProjection(longitude: number, latitude: number): Point{
    const r = 6371000;
    latitude = latitude * Math.PI / 180;
    longitude = longitude * Math.PI / 180;
    let x = r * longitude;
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