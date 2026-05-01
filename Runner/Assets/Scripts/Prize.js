// Prize.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config
//@input SceneObject mesh

var gameManager;
var config;
var sceneObject;
var mesh;
var transform;
var meshTransform;

var floatTime = 0;

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

    if (!mesh) {
        print("Prize mesh is not assigned.");
        return false;
    }

    transform = sceneObject.getTransform();
    meshTransform = mesh.getTransform();

    return true;
}

function cacheReferences() {
    gameManager = script.gameManager;
    config = script.config;
    mesh = script.mesh;
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

    updateMovement(dt);
    updateMeshFloat(dt);
}

function updateMovement(dt) {

    var pos = transform.getLocalPosition();

    pos.z += gameManager.currentSpeed * dt;

    if (pos.z > config.obstacleHideZ) {
        sceneObject.enabled = false;
        return;
    }

    transform.setLocalPosition(pos);
}

function updateMeshFloat(dt) {

    floatTime += dt;

    var pos = meshTransform.getLocalPosition();

    pos.y = Math.sin(floatTime * 6.0) * 7.0;

    meshTransform.setLocalPosition(pos);
}

if (initialize()) {
    script.createEvent("UpdateEvent").bind(updatePrize);
}