// GameManager.js

//@input Component.ScriptComponent config
//@input  Component.ScriptComponent spawner

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

script.restartGame = function () {

    hp = script.config.startHp;
    script.isGameOver = false;

    if (script.spawner && script.spawner.restartSpawner) {
        script.spawner.restartSpawner();
    }
};

script.createEvent("OnStartEvent").bind(initialize);