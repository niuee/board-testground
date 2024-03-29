// geojson data compiled from https://www.naturalearthdata.com/
// geojson data from https://geojson-maps.ash.ms/ https://github.com/AshKyd/geojson-regions

import { utils, mercatorProjection, GeoCoord, orthoProjection } from "@niuee/border";
import Board from "@niuee/board/boardify";
import { Line } from "@niuee/bend";
import { Point } from "point2point";
import lowWorld from "../../geojsons/low_world.json";

declare var environment: string;


type GeoJSONFeature = {
    geometry: MultiPolygon | Polygon;
    properties: {name_zht: string};
    type: string;
}

type MultiPolygon = {
    type: "MultiPolygon";
    coordinates: number[][][][];
}

type Polygon = {
    type: "Polygon";
    coordinates: number[][][];
}

type GeoJSON = {
    features: GeoJSONFeature[];
    type: string;
}

const lowWorldJSON = lowWorld as GeoJSON;
const worldGeoCoords: GeoCoord[][][] = lowWorldJSON.features.map((country)=>{
    if(country.geometry.type !== "MultiPolygon"){
        return country.geometry.coordinates.map((polygon)=>{
            return polygon.map((coord)=>{
                return {latitude: coord[1], longitude: coord[0]};
            });
        });
    }
    return country.geometry.coordinates.map((polygon)=>{
        return polygon[0].map((coord)=>{
            return {latitude: coord[1], longitude: coord[0]};
        });
    });
});

const worldConvertedCoords: Point[][][] = worldGeoCoords.map((country)=>{
    return country.map((polygon)=>{
        return polygon.map((coord)=>{
            return mercatorProjection(coord, 0);
        });
    });
});



let centerLongitude = 120;


let element = document.getElementById("test-graph") as HTMLCanvasElement;
let board = new Board(element);
board.fullScreen = true;
board.debugMode = true;
board.camera.lockTranslationFromGesture();
const stepFunction = board.getStepFunction();
const ctx = board.getContext();

let projectionCenter = {latitude: 23, longitude: 121.5};

function step(timestamp: number){
    stepFunction(timestamp);
    ctx.lineWidth = 1 / board.getCamera().getZoomLevel();
    ctx.strokeStyle = "rgb(0, 0, 0)";
    const worldConvertedOrthoCoords: {clipped: boolean, coord: Point}[][][] = worldGeoCoords.map((country)=>{
        return country.map((polygon)=>{
            return polygon.map((coord)=>{
                const res = orthoProjection(coord, projectionCenter);
                return res;
            });
        });
    });
    
    const clipped = worldConvertedOrthoCoords.map((country)=>{
        return country.map((polygon)=>{
            const filtered = polygon.filter((coord)=>{
                return !coord.clipped;
            });
            return filtered;
        });
    });
    
    clipped.forEach((country)=>{
        country.forEach((polygon)=>{
            ctx.beginPath();
            polygon.forEach((coord, index)=>{
                if(index === 0){
                    ctx.moveTo(coord.coord.x, -coord.coord.y);
                }else{
                    ctx.lineTo(coord.coord.x, -coord.coord.y);
                }
            });
            ctx.stroke();
        });
    });

    requestAnimationFrame(step);
}

step(0);
board.getCamera().setMinZoomLevel(0.00005);

element.addEventListener("wheel", (event)=>{
    if(!event.ctrlKey){
        const deltaY = event.deltaY;
        const deltaX = event.deltaX;
        projectionCenter.longitude += deltaX / 100;
        projectionCenter.latitude -= deltaY / 100;
    }
})