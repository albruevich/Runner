// GameManager.js

//@input Component.ScriptComponent config
//@input Component.ScriptComponent spawner
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

    var store = global.persistentStorageSystem.store;

    if (store.has("highScore")) {
        highScore = store.getInt("highScore");
    }

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

    if (script.spawner && script.spawner.restartSpawner) {
        script.spawner.restartSpawner();
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
        script.gameOverText.text = script.isGameOver
            ? "GAME OVER\n\nJump to Restart"
            : "";
    }
}

function padScore(value) {
    var text = value.toString();

    while (text.length < 4) {
        text = "0" + text;
    }

    return text;
}

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateGameManager);