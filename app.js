const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const canvasContext = canvasElement.getContext('2d');

let net;

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true},
            stream => {
                webcamElement.srcObject = stream;
                webcamElement.addEventListener('loadeddata', resolve, false);
            },
            error => reject());
    } else {
        reject();
    }
  });
}

async function loadModel() {
    net = await cocoSsd.load();  // Here's the change: using cocoSsd to load the model
}

async function detectObjects() {
    const predictions = await net.detect(webcamElement);

    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    let detectedItemsList = '';

    for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        canvasContext.strokeStyle = "#00FF00";
        canvasContext.lineWidth = 4;
        canvasContext.strokeRect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
        canvasContext.font = "20px Arial";
        canvasContext.fillStyle = "#00FF00";
        canvasContext.fillText(prediction.class + ": " + Math.round(prediction.score * 100) + "%", prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 20);

        // Add detected items to the list, avoiding duplicates
        if (!detectedItemsList.includes(prediction.class)) {
            detectedItemsList += prediction.class + ", ";
        }
    }

    // Update the detected-items div
    document.getElementById('detected-items').textContent = "Detected items: " + detectedItemsList;

    requestAnimationFrame(detectObjects);
}

async function bindPage() {
    await setupWebcam();
    await loadModel();
    detectObjects();
}

window.onload = bindPage;
