//console.log("you are not saneeeeee!", $);

const canvas = $("#canvas");
const ctx = canvas[0].getContext("2d");
//let drawing = false;
canvas.height = 80;
canvas.width = 400;
let userX;
let userY;
let offsetX = canvas.offset().left;
let offsetY = canvas.offset().top;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;

canvas.on("mousemove mousedown", (e) => {
    //console.log("mouse clicked on canvas!");
    userX = `${e.clientX}`;
    userY = `${e.clientY}`;

    if (e.which == 1) {
        drawing = true;
        mousePos = getMousePos(canvas, e);
        console.log("mousePos: ", mousePos);
        drawSig();
    }
});

canvas.on("mouseup", (e) => {});

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
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.closePath();
        lastPos = mousePos;
    }
}
