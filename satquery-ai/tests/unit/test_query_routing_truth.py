from backend.agent.router import classify_intent, IntentType
from backend.mission.parser import MissionParser, MissionIntent


def test_water_ranking_outranks_multiple_assets():
    intent, _, params = classify_intent('Where is the largest water reservoir?', available_image_count=3, has_sar=True)
    assert intent == IntentType.SPATIAL_RANKING
    assert params == {'target': 'water_body', 'operation': 'largest', 'measurement': 'area', 'task': 'spatial_ranking'}

    spec = MissionParser().parse('Where is the largest water reservoir?', available_assets_count=3, has_sar_available=True)
    assert spec.intent == MissionIntent.SPATIAL_RANKING
    assert spec.target_phenomena == ['water']


def test_explicit_change_and_vqa_routing():
    assert classify_intent('What changed between these two dates?', 2)[0] == IntentType.CHANGE_DETECTION
    assert classify_intent('Describe this scene.', 3)[0] == IntentType.VQA
    assert classify_intent('Does SAR support the detected flood?', 2, True)[0] == IntentType.OPTICAL_SAR_FUSION
