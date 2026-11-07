// Behavior smoke test for the wheel of fortune: checks B1–B11 and the security header baseline.
// B11 (no page errors, and no 4xx/5xx responses or console errors from this site's origin) runs after
// every test. Other origins don't count, so e.g. the Vercel toolbar on a preview can't trip it.
// B7 (every setting is written into the URL query) is checked by B4–B6 after each change.
// B9 is a pre-existing bug, marked test.fail(): the suite stays green while it fails and goes red
// once it passes, which is the cue to drop its test.fail().
import { test as base, expect, type Page } from "@playwright/test";
import path from "path";

const isOwnOrigin = (url: string, origin: string) => {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
};

const test = base.extend<{ siteErrors: string[] }>({
  siteErrors: [
    async ({ page, baseURL }, runTest) => {
      const origin = new URL(baseURL!).origin;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
      page.on("response", (response) => {
        if (response.status() >= 400 && isOwnOrigin(response.url(), origin)) {
          errors.push(`${response.status()} ${response.url()}`);
        }
      });
      page.on("console", (message) => {
        const url = message.location().url;
        // A console error with no source location is counted as the site's own.
        if (message.type() === "error" && (!url || isOwnOrigin(url, origin))) {
          errors.push(`console error: ${message.text()}`);
        }
      });
      await runTest(errors);
      expect(errors, "B11: no page errors, own-origin 4xx/5xx responses or own-origin console errors").toEqual([]);
    },
    { auto: true },
  ],
});

const DEFAULT_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const DEFAULT_COLORS = [
  "rgb(63, 81, 181)", "rgb(255, 152, 0)", "rgb(233, 30, 99)", "rgb(76, 175, 80)", "rgb(0, 150, 136)", "rgb(156, 39, 176)",
  "rgb(121, 85, 72)", "rgb(244, 67, 54)", "rgb(0, 187, 224)", "rgb(0, 224, 45)", "rgb(220, 216, 0)",
];
const fixture = (name: string) => path.join(__dirname, "fixtures", name);

// The app keeps each setting in the URL as ?<key>=<encodeURI(JSON.stringify(value))>.
function urlValue(page: Page, key: string): unknown {
  const raw = new URL(page.url()).searchParams.get(key);
  try {
    return raw === null ? undefined : JSON.parse(decodeURI(raw));
  } catch {
    return undefined;
  }
}
function urlElements(page: Page) {
  const value = urlValue(page, "elements") as
    | { elements: Record<string, { text: string; background: string; active: boolean; order: number }> }
    | undefined;
  return Object.values(value?.elements ?? {});
}
// The same encoding, to build a deep link.
function deepLink(params: Record<string, unknown>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) search.set(key, encodeURI(JSON.stringify(value)));
  return `/?${search}`;
}

// The app rewrites the URL with router.replace after loading and on every change; wait until it stops.
async function waitForUrlToSettle(page: Page, quietMs = 700) {
  for (let last = ""; last !== page.url(); ) {
    last = page.url();
    await page.waitForTimeout(quietMs);
  }
}

// Load a page and wait until the app has hydrated, which it shows by writing its state into the URL.
async function open(page: Page, url = "/") {
  await page.goto(url);
  await expect(page).toHaveURL(/[?&]elements=/);
  await waitForUrlToSettle(page);
}

// The wheel as rendered: one child of .wheel-container per active item.
async function wheel(page: Page) {
  return page.evaluate(() => {
    const container = document.querySelector(".wheel-container") as HTMLElement;
    const cs = getComputedStyle(container);
    const segments = Array.from(container.children).map((el) => {
      const s = getComputedStyle(el);
      const label = el.querySelector("span");
      return {
        text: el.textContent,
        color: s.backgroundColor,
        fontSize: s.fontSize,
        paddingTop: s.paddingTop,
        alignItems: s.alignItems,
        labelTransform: label ? getComputedStyle(label).transform : null,
      };
    });
    const arrow = document.querySelector("span.arrow") as HTMLElement | null;
    return {
      labels: segments.map((s) => s.text),
      colors: segments.map((s) => s.color),
      segments,
      border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      rotation: parseFloat((container.style.transform || "rotate(0deg)").replace(/^rotate\(([-\d.e]+)deg\)$/, "$1")),
      arrowColor: arrow ? getComputedStyle(arrow).backgroundColor : null,
    };
  });
}

// The prize the app picks for a final rotation (utils.ts findIndexByEndDegree, as pages/index.tsx uses it).
function prizeFor(rotation: number, labels: string[]) {
  const n = labels.length;
  const end = rotation % 360;
  const per = 360 / n;
  let index = 0;
  for (let current = per / 2; current <= end; current += per) index++;
  return index > 0 ? labels[n - index] : labels[0];
}

const menuButton = (page: Page) => page.locator("button").filter({ has: page.locator('svg[viewBox="0 0 20 20"]') }).first();
const spinButton = (page: Page) => page.locator(".wheel-container").locator("xpath=preceding-sibling::div[1]").locator("button");
const arrow = (page: Page) => page.locator("span.arrow");
const drawer = (page: Page) => page.locator(".mantine-Drawer-drawer");
const prizeModal = (page: Page) => page.locator(".mantine-Modal-modal");
const panel = (page: Page, name: string) => page.getByRole("tabpanel", { name });
const itemRows = (page: Page) => panel(page, "Items").locator(":scope > div:nth-child(2) > div");
const hexInput = (page: Page) =>
  page.locator(".mantine-Popover-dropdown").filter({ has: page.locator("input[type=text]") }).first().locator("input[type=text]");

async function openDrawerTab(page: Page, name: string) {
  await menuButton(page).click();
  await expect(drawer(page)).toBeVisible();
  await page.getByRole("tab", { name, exact: true }).click();
  await expect(panel(page, name)).toBeVisible();
}

// Spin with the centre button and return the final rotation once the prize modal is up.
async function spin(page: Page) {
  await spinButton(page).click();
  await expect(prizeModal(page)).toBeVisible({ timeout: 60_000 });
  return (await wheel(page)).rotation;
}

test("B1 renders the title, background, the 11-segment wheel, arrow, spin and menu buttons", async ({ page }) => {
  await open(page);
  await expect(page).toHaveTitle("Wheel of Fortune | App");
  const background = page.locator('img[alt="default background wgg"]');
  await expect(background).toHaveAttribute("src", /^\/_next\/image\?url=%2Fhomepage_3\.png/);
  await expect.poll(() => background.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const box = await background.boundingBox();
  expect(box && [Math.round(box.width), Math.round(box.height)]).toEqual([1280, 800]);
  const w = await wheel(page);
  expect(w.labels).toEqual(DEFAULT_LABELS);
  expect(w.colors).toEqual(DEFAULT_COLORS);
  expect(w.border).toBe("15px solid rgb(188, 200, 208)");
  await expect(arrow(page)).toBeVisible();
  expect(w.arrowColor).toBe("rgb(68, 81, 54)");
  await expect(spinButton(page)).toBeVisible();
  await expect(menuButton(page)).toBeVisible();
});

test("B2 a spin ends on the prize the app's math picks, shown in the modal; Play Again closes it", async ({ page }) => {
  await open(page);
  const rotation = await spin(page);
  const modal = prizeModal(page);
  await expect(modal.locator("h2")).toHaveText("Congratz!");
  await expect(modal.locator("p")).toHaveText(["You won:", prizeFor(rotation, DEFAULT_LABELS), ""]);
  await expect(arrow(page)).toBeHidden();
  await expect(spinButton(page)).toBeHidden();
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(modal).toBeHidden();
  await expect(arrow(page)).toBeVisible();
  await expect(spinButton(page)).toBeVisible();
});

test("B3 the menu button opens the drawer with Items, Styles and General, its list scrolls; Escape and X close it", async ({ page }) => {
  await open(page);
  await menuButton(page).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("tab")).toHaveText(["Items", "Styles", "General"]);
  await expect(itemRows(page)).toHaveCount(11);
  // The item list scrolls inside the drawer, so its last row can be brought fully into view.
  const lastRow = itemRows(page).last();
  await lastRow.scrollIntoViewIfNeeded();
  const lastBox = await lastRow.boundingBox();
  expect(lastBox && lastBox.y + lastBox.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  await menuButton(page).click();
  await page.locator(".mantine-Drawer-closeButton").click();
  await expect(drawer(page)).toBeHidden();
  // Clicking the menu button again doesn't reach it: the open drawer covers it (pre-existing).
});

test("B4 the Items tab adds, unchecks, renames, deletes and recolours items (B7: elements in the URL)", async ({ page }) => {
  await open(page);
  await openDrawerTab(page, "Items");
  const items = panel(page, "Items");

  await items.getByLabel("New Item").fill("Prize A");
  await items.getByRole("button", { name: "Add", exact: true }).click();
  await expect.poll(async () => (await wheel(page)).labels).toEqual([...DEFAULT_LABELS, "Prize A"]);
  await expect(items.getByLabel("New Item")).toHaveValue("");
  await waitForUrlToSettle(page);
  expect(urlElements(page).find((e) => e.text === "Prize A")).toMatchObject({ order: 12, active: true });

  await itemRows(page).nth(2).locator("input[type=checkbox]").click();
  await expect.poll(async () => (await wheel(page)).labels).toEqual(["1", "2", "4", "5", "6", "7", "8", "9", "10", "11", "Prize A"]);
  await expect(itemRows(page)).toHaveCount(12);
  await waitForUrlToSettle(page);
  expect(urlElements(page).find((e) => e.text === "3")).toMatchObject({ active: false });

  await itemRows(page).nth(1).locator("input[placeholder='Main Text']").fill("Two");
  await expect.poll(async () => (await wheel(page)).labels[1]).toBe("Two");
  await waitForUrlToSettle(page);
  expect(urlElements(page).find((e) => e.order === 2)).toMatchObject({ text: "Two" });

  await itemRows(page).nth(4).locator("button").click();
  await expect.poll(async () => (await wheel(page)).labels).toEqual(["1", "Two", "4", "6", "7", "8", "9", "10", "11", "Prize A"]);
  await expect(itemRows(page)).toHaveCount(11);
  await waitForUrlToSettle(page);
  expect(urlElements(page).map((e) => e.order).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  await itemRows(page).nth(0).locator("[aria-haspopup=dialog]").click();
  await expect(hexInput(page)).toHaveValue("#3f51b5");
  await hexInput(page).fill("#123456");
  await expect.poll(async () => (await wheel(page)).colors[0]).toBe("rgb(18, 52, 86)");
  await waitForUrlToSettle(page);
  expect(urlElements(page).find((e) => e.order === 1)).toMatchObject({ background: "#123456" });
});

test("B5 the Styles tab changes the wheel's font, padding, rotation, text position, border and arrow (B7)", async ({ page }) => {
  await open(page);
  await openDrawerTab(page, "Styles");
  const styles = panel(page, "Styles");
  const setNumber = async (label: string, value: number, key: string) => {
    await styles.getByLabel(label, { exact: true }).fill(String(value));
    await styles.getByLabel(label, { exact: true }).press("Tab");
    await waitForUrlToSettle(page);
    expect(urlValue(page, key)).toBe(value);
  };
  const setColor = async (swatch: number, hex: string, key: string) => {
    await styles.locator("[aria-haspopup=dialog]").nth(swatch).click();
    await hexInput(page).fill(hex);
    await waitForUrlToSettle(page);
    expect(urlValue(page, key)).toBe(hex);
    await page.mouse.click(1100, 20); // close the popover
    await expect(page.locator(".mantine-Popover-dropdown")).toBeHidden();
  };

  await setNumber("Font Size", 22, "fontSize");
  expect((await wheel(page)).segments[0].fontSize).toBe("22px");
  await setNumber("Padding Top", 30, "paddingTop");
  expect((await wheel(page)).segments[0].paddingTop).toBe("30px");
  await setNumber("Element Rotation", 45, "eleRotation");
  expect((await wheel(page)).segments[0].labelTransform).toMatch(/^matrix\(0\.7071/);

  await styles.getByLabel("Center", { exact: true }).check();
  await waitForUrlToSettle(page);
  expect(urlValue(page, "eleTextPosition")).toBe("center");
  expect((await wheel(page)).segments[0].alignItems).toBe("center");
  await styles.getByLabel("Top", { exact: true }).check();
  await waitForUrlToSettle(page);
  expect(urlValue(page, "eleTextPosition")).toBe("top");
  expect((await wheel(page)).segments[0].alignItems).toBe("flex-start");

  await setColor(0, "#ff0000", "borderColor");
  await setNumber("Border Width", 25, "borderWidth");
  expect((await wheel(page)).border).toBe("25px solid rgb(255, 0, 0)");
  await setColor(1, "#0000ff", "arrowColro");
  expect((await wheel(page)).arrowColor).toBe("rgb(0, 0, 255)");
});

test("B6 the General tab sets the modal texts, uploads, audio switches and speed (B7)", async ({ page }) => {
  await open(page);
  await openDrawerTab(page, "General");
  const general = panel(page, "General");
  for (const [label, value, key] of [
    ["Prize Modal Title", "Big Win", "modaTitle"],
    ["Prize Secondary Text", "You got:", "secondaryText"],
    ["Modal Button Text", "Again!", "buttonText"],
  ]) {
    await general.getByLabel(label, { exact: true }).fill(value);
    await waitForUrlToSettle(page);
    expect(urlValue(page, key)).toBe(value);
  }

  await general.locator('input[type=file][accept="image/*"]').setInputFiles(fixture("bg-fixture.png"));
  const background = page.locator('img[alt="default background wgg"]');
  await expect(background).toHaveAttribute("src", /^blob:/);
  await expect.poll(() => background.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  // The uploaded sound is read as a data: URL; any load error would show up as a console error (B11).
  await general.locator('input[type=file][accept="audio/*"]').setInputFiles(fixture("prize-fixture.wav"));

  for (const label of ["Play Prize Audio", "Play Ticking Audio"]) {
    const toggle = general.getByLabel(label, { exact: true });
    await expect(toggle).not.toBeChecked();
    await general.getByText(label, { exact: true }).click(); // the switch's label, as a user would
    await expect(toggle).toBeChecked();
  }

  await general.getByLabel("Wheel Speed Scale", { exact: true }).fill("2");
  await general.getByLabel("Wheel Speed Scale", { exact: true }).press("Tab");
  await waitForUrlToSettle(page);
  await expect(general.getByLabel("Wheel Speed Scale", { exact: true })).toHaveValue("2.00");
  expect(urlValue(page, "spin-config")).toEqual({ minTurns: 5, maxTurns: 10, spinSpeed: 2 });

  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  const rotation = await spin(page);
  const modal = prizeModal(page);
  await expect(modal.locator("h2")).toHaveText("Big Win");
  await expect(modal.locator("p")).toHaveText(["You got:", prizeFor(rotation, DEFAULT_LABELS), ""]);
  await page.getByRole("button", { name: "Again!" }).click();
  await expect(modal).toBeHidden();
});

test("B8 a deep link with custom items and styles renders that wheel", async ({ page }) => {
  const names: [string, string, string][] = [
    ["Alpha", "#e53935", "rgb(229, 57, 53)"],
    ["Beta", "#8e24aa", "rgb(142, 36, 170)"],
    ["Gamma", "#1e88e5", "rgb(30, 136, 229)"],
    ["Delta", "#43a047", "rgb(67, 160, 71)"],
    ["Epsilon", "#fdd835", "rgb(253, 216, 53)"],
    ["Zeta", "#fb8c00", "rgb(251, 140, 0)"],
  ];
  const elements = Object.fromEntries(
    names.map(([text, background], i) => {
      const id = `00000000-0000-4000-8000-00000000000${i + 1}`;
      return [id, { id, text, background, active: true, order: i + 1 }];
    }),
  );
  await open(
    page,
    deepLink({
      elements: { elements },
      fontSize: 24,
      paddingTop: 20,
      eleTextPosition: "center",
      borderColor: "#ff00ff",
      borderWidth: 8,
      arrowColro: "#00ff00",
    }),
  );
  const w = await wheel(page);
  expect(w.labels).toEqual(names.map((n) => n[0]));
  expect(w.colors).toEqual(names.map((n) => n[2]));
  expect(w.segments[0]).toMatchObject({ fontSize: "24px", paddingTop: "20px", alignItems: "center" });
  expect(w.border).toBe("8px solid rgb(255, 0, 255)");
  expect(w.arrowColor).toBe("rgb(0, 255, 0)");
  expect(urlValue(page, "elements")).toEqual({ elements });
});

// Pre-existing bug: hooks/useLocalUrl.ts saves the default to localStorage before it reads the
// stored value, so every load without a query overwrites the saved items instead of restoring them.
test.fail("B9 reloading without a query restores the items from localStorage", async ({ page }) => {
  await open(page);
  await openDrawerTab(page, "Items");
  await panel(page, "Items").getByLabel("New Item").fill("Persist Me");
  await panel(page, "Items").getByRole("button", { name: "Add", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("elements") ?? ""))
    .toContain('"text":"Persist Me"');
  await open(page, "/");
  expect((await wheel(page)).labels).toEqual([...DEFAULT_LABELS, "Persist Me"]);
});

test("B10 the server-rendered HTML already carries the Mantine and wheel styles", async ({ request, browser, baseURL }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<title[^>]*>Wheel of Fortune \| App<\/title>/);
  expect(html).toMatch(/<style[^>]*data-emotion="mantine/);
  expect(html).toMatch(/<style[^>]*id="__jsx-/);
  // With JavaScript off, the page is already styled: no unstyled flash before hydration.
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/");
  const w = await wheel(page);
  expect(w.colors).toEqual(DEFAULT_COLORS);
  expect(w.border).toBe("15px solid rgb(188, 200, 208)");
  expect(await menuButton(page).evaluate((b) => getComputedStyle(b).position)).toBe("fixed");
  await context.close();
});

test("the response has the baseline security headers and no X-Powered-By", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const headers = response.headers(); // names are lower-cased
  expect(headers).toMatchObject({
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "content-security-policy":
      "frame-ancestors 'self' https://jakezohdi.dev https://studio-zohdi-llc.com https://www.studio-zohdi-llc.com",
  });
  expect(headers).not.toHaveProperty("x-powered-by");
});
