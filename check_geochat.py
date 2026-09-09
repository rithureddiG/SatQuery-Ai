from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent / 'satquery-ai'))
from backend.models.geochat import geochat_adapter
from backend.models.registry import model_registry
from backend.models.geochat.config import GeoChatConfig

print('registry_keys=', model_registry.list_models())
print('health=', geochat_adapter.health())
print('config_checkpoint=', GeoChatConfig().checkpoint_dir.resolve())
print('checkpoint_exists=', GeoChatConfig().checkpoint_dir.exists())
print('dataset_rsvqa_exists=', (Path(__file__).parent / 'satquery-ai' / 'data' / 'benchmarks' / 'rsvqa_hr').exists())
try:
    geochat_adapter.load(device='cpu')
except Exception as exc:
    print('load_error=', type(exc).__name__, str(exc))
print('health_after_load_attempt=', geochat_adapter.health())
try:
    geochat_adapter.vqa(Path(__file__).parent / 'satquery-ai' / 'data' / 'demo' / 'scene_optical_ahmedabad.tif', 'Describe the scene', strict_real=True)
except Exception as exc:
    print('strict_real_error=', type(exc).__name__, str(exc))
