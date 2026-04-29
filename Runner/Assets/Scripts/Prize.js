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
        return;
    }

    if (!sceneObject) {
        print("Prize sceneObject is missing.");
        return;
    }

    transform = sceneObject.getTransform();
}

function cacheReferences() {
    gameManager = script.gameManager;
    config = script.config;
    sceneObject = script.getSceneObject();
}

function updatePrize() {

    if (!sceneObject || !transform || !config) {
        return;
    }

    if (gameManager && (gameManager.isGameOver || gameManager.isHit || gameManager.isStartPause)) {
        return;
    }

    if (!sceneObject.enabled) {
        return;
    }

    var dt = getDeltaTime();
    var pos = transform.getLocalPosition();

    var speed = gameManager ? gameManager.currentSpeed : config.startSpeed;
    pos.z += speed * dt;

    if (pos.z > config.obstacleHideZ) {
        sceneObject.enabled = false;
        return;
    }

    transform.setLocalPosition(pos);
}

initialize();

script.createEvent("UpdateEvent").bind(updatePrize);