import { describe, expect, test } from "vitest";

import { getSelectableGpuTemperatureSensors } from "./temperature-sensors";

describe("getSelectableGpuTemperatureSensors", () => {
  test("keeps reported GPU names and unambiguous GPU sensors", () => {
    expect(
      getSelectableGpuTemperatureSensors(
        [
          "acpitz",
          "AMD Radeon 780M",
          "AMD Radeon RX 7700S",
          "amdgpu_edge",
          "cros_ec_gpu_amb_f75303@4d",
          "k10temp_tctl",
          "nvme_composite",
        ],
        ["AMD Radeon 780M", "AMD Radeon RX 7700S"],
        "",
      ),
    ).toEqual(["AMD Radeon 780M", "AMD Radeon RX 7700S", "amdgpu_edge", "cros_ec_gpu_amb_f75303@4d"]);
  });

  test("filters matching GPU sensors by search text", () => {
    const sensors = ["AMD Radeon 780M", "amdgpu_edge", "cros_ec_gpu_vram_f75303@4d"];
    const gpuNames = ["AMD Radeon 780M"];

    expect(getSelectableGpuTemperatureSensors(sensors, gpuNames, "radeon")).toEqual(["AMD Radeon 780M"]);
    expect(getSelectableGpuTemperatureSensors(sensors, gpuNames, "vram")).toEqual(["cros_ec_gpu_vram_f75303@4d"]);
  });
});
