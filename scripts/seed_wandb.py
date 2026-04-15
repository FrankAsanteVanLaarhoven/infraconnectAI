import os
import sqlite3
import json
import time

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'prisma', 'dev.db')
    conn = sqlite3.connect(db_path)
    return conn

def main():
    print("Seeding test run for Weights & Biases via Python...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create ML Experiment Data
    curves = []
    current_loss = 2.5
    current_reward = 0
    
    for i in range(50):
        curves.append({
            "episode": i,
            "loss": current_loss,
            "reward": current_reward
        })
        current_loss = current_loss * 0.95
        import random
        current_reward += random.random() * 5 + 2

    # Insert into ML_Experiment table
    import uuid
    new_id = "test-" + str(uuid.uuid4())
        
    cur.execute("""
        INSERT INTO ML_Experiment (id, modelName, runTag, hyperparameters, rewardCurves, svrRate, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    """, (
        new_id,
        "Gemma-4-31B-VLA",
        f"sota-fleet-test-{int(time.time()) % 10000}",
        json.dumps({
            "learningMethod": "RLHF",
            "batchSize": 2048,
            "learningRate": 3e-5,
            "quantization": "4-bit TurboQuant"
        }),
        json.dumps(curves),
        0.0001
    ))
    
    conn.commit()
    conn.close()
    print("Test experiment queued to Prisma DB! Run `python scripts/wandb_sync.py` to push to W&B.")

if __name__ == "__main__":
    main()
