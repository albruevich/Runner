// GameManager.js

//@input Component.ScriptComponent config
//@input Component.ScriptComponent obstacleSpawner
//@input Component.ScriptComponent prizeSpawner
//@input Component.Text hpText
//@input Component.Text scoreText
//@input Component.Text gameOverText

var hp = 0;
var score = 0;
var highScore = 0;
var hitTimer = 0;

function initialize() {

    hp = script.config.startHp;
    score = 0;

    script.isGameOver = false;
    script.isHit = false;
    script.currentSpeed = script.config.startSpeed;

    var store = global.persistentStorageSystem.store;

    if (store.has("highScore")) {
        highScore = store.getInt("highScore");
    }

    // resetHiScore();

    refreshUI();
}

script.takeDamage = function () {

    if (script.isGameOver || script.isHit) {
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

    hp = script.config.startHp;
    score = 0;

    script.isGameOver = false;
    script.isHit = false;
    hitTimer = 0;
    script.currentSpeed = script.config.startSpeed;

    if (script.obstacleSpawner && script.obstacleSpawner.restartSpawner) {
        script.obstacleSpawner.restartSpawner();
    }

    if (script.prizeSpawner && script.prizeSpawner.restartSpawner) {
        script.prizeSpawner.restartSpawner();
    }

    refreshUI();
};

script.addScore = function (amount) {
    score += amount;

    refreshUI();
};

function saveHighScore() {
    var store = global.persistentStorageSystem.store;

    store.putInt("highScore", highScore);
}

function resetHiScore() {

    highScore = 0;

    var store = global.persistentStorageSystem.store;
    store.putInt("highScore", 0);

    refreshUI();
};

function gameOver() {
    script.isGameOver = true;
    script.isHit = false;
    hitTimer = 0;

    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }

    refreshUI();
}

function updateGameManager() {

    if (script.isGameOver) {
        return;
    }

    if (script.isHit) {

        hitTimer -= getDeltaTime();

        if (hitTimer <= 0) {
            script.isHit = false;
        }
    }

    if (!script.isGameOver && !script.isHit) {
        script.currentSpeed += script.config.speedIncreasePerSecond * getDeltaTime();

        if (script.currentSpeed > script.config.maxSpeed) {
            script.currentSpeed = script.config.maxSpeed;
        }
    }
}

function refreshUI() {

    if (script.hpText) {
        script.hpText.text = "HP: " + hp;
    }

    if (script.scoreText) {
        script.scoreText.text =
            "HI   " + padScore(highScore) + "   " + padScore(score);
    }

    if (script.gameOverText) {

        if (script.isGameOver) {

            var isNewHiScore = score >= highScore && score > 0;

            script.gameOverText.text = isNewHiScore
                ? "GAME OVER\n\nNEW HI SCORE: " + highScore + "\n\nJump to Restart"
                : "GAME OVER\n\nJump to Restart";

        } else {
            script.gameOverText.text = "";
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
    var speedRatio = script.currentSpeed / script.config.startSpeed;

    return baseInterval / speedRatio;
};

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateGameManager);