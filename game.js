const {
    Engine,
    Runner,
    Bodies,
    Body,
    Composite,
    Events
} = Matter;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const heightElement = document.getElementById("height");
const animalNameElement = document.getElementById("animal-name");
const nextIconElement = document.getElementById("next-icon");

const gameOverScreen = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const finalHeightElement = document.getElementById("final-height");

const restartButton = document.getElementById("restart");
const playAgainButton = document.getElementById("play-again");


// --------------------------------------------------
// CONFIGURACIÓN
// --------------------------------------------------

let width;
let height;

let gameRunning = true;

let score = 0;
let highestPoint = 0;

let currentAnimal;
let nextAnimal;

let dropX = 0;

const engine = Engine.create();

engine.gravity.y = 1.15;
engine.gravity.x = 0;

const world = engine.world;

const runner = Runner.create();


// --------------------------------------------------
// ANIMALES
// --------------------------------------------------

const animals = [

    {
        name: "Pollito",
        emoji: "🐥",
        shape: "circle",
        width: 34,
        height: 34,
        color: "#ffd84d",
        points: 10
    },

    {
        name: "Gato",
        emoji: "🐱",
        shape: "cat",
        width: 46,
        height: 38,
        color: "#e7a56d",
        points: 15
    },

    {
        name: "Perro",
        emoji: "🐶",
        shape: "dog",
        width: 50,
        height: 42,
        color: "#c98b58",
        points: 20
    },

    {
        name: "Cerdo",
        emoji: "🐷",
        shape: "circle",
        width: 54,
        height: 48,
        color: "#f39ab4",
        points: 25
    },

    {
        name: "Oveja",
        emoji: "🐑",
        shape: "sheep",
        width: 58,
        height: 48,
        color: "#f4f4f4",
        points: 30
    },

    {
        name: "Vaca",
        emoji: "🐮",
        shape: "cow",
        width: 65,
        height: 55,
        color: "#eee4d5",
        points: 40
    },

    {
        name: "Elefante",
        emoji: "🐘",
        shape: "elephant",
        width: 76,
        height: 65,
        color: "#8f9ba8",
        points: 60
    },

    {
        name: "Jirafa",
        emoji: "🦒",
        shape: "giraffe",
        width: 52,
        height: 85,
        color: "#e4b84e",
        points: 80
    }

];


// --------------------------------------------------
// CANVAS
// --------------------------------------------------

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createIsland();

    if (currentAnimal) {
        dropX = width / 2;
    }
}


// --------------------------------------------------
// ISLA
// --------------------------------------------------

let island;

function createIsland() {

    if (island) {
        Composite.remove(world, island);
    }

    island = Bodies.polygon(
        width / 2,
        height - 75,
        12,
        Math.min(115, width * 0.22),
        {
            isStatic: true,
            label: "island",

            chamfer: {
                radius: 12
            }
        }
    );

    Composite.add(world, island);
}


// --------------------------------------------------
// CREAR ANIMAL
// --------------------------------------------------

function createAnimal(data, x, y) {

    let body;

    const options = {
        restitution: 0.05,
        friction: 0.8,
        frictionStatic: 0.8,
        density: 0.002,
        label: "animal"
    };

    if (data.shape === "circle") {

        body = Bodies.circle(
            x,
            y,
            Math.min(data.width, data.height) / 2,
            options
        );

    } else if (data.shape === "giraffe") {

        body = Bodies.rectangle(
            x,
            y,
            data.width,
            data.height,
            {
                ...options,
                chamfer: {
                    radius: 10
                }
            }
        );

    } else {

        body = Bodies.rectangle(
            x,
            y,
            data.width,
            data.height,
            {
                ...options,
                chamfer: {
                    radius: Math.min(data.width, data.height) * 0.2
                }
            }
        );
    }

    body.animalData = data;

    Composite.add(world, body);

    return body;
}


// --------------------------------------------------
// SIGUIENTE ANIMAL
// --------------------------------------------------

function randomAnimal() {

    return animals[
        Math.floor(Math.random() * animals.length)
    ];
}

function prepareNextAnimal() {

    currentAnimal = nextAnimal || randomAnimal();

    nextAnimal = randomAnimal();

    animalNameElement.textContent = currentAnimal.name;
    nextIconElement.textContent = nextAnimal.emoji;

    dropX = width / 2;
}


// --------------------------------------------------
// SOLTAR ANIMAL
// --------------------------------------------------

function dropAnimal() {

    if (!gameRunning) return;

    const animal = createAnimal(
        currentAnimal,
        dropX,
        145
    );

    Body.setVelocity(animal, {
        x: 0,
        y: 0
    });

    score += currentAnimal.points;

    scoreElement.textContent = score;

    prepareNextAnimal();
}


// --------------------------------------------------
// CONTROL DE POSICIÓN
// --------------------------------------------------

function moveDropPosition(clientX) {

    dropX = Math.max(
        60,
        Math.min(width - 60, clientX)
    );
}


// --------------------------------------------------
// INPUT
// --------------------------------------------------

canvas.addEventListener("pointermove", function(e) {

    if (!gameRunning) return;

    moveDropPosition(e.clientX);

});

canvas.addEventListener("pointerdown", function(e) {

    if (!gameRunning) return;

    moveDropPosition(e.clientX);

    dropAnimal();

});


// --------------------------------------------------
// TECLADO
// --------------------------------------------------

window.addEventListener("keydown", function(e) {

    if (!gameRunning) return;

    if (e.key === "ArrowLeft") {

        dropX -= 20;

    }

    if (e.key === "ArrowRight") {

        dropX += 20;
    }

    if (e.key === " ") {

        e.preventDefault();

        dropAnimal();
    }

    dropX = Math.max(
        50,
        Math.min(width - 50, dropX)
    );

});


// --------------------------------------------------
// PUNTUACIÓN / ALTURA
// --------------------------------------------------

function updateHeight() {

    const bodies = Composite.allBodies(world);

    let highest = height;

    bodies.forEach(body => {

        if (
            body.label === "animal" &&
            body.position.y < highestPoint
        ) {
            highest = body.position.y;
        }

    });

    const islandTop = height - 130;

    let meters = Math.max(
        0,
        Math.floor((islandTop - highest) / 10)
    );

    if (meters > highestPoint) {
        highestPoint = meters;
    }

    heightElement.textContent = highestPoint + " m";
}


// --------------------------------------------------
// GAME OVER
// --------------------------------------------------

function checkGameOver() {

    const bodies = Composite.allBodies(world);

    for (const body of bodies) {

        if (
            body.label === "animal" &&
            body.position.y > height + 100
        ) {

            endGame();

            return;
        }
    }
}

function endGame() {

    gameRunning = false;

    finalScoreElement.textContent = score;
    finalHeightElement.textContent = highestPoint + " m";

    gameOverScreen.classList.add("visible");
}


// --------------------------------------------------
// REINICIAR
// --------------------------------------------------

function restartGame() {

    Composite.clear(world, false);

    createIsland();

    score = 0;
    highestPoint = 0;

    scoreElement.textContent = "0";
    heightElement.textContent = "0 m";

    gameRunning = true;

    gameOverScreen.classList.remove("visible");

    nextAnimal = null;

    prepareNextAnimal();
}

restartButton.addEventListener("click", restartGame);

playAgainButton.addEventListener("click", restartGame);


// --------------------------------------------------
// DIBUJAR
// --------------------------------------------------

function drawBackground() {

    ctx.clearRect(0, 0, width, height);

    // Nubes
    drawCloud(100, 220, 0.8);
    drawCloud(width - 130, 330, 0.7);
    drawCloud(width * 0.55, 170, 0.55);
    drawCloud(width * 0.25, 470, 0.5);
}


function drawCloud(x, y, scale) {

    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(255,255,255,0.72)";

    ctx.beginPath();

    ctx.arc(-30, 10, 25, 0, Math.PI * 2);
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.arc(32, 10, 25, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();
}


function drawIsland() {

    if (!island) return;

    const x = island.position.x;
    const y = island.position.y;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(island.angle);

    // Tierra
    ctx.fillStyle = "#765332";

    ctx.beginPath();

    ctx.moveTo(-105, -5);

    ctx.quadraticCurveTo(
        -85,
        55,
        -55,
        75
    );

    ctx.quadraticCurveTo(
        0,
        105,
        55,
        75
    );

    ctx.quadraticCurveTo(
        90,
        45,
        105,
        -5
    );

    ctx.closePath();

    ctx.fill();

    // Césped
    ctx.fillStyle = "#59a84f";

    ctx.beginPath();

    ctx.ellipse(
        0,
        -8,
        108,
        47,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Piedras
    ctx.fillStyle = "#5d4530";

    for (let i = 0; i < 9; i++) {

        const px = -75 + i * 19;
        const py = 15 + Math.sin(i) * 10;

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}


// --------------------------------------------------
// DIBUJAR ANIMALES
// --------------------------------------------------

function drawAnimal(body) {

    const data = body.animalData;

    if (!data) return;

    const x = body.position.x;
    const y = body.position.y;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(body.angle);

    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.12)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        data.height * 0.45,
        data.width * 0.4,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Cuerpo
    ctx.fillStyle = data.color;

    if (data.shape === "circle") {

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            data.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    } else {

        ctx.beginPath();

        const radius = 12;

        ctx.roundRect(
            -data.width / 2,
            -data.height / 2,
            data.width,
            data.height,
            radius
        );

        ctx.fill();
    }

    // Emoji
    ctx.font = `${Math.max(24, data.height * 0.62)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        data.emoji,
        0,
        1
    );

    ctx.restore();
}


// --------------------------------------------------
// ANIMAL QUE ESTÁ ESPERANDO
// --------------------------------------------------

function drawWaitingAnimal() {

    if (!currentAnimal || !gameRunning) return;

    const y = 115;

    ctx.save();

    ctx.globalAlpha = 0.85;

    ctx.font = `${Math.max(
        28,
        currentAnimal.height * 0.65
    )}px Arial`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        currentAnimal.emoji,
        dropX,
        y
    );

    // Línea guía

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;

    ctx.setLineDash([5, 7]);

    ctx.beginPath();

    ctx.moveTo(dropX, y + 30);
    ctx.lineTo(dropX, height - 130);

    ctx.stroke();

    ctx.restore();
}


// --------------------------------------------------
// RENDER
// --------------------------------------------------

function render() {

    drawBackground();

    drawIsland();

    const bodies = Composite.allBodies(world);

    bodies.forEach(body => {

        if (body.label === "animal") {
            drawAnimal(body);
        }

    });

    drawWaitingAnimal();

    requestAnimationFrame(render);
}


// --------------------------------------------------
// ACTUALIZACIÓN
// --------------------------------------------------

Events.on(engine, "afterUpdate", function() {

    updateHeight();

    checkGameOver();

});


// --------------------------------------------------
// INICIO
// --------------------------------------------------

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

prepareNextAnimal();

Runner.run(runner, engine);

render();
