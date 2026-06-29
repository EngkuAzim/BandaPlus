import os
import requests
import json
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, BackgroundTasks, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from ultralytics import YOLO
import urllib.request
import sys

# Try to load .env manually if dotenv is not installed
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, val = line.strip().split('=', 1)
                val = val.strip()
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                os.environ[key] = val

# Replace this with your Droplet IP or Domain (e.g. http://146.190.86.94 or https://bandaplus.tech)
API_BASE_URL = os.environ.get("API_BASE_URL", "https://bandaplus.tech")

if "--local" in sys.argv:
    API_BASE_URL = "http://banda-api.test"

API_UPLOAD_URL = f"{API_BASE_URL}/api/ai/upload-scan-result"

# This should match the AI_WORKER_TOKEN in your droplet's .env file
TOKEN = os.environ.get("AI_WORKER_TOKEN")
if not TOKEN:
    print("WARNING: AI_WORKER_TOKEN is not set in .env!")
MODEL_PATH = r"C:\laragon\www\runs\detect\BANDA_Plus_YOLOv8-8\weights\last.pt"

# Ensure a local directory exists to save temporary downloaded and processed images
TEMP_DIR = "temp_processing"
os.makedirs(TEMP_DIR, exist_ok=True)

print(f"--- BandaPlus Live FastAPI YOLOv8 Worker Started ---")
print(f"Loading model: {MODEL_PATH}")
# Load the YOLO model
model = YOLO(MODEL_PATH)
print("Model loaded successfully. Webhook server ready on port 8001!\n")

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/json'
}

app = FastAPI()

class DetectRequest(BaseModel):
    scan_id: str
    image_path: str

def process_complaint_async(scan_id: str, img_path: str):
    if img_path.startswith('http'):
        img_url = img_path
    else:
        img_url = f"{API_BASE_URL}/storage/{img_path}"

    local_img_filename = os.path.join(TEMP_DIR, f"{scan_id}_original.jpg")
    processed_img_filename = os.path.join(TEMP_DIR, f"{scan_id}_processed.jpg")

    img_response = requests.get(img_url, stream=True)
    img_response.raise_for_status()

    with open(local_img_filename, 'wb') as f:
        for chunk in img_response.iter_content(chunk_size=8192):
            f.write(chunk)

    results = model(local_img_filename, conf=0.1)

    predictions = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = model.names[cls_id]
            predictions.append({
                "class": cls_name,
                "confidence": conf
            })

        r.save(filename=processed_img_filename)

    data = {
        'scan_id': scan_id,
        'predictions': json.dumps(predictions)
    }

    with open(processed_img_filename, 'rb') as f:
        files = {
            'file': (f"{scan_id}_processed.jpg", f, 'image/jpeg')
        }
        response = requests.post(API_UPLOAD_URL, data=data, files=files, headers=headers)
        
        # Log response nicely
        if response.status_code == 200:
            print(f"    [+] Successfully updated {scan_id} on server.")
        else:
            print(f"    [-] Failed to upload. Server responded with {response.status_code}: {response.text}")
        
    # Cleanup temporary files
    try:
        if os.path.exists(local_img_filename): os.remove(local_img_filename)
        if os.path.exists(processed_img_filename): os.remove(processed_img_filename)
    except:
        pass

@app.post("/detect")
async def detect_endpoint(req: DetectRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_complaint_async, req.scan_id, req.image_path)
    return {"message": "Detection started in background", "scan_id": req.scan_id}

# To run: uvicorn banda_live_worker:app --port 8001
