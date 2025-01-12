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
