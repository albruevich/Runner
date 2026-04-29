// PlayerAnimator.js

//@input Component.ScriptComponent player
//@input Component.ScriptComponent gameManager
//@input Component.AnimationPlayer animationPlayer

var currentState = "";

function initialize() {

    if (!script.player || !script.gameManager || !script.animationPlayer) {
        return;
    }

    playRun();
}

function updateAnimator() {

    if (!script.player || !script.gameManager || !script.animationPlayer) {
        return;
    }

    updatePlaybackSpeed();

    if (script.gameManager.isGameOver || script.gameManager.isHit || script.gameManager.isStartPause) {
        playIdle();
        return;
    }

    if (script.player.isPlayerJumping && script.player.isPlayerJumping()) {
        playJump();
    } else {
        playRun();
    }
}

function updatePlaybackSpeed() {

    var speedMultiplier = 1;

    if (script.gameManager.currentSpeed && script.gameManager.config) {
        speedMultiplier =
            script.gameManager.currentSpeed /
            script.gameManager.config.startSpeed;
    }

    speedMultiplier = clamp(speedMultiplier, 0.8, 2.5);

    setClipSpeed("Run", speedMultiplier);
    setClipSpeed("Jump", speedMultiplier);
}

function setClipSpeed(name, speed) {

    var clip = script.animationPlayer.getClip(name);

    if (clip) {
        clip.playbackSpeed = speed;
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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

script.createEvent("OnStartEvent").bind(initialize);
script.createEvent("UpdateEvent").bind(updateAnimator);