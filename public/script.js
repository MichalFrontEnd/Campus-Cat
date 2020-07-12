//console.log("you are not saneeeeee!", $);

const canvas = $("#canvas");
const ctx = canvas[0].getContext("2d");

const submit = $("#submit");
const clear = $("#clear");

let dataUrl;

//let drawing = false;
canvas.height = 80;
canvas.width = 400;
let userX;
let userY;
let offsetX = canvas.offset().left;
let offsetY = canvas.offset().top;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;

canvas.on("mousedown", (e) => {
    //console.log("mouse clicked on canvas!");
    drawing = true;
    lastPos = getMousePos(canvas, e);
});

canvas.on("mousemove", (e) => {
    //console.log("mouse clicked on canvas!");
    userX = `${e.clientX}`;
    userY = `${e.clientY}`;

    if (e.which == 1) {
        drawing = true;
        mousePos = getMousePos(canvas, e);
        //console.log("mousePos: ", mousePos);
        drawSig();
    }
});

canvas.on("mouseup", (e) => {
    drawing = false;

    //console.log("dataUrl: ", dataUrl);
});

clear.on("click", (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

submit.on("click", (e) => {
    //do something to dataUrl
    dataUrl = canvas[0].toDataURL("image/jpeg", 0.1);
    let sigField = $("#signature");
    sigField.val(dataUrl);
});

function getMousePos(canvas, mouseEvent) {
    return {
        x: userX - offsetX,
        y: userY - offsetY,
    };
}

function drawSig() {
    if (drawing) {
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.closePath();
        lastPos = mousePos;
    }
}
