import React, { useRef, useState, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import axios from 'axios';
import { Container, Typography, Box, Button, Grid, Card, CardMedia, Paper, CardContent,Modal } from "@mui/material";
import bicep from "/bicep.mp4";
import throttle from 'lodash.throttle';
import { use } from "react";
import { set } from "lodash";

const ExercisePose = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState("Press Start to begin");
  const [camera, setCamera] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0); // To track last feedback time
  const lastFeedbackTimeRef = useRef(Date.now()); // Using ref instead of state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [progressData, setProgressData] = useState({}); // Data to show in the modal
  // Using the Node.js backend URL
const nodeBackendUrl = import.meta.env.VITE_API_NODE_BACKEND;

// Using the Python backend URL
const pythonBackendUrl = import.meta.env.VITE_API_PYTHON_BACKEND;

// const feedPyhton="https://feedback-64zm.onrender.com"
const feedPyhton="http://localhost:3000"
useEffect(() => {
  let cameraInstance;
  let timerInterval;

  const loadPoseLibrary = async () => {
    try {
      // Load the Mediapipe Pose library using a script tag
      const poseScript = document.createElement("script");
      poseScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
      poseScript.async = true;

      const cameraScript = document.createElement("script");
      cameraScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
      cameraScript.async = true;

      // Load both Pose and Camera scripts
      document.body.appendChild(poseScript);
      document.body.appendChild(cameraScript);

      poseScript.onload = () => {
        const pose = new window.Pose({
          locateFile: (file) => {
            if (file.endsWith(".tflite")) {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
            if (file.endsWith(".data")) {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!results.poseLandmarks) {
            setFeedback("No person detected");
            return;
          }

          const canvasElement = canvasRef.current;
          const canvasCtx = canvasElement.getContext("2d");

          // Clear the canvas
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          // Call function to draw pose landmarks (arm positions)
          drawArmPose(results, canvasCtx);

          // Process the exercise results
          calculateExercise(results);
        });

        cameraScript.onload = () => {
          if (isCameraActive && !isPaused) {
            if (videoRef.current) {
              // Now we can reference window.Camera (loaded from the script)
              cameraInstance = new window.Camera(videoRef.current, {
                onFrame: async () => {
                  await pose.send({ image: videoRef.current });
                },
                width: 640,
                height: 480,
              });
              cameraInstance.start();
              setCamera(cameraInstance);
              setFeedback("Camera started. Begin your exercise.");

              // Start timer for exercise
              timerInterval = setInterval(() => setTimer((prev) => prev + 1), 1000);
            }
          } else if (cameraInstance) {
            cameraInstance.stop();
            clearInterval(timerInterval);
          }
        };
      };

      poseScript.onerror = () => {
        setFeedback("Failed to load Mediapipe Pose library");
      };

      cameraScript.onerror = () => {
        setFeedback("Failed to load Mediapipe Camera library");
      };
    } catch (error) {
      console.error("Error loading the Mediapipe Pose library:", error);
      setFeedback(error?.message || "Error initializing Pose detection."); // Safe access to 'message'
    }
  };

  loadPoseLibrary();

  // Clean up when the component unmounts or dependencies change
  return () => {
    if (cameraInstance) {
      cameraInstance.stop();
    }
    clearInterval(timerInterval);
  };
}, [isCameraActive, isPaused]); // Re-run when camera state changes

 
// Move throttle outside of the function to make it persistent
const throttledSendFeedbackData = throttle(async (angleData, currentTime) => {
  await sendFeedbackData(angleData);
  lastFeedbackTimeRef.current = currentTime; // Update last feedback time after sending
}, 10000);  // Throttle calls to a max of 1 every 10 seconds

const calculateExercise = async (results) => {
  const landmarks = results.poseLandmarks;
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];

  // Calculate angles for both arms
  const leftShoulderAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightShoulderAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const leftElbowAngle = calculateAngle(leftElbow, leftWrist, leftShoulder);
  const rightElbowAngle = calculateAngle(rightElbow, rightWrist, rightShoulder);
  const leftWristAngle = calculateAngle(leftWrist, leftElbow, leftShoulder);
  const rightWristAngle = calculateAngle(rightWrist, rightElbow, rightShoulder);

  // Check if the angles are within acceptable range for a correct bicep curl
  const idealElbowAngle = 90; // Assuming 90 degrees is the ideal for a full bicep curl
  const tolerance = 10; // ±10 degrees tolerance

  const isLeftCurlCorrect = leftElbowAngle >= idealElbowAngle - tolerance && leftElbowAngle <= idealElbowAngle + tolerance;
  const isRightCurlCorrect = rightElbowAngle >= idealElbowAngle - tolerance && rightElbowAngle <= idealElbowAngle + tolerance;

  // Get the current time
  const currentTime = Date.now();
  const timeSinceLastFeedback = currentTime - lastFeedbackTimeRef.current; // Using ref value instead of state

  // Rep counting based on current angle
  const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const isLeftCurl = leftWrist.y < rightWrist.y;
  const currentAngle = isLeftCurl ? leftAngle : rightAngle;

  await sendRepData(currentAngle);

  // Feedback only after 10 seconds or more
  if (isLeftCurlCorrect && isRightCurlCorrect) {
    setFeedback("You are doing it right, keep going!");
  } else if (timeSinceLastFeedback >= 10000) { // Throttle feedback every 10 seconds
    const angleData = {
      leftShoulderAngle: leftShoulderAngle,
      rightShoulderAngle: rightShoulderAngle,
      leftElbowAngle: leftElbowAngle,
      rightElbowAngle: rightElbowAngle,
      leftWristAngle: leftWristAngle,
      rightWristAngle: rightWristAngle,
    };

    // Use the throttled feedback function
    throttledSendFeedbackData(angleData, currentTime);
  }
};


  const sendFeedbackData = async (angleData) => {
    try {
      console.log(angleData)
      const response = await axios.post(`${feedPyhton}/api/get_feedback`, angleData);
      
      setFeedback(response.data);
      // setFeedback("Feedback sent successfully");
      console.log(response.data)
    } catch (error) {
      console.error('Error sending feedback data:', error);
    }
  };

  const sendRepData = async (currentAngle) => {
    try {
      const response = await axios.post(`${pythonBackendUrl}/api/count_reps`, {
        angle: currentAngle,  // Send the angle for counting reps
      });
      setRepCount(response.data.reps); // Update rep count from response
      
    } catch (error) {
      console.error('Error sending rep data:', error);
    }
  };

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const drawArmPose = (results, canvasCtx) => {
    const poseLandmarks = results.poseLandmarks;
    const armLandmarks = [11, 13, 15, 12, 14, 16]; // Left and Right shoulder, elbow, wrist

    canvasCtx.save();
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = "lime"; // Color for the connecting lines

    // Draw lines connecting shoulder -> elbow -> wrist (left and right arms)
    const drawLine = (start, end) => {
      canvasCtx.beginPath();
      canvasCtx.moveTo(poseLandmarks[start].x * 640, poseLandmarks[start].y * 480); // Move to the start point
      canvasCtx.lineTo(poseLandmarks[end].x * 640, poseLandmarks[end].y * 480);     // Draw line to the end point
      canvasCtx.stroke();
    };

    // Left arm: shoulder (11) -> elbow (13) -> wrist (15)
    drawLine(11, 13); // Shoulder to Elbow (left)
    drawLine(13, 15); // Elbow to Wrist (left)

    // Right arm: shoulder (12) -> elbow (14) -> wrist (16)
    drawLine(12, 14); // Shoulder to Elbow (right)
    drawLine(14, 16); // Elbow to Wrist (right)

    // Draw the line connecting the two shoulders (left shoulder (11) -> right shoulder (12))
    drawLine(11, 12);

    // Draw circles for each landmark (elbow, wrist, shoulder)
    armLandmarks.forEach((index) => {
      const landmark = poseLandmarks[index];
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * 640, landmark.y * 480, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "aqua"; // Color for the dots
      canvasCtx.fill();
    });

    canvasCtx.restore();
  };

  const handleStartCamera = () => {
    setIsCameraActive(true);
    setTimer(0);
    setRepCount(0);
    setFeedback("Get ready to start!");
    // Hit the start API to reset the counter and allow counting to restart
      const response = axios.post(`${pythonBackendUrl}/api/start`);
      console.log(response.data.message); // Log the message from the API response
  };

  const handleStopCamera = async () => {
    if (camera) {
      camera.stop();  // Stop the camera instance
    }
    setIsCameraActive(false); // Disable camera
    setIsPaused(false);       // Reset the pause state
    setTimer(0);              // Reset the timer
    setRepCount(0);           // Reset the rep count
    setFeedback("Exercise stopped. All parameters reset.");
  
    // Hit the stop API to stop the rep counter and reset the counter
    try {
      const response1 = await axios.post(`${pythonBackendUrl}/api/stop`);
      const userEmail = localStorage.getItem("email"); // Assuming email is stored in localStorage
      console.log(userEmail)
      const response = await axios.post("http://localhost:8000/api/v1/progress/update", {
        userEmail:userEmail,
        exerciseType: "Bicep Curls",
        repsToday: repCount,
        timeToday: timer,
      });

      // Set progress data and show modal
      setProgressData({
        repsToday: repCount,
        timeToday: timer,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error stopping the rep counter:', error);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handlePauseCamera = async () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    setFeedback(newPauseState ? "Paused. Resume to continue." : "Resumed!");
  
    // Hit the pause or resume API based on the new state
    try {
      const apiEndpoint = newPauseState ? `${pythonBackendUrl}/api/pause` : `${pythonBackendUrl}/api/resume`;
      const response = await axios.post(apiEndpoint);
      console.log(response.data.message); // Log the message from the API response
  
      if (!newPauseState && camera) {
        camera.start();  // Ensure the camera restarts when resuming
      }
    } catch (error) {
      console.error('Error toggling pause state:', error);
    }
  };
  
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom>
        Bicep Tracker
      </Typography>

      <Grid container spacing={2}>
        {/* Camera feed with skeleton */}
        <Grid item xs={7}>
          <Box position="relative" width="640px" height="480px">
            {/* Video Feed */}
            <video ref={videoRef} style={{ position: "absolute", width: "640px", height: "480px", zIndex: 1 }} playsInline />
            {/* Canvas Overlay */}
            <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", zIndex: 2 }} />
          </Box>
        </Grid>
{/* Modal for today's progress */}
<Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "white", p: 4, boxShadow: 24, borderRadius: 2 }}>
          <Typography variant="h6">Today's Progress</Typography>
          <Typography>Exercise Name: Bicep Curls</Typography>
          <Typography>Difficulty: Easy</Typography>
          <Typography>Reps Completed: {progressData.repsToday}</Typography>
          <Typography>Duration: {progressData.timeToday} seconds</Typography>
          <Button variant="contained" onClick={handleCloseModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
        {/* Right side: Recommended card and tutorial video */}
        <Grid item xs={5}>
          {/* Recommended Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Recommended</Typography>
              <Typography>Difficulty: Easy</Typography>
              <Typography>Duration: {timer} seconds</Typography>
              <Typography>Reps: {repCount}</Typography>
              <Typography>Feedback: {feedback}</Typography>
              <Button onClick={handleStartCamera} variant="contained" color="primary" sx={{ mr: 2 }} disabled={isCameraActive}>
                Start
              </Button>

              <Button
                onClick={handlePauseCamera}
                variant="contained"
                color="warning"
                sx={{ mr: 2 }}
                style={{ display: isCameraActive ? 'inline-block' : 'none' }}  // Show Pause/Resume only when the camera is active
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>

              <Button
                onClick={handleStopCamera}
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                style={{ display: isCameraActive || isPaused ? 'inline-block' : 'none' }}  // Show Stop when camera is active or paused
              >
                Stop
              </Button>
            </CardContent>
          </Card>

          {/* Tutorial Video */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tutorial Video</Typography>
            <CardMedia component="video" controls src={bicep} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExercisePose;