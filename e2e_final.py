import sys
from pathlib import Path
import tempfile
import numpy as np
import rasterio
from rasterio.transform import from_origin
from fastapi.testclient import TestClient

ROOT = Path(__file__).parent / 'satquery-ai'
sys.path.insert(0, str(ROOT))
from backend.main import app


def make_raster(path: Path, bands: np.ndarray, tags=None):
    count, height, width = bands.shape
    profile = {'driver': 'GTiff', 'dtype': 'uint8', 'nodata': None, 'width': width,
               'height': height, 'count': count, 'crs': 'EPSG:32643',
               'transform': from_origin(500000, 3000000, 10, 10), 'compress': 'lzw'}
    with rasterio.open(path, 'w', **profile) as dst:
        dst.write(bands.astype('uint8'))
        if tags:
            dst.update_tags(**tags)


def upload(client, path, name):
    with path.open('rb') as f:
        response = client.post('/api/v1/images/inspect', files={'file': (name, f, 'image/tiff')})
    assert response.status_code == 200, response.text
    return response.json()


def main():
    with tempfile.TemporaryDirectory(prefix='satquery_e2e_') as td:
        root = Path(td)
        h = w = 64
        before = np.stack([np.full((h,w), 10), np.full((h,w), 20), np.full((h,w), 30)])
        after = before.copy(); after[:, 20:40, 20:40] *= 2
        sar = np.full((1,h,w), 15); sar[:, 20:40, 20:40] = 5
        before_path, after_path, sar_path = root/'before.tif', root/'after.tif', root/'sar.tif'
        make_raster(before_path, before, {'SATELLITE':'SENTINEL-2','PROCESSING_LEVEL':'L2A'})
        make_raster(after_path, after, {'SATELLITE':'SENTINEL-2','PROCESSING_LEVEL':'L2A'})
        make_raster(sar_path, sar, {'SATELLITE':'SENTINEL-1','POLARISATION':'VV'})
        client = TestClient(app)
        b, a, s = upload(client, before_path, 'before.tif'), upload(client, after_path, 'after.tif'), upload(client, sar_path, 'sar.tif')
        assert b['metadata']['width'] == 64 and b['metadata']['height'] == 64
        assert b['metadata']['crs']['epsg'] == 32643
        assert b['metadata']['resolution']['x_res'] == 10.0
        assert b['metadata']['bands'][0]['mean'] == 10.0
        ids = {'before': b['id'], 'after': a['id'], 'sar': s['id']}
        vqa = client.post('/api/v1/analysis/vqa', json={'image_id': b['id'], 'question':'What land cover types are visible?'})
        assert vqa.status_code == 200, vqa.text
        assert vqa.json()['image_id'] == b['id'] and 'evidence' in vqa.json()
        grounding = client.post('/api/v1/analysis/grounding', json={'image_id': b['id'], 'referring_expression':'buildings'})
        assert grounding.status_code == 200, grounding.text
        assert grounding.json()['regions_geojson']['type'] == 'FeatureCollection'
        change = client.post('/api/v1/analysis/change', json={'image_before_id': b['id'], 'image_after_id': a['id']})
        assert change.status_code == 200, change.text
        change_data = change.json()
        assert isinstance(change_data['change_percent'], (int, float))
        assert isinstance(change_data['total_area_m2'], (int, float))
        assert change_data['change_percent'] > 0.0
        assert change_data['total_area_m2'] > 0.0
        assert change_data['regions_geojson']['type'] == 'FeatureCollection'
        sar_result = client.post('/api/v1/analysis/optical-sar', json={'optical_image_id': a['id'], 'sar_image_id': s['id']})
        assert sar_result.status_code in (200, 404), sar_result.text
        query = client.post('/api/v1/query', json={'query':'What land cover types are visible?', 'image_ids':[b['id']]})
        assert query.status_code == 200, query.text
        q = query.json(); assert q['intent'] == 'vqa' and q['job_id']
        report = client.get(f"/api/v1/reports/{q['job_id']}/geojson")
        assert report.status_code == 200, report.text
        assert client.get('/api/v1/health').status_code == 200
        print('E2E_PASS')
        print({'image_ids': ids, 'change_percent': change_data['change_percent'], 'total_area_m2': change_data['total_area_m2'], 'vqa_answer': vqa.json().get('answer'), 'vqa_confidence': vqa.json().get('confidence'), 'sar_status': sar_result.status_code, 'query_job_id': q['job_id'], 'report_status': report.status_code})

if __name__ == '__main__':
    main()
