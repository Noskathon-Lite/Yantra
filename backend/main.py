from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from g4f.client import Client  # Importing g4f client package
import os
import g4f
import numpy as np
import sys
import asyncio

