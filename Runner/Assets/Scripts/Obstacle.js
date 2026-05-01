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
        return false;
    }

    if (!config) {
        print("Obstacle config is not assigned.");
        return false;
    }

    if (!gameManager) {
        print("Obstacle gameManager is not assigned.");
        return false;
    }

    targetTransform = targetObject.getTransform();

    return true;
}

function cacheReferences() {
    targetObject = script.targetObject;
    config = script.config;
    gameManager = script.gameManager;
}

function updateObstacle() {

    if (gameManager.isGameOver || gameManager.isHit || gameManager.isStartPause) {
        return;
    }

    if (!targetObject.enabled) {
        return;
    }

    var dt = getDeltaTime();
    var pos = targetTransform.getLocalPosition();

    pos.z += gameManager.currentSpeed * dt;

    if (pos.z > config.obstacleHideZ) {
        targetObject.enabled = false;
        return;
    }

    targetTransform.setLocalPosition(pos);
}

if (initialize()) {
    script.createEvent("UpdateEvent").bind(updateObstacle);
}