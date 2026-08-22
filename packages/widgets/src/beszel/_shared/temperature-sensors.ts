const normalizeSensorName = (name: string) => name.trim().toLocaleLowerCase();

const isGpuSensorName = (sensor: string) => /(^|[_\s-])gpu([_\s-]|$)|^amdgpu([_\s-]|$)/i.test(sensor);

/**
 * Returns sensors that can reasonably represent a GPU temperature.
 *
 * Beszel sends every temperature sensor from the host. Prefer names that match
 * a reported GPU, while also allowing unambiguous GPU sensor namespaces such
 * as `amdgpu_edge` and Framework EC `cros_ec_gpu_*` sensors.
 */
export const getSelectableGpuTemperatureSensors = (
  sensors: Iterable<string>,
  gpuNames: Iterable<string>,
  searchText: string,
) => {
  const normalizedGpuNames = new Set([...gpuNames].map(normalizeSensorName));
  const normalizedSearchText = normalizeSensorName(searchText);

  return [...new Set(sensors)]
    .filter((sensor) => normalizedGpuNames.has(normalizeSensorName(sensor)) || isGpuSensorName(sensor))
    .toSorted((a, b) => a.localeCompare(b))
    .filter((sensor) => normalizeSensorName(sensor).includes(normalizedSearchText));
};
