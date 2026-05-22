from ultralytics import YOLO
import torch

def main():
    # Make sure your RTX 4050 is being captured
    device = '0' if torch.cuda.is_available() else 'cpu'
    print(f"🚀 Training BANDA+ Vision using device: {device}")

    # Load the lightweight YOLOv8 Nano model (perfect for fast laptop training)
    model = YOLO("yolov8n.pt")

    # Start the training process
    model.train(
        data="C:/laragon/www/bandaplus_yolo/pothole-detection-1/data.yaml", # Double check if your folder is named pothole-detection-1!
        epochs=30,         # 30 epochs is perfect for a rapid test run
        imgsz=640,         # Standard input resolution
        batch=16,          # Safe setting for your 6GB VRAM to prevent memory crashes
        workers=2,         # Keeps your Victus CPU processing stable
        device=device,     # Targets your GPU
        name="BANDA_Plus_YOLOv8"
        
    )

if __name__ == '__main__':
    main()