var socket = io();

let clientID;
let connectedIDs;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas_2d = document.getElementById("canvas_2D_map");
ctx_2d = canvas_2d.getContext("2d");

ctx_2d.translate(canvas_2d.width / 2, canvas_2d.height / 2);

ctx.transform(1, 0, 0, -1, 0, canvas.height);

ctx.imageSmoothingEnabled = false;

let loadingIn = true;

socket.on("connect", () => {
  clientID = socket.id;
});

socket.on("connect_client", (ID) => {
  if (loadingIn) {
    connectedIDs.forEach((ID) => {
      if (ID !== clientID) {
        new Player(ID);
      }
    });
    loadingIn = false;
  }
  if (ID !== clientID) {
    new Player(ID);
  }
});

socket.on("disconnect_client", (ID) => {
  for (let i = 0; i < players.length; i++) {
    if ((players[i].id = ID)) {
      console.log(objects);
      objects.splice(objects.indexOf(players[i].shape), 1);
      console.log(objects);

      players.splice(i, 1);
    }
  }
});

socket.on("updateConnections", (connectionArray) => {
  connectedIDs = connectionArray;
  console.log(connectedIDs);
});

let objects = [];
let players = [];
let number = 0;

keys = [];

screenWidth = canvas.width;
screenHeight = canvas.height;

class object {
  faces = [];
  faceColors = [];

  height;
  position;
  distance = 0;

  constructor(_faces, _position, _height) {
    this.faces = _faces;
    this.position = _position;
    this.height = _height;

    for (let i = 0; i < _faces.length + 1; i++) {
      this.faceColors.push(getRandomColor());
    }

    objects.push(this);
  }
}

class Player {
  id;
  position = { x: 0, y: 0, z: 100 };
  rotation = 0;
  tilt = 0;
  shape;

  constructor(_id) {
    this.id = _id;
    if (this.id !== clientID) {
      this.shape = new object(
        [
          [
            { x: -10, y: 10, z: 0 },
            { x: -10, y: -10, z: 0 },
          ],
          [
            { x: -10, y: -10, z: 0 },
            { x: 10, y: -10, z: 0 },
          ],
          [
            { x: 10, y: -10, z: 0 },
            { x: 10, y: 10, z: 0 },
          ],
          [
            { x: 10, y: 10, z: 0 },
            { x: -10, y: 10, z: 0 },
          ],
        ],
        this.position,
        20
      );
      players.push(this);
    }
  }
}

let player = new Player(clientID);

deltaMouse = { x: 0, y: 0 };

document.addEventListener("mousemove", function (e) {
  deltaMouse.x = e.movementX;
  deltaMouse.y = e.movementY;
});

document.body.addEventListener("keydown", function (e) {
  keys[e.key] = true;
});
document.body.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});

function clear() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fill();
}

canvas.addEventListener("click", async () => {
  await canvas.requestPointerLock();
});

function updatePlayerMovement() {
  let speed = 5;

  dx = Math.sin(degToRad(player.rotation)) * speed;
  dy = Math.cos(degToRad(player.rotation)) * speed;

  if (keys["w"]) {
    player.position.x += dx;
    player.position.y += dy;
  }

  if (keys["a"]) {
    player.position.x -= dy;
    player.position.y += dx;
  }

  if (keys["s"]) {
    player.position.x -= dx;
    player.position.y -= dy;
  }

  if (keys["d"]) {
    player.position.x += dy;
    player.position.y -= dx;
  }

  if (keys[" "]) {
    // player.position.z -= 10;
  }

  if (keys["Control"]) {
    // player.position.z += 10;
  }

  player.rotation += deltaMouse.x / 5;
  player.tilt -= deltaMouse.y / 5;

  if (keys["ArrowLeft"]) {
    player.rotation -= 1;
  }
  if (keys["ArrowRight"]) {
    player.rotation += 1;
  }

  if (keys["ArrowUp"]) {
    if (player.tilt > -20) {
      player.tilt -= 0.4;
    }
  }
  if (keys["ArrowDown"]) {
    if (player.tilt < 30) {
      player.tilt += 0.4;
    }
  }
}

function degToRad(deg) {
  return (deg / 180) * Math.PI;
}

new object(
  [
    [
      { x: -300, y: 300, z: 0 },
      { x: -300, y: -300, z: 0 },
    ],
    [
      { x: -300, y: -300, z: 0 },
      { x: 300, y: -300, z: 0 },
    ],
    [
      { x: 300, y: -300, z: 0 },
      { x: 300, y: 300, z: 0 },
    ],
    [
      { x: 300, y: 300, z: 0 },
      { x: -300, y: 300, z: 0 },
    ],
  ],
  { x: 0, y: 0, z: 0 },
  1
);

new object(
  [
    [
      { x: -300, y: 15, z: 0 },
      { x: -300, y: -15, z: 0 },
    ],
    [
      { x: -300, y: -15, z: 0 },
      { x: 300, y: -15, z: 0 },
    ],
    [
      { x: 300, y: -15, z: 0 },
      { x: 300, y: 15, z: 0 },
    ],
    [
      { x: 300, y: 15, z: 0 },
      { x: -300, y: 15, z: 0 },
    ],
  ],
  { x: 0, y: 300, z: 0 },
  100
);

function distance(x1, x2, y1, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function drawWall(vertices, color) {
  ctx.beginPath();

  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[3].x, vertices[3].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);

  ctx.fillStyle = color;
  ctx.fill();
}

function collisionDetection() {}

mapScale = 10;

function orderObjects() {
  for (let i = 0; i < objects.length - 1; i++) {
    for (let j = 0; j < objects.length - i - 1; j++) {
      if (objects[j].distance < objects[j + 1].distance) {
        let st = objects[j];
        objects[j] = objects[j + 1];
        objects[j + 1] = st;
      }
    }
  }
}

function draw2d() {
  ctx_2d.beginPath();
  ctx_2d.rect(
    -canvas_2d.width / 2,
    -canvas_2d.height / 2,
    canvas_2d.width,
    canvas_2d.height
  );
  ctx_2d.fillStyle = "white";
  ctx_2d.fill();

  for (let i = 0; i < objects.length; i++) {
    const Object = objects[i];

    vertices_2D = [];

    for (let j = 0; j < Object.faces.length; j++) {
      const _Face = Object.faces[j];

      vertices_2D.push({
        x: (_Face[0].x + Object.position.x) / mapScale,
        y: (_Face[0].y + Object.position.y) / mapScale,
      });
    }

    ctx_2d.beginPath();
    ctx_2d.moveTo(vertices_2D[0].x, vertices_2D[0].y);

    vertices_2D.forEach((Vertex) => {
      ctx_2d.lineTo(Vertex.x, Vertex.y);
    });
    ctx_2d.lineTo(vertices_2D[0].x, vertices_2D[0].y);

    ctx_2d.fillStyle = Object.faceColors[Object.faceColors.length - 1];
    ctx_2d.fill();
  }

  ctx_2d.beginPath();
  ctx_2d.moveTo(player.position.x / mapScale, player.position.y / mapScale);
  ctx_2d.lineTo(
    player.position.x / mapScale +
      Math.cos(degToRad(-player.rotation) + Math.PI / 2) * 15,
    player.position.y / mapScale +
      Math.sin(degToRad(-player.rotation) + Math.PI / 2) * 15
  );
  ctx_2d.stroke();

  ctx_2d.beginPath();
  ctx_2d.arc(
    player.position.x / mapScale,
    player.position.y / mapScale,
    3,
    0,
    2 * Math.PI
  );
  ctx_2d.stroke();
}

function drawSurface(vertices) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);

  for (let i = 1; i < vertices.length; i++) {
    const vertex = vertices[i];

    ctx.lineTo(vertex.x, vertex.y);
  }
  ctx.lineTo(vertices[0].x, vertices[0].y);
  ctx.fill();
}

function clipBehindPlayer(p1, p2) {
  d = p1.y - p2.y;
  if (d == 0) {
    d = 1;
  }
  s = p1.y / d;
  p1.x = p1.x + s * (p2.x - p1.x);
  p1.y = 1;
  p1.z = p1.z + s * (p2.z - p1.z);
}

function draw3d(Object) {
  CS = Math.cos(degToRad(player.rotation));
  SN = Math.sin(degToRad(player.rotation));

  Object.distance = 0;
  let surface = 0;

  if (player.position.z > Object.position.z + Object.height) {
    surface = 1;
  } else if (player.position.z < Object.position.z) {
    surface = 2;
  }

  let pairs = [];

  for (let i = 0; i < Object.faces.length; i++) {
    const _Face = Object.faces[i];

    x1 = _Face[0].x - player.position.x + Object.position.x;
    x2 = _Face[1].x - player.position.x + Object.position.x;

    y1 = _Face[0].y - player.position.y + Object.position.y;
    y2 = _Face[1].y - player.position.y + Object.position.y;

    z1 = _Face[0].z - player.position.z + Object.position.z;
    z2 = _Face[1].z - player.position.z + Object.position.z;

    // world x

    world_x1 = x1 * CS - y1 * SN;
    world_x2 = x2 * CS - y2 * SN;

    world_x3 = world_x1;
    world_x4 = world_x2;

    // world y

    world_y1 = y1 * CS + x1 * SN;
    world_y2 = y2 * CS + x2 * SN;

    world_y3 = world_y1;
    world_y4 = world_y2;

    Object.distance += distance(world_x1, 0, world_y1, 0);

    //world z

    world_z1 = z1 + (player.tilt * world_y1) / 32;
    world_z2 = z2 + (player.tilt * world_y2) / 32;

    world_z3 = world_z1 + Object.height;
    world_z4 = world_z2 + Object.height;

    //backface culling, surface normal DOT viewVector

    surfaceNormal = { x: -world_y2 + world_y1, y: world_x2 - world_x1 };

    viewVector = { x: world_x1, y: world_y1 };

    if (world_y1 < 1 && world_y2 < 1) {
      continue;
    }

    world_1 = { x: world_x1, y: world_y1, z: world_z1 };
    world_2 = { x: world_x2, y: world_y2, z: world_z2 };
    world_3 = { x: world_x3, y: world_y3, z: world_z3 };
    world_4 = { x: world_x4, y: world_y4, z: world_z4 };

    if (world_1.y < 0) {
      clipBehindPlayer(world_1, world_2);
      clipBehindPlayer(world_3, world_4);
    }

    if (world_2.y < 0) {
      clipBehindPlayer(world_2, world_1);
      clipBehindPlayer(world_4, world_3);
    }

    p1 = {
      x: (world_1.x * 500) / world_1.y + screenWidth / 2,
      y: (world_1.z * 500) / world_1.y + screenHeight / 2,
    };

    p2 = {
      x: (world_2.x * 500) / world_2.y + screenWidth / 2,
      y: (world_2.z * 500) / world_2.y + screenHeight / 2,
    };

    p3 = {
      x: (world_3.x * 500) / world_3.y + screenWidth / 2,
      y: (world_3.z * 500) / world_3.y + screenHeight / 2,
    };

    p4 = {
      x: (world_4.x * 500) / world_4.y + screenWidth / 2,
      y: (world_4.z * 500) / world_4.y + screenHeight / 2,
    };

    if (surface == 1) {
      pairs.push(p3);
      pairs.push(p4);
    } else if (surface == 2) {
      pairs.push(p1);
      pairs.push(p2);
    }

    if (surfaceNormal.x * viewVector.x + surfaceNormal.y * viewVector.y < 0) {
      // if the object is behind player, dont draw
      continue;
    }

    drawWall([p1, p2, p3, p4], Object.faceColors[i]);
  }

  if (surface !== 0) {
    drawSurface(pairs);
  }

  Object.distance /= Object.faces.length;
}

socket.on("sendPlayerPosition", function (data) {
  if (data.ID !== clientID) {
    updateOtherPlayers(data.ID, data.position);
  }
});

function updateOtherPlayers(ID, position) {
  console.log(ID, position);
  for (let i = 0; i < players.length; i++) {
    if ((players[i].id = ID)) {
      players[i].position = position;
      players[i].shape.position = players[i].position;
    }
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  updatePlayerMovement();
  clear();

  orderObjects();

  socket.emit("updatePlayerPosition", {
    ID: clientID,
    position: player.position,
  });

  objects.forEach((Object) => {
    draw3d(Object);
  });

  draw2d();

  deltaMouse.x = 0;
  deltaMouse.y = 0;
}

gameLoop();

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// socket.on("connection", (socket) => {});
