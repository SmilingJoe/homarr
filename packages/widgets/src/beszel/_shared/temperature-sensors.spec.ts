import { describe, expect, test } from "vitest";

import { getSelectableGpuTemperatureSensors } from "./temperature-sensors";

describe("getSelectableGpuTemperatureSensors", () => {
  test("excludes Linux CPU core sensors while retaining GPU sensor names", () => {
    expect(
      getSelectableGpuTemperatureSensors(
        ["coretemp_package_id_0", "coretemp_core_0", "GeForce RTX 4080", "amdgpu_edge"],
        "",
      ),
    ).toEqual(["amdgpu_edge", "GeForce RTX 4080"]);
  });

  test("filters the remaining sensor names by search text", () => {
    expect(getSelectableGpuTemperatureSensors(["GeForce RTX 4080", "amdgpu_edge"], "radeon")).toEqual([]);
    expect(getSelectableGpuTemperatureSensors(["GeForce RTX 4080", "amdgpu_edge"], "geforce")).toEqual([
      "GeForce RTX 4080",
    ]);
  });
});
