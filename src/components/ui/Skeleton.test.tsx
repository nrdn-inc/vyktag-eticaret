// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonText } from "./Skeleton";

describe("Skeleton", () => {
  it("aria-hidden ile render olur (ekran okuyucudan gizli, salt görsel ipucu)", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("width/height prop'larını satır içi stil olarak uygular", () => {
    const { container } = render(<Skeleton width={120} height={24} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("24px");
  });
});

describe("SkeletonText", () => {
  it("varsayılan olarak 3 satır render eder", () => {
    const { container } = render(<SkeletonText />);
    expect(container.querySelectorAll("[aria-hidden] > div").length).toBe(3);
  });

  it("lines prop'una göre satır sayısını değiştirir", () => {
    const { container } = render(<SkeletonText lines={5} />);
    expect(container.querySelectorAll("[aria-hidden] > div").length).toBe(5);
  });
});
