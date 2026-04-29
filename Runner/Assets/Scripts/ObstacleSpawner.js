// ObstacleSpawner.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input Asset.ObjectPrefab obstaclePrefab
//@input int poolSize = 10

var spawnTimer = 0;
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

function updateSpawner() {

    if (script.gameManager && (script.gameManager.isGameOver || script.gameManager.isHit)) {
        return;
    }

    if (!script.config || !script.pool || script.pool.length === 0) {
        return;
    }

    spawnTimer -= getDeltaTime();

    if (spawnTimer <= 0) {
        spawnObstacle();
        spawnTimer = script.config.spawnInterval;
    }
}

function spawnObstacle() {
    var obstacle = getNextInactiveObstacle();

    if (!obstacle) {
        return;
    }

    var laneIndex = Math.floor(Math.random() * 3) - 1;

    var transform = obstacle.getTransform();
    var pos = transform.getLocalPosition();

    pos.x = laneIndex * script.config.laneDistance;
    pos.y = script.config.obstacleY;
    pos.z = script.config.obstacleSpawnZ;

    transform.setLocalPosition(pos);
    obstacle.enabled = true;
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
    spawnTimer = 0;
    nextObstacleIndex = 0;

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