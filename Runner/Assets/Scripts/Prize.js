// Prize.js

//@input Component.ScriptComponent gameManager
//@input Component.ScriptComponent config

function updatePrize() {

    if (script.gameManager && (script.gameManager.isGameOver || script.gameManager.isHit)) {
        return;
    }

    var obj = script.getSceneObject();

    if (!obj.enabled) {
        return;
    }

    var dt = getDeltaTime();

    var transform = obj.getTransform();
    var pos = transform.getLocalPosition();

    pos.z += script.config.obstacleSpeed * dt;

    if (pos.z > script.config.obstacleHideZ) {
        obj.enabled = false;
        return;
    }

    transform.setLocalPosition(pos);
}

script.createEvent("UpdateEvent").bind(updatePrize);