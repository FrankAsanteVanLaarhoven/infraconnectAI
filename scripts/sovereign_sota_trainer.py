import os
import argparse
import torch
import wandb
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

def get_args():
    parser = argparse.ArgumentParser(description="InfraConnectAI Sovereign SOTA PEFT Combinator")
    parser.add_argument("--domain", type=str, required=True, help="Target LoRA Matrix (e.g. agent-ops-lora)")
    parser.add_argument("--model", type=str, default="TinyLlama/TinyLlama-1.1B-Chat-v1.0", help="Foundation Model Substrate")
    parser.add_argument("--dataset", type=str, required=True, help="Path/Hub to Domain Dataset")
    parser.add_argument("--epochs", type=int, default=3, help="Training Epoch Boundary")
    parser.add_argument("--batch_size", type=int, default=4, help="Per device batch size")
    parser.add_argument("--quantize", action="store_true", help="Enable 4-bit NormalFloat Quantization (bitsandbytes)")
    return parser.parse_args()

def launch():
    args = get_args()

    # 1. Weights & Biases Telemetry Connection
    # We natively align to the INFRACONNECT namespace
    wandb.init(project="infraconnect-vla", name=args.domain, config=vars(args))
    
    print(f"\n[INIT] Sovereign SOTA Optimizer targeting [{args.domain}] via [{args.model}]")
    
    # 2. Hardware Substrate & Precisions
    # We dynamically select bfloat16 if Ada/Ampere, else fp16. This stabilizes tensor flow.
    compute_dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    
    bnb_config = None
    if args.quantize:
        print("[HARDWARE] Enabling 4-bit precision constraints...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=compute_dtype,
            bnb_4bit_use_double_quant=True
        )

    # 3. Model Orchestration
    print("[MODEL] Mounting weights onto VRAM...")
    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        quantization_config=bnb_config,
        torch_dtype=compute_dtype,
        device_map="auto",
        use_cache=False # Crucial for gradient checkpointing stability
    )
    
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right" # Prevent masking issues
    
    if args.quantize:
        model = prepare_model_for_kbit_training(model)

    # 4. LoRA Strategy (PEFT)
    # We bound the rank heavily (r=16) to prevent parameters from drifting completely
    peft_config = LoraConfig(
        r=16, 
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"]
    )
    
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Load Domain Artifacts
    print(f"[DATA] Loading domain corpus from: {args.dataset}")
    dataset = load_dataset(args.dataset, split="train")

    # 6. Structurally Enforced SOTA Hyperparameters
    # These explicit parameters address the erratic utilization and overfitting metrics:
    # 1. Warmup_ratio=0.1 + lr_scheduler_type="cosine": Fixes gradient starvation.
    # 2. Weight_decay=0.05: Blocks the dataset memorization drop.
    # 3. Gradient_accumulation_steps + gradient_checkpointing: Maximizes VRAM cache density so GPU utilization stays ~99%.
    
    training_args = TrainingArguments(
        output_dir=f"./storage/{args.domain}",
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=4,       # Protects memory and bolsters effective batch pool
        gradient_checkpointing=True,         # Massive GPU throughput booster
        optim="adamw_torch",                
        learning_rate=2e-5,                  # Constrained Base Learning Curve
        weight_decay=0.05,                   # SOTA Regularization (Prevents Overfitting)
        max_grad_norm=1.0,                   # Clips catastrophic gradients
        max_steps=-1,
        warmup_ratio=0.1,                    # THE SOTA WARMUP REQUIREMENT
        lr_scheduler_type="cosine",          # THE SOTA SCHEDULER REQUIREMENT
        group_by_length=True,
        save_steps=50,
        logging_steps=10,
        report_to="wandb",
        bf16=torch.cuda.is_bf16_supported(),
        fp16=not torch.cuda.is_bf16_supported()
    )

    # 7. Supervised Fine-Tuning Controller
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args,
        packing=False
    )

    # FIRE ORBITAL TRAINING LOGIC
    print(f"\n[LAUNCH] Starting Policy Optimization run for {args.domain}...\n")
    trainer.train()
    
    # 8. Preservation
    print(f"[FINAL] Baking PEFT logic adapters locally into ./storage/{args.domain} ...")
    trainer.model.save_pretrained(f"./storage/{args.domain}")
    wandb.finish()

if __name__ == "__main__":
    launch()
