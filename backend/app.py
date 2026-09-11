# # from database import get_connection, generate_patient_id, init_database
# from database import (
#     get_connection,
#     generate_patient_id,
#     init_database,
#     create_patient,
# )
# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import os
# import torch
# torch.set_num_threads(1)
# torch.set_num_interop_threads(1)
# import torch.nn as nn
# # from torchvision.models import resnet50, ResNet50_Weights
# from torchvision.models import (
#     resnet50,
#     ResNet50_Weights,
#     mobilenet_v3_small,
# )
# from torchvision import transforms
# from PIL import Image
# from explain import grad_cam
# import cv2
# import numpy as np

# app = Flask(__name__)
# CORS(app)
# init_database()

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# model = resnet50(weights=None)
# model.fc = nn.Linear(model.fc.in_features, 5)

# model.load_state_dict(
#     torch.load(
#     "resnet50_best.pth",
#     map_location=device,
#     weights_only=False
# )
# )

# model = model.to(device)
# model.eval()
# # Load Fundus / Non-Fundus gate
# gate_model = mobilenet_v3_small(weights=None)
# gate_model.classifier[3] = nn.Linear(
#     gate_model.classifier[3].in_features,
#     2
# )

# gate_model.load_state_dict(
#     torch.load(
#         "fundus_gate_mobilenetv3.pth",
#         map_location=device
#     )
# )

# gate_model = gate_model.to(device)
# gate_model.eval()

# print("✅ Fundus gate model loaded")

# val_transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(
#         mean=[0.485, 0.456, 0.406],
#         std=[0.229, 0.224, 0.225]
#     )
# ])
# # Transform for Fundus / Non-Fundus gate
# gate_transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(
#         mean=[0.485, 0.456, 0.406],
#         std=[0.229, 0.224, 0.225]
#     )
# ])


# def check_fundus_image(image):
#     """
#     Returns:
#         result: 'FUNDUS' or 'NON-FUNDUS'
#         confidence: confidence of the predicted class
#     """

#     image_tensor = gate_transform(image).unsqueeze(0).to(device)

#     gate_model.eval()

#     with torch.no_grad():
#         output = gate_model(image_tensor)
#         probabilities = torch.softmax(output, dim=1)

#     predicted_class = probabilities.argmax(dim=1).item()
#     confidence = probabilities[0, predicted_class].item()

#     if predicted_class == 0:
#         result = "FUNDUS"
#     else:
#         result = "NON-FUNDUS"

#     return result, confidence

# def calculate_fundus_blur_score(image):
#     """
#     Calculate sharpness of the retinal region.
#     Higher score = sharper image.
#     """

#     image_np = np.array(image)
#     image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

#     gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

#     # Ignore mostly-black background
#     mask = gray > 10

#     if not np.any(mask):
#         return 0.0

#     ys, xs = np.where(mask)

#     x1, x2 = xs.min(), xs.max()
#     y1, y2 = ys.min(), ys.max()

#     retinal = gray[y1:y2 + 1, x1:x2 + 1]

#     retinal = cv2.resize(retinal, (512, 512))

#     score = cv2.Laplacian(
#         retinal,
#         cv2.CV_64F
#     ).var()

#     return float(score)

# BLUR_THRESHOLD = 60.0

# print("✅ ResNet50 model loaded")
# # import tensorflow as tf
# # from explain import grad_cam   # import your Grad-CAM function

# # app = Flask(__name__)

# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # @app.route("/uploads/<path:filename>")
# @app.route("/uploads/<path:filename>")
# @app.route("/api/uploads/<path:filename>")
# def uploaded_file(filename):
#     return send_from_directory(UPLOAD_FOLDER, filename)

# @app.route("/")
# def home():
#     return "Backend is running!"

# @app.route("/upload", methods=["POST"])
# def upload():
#     if "image" not in request.files:
#         return jsonify({"error": "No image file provided"}), 400
    
#     file = request.files["image"]
#     filepath = os.path.join(UPLOAD_FOLDER, file.filename)
#     file.save(filepath)
#     return jsonify({"message": "Image uploaded successfully", "path": filepath})

# @app.route("/api/patients", methods=["POST"])
# def create_patient_api():
#     data = request.get_json()

#     if not data:
#         return jsonify({"error": "No patient data provided"}), 400

#     try:
#         patient_id = create_patient(
#             name=data.get("name"),
#             age=int(data["age"]) if data.get("age") else None,
#             gender=data.get("gender"),
#             diabetes_duration=data.get("diabetesDuration"),
#             reference_id=data.get("referenceId"),
#             notes=data.get("notes"),
#         )

#         screening_id = f"scr-{patient_id}"

#         return jsonify({
#             "message": "Patient created successfully",
#             "patient_id": patient_id,
#             "screening_id": screening_id
#         }), 201

#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400

#     except Exception as e:
#         print("Patient creation error:", repr(e))
#         return jsonify({"error": str(e)}), 500


# @app.route("/api/validate-image", methods=["POST"])
#     def validate_image():
#         if "image" not in request.files:
#             return jsonify({
#                 "valid": False,
#                 "error": "No image file provided"
#             }), 400

#     file = request.files["image"]

#     try:
#         image = Image.open(file.stream).convert("RGB")

#         # Fundus / non-fundus check
#         gate_result, gate_confidence = check_fundus_image(image)

#         if gate_result == "NON-FUNDUS":
#             return jsonify({
#                 "valid": False,
#                 "gate_result": gate_result,
#                 "gate_confidence": gate_confidence * 100,
#                 "image_quality": "Invalid",
#                 "message": "The uploaded image is not a retinal fundus image. Please upload a fundus image."
#             }), 200

#         # Blur / focus check
#         blur_score = calculate_fundus_blur_score(image)

#         if blur_score < BLUR_THRESHOLD:
#             return jsonify({
#                 "valid": False,
#                 "gate_result": gate_result,
#                 "gate_confidence": gate_confidence * 100,
#                 "blur_score": blur_score,
#                 "image_quality": "Poor",
#                 "message": "A retinal fundus image was detected, but it appears too blurry. Please recapture the image with better focus and lighting."
#             }), 200

#         return jsonify({
#             "valid": True,
#             "gate_result": gate_result,
#             "gate_confidence": gate_confidence * 100,
#             "blur_score": blur_score,
#             "image_quality": "Good",
#             "message": "Image is suitable for analysis."
#         }), 200

#     except Exception as e:
#         print("Image validation error:", repr(e))
#         return jsonify({
#             "valid": False,
#             "error": str(e)
#         }), 500
    
# @app.route("/api/referrals", methods=["POST"])
# def create_referral():
#     data = request.get_json()

#     if not data:
#         return jsonify({"error": "No referral data provided"}), 400

#     required_fields = ["screening_id", "dr_grade", "risk_level"]

#     for field in required_fields:
#         if field not in data:
#             return jsonify({
#                 "error": f"Missing required field: {field}"
#             }), 400

#     try:
#         patient_id = generate_patient_id()

#         conn = get_connection()

#         conn.execute(
#             """
#             INSERT INTO referrals (
#                 patient_id,
#                 screening_id,
#                 dr_grade,
#                 risk_level,
#                 referral_center,
#                 referral_date,
#                 appointment_date,
#                 status,
#                 specialist_outcome,
#                 follow_up_date
#             )
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#             """,
#             (
#                 patient_id,
#                 data["screening_id"],
#                 int(data["dr_grade"]),
#                 data["risk_level"],
#                 data.get("referral_center"),
#                 data.get("referral_date"),
#                 data.get("appointment_date"),
#                 "REFERRED",
#                 None,
#                 data.get("follow_up_date")
#             )
#         )

#         conn.commit()

#         referral_id = conn.execute(
#             "SELECT last_insert_rowid()"
#         ).fetchone()[0]

#         conn.close()

#         return jsonify({
#             "message": "Referral created successfully",
#             "referral_id": referral_id,
#             "patient_id": patient_id,
#             "status": "REFERRED"
#         }), 201

#     except ValueError as e:
#         return jsonify({
#             "error": str(e)
#         }), 400

#     except Exception as e:
#         print("Referral creation error:", e)
#         return jsonify({
#             "error": "Failed to create referral"
#         }), 500

    
# @app.route("/predict", methods=["POST"])
# @app.route("/api/predict", methods=["POST"])
# def predict():
#     if "image" not in request.files:
#         return jsonify({"error": "No image file provided"}), 400

#     file = request.files["image"]

#     filepath = os.path.join(UPLOAD_FOLDER, file.filename)
#     file.save(filepath)


#     image = Image.open(filepath).convert("RGB")

#     # -------------------------------------------------
#     # Step 1: Fundus / Non-Fundus validation
#     # -------------------------------------------------
#     gate_result, gate_confidence = check_fundus_image(image)

#     print("Fundus Gate:", gate_result)
#     print("Gate Confidence:", f"{gate_confidence * 100:.2f}%")

#     if gate_result == "NON-FUNDUS":
#         return jsonify({
#             "error": "Invalid image",
#             "message": "The uploaded image is not a retinal fundus image. Please upload a fundus image.",
#             "gate_result": gate_result,
#             "gate_confidence": gate_confidence * 100
#         }), 400

#     # -------------------------------------------------
#     # Step 2: Fundus image quality / blur check
#     # -------------------------------------------------
#     blur_score = calculate_fundus_blur_score(image)

#     print("Blur Score:", f"{blur_score:.2f}")

#     if blur_score < BLUR_THRESHOLD:
#         return jsonify({
#             "error": "Poor image quality",
#             "message": (
#                 "A retinal fundus image was detected, but it appears "
#                 "too blurry. Please recapture the image with better "
#                 "focus and lighting."
#             ),
#             "gate_result": gate_result,
#             "blur_score": blur_score
#         }), 400
#     # -------------------------------------------------
#     # Step 3: Continue with existing DR model
#     # -------------------------------------------------
#     image_tensor = val_transform(image).unsqueeze(0).to(device)

#     # Prediction
#     with torch.no_grad():
#         output = model(image_tensor)
#         probabilities = torch.softmax(output, dim=1)

#     predicted_class = probabilities.argmax(dim=1).item()
#     confidence = probabilities[0, predicted_class].item()

#     # Grad-CAM
#     heatmap = grad_cam(model, image_tensor)

#     # Convert heatmap to an image
#     heatmap_uint8 = np.uint8(255 * heatmap)
#     heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

#     original = cv2.imread(filepath)
#     original = cv2.resize(original, (224, 224))

#     overlay = cv2.addWeighted(original, 0.6, heatmap_color, 0.4, 0)

#     heatmap_filename = "heatmap_" + file.filename
#     overlay_filename = "overlay_" + file.filename

#     heatmap_path = os.path.join(UPLOAD_FOLDER, heatmap_filename)
#     overlay_path = os.path.join(UPLOAD_FOLDER, overlay_filename)

#     cv2.imwrite(heatmap_path, heatmap_color)
#     cv2.imwrite(overlay_path, overlay)

#     print("Image received:", file.filename)
#     print("Grade:", predicted_class)
#     print("Confidence:", f"{confidence * 100:.2f}%")
#     print("Grad-CAM generated:", heatmap_filename)

#     return jsonify({
#     "severity": predicted_class,
#     "confidence": confidence * 100,
#     "blur_score": blur_score,
#     "image_quality": "Good",
#     "gate_result": gate_result,
#     "gate_confidence": gate_confidence * 100,
#     "heatmap_url": f"/api/uploads/{heatmap_filename}",
#     "overlay_url": f"/api/uploads/{overlay_filename}",
# })

# if __name__ == "__main__":
#     app.run(debug=True)



from database import (
    get_connection,
    generate_patient_id,
    init_database,
    create_patient,
    save_screening,
    get_screening,
    create_referral as save_referral,
)

from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
from flask_cors import CORS, cross_origin

import os
from datetime import datetime
import torch

torch.set_num_threads(1)
torch.set_num_interop_threads(1)

import torch.nn as nn

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


# =========================================================
# Flask app
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://ocusense.vercel.app",
            ]
        }
    },
)

init_database()


# =========================================================
# Device
# =========================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================================================
# ResNet50 DR model
# =========================================================

model = resnet50(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    5
)

model.load_state_dict(
    torch.load(
        "resnet50_best.pth",
        map_location=device,
        weights_only=False
    )
)

model = model.to(device)
model.eval()

print("✅ ResNet50 model loaded")


# =========================================================
# Fundus / Non-Fundus gate
# =========================================================

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


# =========================================================
# Image transforms
# =========================================================

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


gate_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================================================
# Fundus validation
# =========================================================

def check_fundus_image(image):
    """
    Returns:
        result: 'FUNDUS' or 'NON-FUNDUS'
        confidence: confidence of predicted class
    """

    image_tensor = (
        gate_transform(image)
        .unsqueeze(0)
        .to(device)
    )

    gate_model.eval()

    with torch.no_grad():
        output = gate_model(image_tensor)
        probabilities = torch.softmax(output, dim=1)

    predicted_class = probabilities.argmax(
        dim=1
    ).item()

    confidence = probabilities[
        0,
        predicted_class
    ].item()

    if predicted_class == 0:
        result = "FUNDUS"
    else:
        result = "NON-FUNDUS"

    return result, confidence


# =========================================================
# Blur / focus score
# =========================================================

def calculate_fundus_blur_score(image):
    """
    Calculate sharpness of the retinal region.

    Higher score = sharper image.
    """

    image_np = np.array(image)

    image_bgr = cv2.cvtColor(
        image_np,
        cv2.COLOR_RGB2BGR
    )

    gray = cv2.cvtColor(
        image_bgr,
        cv2.COLOR_BGR2GRAY
    )

    # Ignore mostly-black background
    mask = gray > 10

    if not np.any(mask):
        return 0.0

    ys, xs = np.where(mask)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()

    retinal = gray[
        y1:y2 + 1,
        x1:x2 + 1
    ]

    retinal = cv2.resize(
        retinal,
        (512, 512)
    )

    score = cv2.Laplacian(
        retinal,
        cv2.CV_64F
    ).var()

    return float(score)


BLUR_THRESHOLD = 60.0


# =========================================================
# Upload folder
# =========================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# Static uploaded images
# =========================================================

@app.route("/uploads/<path:filename>")
@app.route("/api/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# =========================================================
# Health check
# =========================================================

@app.route("/")
def home():
    return "Backend is running!"


# =========================================================
# Simple upload endpoint
# =========================================================

@app.route("/upload", methods=["POST"])
def upload():

    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided"
        }), 400

    file = request.files["image"]

    filepath = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    file.save(filepath)

    return jsonify({
        "message": "Image uploaded successfully",
        "path": filepath
    })


# =========================================================
# Create patient
# =========================================================

@app.route("/api/patients", methods=["POST"])
def create_patient_api():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No patient data provided"
        }), 400

    try:

        patient_id = create_patient(
            name=data.get("name"),
            age=int(data["age"])
            if data.get("age")
            else None,
            gender=data.get("gender"),
            diabetes_duration=data.get(
                "diabetesDuration"
            ),
            reference_id=data.get(
                "referenceId"
            ),
            notes=data.get("notes"),
        )

        screening_id = f"scr-{patient_id}"

        return jsonify({
            "message": "Patient created successfully",
            "patient_id": patient_id,
            "screening_id": screening_id
        }), 201

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:

        print(
            "Patient creation error:",
            repr(e)
        )

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# Image validation endpoint
# =========================================================

@app.route("/api/validate-image", methods=["POST"])
def validate_image():

    if "image" not in request.files:

        return jsonify({
            "valid": False,
            "error": "No image file provided"
        }), 400

    file = request.files["image"]

    try:

        image = Image.open(
            file.stream
        ).convert("RGB")

        # -------------------------------------------------
        # Fundus / non-fundus check
        # -------------------------------------------------

        gate_result, gate_confidence = (
            check_fundus_image(image)
        )

        print(
            "Validation Fundus Gate:",
            gate_result
        )

        print(
            "Validation Gate Confidence:",
            f"{gate_confidence * 100:.2f}%"
        )

        if gate_result == "NON-FUNDUS":

            return jsonify({
                "valid": False,
                "gate_result": gate_result,
                "gate_confidence":
                    gate_confidence * 100,
                "image_quality": "Invalid",
                "message":
                    "The uploaded image is not a retinal fundus image. Please upload a fundus image."
            }), 200

        # -------------------------------------------------
        # Blur / focus check
        # -------------------------------------------------

        blur_score = calculate_fundus_blur_score(
            image
        )

        print(
            "Validation Blur Score:",
            f"{blur_score:.2f}"
        )

        if blur_score < BLUR_THRESHOLD:

            return jsonify({
                "valid": False,
                "gate_result": gate_result,
                "gate_confidence":
                    gate_confidence * 100,
                "blur_score": blur_score,
                "image_quality": "Poor",
                "message":
                    "A retinal fundus image was detected, but it appears too blurry. Please recapture the image with better focus and lighting."
            }), 200

        # -------------------------------------------------
        # Valid image
        # -------------------------------------------------

        return jsonify({
            "valid": True,
            "gate_result": gate_result,
            "gate_confidence":
                gate_confidence * 100,
            "blur_score": blur_score,
            "image_quality": "Good",
            "message":
                "Image is suitable for analysis."
        }), 200

    except Exception as e:

        print(
            "Image validation error:",
            repr(e)
        )

        return jsonify({
            "valid": False,
            "error": str(e)
        }), 500


# =========================================================
# Referral creation
# =========================================================

@app.route("/api/referrals", methods=["POST"])
def create_referral():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No referral data provided"
        }), 400

    required_fields = [
        "screening_id",
        "dr_grade",
        "risk_level"
    ]

    for field in required_fields:

        if field not in data:

            return jsonify({
                "error":
                    f"Missing required field: {field}"
            }), 400

    try:

        patient_id = data.get(
            "patient_id"
        )

        if not patient_id:

            patient_id = generate_patient_id()

        conn = get_connection()

        cursor = conn.execute(
            """
            INSERT INTO referrals (
                patient_id,
                screening_id,
                dr_grade,
                risk_level,
                referral_center,
                referral_date,
                appointment_date,
                status,
                specialist_outcome,
                follow_up_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                data["screening_id"],
                int(data["dr_grade"]),
                data["risk_level"],
                data.get(
                    "referral_center"
                ),
                data.get(
                    "referral_date"
                ),
                data.get(
                    "appointment_date"
                ),
                "REFERRED",
                None,
                data.get(
                    "follow_up_date"
                )
            )
        )

        referral_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return jsonify({
            "message":
                "Referral created successfully",
            "referral_id": referral_id,
            "patient_id": patient_id,
            "status": "REFERRED"
        }), 201

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:

        print(
            "Referral creation error:",
            repr(e)
        )

        return jsonify({
            "error":
                "Failed to create referral"
        }), 500


# =========================================================
# Prediction endpoint
# =========================================================

@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
@cross_origin(
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
                "https://ocusense.vercel.app",
    ]
)
def predict():
    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided"
        }), 400

    file = request.files["image"]

    # Screening ID sent by frontend
    screening_id = request.form.get("screening_id")

    if not screening_id:
        return jsonify({
            "error": "No screening_id provided"
        }), 400

    # Our screening IDs are:
    # scr-260910001
    # Therefore patient ID = 260910001
    if not screening_id.startswith("scr-"):
        return jsonify({
            "error": "Invalid screening_id"
        }), 400

    patient_id = screening_id.replace("scr-", "", 1)

    # -------------------------------------------------
    # Save uploaded image
    # -------------------------------------------------

    filepath = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    file.save(filepath)

    image = Image.open(
        filepath
    ).convert("RGB")

    # -------------------------------------------------
    # Step 1: Fundus / Non-Fundus validation
    # -------------------------------------------------

    gate_result, gate_confidence = check_fundus_image(
        image
    )

    print("Fundus Gate:", gate_result)
    print(
        "Gate Confidence:",
        f"{gate_confidence * 100:.2f}%"
    )

    if gate_result == "NON-FUNDUS":

        return jsonify({
            "error": "Invalid image",
            "message":
                "The uploaded image is not a retinal fundus image. Please upload a fundus image.",
            "gate_result": gate_result,
            "gate_confidence":
                gate_confidence * 100
        }), 400

    # -------------------------------------------------
    # Step 2: Blur / focus check
    # -------------------------------------------------

    blur_score = calculate_fundus_blur_score(
        image
    )

    print(
        "Blur Score:",
        f"{blur_score:.2f}"
    )

    if blur_score < BLUR_THRESHOLD:

        return jsonify({
            "error": "Poor image quality",
            "message": (
                "A retinal fundus image was detected, "
                "but it appears too blurry. Please "
                "recapture the image with better "
                "focus and lighting."
            ),
            "gate_result": gate_result,
            "blur_score": blur_score
        }), 400

    # -------------------------------------------------
    # Step 3: DR prediction
    # -------------------------------------------------

    image_tensor = (
        val_transform(image)
        .unsqueeze(0)
        .to(device)
    )

    with torch.no_grad():

        output = model(image_tensor)

        probabilities = torch.softmax(
            output,
            dim=1
        )

    predicted_class = probabilities.argmax(
        dim=1
    ).item()

    confidence = probabilities[
        0,
        predicted_class
    ].item()

    # -------------------------------------------------
    # Step 4: Grad-CAM
    # -------------------------------------------------

    heatmap = grad_cam(
        model,
        image_tensor
    )

    heatmap_uint8 = np.uint8(
        255 * heatmap
    )

    heatmap_color = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET
    )

    original = cv2.imread(
        filepath
    )

    original = cv2.resize(
        original,
        (224, 224)
    )

    overlay = cv2.addWeighted(
        original,
        0.6,
        heatmap_color,
        0.4,
        0
    )

    heatmap_filename = (
        "heatmap_" + file.filename
    )

    overlay_filename = (
        "overlay_" + file.filename
    )

    heatmap_path = os.path.join(
        UPLOAD_FOLDER,
        heatmap_filename
    )

    overlay_path = os.path.join(
        UPLOAD_FOLDER,
        overlay_filename
    )

    cv2.imwrite(
        heatmap_path,
        heatmap_color
    )

    cv2.imwrite(
        overlay_path,
        overlay
    )

    # -------------------------------------------------
    # Step 5: Convert grade → clinical labels
    # -------------------------------------------------

    severity_labels = [
        "No Diabetic Retinopathy",
        "Mild Non-Proliferative Diabetic Retinopathy",
        "Moderate Non-Proliferative Diabetic Retinopathy",
        "Severe Non-Proliferative Diabetic Retinopathy",
        "Proliferative Diabetic Retinopathy"
    ]

    risk_levels = [
        "Low",
        "Moderate",
        "Moderate",
        "High",
        "Urgent"
    ]

    severity = severity_labels[
        predicted_class
    ]

    risk_level = risk_levels[
        predicted_class
    ]

    confidence_percent = (
        confidence * 100
    )

    # -------------------------------------------------
    # Step 6: Automatically save screening
    # -------------------------------------------------

    save_screening(
        screening_id=screening_id,
        patient_id=patient_id,
        image_filename=file.filename,
        image_path=filepath,
        image_quality="Good",
        blur_score=blur_score,
        dr_grade=predicted_class,
        severity=severity,
        risk_level=risk_level,
        confidence=confidence_percent,
        heatmap_filename=heatmap_filename,
        overlay_filename=overlay_filename
    )

    print(
        "✅ Screening saved:",
        screening_id
    )

    # -------------------------------------------------
    # Step 7: Automatic referral for Grade 2+
    # -------------------------------------------------

    referral_created = False
    referral_id = None

    if predicted_class >= 2:

        referral_id = save_referral(
            patient_id=patient_id,
            screening_id=screening_id,
            dr_grade=predicted_class,
            risk_level=risk_level,
            referral_center="District Eye Care Center",
            referral_date=datetime.now().strftime(
                "%Y-%m-%d"
            )
        )

        referral_created = True

        print(
            "✅ Automatic referral created:",
            referral_id
        )

    else:

        print(
            "ℹ️ No referral required for Grade",
            predicted_class
        )

    # -------------------------------------------------
    # Final response
    # -------------------------------------------------

    print(
        "Image received:",
        file.filename
    )

    print(
        "Patient ID:",
        patient_id
    )

    print(
        "Grade:",
        predicted_class
    )

    print(
        "Severity:",
        severity
    )

    print(
        "Risk:",
        risk_level
    )

    print(
        "Confidence:",
        f"{confidence_percent:.2f}%"
    )

    print(
        "Grad-CAM generated:",
        heatmap_filename
    )

    return jsonify({

        "patient_id":
            patient_id,

        "screening_id":
            screening_id,

        "severity":
            predicted_class,

        "severity_label":
            severity,

        "risk_level":
            risk_level,

        "confidence":
            confidence_percent,

        "blur_score":
            blur_score,

        "image_quality":
            "Good",

        "gate_result":
            gate_result,

        "gate_confidence":
            gate_confidence * 100,

        "heatmap_url":
            f"/api/uploads/{heatmap_filename}",

        "overlay_url":
            f"/api/uploads/{overlay_filename}",

        "referral_created":
            referral_created,

        "referral_id":
            referral_id
    })


# =========================================================
# Start server
# =========================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )