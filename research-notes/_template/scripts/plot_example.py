#!/usr/bin/env python3
"""Generate a small example plot using the house research-note style."""

from __future__ import annotations

from pathlib import Path
from typing import Any


PLOTS_DIR = Path(__file__).resolve().parents[1] / "plots"
OUTPUT_PNG = PLOTS_DIR / "example.png"
OUTPUT_WIDE_PNG = PLOTS_DIR / "wide-example.png"

FONT_FAMILY = "Times New Roman"
FONT_SIZE = 8.0
WIDTH_IN = 6
HEIGHT_IN = 2.5
WIDE_WIDTH_IN = 12
WIDE_HEIGHT_IN = 2
DPI = 300


def style_rcparams() -> dict[str, Any]:
    return {
        "font.family": "serif",
        "font.serif": [FONT_FAMILY, "Times", "DejaVu Serif"],
        "font.size": FONT_SIZE,
        "axes.titlesize": FONT_SIZE,
        "axes.labelsize": FONT_SIZE,
        "xtick.labelsize": FONT_SIZE * 0.88,
        "ytick.labelsize": FONT_SIZE * 0.88,
        "pdf.fonttype": 42,
        "ps.fonttype": 42,
        "svg.fonttype": "none",
        "axes.linewidth": 0.7,
    }


def style_axis(ax: Any) -> None:
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", color="0.88", linewidth=0.45)
    ax.tick_params(axis="both", length=2.5, width=0.6, color="0.25")


def main() -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update(style_rcparams())

    x_values = [1, 2, 3, 4, 5, 6]
    y_values = [0.18, 0.27, 0.34, 0.46, 0.55, 0.63]
    fig, ax = plt.subplots(figsize=(WIDTH_IN, HEIGHT_IN))

    line_color = "#2f5f8f"
    ax.plot(x_values, y_values, color=line_color, linewidth=1.2, marker="o", markersize=3)
    ax.set_title("Example result", loc="left", fontweight="semibold", pad=4)
    ax.set_xlabel("Step")
    ax.set_ylabel("Metric")
    style_axis(ax)

    fig.tight_layout(pad=0.6)
    PLOTS_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUTPUT_PNG, dpi=DPI, bbox_inches="tight")

    values = [
        0.05, 0.08, 0.12, 0.13, 0.16, 0.18, 0.22, 0.25, 0.29, 0.31,
        0.34, 0.36, 0.38, 0.42, 0.44, 0.47, 0.51, 0.56, 0.60, 0.64,
        0.68, 0.70, 0.72, 0.75, 0.79, 0.82, 0.86, 0.90, 0.93, 0.96,
    ]
    fig, ax = plt.subplots(figsize=(WIDE_WIDTH_IN, WIDE_HEIGHT_IN))
    ax.plot(range(len(values)), values, color=line_color, linewidth=1.2, marker="o", markersize=3)
    ax.set_title("Wide plot example", loc="left", fontweight="semibold", pad=4)
    ax.set_xlabel("Value")
    ax.set_ylabel("Count")
    style_axis(ax)

    fig.tight_layout(pad=0.55)
    fig.savefig(OUTPUT_WIDE_PNG, dpi=DPI, bbox_inches="tight")

    print(f"saved plot to: {OUTPUT_PNG}")
    print(f"saved wide plot to: {OUTPUT_WIDE_PNG}")


if __name__ == "__main__":
    main()
