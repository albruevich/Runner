// PrizeSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Asset.ObjectPrefab prizePrefab

var spawnTimer = 0;
var nextPrizeIndex = 0;

function initialize() {

    script.pool = [];

    for (var i = 0; i < script.config.prizePoolSize; i++) {

        var prize = script.prizePrefab.instantiate(null);

        prize.name = "Prize_" + i;
        prize.enabled = false;

        var prizeScript = prize.getComponent("Component.ScriptComponent");

        if (prizeScript) {
            prizeScript.config = script.config;
            prizeScript.gameManager = script.gameManager;
        }

        script.pool.push(prize);
    }

    restartSpawner();
}

function updateSpawner() {

    if (script.gameManager && (script.gameManager.isGameOver || script.gameManager.isHit)) {
        return;
    }

    spawnTimer -= getDeltaTime();

    if (spawnTimer <= 0) {
        spawnPrize();

        spawnTimer = script.gameManager
            ? script.gameManager.getSpawnInterval(script.config.prizeSpawnInterval)
            : script.config.prizeSpawnInterval;
    }
}

function spawnPrize() {

    var prize = getNextInactivePrize();

    if (!prize) {
        return;
    }

    var freeLanes = getFreeLanes();

    if (freeLanes.length === 0) {
        return;
    }

    var lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];

    var transform = prize.getTransform();
    var pos = transform.getLocalPosition();

    pos.x = lane * script.config.laneDistance;
    pos.z = script.config.obstacleSpawnZ;

    var isJumpPrize = Math.random() < script.config.jumpPrizeChance;
    pos.y = isJumpPrize ? script.config.prizeJumpY : script.config.prizeGroundY;

    transform.setLocalPosition(pos);
    prize.enabled = true;
}

function getFreeLanes() {

    var lanes = [-1, 0, 1];
    var blocked = {};

    if (!script.obstacleSpawner || !script.obstacleSpawner.pool) {
        return lanes;
    }

    var obstacles = script.obstacleSpawner.pool;

    for (var i = 0; i < obstacles.length; i++) {

        var obstacle = obstacles[i];

        if (!obstacle || !obstacle.enabled) {
            continue;
        }

        var pos = obstacle.getTransform().getLocalPosition();

        if (Math.abs(pos.z - script.config.obstacleSpawnZ) < script.config.prizeObstacleCheckZDistance) {
            var laneIndex = Math.round(pos.x / script.config.laneDistance);
            blocked[laneIndex] = true;
        }
    }

    var free = [];

    for (var j = 0; j < lanes.length; j++) {
        if (!blocked[lanes[j]]) {
            free.push(lanes[j]);
        }
    }

    return free;
}

function getNextInactivePrize() {

    for (var i = 0; i < script.pool.length; i++) {

        var index = (nextPrizeIndex + i) % script.pool.length;
        var prize = script.pool[index];

        if (!prize.enabled) {
            nextPrizeIndex = (index + 1) % script.pool.length;
            return prize;
        }
    }

    return null;
}

function restartSpawner() {

    spawnTimer = 0;
    nextPrizeIndex = 0;

    if (!script.pool) {
        return;
    }

    for (var i = 0; i < script.pool.length; i++) {
        script.pool[i].enabled = false;
    }
}

script.restartSpawner = restartSpawner;

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateSpawner);