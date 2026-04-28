// Player.js

//@input SceneObject targetObject
//@input Component.ScriptComponent config

var currentLane = 0; // -1 = left, 0 = center, 1 = right

var moveSpeed = 20;
var jumpHeight = 40;

var jumpUpSpeed = 20;
var jumpDownSpeed = 3;
var hangTime = 0.2; // pause at the top

var jumpProgress = 0;
var hangTimer = 0;

var isJumping = false;
var isFalling = false;
var isHanging = false;

var baseY = 0;

var touchStartX = 0;
var touchStartY = 0;
var swipeThreshold = 0.08;

function initialize() {
    if (!script.targetObject) {
        print("Target is not assigned.");
        return;
    }

    if (!script.config) {
        print("Config is not assigned.");
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
    isFalling = false;
    isHanging = false;
    jumpProgress = 0;
    hangTimer = 0;
}

function updatePlayer() {
    if (!script.targetObject || !script.config) {
        return;
    }

    var dt = getDeltaTime();
    var transform = script.targetObject.getTransform();
    var pos = transform.getLocalPosition();

    var targetX = currentLane * script.config.laneDistance;
    pos.x = lerp(pos.x, targetX, moveSpeed * dt);

    if (isJumping) {
        if (!isHanging && !isFalling) {
            jumpProgress += dt * jumpUpSpeed;

            if (jumpProgress >= 1) {
                jumpProgress = 1;
                isHanging = true;
                hangTimer = hangTime;
            }
        } else if (isHanging) {
            hangTimer -= dt;

            if (hangTimer <= 0) {
                isHanging = false;
                isFalling = true;
            }
        } else if (isFalling) {
            jumpProgress -= dt * jumpDownSpeed;

            if (jumpProgress <= 0) {
                jumpProgress = 0;
                isJumping = false;
                isFalling = false;
                isHanging = false;
            }
        }

        pos.y = baseY + smoothStep(jumpProgress) * jumpHeight;
    } else {
        pos.y = baseY;
    }

    transform.setLocalPosition(pos);
}

function lerp(a, b, t) {
    t = Math.min(Math.max(t, 0), 1);
    return a + (b - a) * t;
}

function smoothStep(t) {
    t = Math.min(Math.max(t, 0), 1);
    return t * t * (3 - 2 * t);
}

initialize();

script.createEvent("UpdateEvent").bind(updatePlayer);

script.createEvent("TouchStartEvent").bind(function (eventData) {
    var pos = eventData.getTouchPosition();

    touchStartX = pos.x;
    touchStartY = pos.y;
});

script.createEvent("TouchEndEvent").bind(function (eventData) {
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

script.createEvent("KeyPressEvent").bind(function (eventData) {
    var key = eventData.key;

    if (key === 16777234) { // Left Arrow
        moveLeft();
    } else if (key === 16777236) { // Right Arrow
        moveRight();
    } else if (key === 16777235 || key === 32) { // Up Arrow and Space bar
        jump();
    } 
});
