
let button = document.querySelector("#reset-camera") as HTMLButtonElement;
let restrictXTranslationButton = document.querySelector("#restrict-x-translation") as HTMLButtonElement;
let positionText = document.querySelector("#clicked-position");
let zoomLevelText = document.querySelector("#zoom-level");
let cameraPositionText = document.querySelector("#camera-position");
let cameraRotationText = document.querySelector("#camera-rotation");
let toggleTest = document.querySelector("#toggle-test") as HTMLInputElement;


if (button) {
    // button.onclick = (e) => element.resetCamera();
}

if (restrictXTranslationButton) {
    restrictXTranslationButton.onclick = (e) => {
        // element.setAttribute("restrict-relative-x-translation", "true")
    };
}