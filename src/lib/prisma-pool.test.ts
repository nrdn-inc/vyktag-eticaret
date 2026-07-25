import { describe, expect, it } from "vitest";
import {
  SERVER_DEFAULT_WAIT_TIMEOUT_SECONDS,
  SESSION_WAIT_TIMEOUT_SECONDS,
  buildPoolConfig,
} from "@/lib/prisma-pool";

const URL_OK = "mysql://kullanici:sifre@srv1803.hstgr.io:3306/vyk_eticaret";

describe("buildPoolConfig — bağlantı adresi ayrıştırma", () => {
  it("parses every connection field from the URL", () => {
    const config = buildPoolConfig(URL_OK);

    expect(config.host).toBe("srv1803.hstgr.io");
    expect(config.port).toBe(3306);
    expect(config.user).toBe("kullanici");
    expect(config.password).toBe("sifre");
    expect(config.database).toBe("vyk_eticaret");
  });

  it("defaults the port to 3306 when the URL omits it", () => {
    expect(buildPoolConfig("mysql://u:p@host/db").port).toBe(3306);
  });

  it("percent-decodes credentials so special characters survive", () => {
    const config = buildPoolConfig("mysql://u%40ser:p%40ss%3Aword@host:3306/db");
    expect(config.user).toBe("u@ser");
    expect(config.password).toBe("p@ss:word");
  });

  it("reports a clear Turkish error for missing or malformed configuration", () => {
    expect(() => buildPoolConfig(undefined)).toThrow(/DATABASE_URL tanımlı değil/);
    expect(() => buildPoolConfig("bu-bir-url-degil")).toThrow(/geçerli bir bağlantı adresi değil/);
    expect(() => buildPoolConfig("mysql://u:p@host:3306/")).toThrow(/veritabanı adı içermiyor/);
  });
});

// Bu blok, siteyi 503'e sokan bağlantı savurganlığına karşı asıl regresyon korumasıdır.
// Değerlerin gerekçesi ve ölçümler için bkz. prisma-pool.ts.
describe("buildPoolConfig — bağlantı kotası koruması", () => {
  it("keeps exactly one connection warm: 0 breaks the driver, more burns the hourly quota", () => {
    // minimumIdle=0 olursa sürücü hiç bağlantı kuramaz (_shouldCreateMoreConnections
    // içindeki `idleConnections.length < minimumIdle` koşulu 0 < 0 ile asla sağlanmaz).
    expect(buildPoolConfig(URL_OK).minimumIdle).toBe(1);
  });

  it("raises the session wait_timeout well above the server default that caused the churn", () => {
    const { initSql } = buildPoolConfig(URL_OK);

    expect(initSql).toBe(`SET SESSION wait_timeout=${SESSION_WAIT_TIMEOUT_SECONDS}`);
    expect(SESSION_WAIT_TIMEOUT_SECONDS).toBeGreaterThan(SERVER_DEFAULT_WAIT_TIMEOUT_SECONDS * 10);
  });

  it("stays far below the 500 connections/hour account quota while idle", () => {
    const { minimumIdle } = buildPoolConfig(URL_OK);
    expect(minimumIdle).toBeDefined();
    // Boştaki bağlantı, oturum wait_timeout'u dolduğunda bir kez yenilenir.
    const idleReconnectsPerHour = (3600 / SESSION_WAIT_TIMEOUT_SECONDS) * (minimumIdle ?? 0);

    expect(idleReconnectsPerHour).toBeLessThan(50);
  });

  it("reaps surplus idle connections before the session wait_timeout closes them", () => {
    const { idleTimeout } = buildPoolConfig(URL_OK);

    expect(idleTimeout).toBeGreaterThan(0);
    expect(idleTimeout).toBeLessThan(SESSION_WAIT_TIMEOUT_SECONDS);
  });

  it("fails fast instead of occupying a process while the pool is exhausted", () => {
    const config = buildPoolConfig(URL_OK);

    expect(config.acquireTimeout).toBeLessThan(10_000);
    expect(config.connectTimeout).toBeLessThan(10_000);
  });

  it("keeps the per-process connection share well under the 75 connection account limit", () => {
    expect(buildPoolConfig(URL_OK).connectionLimit).toBeLessThanOrEqual(10);
  });

  it("honours a valid DATABASE_CONNECTION_LIMIT override", () => {
    expect(buildPoolConfig(URL_OK, "3").connectionLimit).toBe(3);
  });

  it("ignores an invalid DATABASE_CONNECTION_LIMIT override", () => {
    for (const bad of ["0", "-2", "abc", "2.5", ""]) {
      expect(buildPoolConfig(URL_OK, bad).connectionLimit).toBe(5);
    }
  });
});
