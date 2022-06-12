const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const createButton = document.querySelector(".create");
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;
var listOfWires = [];
var wireStartX;
var wireStartY;
var wireEndX;
var wireEndY;

class Pin {
    constructor(type, connectedTo, x, y) {
        this.type = type;
        this.connectedTo = connectedTo;
        this.x = x;
        this.y = y;
    }
}

class Gate {
    constructor(pins, name) {
        this.pins = pins;
        this.name = name;
        this.gateImage = [];
        this.startX = 0;
        this.startY = 0;
        pins.forEach(p => {
            this.gateImage.push({
                x: p.x,
                y: p.y,
                width: 10,
                height: 10,
                fill: 0,
                isDragging: false
            });
        });
        this.gateImage.push({
            x: pins[0].x + 5,
            y: pins[0].y - 20,
            width: 50,
            height: 60,
            isDragging: false
        })
    }
}

class Wire {
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }
}

canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmousemove = mouseMove;

var gates = [];
var gate = new Gate([new Pin(false, "AND", 5, 20), new Pin(false, "AND", 5, 40), new Pin(true, "AND", 65, 30)], "AND");
gates.push(gate);
function drawGate(gate) {
    ctx.beginPath();
    rect = gate.gateImage[gate.gateImage.length - 1]
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(gate.name, rect.x + (rect.width / 2), rect.y + (rect.height / 2));
    ctx.closePath();
    ctx.stroke();
    for (var i = 0; i < gate.gateImage.length - 1; i++) {
        ctx.beginPath();
        var pin = gate.gateImage[i];
        ctx.arc(pin.x, pin.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.closePath();
}

function drawWire(w) {
    ctx.beginPath();
    ctx.moveTo(w.startX, w.startY);
    ctx.lineTo(w.endX, w.endY);
    ctx.stroke();
    ctx.closePath();
}

function draw() {
    ctx.canvas.width = window.innerWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < gates.length; i++) {
        var gate = gates[i];
        drawGate(gate);
    }
    listOfWires.forEach(w => {
        drawWire(w)
    })
}

var selectedPin;
var prevPin;

function checkPinSameGate(gateImage) {
    var count = 0;
    for (var i = 0; i < gateImage.length-1; i++) {
        var element = gateImage[i];
        if ((prevPin.x == element.x && prevPin.y == element.y)||(selectedPin.x == element.x && selectedPin.y == element.y)) {
            count++;
        }
    }
    if (count == 2) {
        return true;
    }
    return false;
}

function mouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);
    for (var i = 0; gates.length; i++) {
        var gate = gates[i]
        var r = gate.gateImage[gate.gateImage.length - 1]
        if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
            r.isDragging = true;
        }

        gate.startX = mx;
        gate.startY = my;

        for (var j = 0; j < gate.gateImage.length-1; j++) {
            var p = gate.gateImage[j];
            if (mx > p.x-5 && mx < p.x+5 && my > p.y-5 && my < p.y+5) {
                p.isDragging = true;
                if (prevPin === undefined) {
                    if (selectedPin === undefined) {
                        selectedPin = {
                            x: p.x,
                            y: p.y
                        }
                    } else {
                        prevPin = selectedPin;
                        selectedPin = {
                            x: p.x,
                            y: p.y
                        }
                        if (!checkPinSameGate(gate.gateImage)) {
                            listOfWires.push(new Wire(prevPin.x, prevPin.y, selectedPin.x, selectedPin.y))
                            draw();
                        }
                        prevPin = undefined;
                        selectedPin = undefined;
                    }
                } else {
                    selectedPin = {
                        x: p.x,
                        y: p.y
                    }
                }
            }
            console.log(prevPin, selectedPin);
        }
    }
}

function mouseUp(e) {
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);
    gates.forEach(gate => {
        var r = gate.gateImage[gate.gateImage.length - 1]
        r.isDragging = false;
    })
}

function mouseMove(e) {
    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);

    gates.forEach(gate => {
        var r = gate.gateImage[gate.gateImage.length - 1]
        if (r.isDragging) {

            // tell the browser we're handling this mouse event
            e.preventDefault();
            e.stopPropagation();


            // calculate the distance the mouse has moved
            // since the last mousemove
            var dx = mx - gate.startX;
            var dy = my - gate.startY;

            // move each rect that isDragging 
            // by the distance the mouse has moved
            // since the last mousemove
            gate.gateImage.forEach(a => {
                a.x += dx;
                a.y += dy;
            })

            // redraw the scene with the new rect positions
            draw();

            // reset the starting mouse position for the next mousemove
            gate.startX = mx;
            gate.startY = my;

        }
    })
}

function create() {
    var inputText = document.getElementById("input").value
    console.log(inputText)
    gates.push(new Gate([new Pin(false, inputText, 5, 20), new Pin(false, inputText, 5, 40), new Pin(true, inputText, 65, 30)], inputText))
    console.log(gates)
    draw()
}

createButton.onclick = create

draw();