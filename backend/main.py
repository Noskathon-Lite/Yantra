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