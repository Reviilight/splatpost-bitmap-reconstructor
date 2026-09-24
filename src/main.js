import { reconstructBitmap } from "./reconstructor.js";

const canvasOG = document.getElementById("canvas-og");
const canvasOGContext = canvasOG.getContext("2d", { willReadFrequently: true });

const canvasRC = document.getElementById("canvas-rc");
const canvasRCContext = canvasRC.getContext("2d");

const downloadBtn = document.getElementById("download-btn");

const noticeWrapper = document.getElementById("notice-wrapper");

const threshold = document.getElementById("threshold");
const thresholdValueHTML = document.getElementById("threshold-value");
const thresholdResetBtn = document.getElementById("threshold-reset-btn");
const THRESHOLD_DEFAULT_VALUE = 128;
let thresholdValue = THRESHOLD_DEFAULT_VALUE;

threshold.oninput = function () {
    thresholdValue = this.value;
    thresholdValueHTML.textContent = this.value;
    drawRCImage(processImage());
}

thresholdResetBtn.onclick = function () {
    thresholdValue = THRESHOLD_DEFAULT_VALUE;
    threshold.value = THRESHOLD_DEFAULT_VALUE;
    thresholdValueHTML.textContent = THRESHOLD_DEFAULT_VALUE;
    drawRCImage(processImage());
}

downloadBtn.onclick = function () {
    const imageURI = canvasRC.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURI;

    // TODO: use original filename
    link.download = "reconstructed_splatpost.png";

    link.click();
}

document.getElementById("og-image").onchange = function (e) {
    const img = new Image();
    img.onload = onImageLoad;
    img.onerror = showNotAnImageError;
    img.src = URL.createObjectURL(this.files[0]);
};

function onImageLoad() {
    URL.revokeObjectURL(this.src);
    clearAllNotices();

    if (this.width / 16 * 9 !== this.height) {
        showWrongAspectRatioWarning();
    }

    if (this.width % 320 !== 0) {
        showNotIntegerScaleWarning();
    }

    if (Math.floor(this.width / 320) < 1) {
        showSmallScaleError();
    } else if (Math.floor(this.width / 320) <= 2) {
        showSmallScaleWarning();
    }

    drawOGImage(this);
    drawRCImage(processImage());
}

function drawOGImage(img) {
    canvasOG.width = img.width;
    canvasOG.height = img.height;
    canvasOGContext.drawImage(img, 0, 0);
}

function drawRCImage(imageData) {
    canvasRC.width = imageData.width;
    canvasRC.height = imageData.height;
    canvasRCContext.putImageData(imageData, 0, 0);
}

function processImage() {
    const imageData = canvasOGContext.getImageData(0, 0, canvasOG.width, canvasOG.height);
    return reconstructBitmap(imageData, thresholdValue);
}

const NoticeType = Object.freeze({
    WARNING: "WARNING",
    ERROR: "ERROR",
});

function showNotAnImageError() {
    clearAllNotices();
    addNotice("the loaded file is not an image... ￣へ￣", NoticeType.ERROR);
}

function showSmallScaleWarning() {
    addNotice("the loaded image is small. The result might be imperfect ╯︿╰", NoticeType.WARNING);
}

function showSmallScaleError() {
    addNotice("the loaded image is too small... ╮(╯▽╰)╭", NoticeType.ERROR);
}

function showWrongAspectRatioWarning() {
    addNotice("the loaded image's dimensions are not 16:9... >_<", NoticeType.WARNING);
}

function showNotIntegerScaleWarning() {
    addNotice("the loaded image's dimensions are not supported... >_<", NoticeType.WARNING);
}

function addNotice(text, type) {
    if (type === NoticeType.WARNING) {
        noticeWrapper.innerHTML += '<p class="notice notice-warning">WARNING: ' + text + "</p>";
    } else if (type === NoticeType.ERROR) {
        noticeWrapper.innerHTML += '<p class="notice notice-error">ERROR: ' + text + "</p>";
    } else {
        console.error(`The notice type "${type}" is not supported.`);
    }
}

function clearAllNotices() {
    noticeWrapper.innerHTML = "";
}