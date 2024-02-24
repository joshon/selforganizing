const container = document.getElementById("container");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

console.log("index.js loaded");

container.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const numNodes = 100;
const nodeSize = 5;
const circleRadiusBase = 8;
const showCenter = false; // true;
const repelIfWithin = 5;
const repelFromCount = 8; // lots of fun undefined behavior if n = 20 etc
const maxVisionDist = 250;
const maxNodesInCircle = 20;
const nodeDict = {};

// const numNodes = 50;
// const nodeSize = 5;
// const circleRadiusBase = 8;
// const showCenter = false;
// const repelIfWithin = 30;
// const repelFromCount = 1; // lots of fun undefined behavior if n = 20 etc
// const maxVisionDist = 300;
// const maxNodesInCircle = 10;
// const nodeDict = {};

// random init positions
for (let i = 0; i < numNodes; i++) {
  const id = "n" + i;
  nodeDict[id] = {
    id: id,
    x: Math.round(Math.random() * (canvas.width - nodeSize)),
    y: Math.round(Math.random() * (canvas.height - nodeSize)),
    momX: 0,
    momY: 0,
    nodesInMyCircle: [],
  };
  console.log(nodeDict[id]);
}

nodes = Object.values(nodeDict);

console.log("nodes", [...nodes]);

let count = 0;

// Transition function to flip between attractive and repulsive at the given radius
function attract_or_repel(r, numNodesinCircle = 1) {
  const R = circleRadiusBase * numNodesinCircle; // Radius of transition
  retVal = Math.tanh(r - R);
  return retVal;
}

// Helper function to calculate the distance between two nodes
function distance_between(node1, node2) {
  return Math.sqrt(
    (node1.x - node2.x) * (node1.x - node2.x) +
      (node1.y - node2.y) * (node1.y - node2.y),
  );
}

function draw() {
  count++;
  if (count > 10000) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const allNodes = Object.values(nodeDict);

  allNodes.forEach((node) => {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(node.x, node.y, nodeSize, nodeSize, 0, 0, 100);
    ctx.fill();
    ctx.closePath();

    let nodes = findNodesWithinDistance(
      node,
      Object.values(nodeDict),
      maxVisionDist,
    );

    node.nodesInMyCircle = getNodeIdsInMyCircle(
      node,
      nodes,
      node.nodesInMyCircle,
    );

    // rduce nodes to nodes with ids in my circle
    nodes = nodes.filter((n) => node.nodesInMyCircle.includes(n.id));

    if (nodes.length === 0) {
      return;
    }

    // find current average position of all nodes

    const avgX = nodes.reduce((a, n) => a + n.x, 0) / nodes.length;
    const avgY = nodes.reduce((a, n) => a + n.y, 0) / nodes.length;

    // this will start out zero and should, ideally, stay at zero
    const avgMomentumX = nodes.reduce((a, n) => a + n.momX, 0) / nodes.length;
    const avgMomentumY = nodes.reduce((a, n) => a + n.momY, 0) / nodes.length;

    // Calculate movement based on rule

    // find the distance r from the current node to the center of mass
    distance_from_center = Math.sqrt(
      (avgX - node.x) * (avgX - node.x) + (avgY - node.y) * (avgY - node.y),
    );

    // calculate the force on this node
    const k = 0.0005; // force towards main circle (controls speed)
    Fx =
      k *
      (avgX - node.x) *
      attract_or_repel(distance_from_center, nodes.length);
    Fy =
      k *
      (avgY - node.y) *
      attract_or_repel(distance_from_center, nodes.length);

    // repel from closest two nodes
    closestNodes = findNClosestNodes(node, nodes, repelFromCount);
    const closeRepel = -k / 2;
    closestNodes.forEach((close) => {
      const distance = distance_between(node, close);
      if (distance < repelIfWithin * nodes.length) {
        Fx = Fx + closeRepel * (close.x - node.x);
        Fy = Fy + closeRepel * (close.y - node.y);
      }
    });

    // update the momentum of the node by the force
    node.momX += Fx;
    node.momY += Fy;

    // update the position of the node based on the momentum
    node.x += node.momX;
    node.y += node.momY;

    // add (a lot) of friction
    node.momX *= 0.95;
    node.momY *= 0.95;

    // // cancel out average momentum - otherwise you get a kinda drift thing
    // // (also this way you get a nice kinda spinning thing)
    node.momX += -avgMomentumX * 0.12;
    node.momY += -avgMomentumY * 0.12;

    nodeDict[node.id] = node;
  });

  // turn on for debug
  if (showCenter) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.ellipse(avgX, avgY, nodeSize, nodeSize, 0, 0, 100);
    ctx.fill();
    ctx.closePath();
  }

  requestAnimationFrame(draw);
}

function findNClosestNodes(node, nodes, n) {
  // Create a copy of the nodes array to avoid modifying the original
  const sortedNodes = nodes.slice();

  // Remove the current node from the list
  sortedNodes.splice(sortedNodes.indexOf(node), 1);

  // Sort the nodes by their distance to the given node
  sortedNodes.sort((a, b) => {
    const distanceToA = distance_between(node, a);
    const distanceToB = distance_between(node, b);
    return distanceToA - distanceToB;
  });

  return sortedNodes.slice(0, n);
}

function findNodesWithinDistance(node, nodes, dist) {
  let sortedNodes = findNClosestNodes(node, nodes, nodes.length - 1);
  let nodesInRange = [];
  sortedNodes.forEach((n) => {
    if (distance_between(node, n) < dist) {
      nodesInRange.push(n);
    }
  });
  return nodesInRange;
}

function getNodeIdsInMyCircle(node, nodes, nodeIdsInMyCircle) {
  let myCircleIds = [].slice();
  for (let i = 0; i < nodes.length; i++) {
    const nodesInOtherCircle = nodes[i].nodesInMyCircle;
    let combinedNodes = [
      ...new Set([...nodesInOtherCircle, ...myCircleIds, nodes[i].id]),
    ];
    if (combinedNodes.length < maxNodesInCircle) {
      myCircleIds = combinedNodes;
    } else {
      // remove that nodeId if it is in myCircleIds
      const index = myCircleIds.indexOf(nodes[i].id);
      if (index > -1) {
        myCircleIds.splice(index, 1);
      }
    }
    if (myCircleIds.length >= maxNodesInCircle) break;
  }
  return myCircleIds;
}

function keepOnScreen(node, canvasWidth, canvasHeight) {
  // Check if position exceeds canvas edges
  if (node.x < 0) {
    node.x = 0;
  } else if (node.x + nodeSize > canvasWidth) {
    node.x = canvasWidth - nodeSize;
  }

  if (node.y < 0) {
    node.y = 0;
  } else if (node.y + nodeSize > canvasHeight) {
    node.y = canvasHeight - nodeSize;
  }
}

draw();
