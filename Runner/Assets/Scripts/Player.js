// Player.js

//@input SceneObject targetObject
//@input Component.ScriptComponent config

var currentLane = 0; // -1 = left, 0 = center, 1 = right

var moveSpeed = 20;
var jumpHeight = 20;
var jumpSpeed = 15;

var isJumping = false;
var jumpTime = 0;
var baseY = 0;

var touchStartX = 0;
var touchStartY = 0;
var swipeThreshold = 0.08;

function initialize() {
    if (!script.targetObject) {
        print("Target is not assigned.");
        return;
    }

    baseY = script.targetObject.getTransform().getLocalPosition().y;
}

function moveLeft() {
    currentLane = Math.max(-1, currentLane - 1);
}

function moveRight() {
    currentLane = Math.min(1, currentLane + 1);
}

function jump() {
    if (isJumping) {
        return;
    }

    isJumping = true;
    jumpTime = 0;
}

function updatePlayer() {
    if (!script.targetObject) {
        return;
    }

    var dt = getDeltaTime();
    var transform = script.targetObject.getTransform();
    var pos = transform.getLocalPosition();

    var targetX = currentLane * script.config.laneDistance;
    pos.x = lerp(pos.x, targetX, moveSpeed * dt);

    if (isJumping) {
        jumpTime += dt * jumpSpeed;

        var jumpValue = Math.sin(jumpTime) * jumpHeight;
        pos.y = baseY + Math.max(0, jumpValue);

        if (jumpTime >= Math.PI) {
            isJumping = false;
            jumpTime = 0;
            pos.y = baseY;
        }
    }

    transform.setLocalPosition(pos);
}

function lerp(a, b, t) {
    t = Math.min(Math.max(t, 0), 1);
    return a + (b - a) * t;
}

initialize();

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(updatePlayer);

var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(function(eventData) {
    var pos = eventData.getTouchPosition();

    touchStartX = pos.x;
    touchStartY = pos.y;
});

var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(function(eventData) {
    var pos = eventData.getTouchPosition();

    var deltaX = pos.x - touchStartX;
    var deltaY = pos.y - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) < swipeThreshold) {
            return;
        }

        if (deltaX < 0) {
            moveLeft();
        } else {
            moveRight();
        }
    } else {
        if (Math.abs(deltaY) < swipeThreshold) {
            return;
        }

        if (deltaY < 0) {
            jump();
        }
    }
});