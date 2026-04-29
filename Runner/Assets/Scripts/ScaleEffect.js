// ScaleEffect.js

//@input SceneObject targetObject
//@input float maxScale = 1.02
//@input float duration = 0.3

var timer = 0;
var isPlaying = false;
var startScale;

function initialize() {

    var target = getTarget();

    if (target) {
        startScale = target.getTransform().getLocalScale();
    } else {
        startScale = new vec3(1, 1, 1);
    }
}

script.play = function () {
    timer = 0;
    isPlaying = true;
};

function update() {

    if (!isPlaying) {
        return;
    }

    var target = getTarget();

    if (!target) {
        return;
    }

    timer += getDeltaTime();

    var t = timer / script.duration;

    if (t >= 1) {
        t = 1;
        isPlaying = false;
    }

    var scaleFactor;

    if (t < 0.5) {
        scaleFactor = lerp(1.0, script.maxScale, t * 2.0);
    } else {
        scaleFactor = lerp(script.maxScale, 1.0, (t - 0.5) * 2.0);
    }

    var newScale = new vec3(
        startScale.x * scaleFactor,
        startScale.y * scaleFactor,
        startScale.z * scaleFactor
    );

    target.getTransform().setLocalScale(newScale);
}

function getTarget() {

    if (script.targetObject) {
        return script.targetObject;
    }

    return script.getSceneObject();
}

function lerp(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return a + (b - a) * t;
}

initialize();
script.createEvent("UpdateEvent").bind(update);