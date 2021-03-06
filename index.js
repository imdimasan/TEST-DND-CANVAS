const figureCanvas = document.getElementById("figures");
const mainCanvas = document.getElementById("canvas");
const circleCanvas = document.getElementById("circle");
const squareCanvas = document.getElementById("square");

const figureCtx = figureCanvas.getContext("2d");
const mainCtx = mainCanvas.getContext("2d");
const circleCtx = circleCanvas.getContext("2d");
const squareCtx = squareCanvas.getContext("2d");

const lsShapes = JSON.parse(localStorage.getItem("shapes"));
const shapes = lsShapes ? lsShapes : [];

let activeShape;

updateCanvasSizes();
window.onresize = updateCanvasSizes;

drawCircle(figureCtx, 50, 50);
drawCircle(circleCtx, 0, 0);
drawSquare(figureCtx, 50, 200);
drawSquare(squareCtx, 0, 0);

const draw = {
  circle: drawCircle,
  square: drawSquare,
  circleSelection: drawCircleSelection,
  squareSelection: drawSquareSelection,
};

render();
makeDraggable(circleCanvas);
makeDraggable(squareCanvas);

document.body.onkeydown = ({ key }) => {
  if (key === "Delete" && activeShape) {
    shapes.pop();
    activeShape = null;
    save();
    render();
  }
};

mainCanvas.onmousedown = ({ offsetX, offsetY }) => {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isInShape(offsetX, offsetY, shape)) {
      activeShape = shape;
      shapes.splice(i, 1);
      shapes.push(shape);
      save();
      render();
      const shapeTouchX = offsetX - shape.x;
      const shapeTouchY = offsetY - shape.y;

      window.onmousemove = (event) => {
        console.log("SHAPE", shape.x + "x" + shape.y);
        console.log("CURSOR", offsetX + "x" + offsetY);
        shape.x = event.pageX - 212 - shapeTouchX;
        shape.y = event.pageY - 52 - shapeTouchY;
        save();
        render();
      };
      window.onmouseup = () => {
        if (isOffLimit(shape.x, shape.y)) {
          shapes.pop();
          save();
          render();
        }
        window.onmousemove = null;
      };

      return;
    }
  }
  activeShape = null;
  save();
  render();
};

function makeDraggable(shapeCanvas) {
  shapeCanvas.onmousedown = ({ offsetX, offsetY }) => {
    window.onmousemove = (event) => {
      const x = event.pageX - 11 - offsetX;
      const y = event.pageY - 52 - offsetY;
      shapeCanvas.style.top = y + "px";
      shapeCanvas.style.left = x + "px";
    };
    window.onmouseup = () => {
      window.onmousemove = null;
      const { top, left } = shapeCanvas.style;
      if (!top) return;
      addShape(shapeCanvas.id, parseFloat(left) - 201, parseFloat(top));
      shapeCanvas.style = "";
    };
  };
}

function isInShape(pointX, pointY, shape) {
  const { type, x, y } = shape;
  if (type === "square") {
    return pointX >= x && pointX <= x + 100 && pointY >= y && pointY <= y + 100;
  }
  if (type === "circle") {
    return Math.hypot(x + 50 - pointX, y + 50 - pointY) <= 50;
  }
}

function isOffLimit(x, y) {
  return (
    x < 0 || x > mainCanvas.width - 100 || y < 0 || y > mainCanvas.height - 100
  );
}

function addShape(type, x, y) {
  if (isOffLimit(x, y)) return;
  const shape = { type, x, y };
  shapes.push(shape);
  activeShape = shape;
  save();
  render();
}

function updateCanvasSizes() {
  figureCanvas.height = innerHeight - 61;
  mainCanvas.height = innerHeight - 61;
  mainCanvas.width = innerWidth - 223;
}

function drawShape(shape) {
  const { type, x, y } = shape;
  draw[type](mainCtx, x, y);
  if (shape == activeShape) {
    draw[type + "Selection"](x, y);
  }
}

function drawSquare(ctx, x, y) {
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, 100, 100);
  ctx.fillStyle = "green";
  ctx.fillRect(x + 1, y + 1, 98, 98);
}

function drawCircle(ctx, x, y) {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(x + 50, y + 50, 49.5, 0, 7);
  ctx.fill();
  ctx.stroke();
}

function drawCircleSelection(x, y) {
  mainCtx.setLineDash([10, 10]);
  mainCtx.lineWidth = 2;
  mainCtx.strokeStyle = "red";
  mainCtx.beginPath();
  mainCtx.arc(x + 50, y + 50, 52, 0, 7);
  mainCtx.stroke();
  mainCtx.setLineDash([]);
  mainCtx.strokeStyle = "black";
  mainCtx.lineWidth = 1;
}

function drawSquareSelection(x, y) {
  mainCtx.setLineDash([10, 10]);
  mainCtx.lineWidth = 2;
  mainCtx.strokeStyle = "red";
  mainCtx.beginPath();
  mainCtx.moveTo(x - 2, y - 2);
  mainCtx.lineTo(x + 102, y - 2);
  mainCtx.lineTo(x + 102, y + 102);
  mainCtx.lineTo(x - 2, y + 102);
  mainCtx.lineTo(x - 2, y - 2);
  mainCtx.stroke();
  mainCtx.setLineDash([]);
  mainCtx.strokeStyle = "black";
  mainCtx.lineWidth = 1;
}

function render() {
  mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  shapes.forEach(drawShape);
}

function save() {
  localStorage.setItem("shapes", JSON.stringify(shapes));
}

// Load func - local read
// save func - write loca
//update func = save = render
