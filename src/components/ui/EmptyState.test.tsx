// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

describe("EmptyState", () => {
  it("başlığı her zaman render eder", () => {
    render(<EmptyState title="Sepetiniz boş" />);
    expect(screen.getByText("Sepetiniz boş")).toBeInTheDocument();
  });

  it("description/action verilmezse render etmez", () => {
    const { container } = render(<EmptyState title="Sepetiniz boş" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("description ve action birlikte render edilir", () => {
    render(
      <EmptyState
        title="Sepetiniz boş"
        description="Ürün eklemek için mağazaya göz atın."
        action={<Button>Ürünleri keşfet</Button>}
      />,
    );
    expect(screen.getByText("Ürün eklemek için mağazaya göz atın.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ürünleri keşfet" })).toBeInTheDocument();
  });
});
