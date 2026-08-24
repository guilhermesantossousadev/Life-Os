import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Assistant from "./Assistant"

describe("Assistente", () => {
  it("deixa explícito que nenhuma IA está ativa", () => {
    render(<Assistant />)
    expect(
      screen.getByRole("heading", { name: /assistente em desenvolvimento/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/nenhuma IA, chatbot ou API externa está ativa/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })
})
