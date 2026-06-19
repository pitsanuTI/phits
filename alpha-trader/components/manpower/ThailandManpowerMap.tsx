'use client';
import { useState, memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';

// ── Province → Region mapping ──────────────────────────────────────────
const PROVINCE_REGION: Record<string, string> = {
  'Chiang Mai': 'North', 'Chiang Rai': 'North', 'Mae Hong Son': 'North',
  'Lamphun': 'North', 'Lampang': 'North', 'Phrae': 'North', 'Nan': 'North',
  'Phayao': 'North', 'Uttaradit': 'North', 'Sukhothai': 'North',
  'Phitsanulok': 'North', 'Phichit': 'North', 'Kamphaeng Phet': 'North',
  'Tak': 'North', 'Nakhon Sawan': 'North', 'Phetchabun': 'North', 'Uthai Thani': 'North',
  'Nakhon Ratchasima': 'Northeast', 'Chaiyaphum': 'Northeast', 'Buri Ram': 'Northeast',
  'Surin': 'Northeast', 'Si Sa Ket': 'Northeast', 'Ubon Ratchathani': 'Northeast',
  'Yasothon': 'Northeast', 'Nakhon Phanom': 'Northeast', 'Mukdahan': 'Northeast',
  'Loei': 'Northeast', 'Udon Thani': 'Northeast', 'Nong Bua Lam Phu': 'Northeast',
  'Khon Kaen': 'Northeast', 'Kalasin': 'Northeast', 'Maha Sarakham': 'Northeast',
  'Roi Et': 'Northeast', 'Amnat Charoen': 'Northeast', 'Sakon Nakhon': 'Northeast',
  'Nong Khai': 'Northeast', 'Bueng Kan': 'Northeast',
  'Bangkok Metropolis': 'Central', 'Nonthaburi': 'Central', 'Pathum Thani': 'Central',
  'Samut Prakan': 'Central', 'Samut Sakhon': 'Central', 'Samut Songkhram': 'Central',
  'Nakhon Pathom': 'Central', 'Suphan Buri': 'Central', 'Sing Buri': 'Central',
  'Ang Thong': 'Central', 'Lop Buri': 'Central', 'Saraburi': 'Central',
  'Phra Nakhon Si Ayutthaya': 'Central', 'Chai Nat': 'Central',
  'Nakhon Nayok': 'Central', 'Chachoengsao': 'Central',
  'Chon Buri': 'East', 'Rayong': 'East', 'Chanthaburi': 'East',
  'Trat': 'East', 'Sa Kaeo': 'East', 'Prachin Buri': 'East',
  'Kanchanaburi': 'West', 'Ratchaburi': 'West', 'Phetchaburi': 'West',
  'Prachuap Khiri Khan': 'West',
  'Chumphon': 'South', 'Ranong': 'South', 'Surat Thani': 'South',
  'Nakhon Si Thammarat': 'South', 'Phangnga': 'South', 'Phuket': 'South',
  'Krabi': 'South', 'Trang': 'South', 'Phatthalung': 'South',
  'Songkhla': 'South', 'Satun': 'South', 'Pattani': 'South',
  'Yala': 'South', 'Narathiwat': 'South',
};

export const REGION_COLORS: Record<string, { fill: string; active: string; border: string; label: string }> = {
  North:     { fill: '#c7d2fe', active: '#4f46e5', border: '#a5b4fc', label: 'ภาคเหนือ'    },
  Northeast: { fill: '#a7f3d0', active: '#059669', border: '#6ee7b7', label: 'ภาคอีสาน'     },
  Central:   { fill: '#ddd6fe', active: '#7c3aed', border: '#c4b5fd', label: 'ภาคกลาง'      },
  East:      { fill: '#bae6fd', active: '#0284c7', border: '#7dd3fc', label: 'ภาคตะวันออก'  },
  West:      { fill: '#fed7aa', active: '#ea580c', border: '#fdba74', label: 'ภาคตะวันตก'   },
  South:     { fill: '#fde68a', active: '#d97706', border: '#fcd34d', label: 'ภาคใต้'       },
};

export const ALL_REGIONS = ['All', 'North', 'Northeast', 'Central', 'East', 'West', 'South'] as const;
export type TRegion = typeof ALL_REGIONS[number];

// ── Region view config: center + scale per region ─────────────────────
// All: tight crop — Thailand fills ~90% of the 240×440 viewport
const REGION_VIEW: Record<string, { center: [number, number]; scale: number }> = {
  // All: scale=850 → Thailand height ≈ 221px in 250 SVG height → full country visible
  All:       { center: [101.5, 13.5],  scale: 850  },
  North:     { center: [99.5,  18.0],  scale: 2000 },
  Northeast: { center: [103.0, 15.5],  scale: 1900 },
  Central:   { center: [100.5, 14.3],  scale: 3800 },
  East:      { center: [102.5, 13.0],  scale: 2800 },
  West:      { center: [99.5,  15.0],  scale: 2200 },
  South:     { center: [101.0,  7.8],  scale: 2000 },
};

export interface SCMarker {
  id: string; province: string; labelTH: string;
  coordinates: [number, number]; region: string;
  centerName: string; activeStaff: number; totalStaff: number;
}

export const SERVICE_CENTERS: SCMarker[] = [
  { id:'bkk', province:'Bangkok Metropolis', labelTH:'กรุงเทพฯ',       coordinates:[100.501,13.756], region:'Central',   centerName:'Samsung ASC — เซ็นทรัลเวิลด์',     activeStaff:29, totalStaff:32 },
  { id:'cnx', province:'Chiang Mai',         labelTH:'เชียงใหม่',       coordinates:[98.985,18.787],  region:'North',     centerName:'Samsung ASC — เซ็นทรัลแอร์พอร์ต',  activeStaff:11, totalStaff:12 },
  { id:'cri', province:'Chiang Rai',         labelTH:'เชียงราย',        coordinates:[99.833,19.909],  region:'North',     centerName:'Samsung ASC — เชียงราย',             activeStaff:8,  totalStaff:8  },
  { id:'kkn', province:'Khon Kaen',          labelTH:'ขอนแก่น',         coordinates:[102.834,16.432], region:'Northeast', centerName:'Samsung ASC — เซ็นทรัลขอนแก่น',    activeStaff:10, totalStaff:11 },
  { id:'udn', province:'Udon Thani',         labelTH:'อุดรธานี',        coordinates:[102.787,17.415], region:'Northeast', centerName:'Samsung ASC — อุดรธานี',             activeStaff:9,  totalStaff:9  },
  { id:'nma', province:'Nakhon Ratchasima',  labelTH:'โคราช',           coordinates:[102.102,14.979], region:'Northeast', centerName:'Samsung ASC — เซ็นทรัลโคราช',      activeStaff:12, totalStaff:13 },
  { id:'ubn', province:'Ubon Ratchathani',   labelTH:'อุบลฯ',           coordinates:[104.848,15.245], region:'Northeast', centerName:'Samsung ASC — อุบลราชธานี',          activeStaff:7,  totalStaff:8  },
  { id:'chb', province:'Chon Buri',          labelTH:'ชลบุรี/พัทยา',   coordinates:[100.981,12.927], region:'East',      centerName:'Samsung ASC — เซ็นทรัลพัทยา',      activeStaff:9,  totalStaff:10 },
  { id:'pkt', province:'Phuket',             labelTH:'ภูเก็ต',          coordinates:[98.362,7.889],   region:'South',     centerName:'Samsung ASC — เซ็นทรัลภูเก็ต',     activeStaff:10, totalStaff:10 },
  { id:'srt', province:'Surat Thani',        labelTH:'สุราษฎร์ธานี',    coordinates:[99.350,9.140],   region:'South',     centerName:'Samsung ASC — สุราษฎร์ธานี',        activeStaff:7,  totalStaff:7  },
  { id:'hty', province:'Songkhla',           labelTH:'หาดใหญ่/สงขลา',  coordinates:[100.474,7.009],  region:'South',     centerName:'Samsung ASC — เซ็นทรัลหาดใหญ่',    activeStaff:10, totalStaff:11 },
];

interface TooltipState { x: number; y: number; name: string; region: string }

interface Props {
  activeRegion: TRegion;
  onRegionClick: (r: TRegion) => void;
  selectedSC: string | null;
  onSCClick: (id: string | null) => void;
}

function ThailandManpowerMap({ activeRegion, onRegionClick, selectedSC, onSCClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const view = REGION_VIEW[activeRegion] ?? REGION_VIEW.All;

  const getProvinceFill = (name: string) => {
    const region = PROVINCE_REGION[name] ?? 'Unknown';
    const c = REGION_COLORS[region];
    if (!c) return '#e2e8f0';
    if (activeRegion === 'All') return c.fill;
    return activeRegion === region ? c.fill : '#f1f5f9';
  };

  const getProvinceStroke = (name: string) => {
    const region = PROVINCE_REGION[name] ?? 'Unknown';
    const c = REGION_COLORS[region];
    if (!c) return '#cbd5e1';
    return (activeRegion === 'All' || activeRegion === region) ? c.border : '#e8ecf0';
  };

  const getProvinceOpacity = (name: string) => {
    if (activeRegion === 'All') return 1;
    const region = PROVINCE_REGION[name] ?? 'Unknown';
    return activeRegion === region ? 1 : 0.25;
  };

  const visibleMarkers = activeRegion === 'All'
    ? SERVICE_CENTERS
    : SERVICE_CENTERS.filter(sc => sc.region === activeRegion);

  const isZoomed = activeRegion !== 'All';
  // dot smaller when all-view (fits well at scale 850), larger when zoomed
  const dotBase = isZoomed ? 3.5 : 3;

  return (
    <div className="relative w-full select-none overflow-hidden"
      style={{ background: 'linear-gradient(155deg,#dbeafe 0%,#ede9fe 50%,#f0fdf4 100%)' }}>

      {/* ── Map SVG ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRegion}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: view.center, scale: view.scale }}
            width={280}
            height={250}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <Geographies geography="/thailand.json">
              {({ geographies }) =>
                geographies.map(geo => {
                  const name: string = geo.properties.name;
                  const region = PROVINCE_REGION[name] ?? 'Unknown';
                  const isActive = activeRegion === 'All' || activeRegion === region;
                  const rc = REGION_COLORS[region];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getProvinceFill(name)}
                      stroke={getProvinceStroke(name)}
                      strokeWidth={isActive ? 0.5 : 0.2}
                      style={{
                        default: { outline: 'none', opacity: getProvinceOpacity(name), transition: 'all 0.25s ease' },
                        hover:   { outline: 'none', fill: isActive ? (rc?.active ?? '#7c3aed') : '#e2e8f0', opacity: 1, cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={() => {
                        if (region !== 'Unknown') onRegionClick(activeRegion === region ? 'All' : region as TRegion);
                      }}
                      onMouseEnter={(e: React.MouseEvent) => {
                        if (!isActive) return;
                        const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        setTooltip({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0), name, region: rc?.label ?? region });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Service center markers */}
            {visibleMarkers.map(sc => {
              const isSel = selectedSC === sc.id;
              const isHov = hovered === sc.id;
              const rc = REGION_COLORS[sc.region];
              const size = isSel ? dotBase + 2 : isHov ? dotBase + 1 : dotBase;
              // label font scales with dot
              const labelSize = isZoomed ? 4.5 : 3.8;

              return (
                <Marker key={sc.id} coordinates={sc.coordinates}>
                  <g style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onSCClick(isSel ? null : sc.id); }}
                    onMouseEnter={() => setHovered(sc.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Glow ring when selected */}
                    {isSel && <circle r={size + 4.5} fill={rc?.active ?? '#7c3aed'} opacity={0.15} />}
                    {/* White border */}
                    <circle r={size + 1.5} fill="white" opacity={0.9} />
                    {/* Filled dot */}
                    <circle r={size} fill={rc?.active ?? '#7c3aed'} />
                    {/* Staff count — small, centered */}
                    <text textAnchor="middle" y={size * 0.38}
                      style={{ fontSize: size * 1.2, fontWeight: 700, fill: 'white', pointerEvents: 'none', userSelect: 'none' }}>
                      {sc.activeStaff}
                    </text>
                    {/* Province label */}
                    <text textAnchor="middle" y={size + 7}
                      style={{
                        fontSize: labelSize,
                        fontWeight: isSel ? 700 : 500,
                        fill: isSel ? (rc?.active ?? '#7c3aed') : '#334155',
                        pointerEvents: 'none', userSelect: 'none',
                        paintOrder: 'stroke', stroke: 'white', strokeWidth: 2, strokeLinejoin: 'round' as const,
                      }}>
                      {sc.labelTH}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </motion.div>
      </AnimatePresence>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="pointer-events-none absolute z-20 rounded-lg bg-gray-900/90 px-2.5 py-1.5 shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x + 10, top: tooltip.y - 28 }}
          >
            <div className="text-[11px] font-semibold text-white">{tooltip.name}</div>
            <div className="text-[9px] text-white/60 mt-0.5">{tooltip.region}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend (bottom-left) ── */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-0.5
        rounded-xl border border-white/60 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-md">
        {Object.entries(REGION_COLORS).map(([region, c]) => {
          const isAct = activeRegion === region;
          return (
            <div key={region}
              onClick={() => onRegionClick(isAct ? 'All' : region as TRegion)}
              className="flex items-center gap-1.5 cursor-pointer rounded-md px-1 py-0.5 hover:bg-purple-50/80 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full shrink-0 transition-all"
                style={{
                  background: isAct ? c.active : c.fill,
                  outline: `1.5px solid ${c.border}`,
                }} />
              <span className={`text-[8.5px] font-medium leading-none transition-colors ${isAct ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Reset button (top-right) — shows only when zoomed ── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.button
            key="reset-btn"
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => onRegionClick('All')}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl border border-white/50
              bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-gray-700 shadow-lg
              backdrop-blur-md hover:bg-white hover:shadow-xl transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1.5C3.067 1.5 1.5 3.067 1.5 5s1.567 3.5 3.5 3.5c1.31 0 2.45-.72 3.04-1.78"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M8.5 3V1.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>ดูทั้งประเทศ</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Active region pill (bottom-right) ── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            key={activeRegion + '-pill'}
            initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl px-2.5 py-1 text-[9px] font-bold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${REGION_COLORS[activeRegion]?.active}cc, ${REGION_COLORS[activeRegion]?.active})` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {REGION_COLORS[activeRegion]?.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ThailandManpowerMap);
