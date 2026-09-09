from pathlib import Path
import numpy as np
import rasterio
from rasterio.transform import from_origin
from fastapi.testclient import TestClient
from backend.main import app


def make_water_scene(path: Path):
    data = np.zeros((5, 64, 64), dtype=np.uint16)
    data[:] = 1000
    data[1] = 1000  # green background
    data[4] = 3000  # SWIR background
    data[1, 12:44, 14:50] = 3000
    data[4, 12:44, 14:50] = 500
    with rasterio.open(path, 'w', driver='GTiff', dtype='uint16', nodata=0, width=64, height=64, count=5,
                       crs='EPSG:32643', transform=from_origin(500000, 3000000, 10, 10)) as dst:
        dst.write(data)


def test_water_query_routes_to_ranking_and_returns_real_geometry(tmp_path: Path):
    scene = tmp_path / 'water_scene.tif'
    make_water_scene(scene)
    client = TestClient(app)
    with scene.open('rb') as handle:
        upload = client.post('/api/v1/images/inspect', files={'file': ('water_scene.tif', handle, 'image/tiff')})
    assert upload.status_code == 200, upload.text
    image_id = upload.json()['id']

    response = client.post('/api/v1/query', json={
        'query': 'Where is the largest water reservoir?',
        'image_ids': [image_id],
    })
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['intent'] == 'spatial_ranking'
    assert result['target'] == 'water_body'
    assert result['operation'] == 'largest'
    assert result['mission_plan']['tool_chain'][0] == 'WaterBodyAnalyzer'
    assert 'ChangeNet' not in result['mission_plan']['tool_chain']
    assert result['winner']['area_m2'] > 0
    assert result['winner']['area_ha'] > 0
    assert result['regions_geojson']['features']
    assert result['confidence']['overall'] is None
