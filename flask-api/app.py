from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
import cv2
import os

app = Flask(__name__)

# Load model once on startup
MODEL_PATH = 'plant_classifier.h5'
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")

model = load_model(MODEL_PATH)
print("✅ Model loaded successfully")

@app.route('/')
def home():
    return "<h1>Welcome to the Image Prediction API</h1>"

@app.route('/predict', methods=['POST'])
def predict():
    print("✅ Received POST request")

    if 'image' not in request.files:
        print("❌ No image file found in request")
        return jsonify({'error': 'No image provided'}), 400

    try:
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Read and decode image
        image_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Invalid image data")

        # Preprocess image for EfficientNetB0 (input: 160x160 + preprocess_input)
        image_resized = cv2.resize(image, (160, 160))
        image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
        image_preprocessed = preprocess_input(image_rgb)
        input_data = np.expand_dims(image_preprocessed, axis=0)

        # Predict
        prediction = model.predict(input_data)
        predicted_index = int(np.argmax(prediction))
        prediction_array = prediction[0].tolist()  # Convert to JSON serializable

        # Log for debugging
        print("Predicted index:", predicted_index)
        print("Prediction probabilities:", prediction_array)

        # Return both predicted index and full probabilities
        return jsonify({
            'prediction': predicted_index,
            'probabilities': prediction_array
        })

    except Exception as e:
        print("❌ Error during prediction:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9080)
