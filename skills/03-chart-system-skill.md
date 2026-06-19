# 03 — Chart System Skill

## Purpose

Use this skill for every chart-heavy page.

## Required Library

Use Recharts.

## Chart Rules

- Every chart must use ResponsiveContainer.
- Use small readable axis labels.
- Use subtle grid lines.
- Use custom tooltip with rounded white card.
- Use purple for primary equity/performance trend.
- Use mint/green for positive values.
- Use soft coral/red for loss/drawdown.
- Use blue for neutral info/balance.
- Use orange for warning or medium risk.
- Do not use random chart colors.

## Common Chart Mapping

| UI Need | Recommended Chart |
|---|---|
| KPI sparkline | Mini LineChart |
| Equity Curve | ComposedChart |
| Drawdown | AreaChart |
| Strategy Comparison | Horizontal BarChart |
| MFE / MAE | ScatterChart |
| Session Performance | Heatmap / BarChart |
| Asset Performance | Horizontal BarChart |
| Capital Allocation | Donut / Pie |
| Risk Gauge | Custom SVG / CSS |

## QA

- Charts resize correctly
- Tooltips are readable
- Colors match meaning
- No chart overflow on mobile
