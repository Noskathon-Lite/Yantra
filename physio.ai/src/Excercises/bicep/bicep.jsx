import React, { useRef, useState, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import axios from 'axios';
import { Container, Typography, Box, Button, Grid, Card, CardMedia, Paper, CardContent } from "@mui/material";
import bicep from "/bicep.mp4";
import throttle from 'lodash.throttle';

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


  // Using the Node.js backend URL
const nodeBackendUrl = import.meta.env.VITE_API_NODE_BACKEND;

// Using the Python backend URL
const pythonBackendUrl = import.meta.env.VITE_API_PYTHON_BACKEND;

const feedPyhton="https://feedback-64zm.onrender.com"
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