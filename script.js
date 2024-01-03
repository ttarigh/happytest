const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => {
      video.srcObject = stream;
      // video.style.display = 'none'; // Hide the video initially
    },
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    console.log();
    const firstDetection = detections[0];

    if (firstDetection && firstDetection.expressions) {
      let happyDetected = false;

      // Iterate over the emotions
      for (const emotion in firstDetection.expressions) {
        const emotionValue = firstDetection.expressions[emotion];

        // Check if the value is between 0.8 and 1
        if (emotionValue > 0.8 && emotionValue < 1) {
          // Print the emotion name
          console.log("Emotion:", emotion);
        }
        // Check if the value is between 0.8 and 1 for happiness
        if (emotion === "happy" && emotionValue > 0.8 && emotionValue < 1) {
          happyDetected = true;
          break;
        }
      }

      // Redirect to www.tina.zone if happy is detected
      if (happyDetected) {
        window.location.href = "https://www.tina.zone";
      } else {
        // Toggle the visibility of the video based on happiness detection
        // video.style.display = 'none';
      }
    }
  }, 100);
});
