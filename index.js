const canvas = document.querySelector("#drawing-board");
const toolbar = document.querySelector("#toolbar");
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

// canvas.width = window.innerWidth - canvasOffsetX;
// canvas.height = window.innerHeight - canvasOffsetY;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;


let isPainting = false;
let lineWidth = 3;
let startX;
let startY;
let dataURL = "testImage.png";
let template;



async function whenDoneDrawing() {

    const { PopoverElement, Marker3DInteractiveElement } = await importAndReturnMarker();
    const popover = new PopoverElement({
        open: true,
    });
    popover.append(positions[0].name);




    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
    dataURL = resizeDataURL(canvas, 128, 128);
    console.log("dataURL: ", dataURL);
    console.log("OLD IMAGE: ", template.content.querySelector("#markerImg").src);
    template.content.querySelector("#markerImg").src = dataURL;
    console.log("UPDATED");
    let markers = map3DElement.querySelectorAll('gmp-marker-3d');
    markers.forEach(marker => map3DElement.removeChild(marker));
    markers = map3DElement.querySelectorAll('gmp-marker-3d-interactive');
    markers.forEach(marker => map3DElement.removeChild(marker));
    const newTemplate = document.createElement("template");
    newTemplate.innerHTML = `
        <img
            src="${dataURL}" id="markerImg"
            style="width: 100px; height: 100px; display: block;"
        >
    `;


    const newMarker = new Marker3DInteractiveElement({
        position: { lat: 42.0597, lng: 88.1096, altitude: 2350 },
        extruded: true,
        altitudeMode: "ABSOLUTE",
        gmpPopoverTargetElement: popover,
        // billboard: true,
    });

    newMarker.append(newTemplate);






    newMarker.addEventListener('gmp-click', (event) => {
        // map.flyCameraAround({
        //     camera: originalCamera,
        //     durationMillis: 50000,
        //     rounds: 1
        // });
        console.log("whatup");
        overlay = document.createElement("div");
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.zIndex = "9999";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

        closeButton = document.createElement("button");
        closeButton.innerHTML = "<img src='closeIcon.png' style='width: 32px; height: 32px;'>";
        closeButton.style.position = "absolute";
        closeButton.style.top = "20px";
        closeButton.style.right = "20px";
        closeButton.style.fontSize = "16px";
        closeButton.style.cursor = "pointer";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "5px";
        closeButton.style.backgroundColor = "transparent";
        closeButton.addEventListener("click", () => {
            overlay.remove();
        });


        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
    });




    map3DElement.append(newMarker);
    map3DElement.append(popover);
}



toolbar.addEventListener('click', async (e) => {
    if (e.target.id === 'clear') {
        const { PopoverElement, Marker3DInteractiveElement } = await importAndReturnMarker();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dataURL = resizeDataURL(canvas, 128, 128);
        template.content.querySelector("#markerImg").src = dataURL;
        let markers = map3DElement.querySelectorAll('gmp-marker-3d');
        markers.forEach(marker => map3DElement.removeChild(marker));
        markers = map3DElement.querySelectorAll('gmp-marker-3d-interactive');
        markers.forEach(marker => map3DElement.removeChild(marker));
        const newTemplate = document.createElement("template");
        newTemplate.innerHTML = `
        <img
            src="${dataURL}" id="markerImg"
            style="width: 100px; height: 100px; display: block;"
        >
    `;


        const newMarker = new Marker3DInteractiveElement({
            position: { lat: 42.0597, lng: 88.1096, altitude: 2350 },
            extruded: true,
            altitudeMode: "ABSOLUTE",
            // billboard: true,
        });

        newMarker.append(newTemplate);
        map3DElement.append(newMarker);
    }
});

toolbar.addEventListener('change', e => {
    if (e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }

    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
});

const draw = (e) => {
    if (!isPainting) {
        return;
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY);
    ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

async function importAndReturnMarker() {
    const { PopoverElement, Marker3DInteractiveElement } = await google.maps.importLibrary("maps3d");
    return { PopoverElement, Marker3DInteractiveElement };
}

function resizeDataURL(originalCanvas, targetWidth, targetHeight) {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);

    return resizedCanvas.toDataURL();
}



const positions = [{
    lat: 42.0597,
    lng: 88.1096,
    name: "Testing Name",
}];



canvas.addEventListener('mouseup', async (e) => {
    whenDoneDrawing();
});

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    isPainting = true;
    startX = touch.clientX;
    startY = touch.clientY;
    ctx.beginPath();
    ctx.moveTo(startX - canvasOffsetX, startY - canvasOffsetY);
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault()
    if (!isPainting) {
        return
    }
    const touch = e.touches[0];
    const x = touch.clientX - canvasOffsetX;
    const y = touch.clientY - canvasOffsetY;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
});

canvas.addEventListener('touchend', async (e) => {
    whenDoneDrawing();
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - canvasOffsetX;
    canvas.height = window.innerHeight - canvasOffsetY;
});


















let map;
let visible = false;
let marker;
let map3DElement;

async function initMap() {
    const maps3d = await google.maps.importLibrary("maps3d");
    const { Map3DElement, Marker3DInteractiveElement } = maps3d;
    const { PinElement } = await google.maps.importLibrary("marker");

    map3DElement = new Map3DElement({
        center: { lat: 42.0597, lng: 88.1096, altitude: 100 },
        range: 3650,
        tilt: 65,
        heading: 0,
        mode: "SATELLITE",
    });




    template = document.createElement("template");

    // WORKING TEMPLATE
    template.innerHTML = `
        <img
            src="testImage.png" id="markerImg"
            style="width: 100px; height: 100px; display: block;"
        >
    `;


    // const marker = new Marker3DElement({
    //     position: { lat: 42.0597, lng: 88.1096, altitude: 20 },
    //     label: "Custom Icon",
    //     altitudeMode: 'RELATIVE_TO_GROUND',
    //     extruded: true,
    // });








    const pinScaled = new PinElement({
        scale: 0.5,
        glyphColor: "blue",
    });
    marker = new Marker3DInteractiveElement({
        position: { lat: 42.0597, lng: 88.1096, altitude: 2350 },
        extruded: true,
        altitudeMode: "ABSOLUTE",
        // billboard: true,
    });
    // pinScaled.append(template);
    marker.append(template);
    // marker.append(pinScaled);








    map3DElement.append(marker);
    console.log("visible");
    visible = true;
    const container = document.getElementById("map");
    container.innerHTML = "";
    container.appendChild(map3DElement);
}