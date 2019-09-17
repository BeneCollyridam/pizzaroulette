'use strict';
// Fortune wheel taken from:
// https://konvajs.org/docs/sandbox/Wheel_of_Fortune.html
let theWheel = undefined;
let container = undefined;
let item = undefined;
let possibilities = [];
let eventsToRemove = [];
var angularVelocities = [];
var lastRotation = 0;
var controlled = false;
var finished = false;
var angularFriction = 0.2;
var target, activeWedge, stage, layer, wheel, pointer;
var pizzaWheelIsShown = false;

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
var numWedges = items.length;


let getRandomSpeed = () => Math.random() * (items.length / 5) + 0.1;
var angularVelocity = getRandomSpeed();

let spin = () => {
  angularVelocity = getRandomSpeed();
  controlled = false;
  finished = false;
};


let createButton = () => {
  let li = document.createElement("li");
  li.classList.add("nav-list-item");
  let a = document.createElement("a");
  a.classList.add("nav-list-link");
  a.style.cursor = "pointer";
  a.id = "CREATE_PIZZA";
  a.innerText = "Pizzaroulette";
  li.appendChild(a);
  let ul = document.getElementsByClassName("nav-list")[0];
  ul.appendChild(li);
  a.addEventListener('click', createPizzawheel);
}

let alertPrize = a => alert(a);

let createPizzawheel = () => {
  if (pizzaWheelIsShown) return;
  controlled = false;
  finished = false;
  pizzaWheelIsShown = true;

  let div = document.createElement("div");
  div.setAttribute(
    "style",
    "position:fixed;z-index:99999;width:750px;min-height:400px;left:25vw;top:100px;background:white;"
  )

  let h1 = document.createElement("h1");
  h1.innerText = "You get: "
  let span = document.createElement("span");
  span.id = "rouletteres";
  h1.appendChild(span);
  div.appendChild(h1);
  div.appendChild(document.createElement("br"));

  let konvaContainer = document.createElement("div");
  konvaContainer.id = "konva-container";
  div.appendChild(konvaContainer);

  div.appendChild(document.createElement("br"));

  possibilities = document.createElement("button");
  possibilities.style.display = "none";
  possibilities.id = "possibilities";
  possibilities.innerText = "Pick a variant";
  div.appendChild(possibilities);

  let closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  div.appendChild(closeBtn);

  let spinBtn = document.createElement("button");
  spinBtn.innerText = "Spin";
  div.appendChild(spinBtn);

  container = document.body.appendChild(div);

  possibilities.addEventListener('click', createPizzawheelPossibilities);
  eventsToRemove.push({
    el: possibilities,
    type: 'click',
    fn: createPizzawheelPossibilities
  });

  closeBtn.addEventListener('click', close);
  eventsToRemove.push({el: closeBtn, type: 'click', fn: close});

  spinBtn.addEventListener("click", spin);
  eventsToRemove.push({el: spinBtn, type: 'click', fn: spin});

  init(items, 'konva-container');
}

let createPizzawheelPossibilities = () => {
  alert("Your variant is: " +
        item.possibilities[
          Math.floor(Math.random() * item.possibilities.length)
        ].name);
}

let close = () => {
  eventsToRemove.forEach(e => {
    e.el.removeEventListener(e.type, e.fn);
  })
  eventsToRemove = [];
  container.remove();
  pizzaWheelIsShown = false;
}

let start = () => {
  items = getAllItems();
  createButton();
}

start();

Konva.angleDeg = false;

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
        item = items[price];
        document.getElementById("rouletteres").innerText = item.name;
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
  angularVelocity = getRandomSpeed();
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
