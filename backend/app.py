# from flask import Flask, request, jsonify
# import os
# import cv2
# import numpy as np
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import cv2
# import numpy as np
# from flask import Flask, request, jsonify
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights
from torchvision import transforms
from PIL import Image
from explain import grad_cam
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, 5)

model.load_state_dict(
    torch.load("resnet50_best.pth", map_location=device)
)

model = model.to(device)
model.eval()

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

print("✅ ResNet50 model loaded")
# import tensorflow as tf
# from explain import grad_cam   # import your Grad-CAM function

# app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route("/uploads/<path:filename>")
@app.route("/uploads/<path:filename>")
@app.route("/api/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files["image"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    return jsonify({"message": "Image uploaded successfully", "path": filepath})

# @app.route("/predict", methods=["POST"])
# def predict():
#     if "image" not in request.files:
#         return jsonify({"error": "No image file provided"}), 400
    
#     file = request.files["image"]
#     filepath = os.path.join(UPLOAD_FOLDER, file.filename)
#     file.save(filepath)

#     # Load and preprocess image
#     img = cv2.imread(filepath)
#     img = cv2.resize(img, (224, 224)) / 255.0
#     img_array = np.expand_dims(img, axis=0)

#     # 🔑 Later: load your trained model here
#     # model = tf.keras.models.load_model("model.h5")
#     # preds = model.predict(img_array)
#     # severity = int(np.argmax(preds))

#     severity = "pending"  # placeholder until model is ready

#     # 🔑 Later: generate Grad-CAM heatmap
#     # heatmap = grad_cam(model, img_array)
#     # heatmap_path = os.path.join(UPLOAD_FOLDER, "heatmap_" + file.filename)
#     # cv2.imwrite(heatmap_path, (heatmap * 255).astype("uint8"))

#     return jsonify({
#         "severity": severity,
#         "heatmap_url": "pending"
#     })
@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    image = Image.open(filepath).convert("RGB")
    image_tensor = val_transform(image).unsqueeze(0).to(device)

    # Prediction
    with torch.no_grad():
        output = model(image_tensor)
        probabilities = torch.softmax(output, dim=1)

    predicted_class = probabilities.argmax(dim=1).item()
    confidence = probabilities[0, predicted_class].item()

    # Grad-CAM
    heatmap = grad_cam(model, image_tensor)

    # Convert heatmap to an image
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    original = cv2.imread(filepath)
    original = cv2.resize(original, (224, 224))

    overlay = cv2.addWeighted(original, 0.6, heatmap_color, 0.4, 0)

    heatmap_filename = "heatmap_" + file.filename
    overlay_filename = "overlay_" + file.filename

    heatmap_path = os.path.join(UPLOAD_FOLDER, heatmap_filename)
    overlay_path = os.path.join(UPLOAD_FOLDER, overlay_filename)

    cv2.imwrite(heatmap_path, heatmap_color)
    cv2.imwrite(overlay_path, overlay)

    print("Image received:", file.filename)
    print("Grade:", predicted_class)
    print("Confidence:", f"{confidence * 100:.2f}%")
    print("Grad-CAM generated:", heatmap_filename)

    return jsonify({
        "severity": predicted_class,
        "confidence": confidence * 100,
        # "heatmap_url": f"http://127.0.0.1:5000/uploads/{heatmap_filename}",
        # "overlay_url": f"http://127.0.0.1:5000/uploads/{overlay_filename}"
        "heatmap_url": f"/api/uploads/{heatmap_filename}",
        "overlay_url": f"/api/uploads/{overlay_filename}",
    })

if __name__ == "__main__":
    app.run(debug=True)
