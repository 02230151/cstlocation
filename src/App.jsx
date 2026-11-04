import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { allPlanRooms, floorPlanBuildings } from './floorPlanData.js';
import { getBuildingDetails } from './buildingDetails.js';

const categories = ['All places', 'Classroom', 'Laboratory', 'Office', 'Library', 'Hostel', 'Other'];
const categoryPatterns = {
  Classroom: /class|lecture|teaching/i,
  Laboratory: /lab|workshop/i,
  Office: /office|administr|staff/i,
  Library: /library/i,
  Hostel: /hostel|residence/i,
};
const layerFiles = {
  boundary: 'CST_Boundary_3.js',
  buildings: 'Buildings_5.js',
  roads: 'Roads_4.js',
  paths: 'Paths_6.js',
  openSpaces: 'Openspaces_7.js',
};
const buildingPhotos = {
  'convention hall': 'convention-hall.jpg',
  'it building': 'it-building-pictures-it-building.jpg',
  'administrative block': 'academyblock-images-academyblock-front-view.jpg',
  classroom: 'classrooms-cr1.jpg',
  library: 'library.jpg',
  'architecture-studio': 'architecture-department.jpg',
  guesthouse: 'guest-house.jpg',
  'new lab': 'new-lab-building.jpg',
  'fab-lab': 'fablab.jpg',
  'indoor stadium': 'basketball-court.jpg',
  'old chem lab': 'chemistry-lab-01-right.jpg',
  carpentry: 'carpentry-workshop.jpg',
  canteen: 'canteen.jpg',
};

function getBuildingPhoto(name = '') {
  const filename = buildingPhotos[name.trim().toLowerCase()];
  return filename ? `${import.meta.env.BASE_URL}images/floorplans/${filename}` : '';
}

async function loadLayer(filename) {
  const response = await fetch(`${import.meta.env.BASE_URL}layers/${filename}`);
  if (!response.ok) throw new Error(`Could not load ${filename} (${response.status})`);
  const source = await response.text();
  const json = source.slice(source.indexOf('=') + 1).trim().replace(/;\s*$/, '');
  return JSON.parse(json);
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>;
}

export default function App() {
  const mapElement = useRef(null);
  const map = useRef(null);
  const buildingLayer = useRef(null);
  const visibleKeysRef = useRef(new Set());
  const [layers, setLayers] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All places');
  const [selected, setSelected] = useState(null);
  const [baseMap, setBaseMap] = useState('satellite');
  const [view, setView] = useState('map');
  const [photos, setPhotos] = useState({});
  const photoUrls = useRef([]);

  useEffect(() => () => photoUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(Object.entries(layerFiles).map(async ([key, file]) => [key, await loadLayer(file)]))
      .then((entries) => { if (!cancelled) setLayers(Object.fromEntries(entries)); })
      .catch((error) => { if (!cancelled) setLoadError(error.message); });
    return () => { cancelled = true; };
  }, []);

  const buildings = useMemo(() => (layers?.buildings?.features || []).map((feature, index) => ({
    ...feature,
    properties: { ...feature.properties, _key: `${feature.properties?.Name || 'Building'}-${index}` },
  })), [layers]);

  const visibleBuildings = useMemo(() => buildings.filter((feature) => {
    const name = feature.properties?.Name || 'Unnamed building';
    const use = feature.properties?.Use || 'Other';
    const matchesSearch = !search.trim() || `${name} ${use}`.toLowerCase().includes(search.trim().toLowerCase());
    const knownPatterns = Object.values(categoryPatterns);
    const matchesCategory = category === 'All places'
      || (category === 'Other' && !knownPatterns.some((pattern) => pattern.test(use)))
      || Boolean(categoryPatterns[category]?.test(use));
    return matchesSearch && matchesCategory;
  }), [buildings, search, category]);

  useEffect(() => {
    if (!layers || !mapElement.current || map.current) return undefined;

    const campusBounds = L.geoJSON(layers.boundary).getBounds();
    const campusMap = L.map(mapElement.current, {
      zoomControl: false,
      preferCanvas: true,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
    });
    map.current = campusMap;
    L.control.zoom({ position: 'bottomright' }).addTo(campusMap);
    const campusView = { paddingTopLeft: [12, 12], paddingBottomRight: [12, 60] };
    if (campusBounds.isValid()) campusMap.fitBounds(campusBounds, campusView);

    const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20, attribution: 'Tiles © Esri',
    });
    const streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20, attribution: '© OpenStreetMap © CARTO',
    });
    (baseMap === 'satellite' ? imagery : streets).addTo(campusMap);
    campusMap._cstBaseLayers = { imagery, streets };

    const boundary = L.geoJSON(layers.boundary, {
      style: { color: '#e5f3d6', weight: 3, fillColor: '#a6ca80', fillOpacity: 0.08, dashArray: '7 5' },
    });
    let outsideMask = null;
    const panBounds = campusBounds.pad(8);
    if (campusBounds.isValid()) {
      const maskBounds = panBounds;
      const southWest = maskBounds.getSouthWest();
      const northEast = maskBounds.getNorthEast();
      const outsideRing = [
        [southWest.lat, southWest.lng], [northEast.lat, southWest.lng],
        [northEast.lat, northEast.lng], [southWest.lat, northEast.lng],
        [southWest.lat, southWest.lng],
      ];
      const campusHoles = layers.boundary.features.flatMap((feature) => {
        const geometry = feature.geometry;
        const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        return polygons.map((polygon) => polygon[0].map(([longitude, latitude]) => [latitude, longitude]));
      });
      outsideMask = L.polygon([outsideRing, ...campusHoles], {
        stroke: false, fillColor: '#f4eee2', fillOpacity: 0.98, fillRule: 'evenodd', interactive: false,
      });
    }
    boundary.addTo(campusMap);
    L.geoJSON(layers.openSpaces, {
      style: { color: '#7fa86a', weight: 1, fillColor: '#b7d39a', fillOpacity: 0.34 },
    }).addTo(campusMap);
    L.geoJSON(layers.roads, { style: { color: '#e8d5b8', weight: 3, opacity: 0.8 } }).addTo(campusMap);
    L.geoJSON(layers.paths, { style: { color: '#f5d7bd', weight: 1.5, dashArray: '4 5', opacity: 0.8 } }).addTo(campusMap);
    outsideMask?.addTo(campusMap);
    boundary.bringToFront();

    const buildingsOnMap = L.geoJSON({ type: 'FeatureCollection', features: buildings }, {
      style: { color: '#6f3d26', weight: 1.3, fillColor: '#a85f38', fillOpacity: 0.89 },
      onEachFeature: (feature, polygon) => {
        const name = feature.properties?.Name || 'Building';
        polygon.bindTooltip(name, { permanent: false, direction: 'center', className: 'building-label', opacity: 0.97 });
        polygon.on('click', () => setSelected(feature));
      },
    }).addTo(campusMap);
    buildingLayer.current = buildingsOnMap;
    const updateLabels = () => {
      const showLabels = campusMap.getZoom() >= 17;
      buildingsOnMap.eachLayer((polygon) => {
        const isVisible = visibleKeysRef.current.has(polygon.feature.properties._key);
        if (showLabels && isVisible) polygon.openTooltip(); else polygon.closeTooltip();
      });
    };
    campusMap.on('zoomend', updateLabels);

    if (campusBounds.isValid()) {
      campusMap.invalidateSize(true);
      campusMap.fitBounds(campusBounds, campusView);
      campusMap.setMinZoom(campusMap.getZoom());
      campusMap.setMaxBounds(panBounds);
      campusMap.options.maxBoundsViscosity = 1;
    }
    updateLabels();
    return () => { campusMap.remove(); map.current = null; };
  }, [layers, buildings]);

  useEffect(() => {
    const campusMap = map.current;
    if (!campusMap?._cstBaseLayers) return;
    const { imagery, streets } = campusMap._cstBaseLayers;
    const next = baseMap === 'satellite' ? imagery : streets;
    const previous = baseMap === 'satellite' ? streets : imagery;
    if (campusMap.hasLayer(previous)) campusMap.removeLayer(previous);
    if (!campusMap.hasLayer(next)) campusMap.addLayer(next);
  }, [baseMap, layers]);

  useEffect(() => {
    if (!buildingLayer.current) return;
    const visibleKeys = new Set(visibleBuildings.map((feature) => feature.properties._key));
    visibleKeysRef.current = visibleKeys;
    const showLabels = map.current?.getZoom() >= 17;
    buildingLayer.current.eachLayer((polygon) => {
      const isVisible = visibleKeys.has(polygon.feature.properties._key);
      const isSelected = selected?.properties?._key === polygon.feature.properties._key;
      polygon.setStyle({ color: isSelected ? '#234431' : '#6f3d26', fillColor: isSelected ? '#d1a05a' : '#a85f38', fillOpacity: isVisible ? 0.89 : 0.08, opacity: isVisible ? 1 : 0.2, weight: isSelected ? 2.5 : isVisible ? 1.3 : 0.6 });
      if (isVisible && showLabels) polygon.openTooltip(); else polygon.closeTooltip();
    });
  }, [visibleBuildings, selected]);

  function chooseBuilding(feature) {
    setSelected(feature);
    const polygon = buildingLayer.current?.getLayers().find((layer) => layer.feature.properties._key === feature.properties._key);
    if (polygon && map.current) {
      map.current.flyToBounds(polygon.getBounds().pad(0.9), { duration: 0.65, maxZoom: 19 });
      polygon.openPopup();
    }
  }

  function showCampus() {
    if (map.current && layers?.boundary) map.current.fitBounds(L.geoJSON(layers.boundary).getBounds(), {
      paddingTopLeft: [12, 12], paddingBottomRight: [12, 60],
    });
  }

  function submitSearch() {
    if (visibleBuildings[0]) chooseBuilding(visibleBuildings[0]);
  }

  function addBuildingPhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !selected) return;
    const url = URL.createObjectURL(file);
    photoUrls.current.push(url);
    setPhotos((current) => ({ ...current, [selected.properties._key]: url }));
  }

  if (view === 'floorplans') return <main className="app floor-app"><AppHeader view={view} onChange={setView}/><FloorPlans/></main>;
  if (loadError) return <main className="load-state"><AppHeader view={view} onChange={setView}/><h1>Could not load the CST map</h1><p>{loadError}</p><p>Check that the <code>public/layers</code> folder is beside this app's source.</p></main>;
  if (!layers) return <main className="load-state"><AppHeader view={view} onChange={setView}/><div className="loader-mark">⌖</div><strong>Loading CST campus map…</strong><span>Preparing campus buildings and paths</span></main>;

  return <main className="app">
    <AppHeader view={view} onChange={setView}/>
    <section className="map-shell" aria-label="Interactive CST campus map"><div className="map-canvas" ref={mapElement} />
      <div className="map-top"><div className="map-toolbar"><div className="map-search-row"><SearchBox value={search} onChange={setSearch} className="map-search" onSubmit={submitSearch} /><div className="map-pill">⌖ &nbsp;CST campus</div></div><nav className="map-categories" aria-label="Filter campus places">{categories.map((item) => <button key={item} className={`chip ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</nav></div></div>
      <div className="map-tools"><button className={`tool ${baseMap === 'satellite' ? 'active' : ''}`} onClick={() => setBaseMap('satellite')}>▧ &nbsp;Satellite</button><button className={`tool ${baseMap === 'street' ? 'active' : ''}`} onClick={() => setBaseMap('street')}>▤ &nbsp;Street map</button><button className="tool" disabled title="Directions are unavailable because no campus routing data is configured">➤ &nbsp;Directions</button></div>
      <div className="map-bottom"><div className="legend"><div className="legend-title">Map key</div><div className="legend-line"><span className="swatch"/> Buildings</div><div className="legend-line"><span className="swatch boundary"/> Campus boundary</div><div className="legend-line"><span className="swatch open-space"/> Outdoor areas</div><div className="legend-line"><span className="swatch paths"/> Paths / roads</div></div><button className="locate" onClick={showCampus}>⌖ &nbsp;Show CST campus</button></div>
      <button className="floorplans-fab" onClick={() => setView('floorplans')} aria-label="Open floor plans"><span className="floorplans-fab-icon">▦</span><span>Explore floor plans</span><span className="floorplans-fab-arrow">↗</span></button>
      {selected && <BuildingDetailsPanel
        feature={selected}
        details={getBuildingDetails(selected.properties?.Name, selected.properties?.Use)}
        photo={photos[selected.properties._key] || getBuildingPhoto(selected.properties?.Name)}
        isPhotoPreview={Boolean(photos[selected.properties._key])}
        onPhotoChange={addBuildingPhoto}
        onClose={() => setSelected(null)}
      />}
    </section>
  </main>;
}

function AppHeader({ view, onChange }) {
  return <header className="app-header"><a className="brand" href="#campus" onClick={(event) => { event.preventDefault(); onChange('map'); }}><span className="brand-mark">C</span><span><strong>CST</strong><small>Campus guide</small></span></a><nav className="view-tabs" aria-label="Guide view"><button className={view === 'map' ? 'selected' : ''} onClick={() => onChange('map')}>⌖ <span>Campus map</span></button></nav></header>;
}

function FloorPlans({ initialBuildingIndex = 0 }) {
  const [buildingIndex, setBuildingIndex] = useState(initialBuildingIndex);
  const [floorIndex, setFloorIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const activeBuilding = floorPlanBuildings[buildingIndex];
  const activeFloor = activeBuilding.floors[floorIndex];
  useEffect(() => {
    if (!activeRoom) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setActiveRoom(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeRoom]);
  const matches = query.trim() ? allPlanRooms.filter((item) => `${item.name} ${item.building} ${item.floor}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) : [];
  const setLocation = (item) => {
    const nextBuilding = floorPlanBuildings.findIndex((entry) => entry.name === item.building);
    setBuildingIndex(nextBuilding);
    setFloorIndex(floorPlanBuildings[nextBuilding].floors.findIndex((entry) => entry.name === item.floor));
    setActiveRoom(item);
    setQuery('');
  };
  const selectRoom = (item) => setActiveRoom({ ...item, building: activeBuilding.name, floor: activeFloor.name });
  const chooseBuilding = (index) => { setBuildingIndex(index); setFloorIndex(0); setActiveRoom(null); };
  const roomsFor = (side) => activeFloor.rooms.filter((item) => item.side === side);
  return <section className="floor-page">
    <div className="floor-heading"><div><div className="eyebrow"><span/> CAMPUS DIRECTORY</div><h1>Find your place.</h1><p>Explore buildings, floors, departments, classrooms and labs across CST.</p></div><div className="room-count"><strong>{allPlanRooms.length}</strong><span>mapped spaces</span></div></div>
    <div className="plan-search-wrap"><SearchIcon/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a room, lab or building…" aria-label="Search rooms, labs or buildings"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search">×</button>}{matches.length>0&&<div className="search-results">{matches.map((item)=><button key={`${item.building}-${item.floor}-${item.name}`} onClick={()=>setLocation(item)}><span className="result-icon">⌕</span><span><strong>{item.name}</strong><small>{item.building} <i>·</i> {item.floor}</small></span><b>↗</b></button>)}</div>}</div>
    <div className="plan-layout"><aside className="building-panel"><div className="panel-label">BUILDINGS <span>{floorPlanBuildings.length.toString().padStart(2,'0')}</span></div>{floorPlanBuildings.map((item,index)=><button className={`building-link ${index===buildingIndex?'chosen':''}`} key={item.name} onClick={()=>chooseBuilding(index)}><span className="building-glyph">{['⌂','▤','⌖','✳','▦','▧','▤','⌘','▱'][index]}</span><span className="building-link-copy"><strong>{item.name}</strong><small>{item.floors.length} {item.floors.length===1?'level':'levels'} <i>·</i> {item.floors.reduce((n,f)=>n+f.rooms.length,0)} spaces</small></span><b>›</b></button>)}</aside>
      <div className="plan-content"><div className="building-title"><div><div className="eyebrow">BUILDING OVERVIEW</div><h2>{activeBuilding.name}</h2>{activeBuilding.note&&<p>{activeBuilding.note}</p>}</div><span className="floor-badge">{activeBuilding.floors.reduce((n,f)=>n+f.rooms.length,0)} spaces</span></div>
        <div className="floor-tabs" role="tablist" aria-label="Select floor">{activeBuilding.floors.map((item,index)=><button role="tab" aria-selected={index===floorIndex} className={index===floorIndex?'active':''} key={item.name} onClick={()=>{setFloorIndex(index);setActiveRoom(null);}}>{item.name}</button>)}</div>
        <div className="schematic"><div className="schematic-top"><div><span className="plan-dot"/> FLOOR LAYOUT <span className="plan-dash">/</span> {activeFloor.name.toUpperCase()}</div><span className="schematic-tag">SCHEMATIC DIRECTORY</span></div><div className="plan-board"><div className="plan-direction"><span>← LEFT SIDE</span><span>RIGHT SIDE →</span></div>{(roomsFor('left').length>0||roomsFor('right').length>0)&&<div className="room-columns"><div className="room-column">{roomsFor('left').map((item,index)=><RoomTile key={item.name} item={item} index={index} active={activeRoom?.name===item.name} onClick={selectRoom}/>)}</div><div className="room-column">{roomsFor('right').map((item,index)=><RoomTile key={item.name} item={item} index={index} active={activeRoom?.name===item.name} onClick={selectRoom}/>)}</div></div>}{roomsFor('center').length>0&&<div className={`center-rooms ${(roomsFor('left').length||roomsFor('right').length)?'':'center-only'}`}>{roomsFor('center').map((item,index)=><RoomTile key={item.name} item={item} index={index} active={activeRoom?.name===item.name} onClick={selectRoom}/>)}</div>}</div><div className="schematic-foot"><span>ROOMS & FACILITIES</span><span>{activeFloor.rooms.length.toString().padStart(2,'0')} LISTED <i>·</i> NOT TO SCALE</span></div></div>
        <div className="plan-bottom"><div className={`room-detail ${activeRoom?'has-room':''}`}><span className="detail-symbol">{activeRoom?'⌖':'＋'}</span><div>{activeRoom?<><small>SELECTED SPACE <i>·</i> {activeRoom.building} <i>·</i> {activeRoom.floor}</small><strong>{activeRoom.name}</strong>{activeRoom.description&&<p>{activeRoom.description}</p>}{activeRoom.note&&<p className="room-location-note">{activeRoom.note}</p>}</>:<><small>ROOM DETAILS</small><strong>Select a room to see more</strong><p>Choose any tile in the floor layout.</p></>}</div></div><div className="floor-note">{activeFloor.note?<><span>i</span>{activeFloor.note}</>:<> <span>i</span>Layout is a visual directory based on the provided side and adjacency descriptions.</>}</div></div>
      </div>
    </div>
    {activeRoom && <div className="room-photo-backdrop" onClick={() => setActiveRoom(null)}>
      <section className="room-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="room-photo-title" onClick={(event) => event.stopPropagation()}>
        <button className="room-photo-close" onClick={() => setActiveRoom(null)} aria-label="Close room photo">×</button>
        {activeRoom.image
          ? <img className="room-photo-image" src={`${import.meta.env.BASE_URL}images/floorplans/${activeRoom.image}`} alt={`${activeRoom.name} at CST`} />
          : <div className="room-photo-empty"><span>▧</span><strong>Photo not available yet</strong><small>This room does not have a photo in the supplied folder.</small></div>}
        <div className="room-photo-caption">
          <span className="details-kicker">{activeRoom.building} · {activeRoom.floor}{activeRoom.side ? ` · ${activeRoom.side === 'center' ? 'center area' : `${activeRoom.side} side`}` : ''}</span>
          <h2 id="room-photo-title">{activeRoom.name}</h2>
          {activeRoom.description && <p>{activeRoom.description}</p>}
          {activeRoom.note && <p>{activeRoom.note}</p>}
        </div>
      </section>
    </div>}
  </section>;
}

function RoomTile({ item, index, active, onClick }) {
  return <button className={`room-tile ${active?'active':''}`} onClick={()=>onClick(item)} style={{'--tile-order':index}}><span className="room-num">{String(index+1).padStart(2,'0')}</span><span className="room-tile-copy"><strong>{item.name}</strong>{item.description&&<span className="room-description">{item.description}</span>}</span><span className="tile-arrow">↗</span></button>;
}

function SearchBox({ value, onChange, className, onSubmit }) {
  return <label className={`search ${className}`}><SearchIcon/><input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSubmit?.(); }} placeholder="Search buildings or facilities…" aria-label="Search buildings or facilities" /></label>;
}

function BuildingDetailsPanel({ feature, details, photo, isPhotoPreview, onPhotoChange, onClose }) {
  const name = feature.properties?.Name || 'Campus building';
  const use = feature.properties?.Use || 'Campus facility';
  return <aside className="building-details" aria-label={`${name} details`}>
    <header className="details-header">
      <div><span className="details-kicker">CST building details</span><h2>{name}</h2><span className="details-type">{use}</span></div>
      <button className="details-close" onClick={onClose} aria-label="Close building details">×</button>
    </header>
    <p className="details-description">{details.description}</p>
    <section className="details-photo-section" aria-label="Building photograph">
      {photo ? <img className="details-photo" src={photo} alt={`${name} building`} /> : <div className="photo-placeholder"><span className="photo-icon">▧</span><strong>Building photo</strong><span>Photo space reserved for this building</span></div>}
      <label className="photo-upload">{photo ? 'Change photo' : 'Choose photo'}<input type="file" accept="image/*" onChange={onPhotoChange} /></label>
      <span className="photo-note">{isPhotoPreview ? 'Preview only · not saved after this session' : photo ? 'Campus photo' : 'Preview only · not saved after this session'}</span>
    </section>
    <section className="floor-plan-section">
      <div className="details-section-heading"><div><span className="details-kicker">Room layout</span><h3>Floor plan</h3></div><span className="plan-badge">Text layout</span></div>
      {details.floors?.length ? <div className="floor-list">{details.floors.map((item) => <article className="floor-card" key={item.name}>
        <h4>{item.name}</h4>
        {item.zones.length ? <div className="floor-zones">{item.zones.map((itemZone) => <div className="floor-zone" key={itemZone.side}>
          <span className="zone-label">{itemZone.side}</span>
          <div className="room-grid">{itemZone.rooms.map((room) => <RoomBlock key={room} name={room}/>)}</div>
        </div>)}</div> : <p className="plan-missing">Floor or room details were not included in the supplied notes.</p>}
      </article>)}</div> : <div className="plan-empty"><strong>Floor plan details to add</strong><span>Add the floor names, room numbers, and left/right or section layout here.</span></div>}
      {details.areaFacilities && <div className="area-facilities"><h4>Facilities noted near the football ground</h4><p>Floor and host-building assignments were not specified.</p><div className="room-grid">{details.areaFacilities.map((item) => <RoomBlock key={item} name={item}/>)}</div></div>}
    </section>
  </aside>;
}

function RoomBlock({ name }) {
  return <span className="room-block"><strong>{name}</strong></span>;
}
