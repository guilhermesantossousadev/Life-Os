import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupabaseNotConfigured } from "./Auth";

describe("configuração de autenticação", () => {
  it("mostra um estado seguro quando variáveis públicas não existem", () => {
    render(<SupabaseNotConfigured />);
    expect(screen.getByRole("heading", { name: /configuração necessária/i })).toBeInTheDocument();
    expect(screen.getByText("VITE_SUPABASE_ANON_KEY")).toBeInTheDocument();
  });
});
