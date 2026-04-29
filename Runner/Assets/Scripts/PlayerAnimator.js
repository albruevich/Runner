// PlayerAnimator.js

//@input Component.ScriptComponent player
//@input Component.AnimationPlayer animationPlayer

var currentState = "";

function initialize() {
    if (!script.player) {
        print("PlayerAnimator: player is not assigned.");
        return;
    }

    if (!script.animationPlayer) {
        print("PlayerAnimator: animationPlayer is not assigned.");
        return;
    }

    playRun();
}

function updateAnimator() {
    if (!script.player || !script.animationPlayer) {
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

    script.animationPlayer.stopClip("Jump");
    script.animationPlayer.playClipAt("Run", 0);
}

function playJump() {
    if (currentState === "Jump") {
        return;
    }

    currentState = "Jump";

    script.animationPlayer.stopClip("Run");
    script.animationPlayer.playClipAt("Jump", 0);
}

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateAnimator);