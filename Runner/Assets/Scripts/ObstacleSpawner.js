// ObstacleSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Asset.ObjectPrefab obstaclePrefab
//@input Component.ScriptComponent prizeSpawner
//@input int poolSize = 10

var nextObstacleIndex = 0;

function initialize() {

    if (!script.config) {
        print("ObstacleSpawner: config is not assigned.");
        return;
    }

    if (!script.obstaclePrefab) {
        print("ObstacleSpawner: obstaclePrefab is not assigned.");
        return;
    }

    script.pool = [];

    for (var i = 0; i < script.poolSize; i++) {
        var obstacle = script.obstaclePrefab.instantiate(null);

        obstacle.name = "Obstacle_" + i;
        obstacle.enabled = false;

        var obstacleScript = obstacle.getComponent("Component.ScriptComponent");
        if (obstacleScript) {
            obstacleScript.config = script.config;
            obstacleScript.gameManager = script.gameManager;
        }

        script.pool.push(obstacle);
    }

    restartSpawner();
}

function spawnObstacle() {

    var obstacle = getNextInactiveObstacle();

    if (!obstacle) {
        return;
    }

    var position = findFreeObstaclePosition();

    if (!position) {
        return;
    }

    var transform = obstacle.getTransform();
    var pos = transform.getLocalPosition();

    pos.x = position.x;
    pos.y = position.y;
    pos.z = position.z;

    transform.setLocalPosition(pos);
    obstacle.enabled = true;
}

function findFreeObstaclePosition() {

    var lanes = [-1, 0, 1];
    var heights = [script.config.obstacleGroundY, script.config.obstacleUpperY];
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

    if (!script.prizeSpawner || !script.prizeSpawner.pool) {
        return true;
    }

    var targetPos = new vec3(x, y, z);
    var prizes = script.prizeSpawner.pool;

    for (var i = 0; i < prizes.length; i++) {

        var prize = prizes[i];

        if (!prize || !prize.enabled) {
            continue;
        }

        var prizePos = prize.getTransform().getLocalPosition();
        var distance = prizePos.distance(targetPos);

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

function getNextInactiveObstacle() {

    for (var i = 0; i < script.pool.length; i++) {
        var index = (nextObstacleIndex + i) % script.pool.length;
        var obstacle = script.pool[index];

        if (!obstacle.enabled) {
            nextObstacleIndex = (index + 1) % script.pool.length;
            return obstacle;
        }
    }

    return null;
}

function restartSpawner() {

    nextObstacleIndex = 0;

    if (!script.pool) {
        return;
    }

    for (var i = 0; i < script.pool.length; i++) {
        script.pool[i].enabled = false;
    }
}

script.spawnObstacle = spawnObstacle;
script.restartSpawner = restartSpawner;

script.createEvent("OnStartEvent").bind(initialize);