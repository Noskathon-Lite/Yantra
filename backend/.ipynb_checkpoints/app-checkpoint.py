from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from g4f.client import Client  # Importing g4f client package
import os
import numpy as np
import sys
import asyncio

# This is needed for Windows compatibility with aiodns
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
app = Flask(__name__)
# Enable CORS for all routes and all domains
CORS(app, resources={r"/*": {"origins": "*"}})

client = Client()

# List of full-body physiotherapy exercises and their descriptions
exercise_details = {
    'Push-ups': 'An exercise to strengthen the upper body, particularly the chest and triceps.',
    'Squats': 'A lower body exercise that targets the thighs, hips, and buttocks.',
    'Lunges': 'An exercise focusing on the legs, enhancing strength and balance.',
    'Plank': 'A core-strengthening exercise that also works the shoulders and back.',
    'Bridges': 'Targets the glutes and lower back while improving core stability.',
    'Clamshells': 'Strengthens the hip muscles and improves hip stability.',
    'Bird Dogs': 'Enhances balance and coordination while working on core stability.',
    'Dead Bugs': 'Strengthens the core while focusing on coordination between limbs.',
    'Shoulder Press': 'An exercise to build shoulder and upper arm strength.',
    'Bicep Curls': 'Strengthens the biceps and improves arm aesthetics.',
    'Tricep Dips': 'Targets the triceps, helping to tone and strengthen the arms.',
    'Calf Raises': 'Focuses on strengthening the calf muscles.',
    'Seated Row': 'Targets the back muscles, improving posture and strength.',
    'Wall Angels': 'Improves shoulder mobility and posture.',
    'Chest Stretch': 'A flexibility exercise for the chest and shoulders.',
    'Hamstring Stretch': 'Stretches the hamstring muscles to enhance flexibility.',
    'Quadriceps Stretch': 'Stretches the quadriceps for improved flexibility.',
    'Hip Flexor Stretch': 'Stretches the hip flexors to improve range of motion.',
    'Spinal Twist': 'Enhances spinal mobility and flexibility.',
    'Side Lunges': 'Strengthens the inner thighs and improves balance.',
    'Glute Bridges': 'Focuses on the glutes and lower back for better stability.',
    'Mountain Climbers': 'A full-body exercise that increases heart rate and builds endurance.',
    'Leg Raises': 'Strengthens the lower abdominal muscles.',
    'Standing Balance': 'Improves balance and stability through weight shifting.',
    'Side Plank': 'Strengthens the oblique muscles and stabilizes the core.',
    'Torso Rotation': 'Enhances core flexibility and stability.',
    'Wrist Flexor Stretch': 'Stretches the wrist and forearm muscles.',
    'Ankle Circles': 'Improves ankle mobility and flexibility.',
    'T-Pose Exercise': 'Strengthens the upper back and shoulders.',
    'Knee to Chest Stretch': 'Stretches the lower back and glutes.',
    'Pigeon Pose': 'A yoga pose that stretches the hips and glutes.'
}