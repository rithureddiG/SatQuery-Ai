export type LensMode =
  | 'True Color'
  | 'NIR'
  | 'SWIR'
  | 'SAR'
  | 'NDVI'
  | 'NDWI'
  | 'NDBI'
  | 'CHANGE'
  | 'EVIDENCE';

export interface CRSInfo {
  present: boolean;
  valid: boolean;
  epsg: number | null;
  name: string | null;
  type: string;
  status: string;
  units: string | null;
}

export interface BoundingBox {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  wgs84?: {
    min_lon: number;
    min_lat: number;
    max_lon: number;
    max_lat: number;
  } | null;
}

export interface SpatialResolution {
  x_res: number;
  y_res: number;
  units: string;
}

export interface BandStatistics {
  band_index: number;
  dtype: string;
  min: number;
  max: number;
  mean: number;
  std?: number | null;
  nodata?: number | null;
}

export interface ModalityInfo {
  detected: string;
  confidence: number;
  basis: string[];
}

export interface RasterMetadata {
  filename: string;
  format: string;
  driver?: string | null;
  width: number;
  height: number;
  band_count: number;
  dtype: string;
  crs: CRSInfo;
  transform: number[];
  bounds?: BoundingBox | null;
  resolution: SpatialResolution;
  nodata?: number | null;
  compression?: string | null;
  bands: BandStatistics[];
  modality: ModalityInfo;
  tags?: Record<string, string>;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface PreviewInfo {
  available: boolean;
  preview_url?: string | null;
}

export interface ImageInspectionResponse {
  id: string;
  status: string;
  metadata?: RasterMetadata | null;
  validation: ValidationResult;
  preview: PreviewInfo;
}

export interface ImageSummary {
  id: string;
  filename: string;
  format: string;
  modality: string;
  width: number;
  height: number;
  band_count: number;
  crs?: string | null;
  preview_url?: string | null;
  created_at: string;
}

export interface ExecutionStep {
  step_number: number;
  tool: string;
  description: string;
  status: string;
  duration_ms: number;
  model?: string | null;
  output_summary?: string | null;
}

export interface ConfidenceScore {
  overall: number | null;
  model_score: number | null;
  resolution_score: number | null;
  registration_score?: number | null;
  sar_agreement_score?: number | null;
  factors: Record<string, number>;
  notes: string[];
}

export interface EvidenceObject {
  id: string;
  claim: string;
  source_analysis_id: string;
  source_image_ids: string[];
  model_used: string;
  output_geometry?: any;
  confidence: ConfidenceScore;
  execution_steps: ExecutionStep[];
  artifacts: string[];
  created_at: string;
}

export interface FindingObservation {
  asset_ids: string[];
  modality: string;
  acquisition_time: string;
  sensor: string;
}

export interface FindingModel {
  name: string;
  version: string;
  checkpoint: string;
  real_weights: boolean;
}

export interface FindingSpatial {
  geometry: any;
  crs: string;
  area_m2: number;
  area_ha: number;
  bbox: { ymin: number; xmin: number; ymax: number; xmax: number };
}

export interface FindingConfidence {
  model_confidence: number;
  evidence_score: number;
  calibrated_confidence: number;
}

export interface FindingProvenance {
  source_assets: string[];
  processing_steps: string[];
  timestamps: string[];
}

export interface FindingVisualEvidence {
  raster_window: string;
  overlay: string;
  annotation: string;
}

export interface Finding {
  id: string;
  mission_id: string;
  query: string;
  title: string;
  category: string;
  observation: FindingObservation;
  model: FindingModel;
  spatial: FindingSpatial;
  confidence: FindingConfidence;
  provenance: FindingProvenance;
  visual_evidence: FindingVisualEvidence;
}

export interface VQAAnalysisResult {
  job_id: string;
  image_id: string;
  question: string;
  answer: string;
  confidence: ConfidenceScore;
  evidence: EvidenceObject;
  execution_steps: ExecutionStep[];
  total_duration_ms: number;
}

export interface GroundingFeature {
  type: string;
  id: string;
  properties: {
    label: string;
    confidence: number;
    area_m2: number;
    bbox_normalized: { ymin: number; xmin: number; ymax: number; xmax: number };
    bbox_pixel: { ymin: number; xmin: number; ymax: number; xmax: number };
  };
  geometry: any;
}

export interface GroundingAnalysisResult {
  job_id: string;
  image_id: string;
  referring_expression: string;
  regions_geojson: {
    type: string;
    features: GroundingFeature[];
  };
  total_area_m2: number;
  confidence: ConfidenceScore;
  evidence: EvidenceObject;
  execution_steps: ExecutionStep[];
  total_duration_ms: number;
}

export interface ChangeFeature {
  type: string;
  id: string;
  properties: {
    cluster_id: number;
    area_m2: number;
    area_ha: number;
    pixel_count: number;
  };
  geometry: any;
}

export interface ChangeAnalysisResult {
  job_id: string;
  image_before_id: string;
  image_after_id: string;
  change_percent: number;
  total_area_m2: number;
  total_area_ha: number;
  cluster_count: number;
  regions_geojson: {
    type: string;
    features: ChangeFeature[];
  };
  mask_preview_url: string;
  is_trained: boolean;
  confidence: ConfidenceScore;
  evidence: EvidenceObject;
  execution_steps: ExecutionStep[];
  total_duration_ms: number;
}

export interface OpticalSARAnalysisResult {
  job_id: string;
  optical_image_id: string;
  sar_image_id: string;
  corroboration_score: number;
  joint_claim: string;
  optical_features: {
    sensor: string;
    band_count: number;
    mean_spectral: number[];
    water_fraction_proxy: number;
    embedding_dim: number;
  };
  sar_features: {
    sensor: string;
    polarization: string;
    mean_sigma0_db: number;
    min_sigma0_db: number;
    max_sigma0_db: number;
    std_sigma0_db: number;
    low_backscatter_fraction: number;
    embedding_dim: number;
  };
  confidence: ConfidenceScore;
  evidence: EvidenceObject;
  execution_steps: ExecutionStep[];
  total_duration_ms: number;
}

export interface AgentQueryLocation {
  name?: string;
  lat?: number;
  lon?: number;
  crs_name?: string;
  utm_zone?: number | string;
  utmZone?: string;
  epsg?: number;
}

export interface AgentQueryResponse {
  query: string;
  intent: string;
  target?: string;
  operation?: string;
  measurement?: string;
  mission_id?: string;
  query_hash?: string;
  result_hash?: string;
  mission_plan?: Record<string, unknown>;
  task?: string;
  intent_confidence: number;
  job_id: string;
  answer: string;
  location?: AgentQueryLocation;
  pipeline_result: any;
  confidence: ConfidenceScore;
  evidence: EvidenceObject;
  execution_steps: ExecutionStep[];
  report_urls: {
    pdf: string;
    geojson: string;
    csv: string;
    json?: string;
  };
  total_duration_ms: number;
}

export interface HardwareInfo {
  torch_available: boolean;
  cuda_available: boolean;
  device: string;
  active_model?: string | null;
  gpu?: {
    name: string;
    total_vram_mb: number;
    allocated_vram_mb: number;
    reserved_vram_mb: number;
    peak_vram_mb: number;
    multi_processor_count: number;
  } | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  version?: string;
  environment?: string;
  hardware?: HardwareInfo;
}

export interface SatelliteObservationItem {
  id: string;
  title: string;
  sensor: 'Sentinel-2 L2A' | 'Sentinel-1 C-SAR' | 'Landsat-9 OLI';
  modality: 'optical' | 'sar' | 'multispectral';
  date: string;
  dateFormatted: string;
  cloudCoverPct: number;
  sunElevationDeg: number;
  orbit: string;
  polarization?: string;
  resolution: string;
  bands: string[];
  thumbnailUrl: string;
  previewUrl?: string;
  utmZone: string;
  epsg: number;
  bbox: [number, number, number, number];
  stacCollection: string;
  provider: string;
  qualityScore: number;
  processingLevel: string;
}

export interface SearchEarthLocation {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  utmZone: string;
  epsg: number;
  bbox: [number, number, number, number];
  country: string;
  areaEstimateKm2?: number;
}

export interface CustomAOI {
  id: string;
  name: string;
  format: 'geojson' | 'kml' | 'shapefile' | 'manual';
  crs: {
    inputCrs: string;
    canonicalCrs: string; // EPSG:4326
    utmZone: string;      // e.g. EPSG:32643
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  centroid: [number, number]; // [lon, lat]
  metrics: {
    areaHa: number;
    areaM2: number;
    perimeterM: number;
    vertexCount: number;
  };
  validation: {
    isValid: boolean;
    isSelfIntersecting: boolean;
    isClosed: boolean;
    reprojected: boolean;
    warnings: string[];
  };
  createdAt: string;
}

export interface SpectralBand {
  band: string;
  name: string;
  wavelengthNm: number;
  reflectance: number;
  category: 'VNIR' | 'RedEdge' | 'SWIR';
}

export interface SpectralIndices {
  ndvi: number;
  ndwi: number;
  ndbi: number;
  evi: number;
  savi: number;
}

export interface SarSignature {
  vvDb: number;
  vhDb: number;
  vvVhRatioDb: number;
  scatteringMechanism: 'Double-bounce (Built Structure)' | 'Volumetric (Canopy / Crops)' | 'Specular (Water / Smooth Surface)' | 'Rough Surface (Bare Soil)';
  polarizationConfidence: number;
}

export interface ZonalStatistics {
  meanNdvi: number;
  medianNdvi: number;
  stdDevNdvi: number;
  minNdvi: number;
  maxNdvi: number;
  meanSarVvDb: number;
  meanSarVhDb: number;
  areaHa: number;
  pixelCount: number;
  dominantSurface: string;
}

export interface SpectralInspectionResult {
  location: {
    lat: number;
    lon: number;
    gsdM: number;
    crs: string;
  };
  sensor: {
    optical: string;
    sar: string;
    acquisitionDate: string;
    sunElevationDeg: number;
  };
  bands: SpectralBand[];
  indices: SpectralIndices;
  sar: SarSignature;
  zonalStats?: ZonalStatistics;
}

export interface EpochObservation {
  id: string;
  date: string;
  year: number;
  month: string;
  sensor: 'Sentinel-2A' | 'Sentinel-2B' | 'Sentinel-1A' | 'Landsat-9';
  modality: 'optical' | 'sar';
  cloudCoverPct: number;
  resolutionM: number;
  orbitPass: string;
  sunElevationDeg: number;
  tileId: string;
  isBaseline?: boolean;
  isLatest?: boolean;
  cumulativeChangeHa: number;
  thumbnailUrl: string;
  quality: 'Excellent' | 'Good' | 'Cloudy' | 'Radar High-Fidelity';
}

export type DisplayViewMode = 'swipe' | 'split' | 'single' | 'flicker' | 'difference';

export interface SplitViewportConfig {
  leftLens: LensMode;
  rightLens: LensMode;
  leftEpochId: string;
  rightEpochId: string;
  splitRatio: number;
  syncPanZoom: boolean;
  crosshairSync: boolean;
}

export interface SentinelWatchCondition {
  type: 'built_up_increase' | 'ndvi_decrease' | 'sar_anomaly' | 'water_loss';
  operator: '>' | '<';
  thresholdValue: number;
  unit: 'ha' | '%' | 'dB';
}

export interface SentinelWatchItem {
  id: string;
  name: string;
  locationName: string;
  centroid: [number, number];
  aoiGeometry?: any;
  aoiAreaHa: number;
  sensors: string[];
  frequency: 'Every available acquisition' | 'Weekly digest' | 'Bi-monthly';
  conditions: SentinelWatchCondition[];
  status: 'Monitoring' | 'Alert Triggered' | 'Standby';
  lastCheckDate: string;
  nextSceneDate: string;
  latestDeltas: {
    builtUpAreaHaChange: number;
    vegetationPctChange: number;
    sarAnomalyDb: number;
    alertTriggered: boolean;
    triggerReason?: string;
  };
  createdAt: string;
}

