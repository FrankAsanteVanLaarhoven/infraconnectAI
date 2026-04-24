# Performance Optimization Guide — Large-Scale Isaac Lab Training

## 1. GPU & Memory Tuning
- Use **mixed precision** (`--fp16`)
- Set `NUM_ENVS` based on GPU memory (e.g., 2048 on 4×A100)
- Enable **asynchronous simulation** in Isaac Lab

## 2. Data Pipeline
- Use **Redis Streams** with batch size 128–256
- Enable **episode compression** before storage
- Prune aggressively (target <15% prune rate)

## 3. Training Efficiency
- Use **curriculum learning** based on physics score
- Enable **gradient checkpointing**
- Run **multi-GPU training** with DDP

## 4. Monitoring Targets
- GPU Utilization > 85%
- Episode throughput > 1200/sec per GPU
- Physics score variance < 0.08

## 5. Cost Optimization
- Use spot instances for non-critical runs
- Auto-scale HPA based on queue length
- Archive old runs after 30 days
