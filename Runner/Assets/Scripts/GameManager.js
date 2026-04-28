// GameManager.js

//@input Component.ScriptComponent config

var hp = 0;

function initialize() {
    hp = script.config.startHp;
    script.isGameOver = false;

    print("HP: " + hp);
}

script.takeDamage = function () {
    if (script.isGameOver) {
        return;
    }

    hp--;

    print("HP: " + hp);

    if (hp <= 0) {
        gameOver();
    }
};

function gameOver() {
    script.isGameOver = true;
    print("GAME OVER");
}

script.createEvent("OnStartEvent").bind(initialize);