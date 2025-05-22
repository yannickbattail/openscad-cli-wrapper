type Cache = {
  bytes: number;
  entries: number;
  max_size: number;
};

type Camera = {
  distance: number;
  fov: number;
  rotation: [number, number, number];
  translation: [number, number, number];
};

type BoundingBox = {
  max: [number, number, number];
  min: [number, number, number];
  size: [number, number, number];
};

type Geometry = {
  bounding_box: BoundingBox;
  dimensions: number;
  facets: number;
  simple: boolean;
  vertices: number;
};

type Time = {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
  time: string;
  total: number;
};

export type ModelSummary = {
  cache: {
    cgal_cache: Cache;
    geometry_cache: Cache;
  };
  camera: Camera;
  geometry: Geometry;
  time: Time;
};
