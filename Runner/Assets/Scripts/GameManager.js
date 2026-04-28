// GameManager.js

//@input Component.ScriptComponent config
//@input Component.ScriptComponent spawner
//@input Component.Text hpText
//@input Component.Text scoreText
//@input Component.Text gameOverText

var hp = 0;
var score = 0;

function initialize() {
    hp = script.config.startHp;
    score = 0;
    script.isGameOver = false;

    refreshUI();
}

script.takeDamage = function () {
    if (script.isGameOver) {
        return;
    }

    hp--;

    refreshUI();

    if (hp <= 0) {
        gameOver();
    }
};

script.restartGame = function () {
    hp = script.config.startHp;
    score = 0;
    script.isGameOver = false;

    if (script.spawner && script.spawner.restartSpawner) {
        script.spawner.restartSpawner();
    }

    refreshUI();
};

script.addScore = function (amount) {
    score += amount;
    refreshUI();
};

function gameOver() {
    script.isGameOver = true;
    refreshUI();
}

function refreshUI() {

    if (script.hpText) {
        script.hpText.text = "HP: " + hp;
    }

    if (script.scoreText) {
        script.scoreText.text = "Score: " + score;
    }

    if (script.gameOverText) {
        script.gameOverText.text = script.isGameOver
            ? "GAME OVER\n\nJump to Restart"
            : "";
    }
}

script.createEvent("OnStartEvent").bind(initialize);