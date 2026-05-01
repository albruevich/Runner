// ObstacleSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Asset.ObjectPrefab obstaclePrefab
//@input Component.ScriptComponent prizeSpawner

var gameManager;
var config;
var obstaclePrefab;
var prizeSpawner;

var pool = [];
var nextObstacleIndex = 0;

function initialize() {
    cacheReferences();

    if (!config) {
        print("ObstacleSpawner: config is not assigned.");
        return;
    }

    if (!obstaclePrefab) {
        print("ObstacleSpawner: obstaclePrefab is not assigned.");
        return;
    }

    createPool();
    restartSpawner();
}

function cacheReferences() {
    gameManager = script.gameManager;
    config = script.config;
    obstaclePrefab = script.obstaclePrefab;
    prizeSpawner = script.prizeSpawner;
}

function createPool() {

    pool = [];
    script.pool = pool;

    for (var i = 0; i < config.obstaclePoolSize; i++) {
        var obstacle = obstaclePrefab.instantiate(null);

        obstacle.name = "Obstacle_" + i;
        obstacle.enabled = false;

        var obstacleScript = obstacle.getComponent("Component.ScriptComponent");

        if (obstacleScript) {
            obstacleScript.config = config;
            obstacleScript.gameManager = gameManager;
        }

        pool.push(obstacle);
    }
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
    var heights = [config.obstacleGroundY, config.obstacleUpperY];
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

    if (!prizeSpawner || !prizeSpawner.pool) {
        return true;
    }

    var targetPos = new vec3(x, y, z);
    var prizes = prizeSpawner.pool;

    for (var i = 0; i < prizes.length; i++) {

        var prize = prizes[i];

        if (!prize || !prize.enabled) {
            continue;
        }

        var prizePos = prize.getTransform().getLocalPosition();
        var distance = prizePos.distance(targetPos);

        if (distance < config.spawnCriticalDistance) {
            return false;
        }
    }

    return true;
}

function shuffle(array) {

    for (var i = array.length - 1; i > 0; i--) {

        // Multiply random value by (i + 1) to get range from 0 to i,
        // then use floor to convert it to integer index
        var j = Math.floor(Math.random() * (i + 1));

        // Swap two objects in array
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getNextInactiveObstacle() {

    for (var i = 0; i < pool.length; i++) {

        // Take the next saved index
        // and make sure it does not go beyond pool size
        var index = (nextObstacleIndex + i) % pool.length;

        var obstacle = pool[index];

        if (!obstacle.enabled) {

            // Save next index
            nextObstacleIndex = (index + 1) % pool.length;

            return obstacle;
        }
    }

    return null;
}

function restartSpawner() {

    nextObstacleIndex = 0;

    for (var i = 0; i < pool.length; i++) {
        pool[i].enabled = false;
    }
}

script.spawnObstacle = spawnObstacle;
script.restartSpawner = restartSpawner;

script.createEvent("OnStartEvent").bind(initialize);