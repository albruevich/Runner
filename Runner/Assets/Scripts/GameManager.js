// GameManager.js

//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Component.ScriptComponent prizeSpawner
//@input Component.Text scoreText
//@input Component.Text gameOverText
//@input Component.ScriptComponent audioManager
//@input SceneObject playButton
//@input Component.ScriptComponent scoreScaleEffect
//@input SceneObject[] hearts

var hp = 0;
var score = 0;
var highScore = 0;
var hitTimer = 0;

var obstacleSpawnTimer = 0;
var prizeSpawnTimer = 0;

var config;
var obstacleSpawner;
var prizeSpawner;
var audioManager;
var scoreScaleEffect;
var hearts;

function initialize() {

    cacheReferences();

    hp = getMaxHp();
    score = 0;

    script.isGameOver = false;
    script.isStartPause = true;
    script.isHit = false;
    script.currentSpeed = config.startSpeed;

    obstacleSpawnTimer = 0;
    prizeSpawnTimer = 0;

    var store = global.persistentStorageSystem.store;

    if (store.has("highScore")) {
        highScore = store.getInt("highScore");
    }

    refreshUI();
}

function cacheReferences() {
    config = script.config;
    obstacleSpawner = script.obstacleSpawner;
    prizeSpawner = script.prizeSpawner;
    audioManager = script.audioManager;
    scoreScaleEffect = script.scoreScaleEffect;
    hearts = script.hearts;
}

function getMaxHp() {
    return hearts ? hearts.length : 0;
}

script.takeDamage = function () {

    if (script.isGameOver || script.isHit || script.isStartPause) {
        return;
    }

    hp--;

    script.isHit = true;
    hitTimer = 1.0;

    refreshUI();

    if (hp <= 0) {
        gameOver();
    }
};

script.restartGame = function () {

    hp = getMaxHp();
    score = 0;

    script.isGameOver = false;
    script.isHit = false;
    hitTimer = 0;
    script.currentSpeed = config.startSpeed;

    obstacleSpawnTimer = 0;
    prizeSpawnTimer = 0;

    obstacleSpawner.restartSpawner();
    prizeSpawner.restartSpawner();
    audioManager.playMusic();

    refreshUI();
};

script.addScore = function (amount) {
    score += amount;

    scoreScaleEffect.play();

    refreshUI();
};

function updateGameManager() {

    if (script.isGameOver || script.isStartPause) {
        return;
    }

    if (script.isHit) {

        hitTimer -= getDeltaTime();

        if (hitTimer <= 0) {
            script.isHit = false;
        }

        return;
    }

    updateSpeed();
    updateSpawning();
}

function updateSpeed() {

    script.currentSpeed += config.speedIncreasePerSecond * getDeltaTime();

    if (script.currentSpeed > config.maxSpeed) {
        script.currentSpeed = config.maxSpeed;
    }
}

function updateSpawning() {

    var dt = getDeltaTime();

    obstacleSpawnTimer -= dt;
    prizeSpawnTimer -= dt;

    if (obstacleSpawnTimer <= 0) {
        obstacleSpawner.spawnObstacle();
        obstacleSpawnTimer = script.getSpawnInterval(config.obstacleSpawnInterval);
    }

    if (prizeSpawnTimer <= 0) {
        prizeSpawner.spawnPrize();
        prizeSpawnTimer = script.getSpawnInterval(config.prizeSpawnInterval);
    }
}

function gameOver() {

    script.isGameOver = true;
    script.isHit = false;
    hitTimer = 0;

    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }

    audioManager.stopMusic();

    refreshUI();
}

function saveHighScore() {
    var store = global.persistentStorageSystem.store;
    store.putInt("highScore", highScore);
}

function resetHiScore() {

    highScore = 0;

    var store = global.persistentStorageSystem.store;
    store.putInt("highScore", 0);

    refreshUI();
}

function refreshUI() {

    updateHearts();

    if (script.scoreText) {
        script.scoreText.text =
            "HI   " + padScore(highScore) + "   " + padScore(score);
    }

    if (script.gameOverText) {

        if (script.isGameOver) {

            var isNewHiScore = score >= highScore && score > 0;

            script.gameOverText.text = isNewHiScore
                ? "GAME OVER\n\nNEW HI SCORE: " + padScore(highScore) + "\n\nJump to Restart"
                : "GAME OVER\n\nJump to Restart";

        } else {
            script.gameOverText.text = "";
        }
    }
}

function updateHearts() {

    if (!hearts) {
        return;
    }

    for (var i = 0; i < hearts.length; i++) {

        var heart = hearts[i];

        if (heart) {
            heart.enabled = i < hp;
        }
    }
}

function padScore(value) {
    var text = value.toString();

    while (text.length < 4) {
        text = "0" + text;
    }

    return text;
}

script.getSpawnInterval = function (baseInterval) {
    var speedRatio = script.currentSpeed / config.startSpeed;
    return baseInterval / speedRatio;
};

script.startGame = function () {

    if (!script.isStartPause) {
        return;
    }

    script.isStartPause = false;

    if (script.playButton) {
        script.playButton.enabled = false;
    }

    audioManager.playMusic();
};

script.resetHiScore = resetHiScore;

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateGameManager);

script.createEvent("TapEvent").bind(function () {
    script.startGame();
});