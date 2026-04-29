// PrizeSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Asset.ObjectPrefab prizePrefab

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
    var heights = [script.config.prizeGroundY, script.config.prizeJumpY];
    var z = script.config.obstacleSpawnZ;

    var candidates = [];

    for (var i = 0; i < lanes.length; i++) {
        for (var j = 0; j < heights.length; j++) {
            candidates.push({
                x: lanes[i] * script.config.laneDistance,
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

    if (!script.obstacleSpawner || !script.obstacleSpawner.pool) {
        return true;
    }

    var targetPos = new vec3(x, y, z);
    var obstacles = script.obstacleSpawner.pool;

    for (var i = 0; i < obstacles.length; i++) {

        var obstacle = obstacles[i];

        if (!obstacle || !obstacle.enabled) {
            continue;
        }

        var obstaclePos = obstacle.getTransform().getLocalPosition();
        var distance = obstaclePos.distance(targetPos);

        if (distance < script.config.spawnCriticalDistance) {
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

    nextPrizeIndex = 0;

    if (!script.pool) {
        return;
    }

    for (var i = 0; i < script.pool.length; i++) {
        script.pool[i].enabled = false;
    }
}

script.spawnPrize = spawnPrize;
script.restartSpawner = restartSpawner;

script.createEvent("OnStartEvent").bind(initialize);