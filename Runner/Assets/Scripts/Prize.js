// Prize.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config

var gameManager;
var config;
var sceneObject;
var transform;

function initialize() {

    cacheReferences();

    if (!config) {
        print("Prize config is not assigned.");
        return false;
    }

    if (!gameManager) {
        print("Prize gameManager is not assigned.");
        return false;
    }

    if (!sceneObject) {
        print("Prize sceneObject is missing.");
        return false;
    }

    transform = sceneObject.getTransform();

    return true;
}

function cacheReferences() {
    gameManager = script.gameManager;
    config = script.config;
    sceneObject = script.getSceneObject();
}

function updatePrize() {

    if (gameManager.isGameOver || gameManager.isHit || gameManager.isStartPause) {
        return;
    }

    if (!sceneObject.enabled) {
        return;
    }

    var dt = getDeltaTime();
    var pos = transform.getLocalPosition();

    pos.z += gameManager.currentSpeed * dt;

    if (pos.z > config.obstacleHideZ) {
        sceneObject.enabled = false;
        return;
    }

    transform.setLocalPosition(pos);
}

if (initialize()) {
    script.createEvent("UpdateEvent").bind(updatePrize);
}