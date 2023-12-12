import { vCanvas } from "@niuee/vcanvas";
import { vDial, Point } from "@niuee/vcanvas";

customElements.define('v-canvas', vCanvas);
customElements.define('v-dial', vDial);

let element = document.getElementById("test-graph") as vCanvas;