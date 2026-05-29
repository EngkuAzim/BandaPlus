import os
import yaml
import shutil
from pathlib import Path

# --- CONFIGURATION ---
# List of the dataset folders you downloaded
DATASETS = [
    'pothole-detection-1',
    'Flood.v1i.yolov8',
    'stray dogs.yolov8',
    'Fallen Trees Detection V1.yolov8',
    'Illegal Dumping.yolov8'
]

# The new master class names we want for our final model
# The index in this list will be the new Class ID!
MASTER_CLASSES = [
    'Pothole',         # ID: 0
    'Flood',           # ID: 1
    'Stray Dog',       # ID: 2
    'Fallen Tree',     # ID: 3
    'Illegal Dumping'  # ID: 4
]

# Map each dataset folder to its new MASTER_CLASS index
DATASET_CLASS_MAPPING = {
    'pothole-detection-1': 0,
    'Flood.v1i.yolov8': 1,
    'stray dogs.yolov8': 2,
    'Fallen Trees Detection V1.yolov8': 3,
    'Illegal Dumping.yolov8': 4
}

OUTPUT_DIR = 'BandaPlus_Master_Dataset'

def setup_directories():
    print(f"[*] Creating master dataset directory: {OUTPUT_DIR}")
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
        
    for split in ['train', 'valid', 'test']:
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'labels'), exist_ok=True)

def process_dataset(dataset_name, new_class_id):
    dataset_path = Path(dataset_name)
    if not dataset_path.exists():
        print(f"[-] WARNING: Dataset {dataset_name} not found. Skipping.")
        return

    print(f"\n[+] Processing {dataset_name} -> Assigning to Class ID {new_class_id} ({MASTER_CLASSES[new_class_id]})")
    
    # Process train, valid, test splits
    for split in ['train', 'valid', 'test']:
        # Some datasets use 'val' instead of 'valid'
        search_split = 'val' if split == 'valid' and not (dataset_path / 'valid').exists() else split
        
        images_dir = dataset_path / search_split / 'images'
        labels_dir = dataset_path / search_split / 'labels'
        
        if not images_dir.exists() or not labels_dir.exists():
            continue
            
        images = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.jpeg')) + list(images_dir.glob('*.png'))
        print(f"    -> {split}: Found {len(images)} images.")
        
        for img_path in images:
            # 1. Copy Image
            new_img_name = f"{dataset_name.replace(' ', '_')}_{img_path.name}"
            shutil.copy(img_path, os.path.join(OUTPUT_DIR, split, 'images', new_img_name))
            
            # 2. Process and Copy Label
            label_path = labels_dir / f"{img_path.stem}.txt"
            new_label_name = f"{dataset_name.replace(' ', '_')}_{img_path.stem}.txt"
            out_label_path = os.path.join(OUTPUT_DIR, split, 'labels', new_label_name)
            
            if label_path.exists():
                with open(label_path, 'r') as f_in, open(out_label_path, 'w') as f_out:
                    for line in f_in:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            # Replace the old class ID (parts[0]) with the new class ID
                            parts[0] = str(new_class_id)
                            f_out.write(' '.join(parts) + '\n')

def create_yaml():
    yaml_path = os.path.join(OUTPUT_DIR, 'data.yaml')
    # Get absolute path for the output directory to ensure YOLO finds it
    abs_out_dir = os.path.abspath(OUTPUT_DIR).replace('\\', '/')
    
    data = {
        'train': f"{abs_out_dir}/train/images",
        'val': f"{abs_out_dir}/valid/images",
        'test': f"{abs_out_dir}/test/images",
        'nc': len(MASTER_CLASSES),
        'names': MASTER_CLASSES
    }
    
    with open(yaml_path, 'w') as f:
        yaml.dump(data, f, sort_keys=False)
    print(f"\n[*] Created master data.yaml at {yaml_path}")

if __name__ == "__main__":
    setup_directories()
    for ds_name, new_id in DATASET_CLASS_MAPPING.items():
        process_dataset(ds_name, new_id)
    create_yaml()
    print("\n[+] SUCCESS! All datasets have been merged into 'BandaPlus_Master_Dataset'.")
    print("    You can now point your train_banda.py to BandaPlus_Master_Dataset/data.yaml!")
