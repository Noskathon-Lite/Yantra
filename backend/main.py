from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from g4f.client import Client  # Importing g4f client package
import os
import g4f
import numpy as np
import sys
import asyncio

# Ensure compatibility with aiodns on Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all domains

client = Client()

angle_history = []

def calculate_average_angle(history, key):
    """
    Calculate the average value of a specific angle key from the history.
    :param history: List of dictionaries containing angle data.
    :param key: Key to calculate the average for.
    :return: Average value of the specified key.
    """
    return sum(entry[key] for entry in history) / len(history)

def generate_feedback(history):
    """
    Generate feedback for bicep curl form based on angle history using g4f.
    :param history: List of dictionaries containing angle data.
    :return: Feedback string for the user.
    """
    if not history:
        return "No movement detected."

    try:
        # Calculate average angles for relevant joints
        avg_angles = {
            "leftShoulderAngle": calculate_average_angle(history, "leftShoulderAngle"),
            "rightShoulderAngle": calculate_average_angle(history, "rightShoulderAngle"),
            "leftElbowAngle": calculate_average_angle(history, "leftElbowAngle"),
            "rightElbowAngle": calculate_average_angle(history, "rightElbowAngle"),
            "leftWristAngle": calculate_average_angle(history, "leftWristAngle"),
            "rightWristAngle": calculate_average_angle(history, "rightWristAngle"),
        }

        # Prepare the input for GPT
        user_input = ", ".join(
            f"Average {key}: {value:.2f} degrees" for key, value in avg_angles.items()
        )
          # Prompt for GPT
        prompt = (
            f"You are a fitness assistant. Evaluate the user's bicep curl form based on the following data: {user_input}. "
            "Provide specific feedback on their posture and form in simple 10-15 words.Proper and simple english"
        )

    #    # streamed completion
        response = g4f.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
        print(response)
        for message in response:
            print(message, flush=True, end='')
            return response
        
        
        
