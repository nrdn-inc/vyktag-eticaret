import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/html-escape";

describe("escapeHtml", () => {
  it("escapes all HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert('x')</script>`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;",
    );
  });

  it("escapes an injected anchor tag so it renders as plain text, not a link", () => {
    const malicious = `<a href="https://phishing.example">Doğrula</a>`;
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain("<a ");
    expect(escaped).toContain("&lt;a href=&quot;https://phishing.example&quot;&gt;");
  });

  it("escapes double and single quotes to prevent attribute breakout", () => {
    expect(escapeHtml(`" onmouseover="alert(1)`)).toBe("&quot; onmouseover=&quot;alert(1)");
  });

  it("leaves plain Turkish text unchanged", () => {
    expect(escapeHtml("Ayşe Öztürk")).toBe("Ayşe Öztürk");
  });

  it("leaves an empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });
});
