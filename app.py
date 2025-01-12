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