"use client";

/**
 * Shared tooltip surface.
 *
 * Values wear text tokens, never the series colour — a small colour chip beside the
 * label carries identity instead. Coloured numerals read as decoration and lose
 * contrast against the tooltip surface.
 *
 * The props are declared locally rather than imported from Recharts: `TooltipProps` in
 * v3 no longer exposes `payload`/`label` on the content-component type (they are
 * injected from context at render time), so importing it types them away. This
 * interface describes what the component is actually handed.
 */
interface TooltipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  valueSuffix?: string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {label !== undefined && (
        <p className="mb-1 text-xs font-medium">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
