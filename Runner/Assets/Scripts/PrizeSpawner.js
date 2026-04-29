// PrizeSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Asset.ObjectPrefab prizePrefab

var gameManager;
var config;
var obstacleSpawner;
var prizePrefab;

var pool = [];
var nextPrizeIndex = 0;

function initialize() {
    cacheReferences();

    if (!config) {
        print("PrizeSpawner config is not assigned.");
        return;
    }

    if (!prizePrefab) {
        print("PrizeSpawner prefab is not assigned.");
        return;
    }

    createPool();
    restartSpawner();
}

function cacheReferences() {
    gameManager = script.gameManager;
    config = script.config;
    obstacleSpawner = script.obstacleSpawner;
    prizePrefab = script.prizePrefab;
}

function createPool() {

    pool = [];
    script.pool = pool;

    for (var i = 0; i < config.prizePoolSize; i++) {

        var prize = prizePrefab.instantiate(null);

        prize.name = "Prize_" + i;
        prize.enabled = false;

        var prizeScript = prize.getComponent("Component.ScriptComponent");

        if (prizeScript) {
            prizeScript.config = config;
            prizeScript.gameManager = gameManager;
        }

        pool.push(prize);
    }
}

function spawnPrize() {

    var prize = getNextInactivePrize();

    if (!prize) {
        return;
    }

    var position = findFreePrizePosition();

    if (!position) {
        return;
    }

    var transform = prize.getTransform();
    var pos = transform.getLocalPosition();

    pos.x = position.x;
    pos.y = position.y;
    pos.z = position.z;

    transform.setLocalPosition(pos);
    prize.enabled = true;
}

function findFreePrizePosition() {

    var lanes = [-1, 0, 1];
    var heights = [config.prizeGroundY, config.prizeJumpY];
    var z = config.obstacleSpawnZ;

    var candidates = [];

    for (var i = 0; i < lanes.length; i++) {
        for (var j = 0; j < heights.length; j++) {

            candidates.push({
                x: lanes[i] * config.laneWidth,
                y: heights[j],
                z: z
            });
        }
    }

    shuffle(candidates);

    for (var k = 0; k < candidates.length; k++) {
        var candidate = candidates[k];

        if (isPositionFree(candidate.x, candidate.y, candidate.z)) {
            return candidate;
        }
    }

    return null;
}

function isPositionFree(x, y, z) {

    if (!obstacleSpawner || !obstacleSpawner.pool) {
        return true;
    }

    var targetPos = new vec3(x, y, z);
    var obstacles = obstacleSpawner.pool;

    for (var i = 0; i < obstacles.length; i++) {

        var obstacle = obstacles[i];

        if (!obstacle || !obstacle.enabled) {
            continue;
        }

        var obstaclePos = obstacle.getTransform().getLocalPosition();
        var distance = obstaclePos.distance(targetPos);

        if (distance < config.spawnCriticalDistance) {
            return false;
        }
    }

    return true;
}

function shuffle(array) {

    for (var i = array.length - 1; i > 0; i--) {

        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getNextInactivePrize() {

    for (var i = 0; i < pool.length; i++) {

        var index = (nextPrizeIndex + i) % pool.length;
        var prize = pool[index];

        if (!prize.enabled) {
            nextPrizeIndex = (index + 1) % pool.length;
            return prize;
        }
    }

    return null;
}

function restartSpawner() {

    nextPrizeIndex = 0;

    for (var i = 0; i < pool.length; i++) {
        pool[i].enabled = false;
    }
}

script.spawnPrize = spawnPrize;
script.restartSpawner = restartSpawner;

script.createEvent("OnStartEvent").bind(initialize);