// AudioManager.js

//@input Component.AudioComponent musicAudio
//@input Component.AudioComponent collectAudio
//@input Component.AudioComponent hitAudio

function initialize() {

    playMusic();
}

function playMusic() {

    if (script.musicAudio) {
        script.musicAudio.play(-1);
    }
}

function stopMusic() {

    if (script.musicAudio) {
        script.musicAudio.stop(false);
    }
}

function playCollect() {

    if (script.collectAudio) {
        script.collectAudio.stop(false);
        script.collectAudio.play(1);
    }
}

function playHit() {

    if (script.hitAudio) {
        script.hitAudio.stop(false);
        script.hitAudio.play(1);
    }
}

script.playMusic = playMusic;
script.stopMusic = stopMusic;
script.playCollect = playCollect;
script.playHit = playHit;

script.createEvent("OnStartEvent").bind(initialize);