import os
import sqlite3
import time
import json
import wandb

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'prisma', 'dev.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def sync_experiments():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # We query the ML_Experiment table
    cur.execute("SELECT * FROM ML_Experiment")
    experiments = cur.fetchall()
    
    if not experiments:
        print("No local experiments found to sync.")
        return
        
    for exp in experiments:
        run_name = f"{exp['modelName']}-{exp['runTag']}"
        print(f"Syncing Run: {run_name}")
        
        # Initialize wandb run
        run = wandb.init(
            project="infraconnect-vla",
            name=run_name,
            config=json.loads(exp['hyperparameters'] or '{}'),
            reinit=True
        )
        
        curves = json.loads(exp['rewardCurves'] or '[]')
        
        # Log the step-by-step curve
        for step in curves:
            wandb.log({
                "reward": step.get("reward", 0),
                "loss": step.get("loss", 0),
                "episode": step.get("episode", 0)
            }, step=step.get("episode", 0))
            
        # Log final global metrics
        wandb.log({
            "svrRate": exp['svrRate'],
            "completed": exp['completedAt']
        })
        
        run.finish()

    conn.close()

def main():
    # Try to load .env manually
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    if key == 'WEIGHTS_AND_BIASES_API':
                        os.environ['WEIGHTS_AND_BIASES_API'] = val.strip().strip("'\"")

    # Only run if API key is provided OR we are in offline test mode
    api_key = os.environ.get("WEIGHTS_AND_BIASES_API")
    is_offline = os.environ.get("WANDB_MODE") == "offline"
    
    if not api_key and not is_offline:
        print("WEIGHTS_AND_BIASES_API not set. Bypassing W&B Sync.")
        return
    
    # We use WEIGHTS_AND_BIASES_API but wandb expects WANDB_API_KEY
    if api_key:
        os.environ["WANDB_API_KEY"] = api_key
        wandb.login(key=api_key)
    
    print("Initiating Sovereign MLOps W&B Daemon...")
    while True:
        try:
            sync_experiments()
        except Exception as e:
            print(f"Sync Error: {e}")
            
        if os.environ.get("WANDB_ONCE") == "1":
            print("WANDB_ONCE flag detected. Exiting trace.")
            break
        
        print("Sleeping for 60s...")
        time.sleep(60)

if __name__ == "__main__":
    main()
