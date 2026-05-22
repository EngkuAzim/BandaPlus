import os
import time
import requests
import json
from ultralytics import YOLO
import urllib.request

# --- CONFIGURATION ---
# Replace this with your Droplet IP or Domain (e.g. http://142.93.x.x)
API_BASE_URL = "http://146.190.86.94"
API_PENDING_URL = f"{API_BASE_URL}/api/ai/pending"
API_UPLOAD_URL = f"{API_BASE_URL}/api/ai/upload-detection"

# This should match the AI_WORKER_TOKEN in your droplet's .env file
TOKEN = "Azim_Victus_RTX4050_BandaPlus_Secure2026"

POLL_INTERVAL = 10 # Seconds to wait between checking for new complaints
MODEL_PATH = "yolo26n.pt" # Ensure this file is in the same directory

# Ensure a local directory exists to save temporary downloaded and processed images
TEMP_DIR = "temp_processing"
os.makedirs(TEMP_DIR, exist_ok=True)

print(f"--- BandaPlus Live YOLOv8 Worker Started ---")
print(f"Loading model: {MODEL_PATH}")
# Load the YOLO model (will automatically use GPU if PyTorch is configured for CUDA on your RTX 4050)
model = YOLO(MODEL_PATH)
print("Model loaded successfully. Starting polling loop...\n")

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/json'
}

def process_complaint(complaint):
    c_id = complaint.get('id_aduan')
    img_path = complaint.get('gambar_bukti')
    
    print(f"\n[+] Processing Complaint ID: {c_id}")
    
    if not img_path:
        print(f"[-] No image path found for {c_id}, skipping.")
        return

    # Construct full image URL
    if img_path.startswith('http'):
        img_url = img_path
    else:
        # Assuming Laravel storage symlink
        img_url = f"{API_BASE_URL}/storage/{img_path}"
        
    local_img_filename = os.path.join(TEMP_DIR, f"{c_id}_original.jpg")
    processed_img_filename = os.path.join(TEMP_DIR, f"{c_id}_processed.jpg")
    
    # 1. Download the image
    print(f"    -> Downloading image from: {img_url}")
    try:
        urllib.request.urlretrieve(img_url, local_img_filename)
    except Exception as e:
        print(f"    [-] Failed to download image: {e}")
        return

    # 2. Run YOLOv8 Inference
    print("    -> Running YOLOv8 Inference...")
    results = model(local_img_filename)
    
    # Extract predictions
    predictions = []
    # ultralytics results is a list of Result objects (usually 1 per image)
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = model.names[cls_id]
            predictions.append({
                "class": cls_name,
                "confidence": conf
            })
            
        # 3. Save the processed image with bounding boxes
        r.save(filename=processed_img_filename)
        
    print(f"    -> Detected objects: {predictions}")
    
    # 4. Upload the results back to the server
    print("    -> Uploading results to server...")
    data = {
        'complaint_id': c_id,
        'predictions': json.dumps(predictions)
    }
    
    try:
        with open(processed_img_filename, 'rb') as f:
            files = {
                'file': (f"{c_id}_processed.jpg", f, 'image/jpeg')
            }
            response = requests.post(API_UPLOAD_URL, data=data, files=files, headers=headers)
            
        if response.status_code == 200:
            print(f"    [+] Successfully updated {c_id} on server.")
        else:
            print(f"    [-] Failed to upload. Server responded with {response.status_code}: {response.text}")
    except Exception as e:
        print(f"    [-] Upload exception: {e}")
        
    # Cleanup temporary files
    try:
        if os.path.exists(local_img_filename): os.remove(local_img_filename)
        if os.path.exists(processed_img_filename): os.remove(processed_img_filename)
    except:
        pass


# --- MAIN LOOP ---
while True:
    try:
        # Fetch pending complaints
        response = requests.get(API_PENDING_URL, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pending_complaints = data.get('data', [])
            
            if pending_complaints:
                print(f"[*] Found {len(pending_complaints)} pending complaint(s).")
                for complaint in pending_complaints:
                    process_complaint(complaint)
            else:
                # print("[-] No pending complaints. Waiting...")
                pass
        else:
            print(f"[-] API Error {response.status_code} while fetching pending complaints: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"[-] Could not connect to {API_BASE_URL}. Is the server running?")
    except Exception as e:
        print(f"[-] Unexpected error in main loop: {e}")
        
    time.sleep(POLL_INTERVAL)
