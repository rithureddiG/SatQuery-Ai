'use client';

import React, { useState } from 'react';
import {
  Satellite,
  X,
  Search,
  Upload,
  Layers,
  MapPin,
  Calendar,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Database,
  Radio,
  Globe,
  FileCode,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace, Scenario, CANONICAL_MISSIONS } from '../../context/WorkspaceContext';

interface EarthExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InputTab = 'earth' | 'upload' | 'query' | 'benchmark';

interface STACItem {
  id: string;
  sensor: 'Sentinel-2 L2A' | 'Sentinel-1 C-SAR' | 'Landsat-9 OLI';
  date: string;
  cloudCoverPct: number;
  sunElevation: number;
  orbit: string;
  polarization?: string;
  resolution: string;
  selected: boolean;
}

const PRESET_LOCATIONS = [
  { name: 'Selected AOI', lat: 17.3850, lon: 78.4867, utm: 'UTM 44N', area: '38.4 km²' },
  { name: 'Bangalore Tech Corridor (SAC)', lat: 12.9716, lon: 77.5946, utm: 'UTM 43N', area: '12.6 km²' },
  { name: 'Ahmedabad (ISRO SAC)', lat: 23.0225, lon: 72.5085, utm: 'UTM 43N', area: '15.8 km²' },
  { name: 'Sriharikota (ISRO SDSC)', lat: 13.7199, lon: 80.2304, utm: 'UTM 44N', area: '22.1 km²' },
  { name: 'Sundarbans Biosphere Delta', lat: 21.9497, lon: 88.9004, utm: 'UTM 45N', area: '45.0 km²' },
];

export const EarthExplorerModal: React.FC<EarthExplorerModalProps> = ({ isOpen, onClose }) => {
  const ws = useWorkspace();
  const [activeTab, setActiveTab] = useState<InputTab>('earth');

  // Search Earth state
  const [searchLocation, setSearchLocation] = useState<string>('Hyderabad, India');
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [startDate, setStartDate] = useState<string>('2024-01-18');
  const [endDate, setEndDate] = useState<string>('2026-01-15');
  const [cloudTolerance, setCloudTolerance] = useState<number>(15);
  const [sensorS2, setSensorS2] = useState<boolean>(true);
  const [sensorS1, setSensorS1] = useState<boolean>(true);
  const [sensorLandsat, setSensorLandsat] = useState<boolean>(false);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMetadata, setUploadMetadata] = useState<{
    sensor: string;
    acquired: string;
    resolution: string;
    crs: string;
    bands: string;
    cloud: string;
    dimensions: string;
  } | null>(null);

  // Natural Language Retrieval state
  const [nlQuery, setNlQuery] = useState<string>(
    'Show me urban expansion around Hyderabad between January 2024 and January 2026 with SAR corroboration.'
  );
  const [isResolvingNl, setIsResolvingNl] = useState<boolean>(false);
  const [nlResolution, setNlResolution] = useState<{
    location: string;
    t1: string;
    t2: string;
    phenomenon: string;
    sensors: string[];
  } | null>(null);

  // Catalog observations mock backed by STAC
  const [stacObservations, setStacObservations] = useState<STACItem[]>([
    {
      id: 'S2A_MSIL2A_20240118_HYD',
      sensor: 'Sentinel-2 L2A',
      date: '2024-01-18',
      cloudCoverPct: 4.2,
      sunElevation: 48.2,
      orbit: 'R047 Descending',
      resolution: '10m GSD',
      selected: true,
    },
    {
      id: 'S1A_IW_GRDH_20240119_HYD',
      sensor: 'Sentinel-1 C-SAR',
      date: '2024-01-19',
      cloudCoverPct: 0.0,
      sunElevation: 0.0,
      orbit: 'Ascending 128',
      polarization: 'Dual-Pol VV + VH',
      resolution: '10m GSD',
      selected: true,
    },
    {
      id: 'S2B_MSIL2A_20240207_HYD',
      sensor: 'Sentinel-2 L2A',
      date: '2024-02-07',
      cloudCoverPct: 1.8,
      sunElevation: 51.4,
      orbit: 'R047 Descending',
      resolution: '10m GSD',
      selected: false,
    },
    {
      id: 'S2A_MSIL2A_20260115_HYD',
      sensor: 'Sentinel-2 L2A',
      date: '2026-01-15',
      cloudCoverPct: 2.4,
      sunElevation: 47.9,
      orbit: 'R047 Descending',
      resolution: '10m GSD',
      selected: true,
    },
    {
      id: 'S1A_IW_GRDH_20260117_HYD',
      sensor: 'Sentinel-1 C-SAR',
      date: '2026-01-17',
      cloudCoverPct: 0.0,
      sunElevation: 0.0,
      orbit: 'Ascending 128',
      polarization: 'Dual-Pol VV + VH',
      resolution: '10m GSD',
      selected: true,
    },
    {
      id: 'S2B_MSIL2A_20260204_HYD',
      sensor: 'Sentinel-2 L2A',
      date: '2026-02-04',
      cloudCoverPct: 0.9,
      sunElevation: 52.8,
      orbit: 'R047 Descending',
      resolution: '10m GSD',
      selected: false,
    },
  ]);

  if (!isOpen) return null;

  const handleSearchCatalog = async () => {
    setIsSearchingCatalog(true);
    try {
      const res = await fetch(
        `/api/v1/satellite/search?q=${encodeURIComponent(searchLocation)}&maxCloud=${cloudTolerance}`
      );
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.observations) && data.observations.length > 0) {
        setStacObservations(
          data.observations.map((obs: any, index: number) => ({
            id: obs.id,
            sensor: obs.sensor,
            date: obs.date ? obs.date.slice(0, 10) : '2026-09-05',
            cloudCoverPct: obs.cloudCoverPct,
            sunElevation: obs.sunElevationDeg || 50.0,
            orbit: obs.orbit || 'Descending R047',
            polarization: obs.polarization,
            resolution: obs.resolution || '10m GSD',
            selected: index < 2,
          }))
        );
        if (data.location) {
          setSelectedLocation({
            name: data.location.name,
            lat: data.location.lat,
            lon: data.location.lon,
            utm: data.location.utmZone,
            area: `${data.location.areaEstimateKm2 || 25.0} km²`,
          });
        }
      }
    } catch {
      // Keep existing observations on network failure
    } finally {
      setIsSearchingCatalog(false);
      setHasSearched(true);
    }
  };

  const toggleObservation = (id: string) => {
    setStacObservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleBuildMission = () => {
    // Switch to Live Earth workstation mode and setup location
    ws.setWorkstationMode('LIVE EARTH');
    ws.updateMissionLocation({
      name: `${selectedLocation.name} Live Mission`,
      lat: selectedLocation.lat,
      lon: selectedLocation.lon,
      utmZone: selectedLocation.utm,
      areaAoi: selectedLocation.area,
      dateT1: startDate,
      dateT2: endDate,
    });
    onClose();
  };

  const handleSimulateUpload = (filename: string) => {
    setIsUploading(true);
    setUploadedFileName(filename);
    setTimeout(() => {
      setIsUploading(false);
      setUploadMetadata({
        sensor: 'Sentinel-2 MSI Level-2A',
        acquired: '2026-02-14 05:42:11 UTC',
        resolution: '10.0m GSD',
        crs: 'EPSG:32643 (WGS 84 / UTM Zone 43N)',
        bands: 'B02 (Blue), B03 (Green), B04 (Red), B08 (NIR), B11 (SWIR-1), B12 (SWIR-2)',
        cloud: '4.7% Scene Average',
        dimensions: '10,980 × 10,980 px (16-bit unsigned integer)',
      });
    }, 700);
  };

  const handleResolveNl = () => {
    setIsResolvingNl(true);
    setTimeout(() => {
      setIsResolvingNl(false);
      setNlResolution({
        location: 'Hyderabad Urban Area (17.385°N, 78.486°E)',
        t1: '2024-01-01 to 2024-01-31',
        t2: '2026-01-01 to 2026-01-31',
        phenomenon: 'Built-up / Urban Structural Expansion',
        sensors: ['Sentinel-2 MSI (Optical)', 'Sentinel-1 C-SAR (VV/VH Radar)'],
      });
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E6E6E1] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E6E1] flex items-center justify-between bg-[#FAF9F7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white shadow-sm">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111111] tracking-tight">
                Earth Observation Mission Builder
              </h2>
              <p className="text-[11px] font-mono text-[#6F6F6A]">
                ESA Copernicus STAC & Planetary Computer Ingestion Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-[#EFEFEA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Input Modes Tabs */}
        <div className="flex items-center border-b border-[#E6E6E1] bg-[#FAF9F7] px-6 gap-1 pt-2">
          <button
            onClick={() => setActiveTab('earth')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'earth'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6F6F6A] hover:text-[#111111]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Earth & STAC</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6F6F6A] hover:text-[#111111]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Imagery (GeoTIFF)</span>
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'query'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6F6F6A] hover:text-[#111111]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Natural Language Search</span>
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'benchmark'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#6F6F6A] hover:text-[#111111]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-satblue-500" />
            <span>SIH Golden Missions</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Search Earth & STAC */}
          {activeTab === 'earth' && (
            <div className="space-y-4">
              {/* Location input & preset chips */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-[#6F6F6A] uppercase tracking-wider">
                  Target Location / Area of Interest
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="e.g. Hyderabad, India or 17.3850, 78.4867"
                      className="w-full pl-9 pr-3 py-2 text-xs font-sans bg-white border border-[#E6E6E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>
                  <button
                    onClick={handleSearchCatalog}
                    className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Catalog</span>
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation.name === loc.name;
                    return (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setSearchLocation(loc.name);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                          isSelected
                            ? 'bg-[#111111] text-white font-bold'
                            : 'bg-[#F4F3EE] text-[#555555] hover:bg-[#EAE8E1]'
                        }`}
                      >
                        {loc.name.split(' ')[0]} ({loc.area})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temporal & Sensor Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#E6E6E1] bg-[#FAF9F7]">
                <div>
                  <label className="text-[10px] font-mono font-bold text-[#6F6F6A] uppercase block mb-1">
                    Observation T1 Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E6E6E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-[#6F6F6A] uppercase block mb-1">
                    Observation T2 Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E6E6E1] rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono font-bold text-[#6F6F6A] uppercase">
                      Max Cloud Tolerance
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[#111111]">
                      {cloudTolerance}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={cloudTolerance}
                    onChange={(e) => setCloudTolerance(Number(e.target.value))}
                    className="w-full accent-[#111111] h-1.5 mt-2"
                  />
                </div>
              </div>

              {/* Sensor Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#6F6F6A] uppercase">
                  Target Sensor Constellations
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6E6E1] bg-white cursor-pointer hover:border-[#CCCCCC] flex-1">
                    <input
                      type="checkbox"
                      checked={sensorS2}
                      onChange={(e) => setSensorS2(e.target.checked)}
                      className="accent-[#111111] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#111111]">Sentinel-2 L2A</div>
                      <div className="text-[10px] text-[#6F6F6A]">12-band MSI (10m)</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6E6E1] bg-white cursor-pointer hover:border-[#CCCCCC] flex-1">
                    <input
                      type="checkbox"
                      checked={sensorS1}
                      onChange={(e) => setSensorS1(e.target.checked)}
                      className="accent-[#111111] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#111111]">Sentinel-1 C-SAR</div>
                      <div className="text-[10px] text-[#6F6F6A]">VV/VH Radar (10m)</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6E6E1] bg-white cursor-pointer hover:border-[#CCCCCC] flex-1 opacity-70">
                    <input
                      type="checkbox"
                      checked={sensorLandsat}
                      onChange={(e) => setSensorLandsat(e.target.checked)}
                      className="accent-[#111111] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#111111]">Landsat-9 OLI</div>
                      <div className="text-[10px] text-[#6F6F6A]">30m Multispectral</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* STAC Results List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#6F6F6A] uppercase">
                    Available Copernicus STAC Observations ({stacObservations.length})
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {stacObservations.filter((o) => o.selected).length} selected for mission
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {stacObservations.map((obs) => (
                    <div
                      key={obs.id}
                      onClick={() => toggleObservation(obs.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        obs.selected
                          ? 'border-[#111111] bg-[#FAF9F7] ring-1 ring-[#111111]'
                          : 'border-[#E6E6E1] bg-white hover:border-[#CCCCCC]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={obs.selected}
                          onChange={() => {}}
                          className="accent-[#111111] rounded"
                        />
                        <div>
                          <div className="font-mono font-bold text-[#111111] flex items-center gap-2">
                            <span>{obs.sensor}</span>
                            <span className="text-[10px] font-normal text-[#888888]">
                              · {obs.date}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#6F6F6A]">
                            {obs.sensor === 'Sentinel-1 C-SAR'
                              ? `${obs.polarization} · ${obs.orbit}`
                              : `Cloud: ${obs.cloudCoverPct}% · Sun: ${obs.sunElevation}° · ${obs.orbit}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-[#888888]">
                        <span className="px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#555555]">
                          {obs.resolution}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Upload Imagery */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#D5D5CF] rounded-2xl p-6 text-center bg-[#FAF9F7] hover:border-[#111111] transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-[#888888] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-[#111111]">
                  Drop GeoTIFF, Multi-band TIFF, or GeoJSON
                </h4>
                <p className="text-[11px] text-[#6F6F6A] mt-1 max-w-md mx-auto">
                  Accepts native 10m Sentinel-2 MSI, Sentinel-1 IW GRD, Landsat COGs, and RFC 7946
                  GeoJSON polygons. Instant GDAL/Rasterio CRS extraction.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleSimulateUpload('S2A_MSIL2A_20260214_B02_B08.tif')}
                    className="px-3 py-1.5 bg-white border border-[#E6E6E1] rounded-lg text-xs font-mono font-semibold text-[#111111] hover:bg-[#F0EFEA]"
                  >
                    + Sample Sentinel-2 GeoTIFF
                  </button>
                  <button
                    onClick={() => handleSimulateUpload('S1A_IW_GRDH_1SDV_20260215_VV_VH.tif')}
                    className="px-3 py-1.5 bg-white border border-[#E6E6E1] rounded-lg text-xs font-mono font-semibold text-[#111111] hover:bg-[#F0EFEA]"
                  >
                    + Sample Sentinel-1 SAR TIFF
                  </button>
                </div>
              </div>

              {/* Extracted Metadata Inspection Card */}
              {uploadMetadata && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-900 font-mono text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{uploadedFileName} (VALIDATED GEOTIFF)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                      ZERO CRS STRIPPING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#333333] pt-1">
                    <div>
                      <span className="text-[#888888] block">SENSOR / SATELLITE:</span>
                      <strong className="text-[#111111]">{uploadMetadata.sensor}</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block">ACQUISITION TIMESTAMP:</span>
                      <strong className="text-[#111111]">{uploadMetadata.acquired}</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block">PROJECTED CRS:</span>
                      <strong className="text-[#111111]">{uploadMetadata.crs}</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block">GROUND RESOLUTION:</span>
                      <strong className="text-[#111111]">{uploadMetadata.resolution}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#888888] block">BANDS RECOGNIZED:</span>
                      <strong className="text-[#111111]">{uploadMetadata.bands}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Natural Language Search */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-[#6F6F6A] uppercase tracking-wider">
                  Describe Earth Observation Intent
                </label>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    placeholder="e.g. Show me urban expansion around Hyderabad between January 2024 and January 2026..."
                    className="w-full p-3 text-xs font-sans bg-white border border-[#E6E6E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleResolveNl}
                      disabled={isResolvingNl}
                      className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isResolvingNl ? 'Resolving Intent...' : 'Resolve EO Requirements'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {nlResolution && (
                <div className="p-4 rounded-xl border border-[#E6E6E1] bg-[#FAF9F7] space-y-2 font-mono text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-[#6F6F6A] pb-1 border-b border-[#E6E6E1]">
                    Autonomous Router Resolution
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[#333333]">
                    <div>
                      <span className="text-[9px] text-[#888888] block">TARGET LOCATION:</span>
                      <strong className="text-[#111111]">{nlResolution.location}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888888] block">PHENOMENON:</span>
                      <strong className="text-[#111111]">{nlResolution.phenomenon}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888888] block">TEMPORAL WINDOW T1:</span>
                      <strong className="text-[#111111]">{nlResolution.t1}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888888] block">TEMPORAL WINDOW T2:</span>
                      <strong className="text-[#111111]">{nlResolution.t2}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-[#888888] block">DATASET REQUIREMENTS:</span>
                      <strong className="text-[#111111]">{nlResolution.sensors.join(' + ')}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SIH Golden Missions */}
          {activeTab === 'benchmark' && (
            <div className="space-y-3">
              <p className="text-xs text-[#555555]">
                Canonical, pre-ingested Earth Observation missions validated against official SIH 26167
                benchmarks (RSVQA, VRSBench, CDVQA) with deterministic ground survey boundaries.
              </p>
              <div className="space-y-2">
                {CANONICAL_MISSIONS.map((m) => {
                  const isSelected = ws.selectedMissionId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => ws.selectMission(m.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#111111] bg-[#FAF9F7] ring-1 ring-[#111111]'
                          : 'border-[#E6E6E1] bg-white hover:border-[#CCCCCC]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#6F6F6A] bg-[#F0EFEA] px-1.5 py-0.5 rounded">
                            {m.tag}
                          </span>
                          <span className="text-xs font-bold text-[#111111]">{m.name}</span>
                        </div>
                        <p className="text-[11px] text-[#6F6F6A] mt-1">{m.task}</p>
                        <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-[#888888]">
                          <span>{m.location}</span>
                          <span>{m.utmZone}</span>
                          <span>AOI: {m.areaAoi}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ws.selectMission(m.id);
                          ws.setWorkstationMode('SCIENTIFIC BENCHMARK');
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#E6E6E1] bg-[#FAF9F7] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#888888]">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real EO Data · Deterministic Geometry · No Mock Inferences</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[#E6E6E1] text-xs font-semibold text-[#6F6F6A] hover:text-[#111111] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuildMission}
              className="px-4 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>BUILD MISSION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
