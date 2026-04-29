// Obstacle.js

//@input SceneObject targetObject
//@input Component.ScriptComponent config
//@input Component.ScriptComponent gameManager

var targetObject;
var targetTransform;
var config;
var gameManager;

function initialize() {
    cacheReferences();

    if (!targetObject) {
        print("Obstacle targetObject is not assigned.");
        return;
    }

    if (!config) {
        print("Obstacle config is not assigned.");
        return;
    }

    targetTransform = targetObject.getTransform();
}

function cacheReferences() {
    targetObject = script.targetObject;
    config = script.config;
    gameManager = script.gameManager;
}

function updateObstacle() {

    if (!targetObject || !targetTransform || !config) {
        return;
    }

    if (gameManager && (gameManager.isGameOver || gameManager.isHit || gameManager.isStartPause)) {
        return;
    }

    if (!targetObject.enabled) {
        return;
    }

    var dt = getDeltaTime();
    var pos = targetTransform.getLocalPosition();

    var speed = gameManager ? gameManager.currentSpeed : config.startSpeed;
    pos.z += speed * dt;

    if (pos.z > config.obstacleHideZ) {
        targetObject.enabled = false;
        return;
    }

    targetTransform.setLocalPosition(pos);
}

initialize();

script.createEvent("UpdateEvent").bind(updateObstacle);