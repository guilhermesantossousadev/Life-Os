import { describe, expect, it } from "vitest";
import { addCivilDays, civilDate, todayInSaoPaulo } from "./dates";

describe("datas civis em São Paulo", () => {
  it("não muda para o dia UTC seguinte", () => {
    const instant = new Date("2026-01-01T02:00:00Z");
    expect(todayInSaoPaulo(instant)).toBe("2025-12-31");
    expect(civilDate(instant.toISOString())).toBe("2025-12-31");
  });

  it("soma dias sem interpretar YYYY-MM-DD no fuso local", () => {
    expect(addCivilDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
