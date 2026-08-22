import { IconChartAreaLine, IconServerOff } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";

import { getSelectableGpuTemperatureSensors } from "../beszel/_shared/temperature-sensors";
import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

const timePeriodOptions = [
  { value: "1m", label: "Live" },
  { value: "1h", label: "1 Hour" },
  { value: "12h", label: "12 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "1w", label: "1 Week" },
  { value: "30d", label: "30 Days" },
];

export const { definition, componentLoader } = createWidgetDefinition("beszelSystemStats", {
  icon: IconChartAreaLine,
  queryKey: [["widget", "beszel"]],
  supportedIntegrations: ["beszel", "mock"],
  integrationsRequired: true,
  createOptions() {
    return optionsBuilder.from(
      (factory) => ({
        systemId: factory.integrationSelect({
          withDescription: true,
          clearable: true,
          useOptions: (integrationIds: string[]) => {
            const {
              data = [],
              isPending,
              isError,
            } = clientApi.widget.beszel.getSystems.useQuery({ integrationIds }, { enabled: integrationIds.length > 0 });
            const selectData = data.flatMap((r) => r.systems.map((s) => ({ value: s.id, label: s.name })));
            return { data: selectData, isPending, isError };
          },
        }),
        timePeriod: factory.select({
          defaultValue: "1h",
          options: timePeriodOptions,
        }),
        gpuTemperatureUnit: factory.select({
          defaultValue: "celsius",
          options: [
            { value: "celsius", label: "Celsius" },
            { value: "fahrenheit", label: "Fahrenheit" },
          ],
        }),
        gpuTemperatureSensor: factory.dynamicSelect({
          defaultValue: { value: "auto", label: "Auto-detect matching GPU" },
          withDescription: true,
          useOptions(query, integrationIds, options) {
            const { data: systems = [], isPending: systemsPending } = clientApi.widget.beszel.getSystems.useQuery(
              { integrationIds },
              { enabled: integrationIds.length > 0 },
            );
            const configuredSystemId = typeof options.systemId === "string" ? options.systemId : "";
            const systemId = configuredSystemId || systems.flatMap((result) => result.systems)[0]?.id || "";
            const { data, isPending: statsPending } = clientApi.widget.beszel.getSystemStats.useQuery(
              { integrationIds, systemId, timePeriod: "1h", includeDocker: false },
              { enabled: integrationIds.length > 0 && systemId !== "" },
            );
            const sensors = new Set<string>();
            const gpuNames = new Set<string>();
            for (const record of data?.systemStats ?? []) {
              for (const sensor of Object.keys(record.stats.t ?? {})) sensors.add(sensor);
              for (const gpu of Object.values(record.stats.g ?? {})) gpuNames.add(gpu.n);
            }
            const selectedOption = options.gpuTemperatureSensor;
            const selectedLabel =
              typeof selectedOption === "object" && selectedOption !== null && "label" in selectedOption
                ? selectedOption.label
                : "";
            const searchText = query === selectedLabel ? "" : query;
            const matchingSensors = getSelectableGpuTemperatureSensors(sensors, gpuNames, searchText);
            return {
              isPending: systemsPending || statsPending,
              options: [
                { value: "auto", label: "Auto-detect matching GPU" },
                ...matchingSensors.map((sensor) => ({ value: sensor, label: sensor })),
              ],
            };
          },
        }),
        showCpu: factory.switch({ defaultValue: true }),
        showMemory: factory.switch({ defaultValue: true }),
        showDisk: factory.switch({ defaultValue: true }),
        showDiskIO: factory.switch({ defaultValue: true }),
        showNetwork: factory.switch({ defaultValue: true }),
        showGpuUsage: factory.switch({ defaultValue: true }),
        showGpuMemory: factory.switch({ defaultValue: true }),
        showGpuPower: factory.switch({ defaultValue: true }),
        showGpuTemperature: factory.switch({ defaultValue: true }),
        showDockerCpu: factory.switch({ defaultValue: true }),
        showDockerMemory: factory.switch({ defaultValue: true }),
        showDockerNetwork: factory.switch({ defaultValue: true }),
      }),
      {
        gpuTemperatureUnit: {
          shouldHide: (options) => !options.showGpuTemperature,
        },
        gpuTemperatureSensor: {
          shouldHide: (options) => !options.showGpuTemperature,
        },
      },
    );
  },
  errors: {
    INTERNAL_SERVER_ERROR: {
      icon: IconServerOff,
      message: (t) => t("widget.beszelSystemStats.error.internalServerError"),
    },
  },
}).withDynamicImport(() => import("./component"));
