// PlayerAnimator.js

//@input Component.ScriptComponent player
//@input Component.ScriptComponent gameManager
//@input Component.AnimationPlayer animationPlayer

var currentState = "";

function initialize() {

    if (!script.player) {
        print("PlayerAnimator: player is not assigned.");
        return;
    }

    if (!script.gameManager) {
        print("PlayerAnimator: gameManager is not assigned.");
        return;
    }

    if (!script.animationPlayer) {
        print("PlayerAnimator: animationPlayer is not assigned.");
        return;
    }

    playRun();
}

function updateAnimator() {

    if (!script.player || !script.gameManager || !script.animationPlayer) {
        return;
    }

    if (script.gameManager.isGameOver || script.gameManager.isHit) {
        playIdle();
        return;
    }

    if (script.player.isPlayerJumping && script.player.isPlayerJumping()) {
        playJump();
    } else {
        playRun();
    }
}

function playRun() {

    if (currentState === "Run") {
        return;
    }

    currentState = "Run";

    stopAll();
    script.animationPlayer.playClipAt("Run", 0);
}

function playJump() {

    if (currentState === "Jump") {
        return;
    }

    currentState = "Jump";

    stopAll();
    script.animationPlayer.playClipAt("Jump", 0);
}

function playIdle() {

    if (currentState === "Idle") {
        return;
    }

    currentState = "Idle";

    stopAll();
    script.animationPlayer.playClipAt("Idle", 0);
}

function stopAll() {

    script.animationPlayer.stopClip("Run");
    script.animationPlayer.stopClip("Jump");
    script.animationPlayer.stopClip("Idle");
}

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateAnimator);