export const getSelectableGpuTemperatureSensors = (sensors: Iterable<string>, searchText: string) =>
  [...new Set(sensors)]
    .filter((sensor) => !sensor.toLocaleLowerCase().startsWith("coretemp"))
    .toSorted((a, b) => a.localeCompare(b))
    .filter((sensor) => sensor.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
