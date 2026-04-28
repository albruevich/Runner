// Obstacle.js

//@input SceneObject targetObject
//@input Component.ScriptComponent config
//@input Component.ScriptComponent gameManager

function updateObstacle() {

    if (script.gameManager && script.gameManager.isGameOver) {
        return;
    }

    if (!script.targetObject || !script.targetObject.enabled) {
        return;
    }

    if (!script.config) {
        return;
    }

    var dt = getDeltaTime();

    var transform = script.targetObject.getTransform();
    var pos = transform.getLocalPosition();

    pos.z += script.config.obstacleSpeed * dt;

    if (pos.z > script.config.obstacleHideZ) {
        script.targetObject.enabled = false;
        return;
    }

    transform.setLocalPosition(pos);
}

script.createEvent("UpdateEvent").bind(updateObstacle);