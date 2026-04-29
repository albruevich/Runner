// Player.js

//@input Component.ScriptComponent gameManager
//@input SceneObject targetObject
//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Component.ScriptComponent prizeSpawner
//@input SceneObject shineImage
//@input Component.Image shineImageComponent
//@input Component.ScriptComponent audioManager

var gameManager;
var targetObject;
var targetTransform;
var config;
var obstacleSpawner;
var prizeSpawner;
var shineImage;
var shineImageComponent;
var audioManager;

var currentLane = 0; // -1 = left, 0 = center, 1 = right

var moveSpeed = 20;
var jumpHeight = 30;

var jumpUpSpeed = 20;
var jumpDownSpeed = 3;
var hangTime = 0.1; // pause at the top

var jumpProgress = 0;
var hangTimer = 0;

var isJumping = false;
var isFalling = false;
var isHanging = false;

var baseY = 0;

var touchStartX = 0;
var touchStartY = 0;
var swipeThreshold = 0.08;

var pendingHitObstacle = null;

var shineTimer = 0;
var shineDuration = 0.25;
var shineStartAlpha = 1.0;

function initialize() {
    cacheReferences();

    if (!targetObject) {
        print("Target is not assigned.");
        return;
    }

    if (!config) {
        print("Config is not assigned.");
        return;
    }

    targetTransform = targetObject.getTransform();
    baseY = targetTransform.getLocalPosition().y;

    if (shineImageComponent) {
        shineStartAlpha = shineImageComponent.mainPass.baseColor.a;
    }

    if (shineImage) {
        shineImage.enabled = false;
    }
}

function cacheReferences() {
    gameManager = script.gameManager;
    targetObject = script.targetObject;
    config = script.config;
    obstacleSpawner = script.obstacleSpawner;
    prizeSpawner = script.prizeSpawner;
    shineImage = script.shineImage;
    shineImageComponent = script.shineImageComponent;
    audioManager = script.audioManager;
}

function moveLeft() {

    if (!canControlPlayer()) {
        return;
    }

    currentLane = Math.max(-1, currentLane - 1);
}

function moveRight() {

    if (!canControlPlayer()) {
        return;
    }

    currentLane = Math.min(1, currentLane + 1);
}

function jump() {

    if (!gameManager) {
        return;
    }

    gameManager.startGame();

    if (gameManager.isGameOver) {
        gameManager.restartGame();
        return;
    }

    if (!canControlPlayer() || isJumping) {
        return;
    }

    isJumping = true;
    isFalling = false;
    isHanging = false;
    jumpProgress = 0;
    hangTimer = 0;
}

function canControlPlayer() {

    if (!gameManager) {
        return false;
    }

    gameManager.startGame();

    return !gameManager.isGameOver &&
           !gameManager.isHit &&
           !gameManager.isStartPause;
}

function updatePlayer() {

    if (!gameManager || !targetTransform || !config) {
        return;
    }

    if (gameManager.isGameOver) {
        resetJumpState();
        return;
    }

    if (gameManager.isStartPause) {
        return;
    }

    var dt = getDeltaTime();
    var speedMultiplier = getGameSpeedMultiplier();
    var pos = targetTransform.getLocalPosition();

    updateMovement(pos, dt, speedMultiplier);
    updateJump(pos, dt, speedMultiplier);

    checkObstacleCollisions(pos);
    checkPrizeCollisions(pos);

    targetTransform.setLocalPosition(pos);

    updatePendingHitObstacle();
    updateShineEffect(dt);
}

function updateMovement(pos, dt, speedMultiplier) {
    var targetX = currentLane * config.laneDistance;
    pos.x = lerp(pos.x, targetX, moveSpeed * speedMultiplier * dt);
}

function updateJump(pos, dt, speedMultiplier) {

    if (isJumping) {

        if (!isHanging && !isFalling) {

            jumpProgress += dt * jumpUpSpeed * speedMultiplier;

            if (jumpProgress >= 1) {
                jumpProgress = 1;
                isHanging = true;
                hangTimer = hangTime;
            }

        } else if (isHanging) {

            hangTimer -= dt * speedMultiplier;

            if (hangTimer <= 0) {
                isHanging = false;
                isFalling = true;
            }

        } else if (isFalling) {

            jumpProgress -= dt * jumpDownSpeed * speedMultiplier;

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
}

function updatePendingHitObstacle() {

    if (pendingHitObstacle && !gameManager.isHit) {
        pendingHitObstacle.enabled = false;
        pendingHitObstacle = null;
    }
}

function lerp(a, b, t) {
    t = Math.min(Math.max(t, 0), 1);
    return a + (b - a) * t;
}

function smoothStep(t) {
    t = Math.min(Math.max(t, 0), 1);
    return t * t * (3 - 2 * t);
}

function checkObstacleCollisions(playerPos) {

    if (!obstacleSpawner) {
        return;
    }

    var obstacles = obstacleSpawner.pool;

    if (!obstacles) {
        return;
    }

    for (var i = 0; i < obstacles.length; i++) {
        var obstacle = obstacles[i];

        if (!obstacle || !obstacle.enabled) {
            continue;
        }

        var obstaclePos = obstacle.getTransform().getLocalPosition();

        var dz = Math.abs(playerPos.z - obstaclePos.z);

        var sameLane = Math.abs(playerPos.x - obstaclePos.x) < config.laneTolerance;
        var closeEnough = dz < config.collisionZDistance;

        var isUpperObstacle = obstaclePos.y > config.obstacleGroundY + 1;
        var canHitByHeight = isUpperObstacle ? isJumping : !isJumping;

        if (sameLane && closeEnough && canHitByHeight) {
            onHitObstacle(obstacle);
        }
    }
}

function checkPrizeCollisions(playerPos) {

    if (!prizeSpawner) {
        return;
    }

    var prizes = prizeSpawner.pool;

    if (!prizes) {
        return;
    }

    for (var i = 0; i < prizes.length; i++) {
        var prize = prizes[i];

        if (!prize || !prize.enabled) {
            continue;
        }

        var prizePos = prize.getTransform().getLocalPosition();

        var dz = Math.abs(playerPos.z - prizePos.z);

        var sameLane = Math.abs(playerPos.x - prizePos.x) < config.laneTolerance;
        var closeEnough = dz < config.collisionZDistance;

        var isJumpPrize = prizePos.y > config.prizeGroundY + 1;
        var canCollectByHeight = isJumpPrize ? isJumping : !isJumping;

        if (sameLane && closeEnough && canCollectByHeight) {
            onCollectPrize(prize);
        }
    }
}

function onCollectPrize(prize) {
    prize.enabled = false;

    gameManager.addScore(1);
    playShineEffect();

    if (audioManager) {
        audioManager.playCollect();
    }
}

function onHitObstacle(obstacle) {

    if (pendingHitObstacle) {
        return;
    }

    pendingHitObstacle = obstacle;

    gameManager.takeDamage();

    if (audioManager) {
        audioManager.playHit();
    }
}

function getGameSpeedMultiplier() {
    return gameManager.currentSpeed / config.startSpeed;
}

function playShineEffect() {

    shineTimer = shineDuration;

    if (shineImage) {
        shineImage.enabled = true;
    }

    setShineAlpha(shineStartAlpha);
}

function updateShineEffect(dt) {

    if (!shineImage || shineTimer <= 0) {
        return;
    }

    shineTimer -= dt;

    var alpha = shineStartAlpha * (shineTimer / shineDuration);
    setShineAlpha(alpha);

    if (shineTimer <= 0) {
        shineImage.enabled = false;
    }
}

function setShineAlpha(alpha) {

    if (!shineImageComponent) {
        return;
    }

    var color = shineImageComponent.mainPass.baseColor;
    color.a = alpha;
    shineImageComponent.mainPass.baseColor = color;
}

function resetJumpState() {
    isJumping = false;
    isFalling = false;
    isHanging = false;
    jumpProgress = 0;
    hangTimer = 0;

    var pos = targetTransform.getLocalPosition();
    pos.y = baseY;
    targetTransform.setLocalPosition(pos);
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

script.isPlayerJumping = function () {
    return isJumping;
};