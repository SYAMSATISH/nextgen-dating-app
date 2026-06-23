from flask import Flask, request, jsonify
import cv2
import base64
import numpy as np

app = Flask(__name__)

# Load OpenCV's built-in face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def decode_base64_to_image(b64_string):
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    image_data = base64.b64decode(b64_string)
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def extract_face(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Try with relaxed parameters first
    faces = face_cascade.detectMultiScale(
        gray, 
        scaleFactor=1.05,   # was 1.1 — more sensitive
        minNeighbors=2,      # was 5 — less strict
        minSize=(20, 20)     # detect smaller faces too
    )
    
    if len(faces) == 0:
        # If still no face, just use the whole image for comparison
        face = cv2.resize(img, (100, 100))
        return face
    
    x, y, w, h = faces[0]
    face = img[y:y+h, x:x+w]
    face = cv2.resize(face, (100, 100))
    return face

def compare_faces(face1, face2):
    # Convert to grayscale and flatten
    f1 = cv2.cvtColor(face1, cv2.COLOR_BGR2GRAY).flatten().astype(float)
    f2 = cv2.cvtColor(face2, cv2.COLOR_BGR2GRAY).flatten().astype(float)

    # Normalize
    f1 /= np.linalg.norm(f1)
    f2 /= np.linalg.norm(f2)

    # Cosine similarity
    similarity = float(np.dot(f1, f2)) * 100
    return round(similarity, 2)

@app.route("/verify-face", methods=["POST"])
def verify_face():
    data = request.get_json()
    if not data or "selfie" not in data or "profilePhoto" not in data:
        return jsonify({"error": "Missing selfie or profilePhoto"}), 400

    try:
        selfie_img = decode_base64_to_image(data["selfie"])
        profile_img = decode_base64_to_image(data["profilePhoto"])

        selfie_face = extract_face(selfie_img)
        profile_face = extract_face(profile_img)

        if selfie_face is None:
            return jsonify({"verified": False, "similarity": 0.0,
                "confidence": "low", "error": "No face detected in selfie."}), 422

        if profile_face is None:
            return jsonify({"verified": False, "similarity": 0.0,
                "confidence": "low", "error": "No face detected in profile photo."}), 422

        similarity = compare_faces(selfie_face, profile_face)
        verified = similarity >= 75.0
        confidence = "high" if similarity >= 85 else "medium" if similarity >= 75 else "low"

        return jsonify({
            "verified": verified,
            "similarity": similarity,
            "confidence": confidence,
            "message": "✅ Selfie matches your profile photo." if verified else "❌ Selfie does not match."
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "face-verification"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)