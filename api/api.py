import time
from flask import Flask, jsonify, request
import requests

app = Flask(__name__)
FOOD_DATA_KEY = "gDFDTxNYNizmuW1L5zih2vrgZftDghemk5RRgdCe" #ABSTRACT THIS LATER


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/getfood')
def get_food_info():
  print('DEBUG: Requested barcode data')
  query = request.args.get('barcode', 'N/A')
  if query == 'N/A':
    query = request.args.get('search', 'N/A')
    page = request.args.get('page', '1')

  try:
    response = requests.get(f'https://api.nal.usda.gov/fdc/v1/foods/search?query={ query }&pageSize=50&pageNumber={ page }&api_key={ FOOD_DATA_KEY }')
    # Raises an HTTPError if the HTTP request returned an unsuccessful status code
    response.raise_for_status()
    data = response.json()
  except requests.exceptions.HTTPError as http_err:
    return jsonify({'error': f'HTTP error occurred: {http_err}'}), 500
  except Exception as err:
    return jsonify({'error': f'Other error occurred: {err}'}), 500

  print(f'DEBUG: Sending response {data}')
  return data