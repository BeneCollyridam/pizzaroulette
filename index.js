'use strict';
// Fortune wheel taken from:
// https://konvajs.org/docs/sandbox/Wheel_of_Fortune.html
let theWheel = undefined;
let container = undefined;
let item = undefined;
let possibilities = undefined;

let toArray = e => Array.prototype.slice.call(e)

let getAllItems = () =>
  toArray(document.getElementsByClassName("menu-product product"))
    .map((e, i) => ({
      "name": e.getElementsByClassName("product-title")[0].innerText,
      "possibilities":
      toArray(e.getElementsByClassName("product-synonym-name"))
      .map((q, i) => ({name: q.innerText, i})),
      "el": e,
      i
    }))
let items = getAllItems();

let createButton = () => {
  let li = document.createElement("li");
  li.innerHTML = `<a class="nav-list-link" style="cursor:pointer;" onclick="(()=>{let e = document.createEvent('Events');e.initEvent('CREATE_PIZZA');document.dispatchEvent(e)})()">Pizzaroulette</a>`;
  li.setAttribute("class", "nav-list-item");
  let ul = document.getElementsByClassName("nav-list")[0];
  ul.appendChild(li);
}

let alertPrize = a => alert(a);

let createPizzawheel = () => {
  let div = document.createElement("div");
  div.setAttribute(
    "style",
    "position:fixed;z-index:99999;width:750px;min-height:400px;left:25vw;top:100px;background:white;"
  )
  div.innerHTML = `<h1>Du får: <span id='rouletteres'></span><br><div id='konva-container'></div><br>` +
    `<button style="display: none;"id='possibilities' onclick="(()=>{let e = document.createEvent('Events');e.initEvent('CREATE_PIZZA_POS');document.dispatchEvent(e)})()">Vælg en variant</button>` +
    `<button onclick="(()=>{let e = document.createEvent('Events');e.initEvent('CLOSE');document.dispatchEvent(e)})()">Luk</button>`
  container = document.body.appendChild(div);
  possibilities = document.getElementById("possibilities");
  init(items, 'konva-container');
}

let createPizzawheelPossibilities = () => {
  alert("Din variation er: " + item.possibilities[Math.floor(Math.random() * item.possibilities.length)].name);
}

let close = () => {
  container.remove();
}

let start = () => {
  items = getAllItems();
  createButton();
}

start();
document.addEventListener("CREATE_PIZZA_POS", createPizzawheelPossibilities, false, true);
document.addEventListener("CREATE_PIZZA", createPizzawheel, false, true);
document.addEventListener("CLOSE", close, false, true);

var width = window.innerWidth;
var height = window.innerHeight;

Konva.angleDeg = false;
var angularVelocity = 0;
var angularVelocities = [];
var lastRotation = 0;
var controlled = false;
var numWedges = items.length;
var angularFriction = 0.2;
var target, activeWedge, stage, layer, wheel, pointer;
var finished = false;

function getAverageAngularVelocity() {
  var total = 0;
  var len = angularVelocities.length;

  if (len === 0) {
    return 0;
  }

  for (var n = 0; n < len; n++) {
    total += angularVelocities[n];
  }

  return total / len;
}
function purifyColor(color) {
  var randIndex = Math.round(Math.random() * 3);
  color[randIndex] = 0;
  return color;
}
function getRandomColor() {
  var r = 100 + Math.round(Math.random() * 55);
  var g = 100 + Math.round(Math.random() * 55);
  var b = 100 + Math.round(Math.random() * 55);
  return purifyColor([r, g, b]);
}

function addWedge(n, i) {
  var s = getRandomColor();
  var reward = i.i.toString();
  var r = s[0];
  var g = s[1];
  var b = s[2];
  var angle = (2 * Math.PI) / numWedges;

  var endColor = 'rgb(' + r + ',' + g + ',' + b + ')';
  r += 100;
  g += 100;
  b += 100;

  var startColor = 'rgb(' + r + ',' + g + ',' + b + ')';

  var wedge = new Konva.Group({
    rotation: (2 * n * Math.PI) / numWedges
  });

  var wedgeBackground = new Konva.Wedge({
    radius: 400,
    angle: angle,
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 400,
    fillRadialGradientColorStops: [0, startColor, 1, endColor],
    fill: '#64e9f8',
    fillPriority: 'radial-gradient',
    stroke: '#ccc',
    strokeWidth: 2
  });

  wedge.add(wedgeBackground);

  var text = new Konva.Text({
    text: reward.split("").join("\n"),
    fontFamily: 'Calibri',
    fontSize: 8,
    fill: 'white',
    align: 'center',
    stroke: 'yellow',
    strokeWidth: 1,
    rotation: (Math.PI + angle) / 2,
    x: 380,
    y: 30,
    listening: false
  });

  wedge.add(text);
  text.cache();

  wedge.startRotation = wedge.rotation();

  wheel.add(wedge);
}
function animate(frame) {
  // handle wheel spin
  var angularVelocityChange =
    (angularVelocity * frame.timeDiff * (1 - angularFriction)) / 1000;
  angularVelocity -= angularVelocityChange;

  // activate / deactivate wedges based on point intersection
  var shape = stage.getIntersection({
    x: stage.width() / 2,
    y: 100
  });

  if (controlled) {
    if (angularVelocities.length > 10) {
      angularVelocities.shift();
    }

    angularVelocities.push(
      ((wheel.rotation() - lastRotation) * 1000) / frame.timeDiff
    );
  } else {
    var diff = (frame.timeDiff * angularVelocity) / 1000;
    if (diff > 0.0001) {
      wheel.rotate(diff);
    } else if (!finished && !controlled) {
      if (shape) {
        var text = shape
          .getParent()
          .findOne('Text')
          .text();
        var price = parseInt(text.split('\n').join(''));
        // alert('You price is' + price[2]);
        item = items[price];
        document.getElementById("rouletteres").innerHTML = item.name;
        item.el.scrollIntoView();
        window.scrollBy(0, -150);
        possibilities.style.display = item.possibilities.length > 1 ? "initial" : "none";
      }
      finished = true;
    }
  }
  lastRotation = wheel.rotation();

  if (shape) {
    if (shape && (!activeWedge || shape._id !== activeWedge._id)) {
      pointer.y(20);

      new Konva.Tween({
        node: pointer,
        duration: 0.3,
        y: 30,
        easing: Konva.Easings.ElasticEaseOut
      }).play();

      if (activeWedge) {
        activeWedge.fillPriority('radial-gradient');
      }
      shape.fillPriority('fill');
      activeWedge = shape;
    }
  }
}
function init(items, container) {
  stage = new Konva.Stage({
    container: container,
    width: 700,
    height: 300
  });
  layer = new Konva.Layer();
  wheel = new Konva.Group({
    x: stage.width() / 2,
    y: 410
  });

  for (let n = 0; n < items.length; n++) {
    addWedge(n, items[n]);
  }
  pointer = new Konva.Wedge({
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 30,
    fillRadialGradientColorStops: [0, 'white', 1, 'red'],
    stroke: 'white',
    strokeWidth: 2,
    lineJoin: 'round',
    angle: 1,
    radius: 30,
    x: stage.width() / 2,
    y: 33,
    rotation: -90,
    shadowColor: 'black',
    shadowOffset: 3,
    shadowBlur: 2,
    shadowOpacity: 0.5
  });

  // add components to the stage
  layer.add(wheel);
  layer.add(pointer);
  stage.add(layer);

  // bind events
  wheel.on('mousedown touchstart', function(evt) {
    angularVelocity = 0;
    controlled = true;
    target = evt.target;
    finished = false;
  });
  // add listeners to container
  stage.addEventListener(
    'mouseup touchend',
    function() {
      controlled = false;
      angularVelocity = getAverageAngularVelocity() * 5;

      if (angularVelocity > 20) {
        angularVelocity = 20;
      } else if (angularVelocity < -20) {
        angularVelocity = -20;
      }

      angularVelocities = [];
    },
    false
  );

  stage.addEventListener(
    'mousemove touchmove',
    function(evt) {
      var mousePos = stage.getPointerPosition();
      if (controlled && mousePos && target) {
        var x = mousePos.x - wheel.getX();
        var y = mousePos.y - wheel.getY();
        var atan = Math.atan(y / x);
        var rotation = x >= 0 ? atan : atan + Math.PI;
        var targetGroup = target.getParent();

        wheel.rotation(
          rotation - targetGroup.startRotation - target.angle() / 2
        );
      }
    },
    false
  );

  var anim = new Konva.Animation(animate, layer);

  // wait one second and then spin the wheel
  setTimeout(function() {
    anim.start();
  }, 1000);
}
