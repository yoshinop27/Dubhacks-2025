from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import boto3, json
from datetime import date
from botocore.exceptions import ClientError
import requests
import time

app = Flask(__name__)
CORS(app)
FOOD_DATA_KEY = "ObAd8jFsex3BZhX7HtE4Ax4KApFezjSkymZdLSH9" #Replace with actual key

# Initialize AWS Clients
s3 = boto3.client('s3')
bedrock = boto3.client(service_name='bedrock-runtime')
BUCKET_NAME = 'userfridge1'

def get_user_key(user_id):
    return f"{user_id}.json"

def load_data_from_s3(user_id):
    key = get_user_key(user_id)
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        return json.loads(response['Body'].read())
    except s3.exceptions.NoSuchKey:
        return {"items": []}

def save_data_to_s3(user_id, data):
    key = get_user_key(user_id)
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(data),
        ContentType='application/json'
    )

def get_meal_suggestion_from_bedrock(items):
    """
    Generates a meal suggestion based on a list of items using AWS Bedrock.
    This example uses the Anthropic Claude model.
    """
    # Filter for items that are not expired
    today = date.today()
    valid_items = [
        item['name'] for item in items
        if item.get('expiration_date') and date.fromisoformat(item['expiration_date'].split('T')[0]) >= today
    ]

    if not valid_items:
        return "Your fridge seems to be empty or all items are expired. Add some fresh items to get a meal suggestion!"

    item_list_str = ", ".join(valid_items)

    # Construct the prompt for the model
    prompt = f"""You are a helpful chef. Based on these ingredients: {item_list_str}, suggest a simple recipe. Provide a name for the recipe, a list of ingredients, and step-by-step instructions."""

    body = json.dumps({
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "max_tokens": 500,
        "temperature": 0.7,
    })

    try:
        modelId = 'deepseek.v3-v1:0'
        response = bedrock.invoke_model(body=body, modelId=modelId, contentType='application/json', accept='application/json')
        response_body = json.loads(response.get('body').read())
        suggestion = response_body.get('choices')[0].get('message').get('content')
        print(response_body)
        print(suggestion)

        return suggestion

    except ClientError as e:
        if e.response['Error']['Code'] == 'AccessDeniedException':
            print(f"ERROR: Access denied to Bedrock. Details: {e}")
            return "Error: The application is not configured with the correct permissions to access the AI model. Please check the IAM policy."
        else:
            raise e

# ------------------- ROUTES -------------------

@app.route('/api/init', methods=['POST'])
def init_user():
    """Initialize a user with a provided userID and optional list of items."""
    body = request.json or {}
    user_id = body.get("user_id")
    items = body.get("items", [])

    if not user_id:
        return jsonify({"message": "user_id is required"}), 400

    data = {"user_id": user_id, "items": []}

    for i, item in enumerate(items, start=1):
        # Validate essential fields
        if "name" in item and "expiration_date" in item:
            data["items"].append({
                "id": i,
                "name": item.get("name"),
                "expiration_date": item.get("expiration_date"),
                "nutritionfact": item.get("nutritionfact", ""),
                "quantities": item.get("quantities", 0),
                "serving_count": item.get("serving_count", 0),
                "serving_size": item.get("serving_size", "")
            })

    save_data_to_s3(user_id, data)
    return jsonify({"message": "User initialized", "user_id": user_id, "data": data}), 201


@app.route('/api/items/<string:user_id>', methods=['GET'])
def get_items(user_id):
    """Retrieve all items for a user."""
    data = load_data_from_s3(user_id)
    return jsonify(data)


@app.route('/api/items/<string:user_id>/<int:item_id>', methods=['GET'])
def get_item(user_id, item_id):
    """Retrieve a single item for a user by ID."""
    data = load_data_from_s3(user_id)
    item = next((item for item in data['items'] if item['id'] == item_id), None)
    if item:
        return jsonify(item)
    return jsonify({"message": "Item not found"}), 404


@app.route('/api/items/<string:user_id>/<int:item_id>', methods=['DELETE'])
def delete_item(user_id, item_id):
    """Delete an item from a user's fridge by ID."""
    data = load_data_from_s3(user_id)
    item_to_delete = next((item for item in data['items'] if item['id'] == item_id), None)

    if item_to_delete:
        data['items'] = [item for item in data['items'] if item['id'] != item_id]
        save_data_to_s3(user_id, data)
        return jsonify({"message": "Item deleted"}), 200
    return jsonify({"message": "Item not found"}), 404


@app.route('/api/items/<string:user_id>', methods=['POST'])
def add_item(user_id):
    """Add an item to the user's fridge."""
    new_item = request.json
    data = load_data_from_s3(user_id)

    if new_item and 'name' in new_item and 'expiration_date' in new_item:
        # Use a more robust ID generation method to avoid duplicates
        max_id = max([item['id'] for item in data['items']]) if data['items'] else 0
        new_item['id'] = max_id + 1

        new_item['nutritionfact'] = new_item.get("nutritionfact", "")
        new_item['quantities'] = new_item.get("quantities", 0)
        new_item['serving_count'] = new_item.get("serving_count", 0)
        new_item['serving_size'] = new_item.get("serving_size", "")

        data['items'].append(new_item)
        save_data_to_s3(user_id, data)
        return jsonify(new_item), 201
    return jsonify({"message": "Invalid item data"}), 400

@app.route('/api/meal-suggestion/<string:user_id>', methods=['GET'])
def get_meal_suggestion(user_id):
    """Generate a meal suggestion for a user based on their fridge items."""
    fridge_data = load_data_from_s3(user_id)
    items = fridge_data.get("items", [])

    suggestion = get_meal_suggestion_from_bedrock(items)
    return jsonify({"suggestion": suggestion})

@app.route('/api/getfood', methods=['GET'])
def get_food_info():
  print('DEBUG: Requested barcode data')
  query = request.args.get('barcode', 'N/A')
  page = 1
  if query == 'N/A':
    query = request.args.get('search', 'N/A')
    page = request.args.get('page', '1')

  try:
    response = requests.get(f'https://api.nal.usda.gov/fdc/v1/foods/search?query={ query }&pageSize=15&pageNumber={ page }&api_key={ FOOD_DATA_KEY }')
    # Raises an HTTPError if the HTTP request returned an unsuccessful status code
    response.raise_for_status()
    data = response.json()
  except requests.exceptions.HTTPError as http_err:
    print(f'error http: {http_err}')
    return jsonify({'error': f'HTTP error occurred: {http_err}'}), 500
  except Exception as err:
    print(f'error other: {err}')
    return jsonify({'error': f'Other error occurred: {err}'}), 500

  print(f'DEBUG: Sending response {data}')
  return data


if __name__ == '__main__':
    app.run(debug=True)