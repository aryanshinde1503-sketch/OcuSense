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
torch.set_num_threads(1)
torch.set_num_interop_threads(1)
import torch.nn as nn
# from torchvision.models import resnet50, ResNet50_Weights
from torchvision.models import (
    resnet50,
    ResNet50_Weights,
    mobilenet_v3_small,
)
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
    torch.load(
    "resnet50_best.pth",
    map_location=device,
    weights_only=False
)
)

model = model.to(device)
model.eval()
# Load Fundus / Non-Fundus gate
gate_model = mobilenet_v3_small(weights=None)
gate_model.classifier[3] = nn.Linear(
    gate_model.classifier[3].in_features,
    2
)

gate_model.load_state_dict(
    torch.load(
        "fundus_gate_mobilenetv3.pth",
        map_location=device
    )
)

gate_model = gate_model.to(device)
gate_model.eval()

print("✅ Fundus gate model loaded")

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
# Transform for Fundus / Non-Fundus gate
gate_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def check_fundus_image(image):
    """
    Returns:
        result: 'FUNDUS' or 'NON-FUNDUS'
        confidence: confidence of the predicted class
    """

    image_tensor = gate_transform(image).unsqueeze(0).to(device)

    gate_model.eval()

    with torch.no_grad():
        output = gate_model(image_tensor)
        probabilities = torch.softmax(output, dim=1)

    predicted_class = probabilities.argmax(dim=1).item()
    confidence = probabilities[0, predicted_class].item()

    if predicted_class == 0:
        result = "FUNDUS"
    else:
        result = "NON-FUNDUS"

    return result, confidence

def calculate_fundus_blur_score(image):
    """
    Calculate sharpness of the retinal region.
    Higher score = sharper image.
    """

    image_np = np.array(image)
    image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    # Ignore mostly-black background
    mask = gray > 10

    if not np.any(mask):
        return 0.0

    ys, xs = np.where(mask)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()

    retinal = gray[y1:y2 + 1, x1:x2 + 1]

    retinal = cv2.resize(retinal, (512, 512))

    score = cv2.Laplacian(
        retinal,
        cv2.CV_64F
    ).var()

    return float(score)

BLUR_THRESHOLD = 60.0

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

    # -------------------------------------------------
    # Step 1: Fundus / Non-Fundus validation
    # -------------------------------------------------
    gate_result, gate_confidence = check_fundus_image(image)

    print("Fundus Gate:", gate_result)
    print("Gate Confidence:", f"{gate_confidence * 100:.2f}%")

    if gate_result == "NON-FUNDUS":
        return jsonify({
            "error": "Invalid image",
            "message": "The uploaded image is not a retinal fundus image. Please upload a fundus image.",
            "gate_result": gate_result,
            "gate_confidence": gate_confidence * 100
        }), 400

    # -------------------------------------------------
    # Step 2: Fundus image quality / blur check
    # -------------------------------------------------
    blur_score = calculate_fundus_blur_score(image)

    print("Blur Score:", f"{blur_score:.2f}")

    if blur_score < BLUR_THRESHOLD:
        return jsonify({
            "error": "Poor image quality",
            "message": (
                "A retinal fundus image was detected, but it appears "
                "too blurry. Please recapture the image with better "
                "focus and lighting."
            ),
            "gate_result": gate_result,
            "blur_score": blur_score
        }), 400
    # -------------------------------------------------
    # Step 3: Continue with existing DR model
    # -------------------------------------------------
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
