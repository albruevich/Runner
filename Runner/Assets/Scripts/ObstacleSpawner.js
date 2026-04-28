// ObstacleSpawner.js

//@input Component.ScriptComponent config
//@input Asset.ObjectPrefab obstaclePrefab
//@input int poolSize = 8

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
        }

         script.pool.push(obstacle);
    }

    spawnTimer = 0;
}

function updateSpawner() {
    if (!script.config || !script.pool ||  script.pool.length === 0) {
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
        print("ObstacleSpawner: no inactive obstacles available.");
        return;
    }

    var laneIndex = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

    var transform = obstacle.getTransform();
    var pos = transform.getLocalPosition();

    pos.x = laneIndex * script.config.laneDistance;
    pos.y = script.config.obstacleY;
    pos.z = script.config.obstacleSpawnZ; 

    transform.setLocalPosition(pos);
    obstacle.enabled = true;
}

function getNextInactiveObstacle() {
    for (var i = 0; i <  script.pool.length; i++) {
        var index = (nextObstacleIndex + i) %  script.pool.length;
        var obstacle =  script.pool[index];

        if (!obstacle.enabled) {
            nextObstacleIndex = (index + 1) % script.pool.length;
            return obstacle;
        }
    }

    return null;
}

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateSpawner);