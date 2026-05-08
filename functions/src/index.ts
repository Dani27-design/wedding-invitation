import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

setGlobalOptions({maxInstances: 10, region: "asia-southeast2"});

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

/**
 * Escape HTML special characters.
 * @param {string} s - Input string.
 * @return {string} Escaped string.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validate hex color, return fallback if invalid.
 * @param {string|undefined} v - Color value.
 * @param {string} fb - Fallback color.
 * @return {string} Valid hex color.
 */
function hex(
  v: string | undefined,
  fb: string,
): string {
  return v && HEX_RE.test(v) ? v : fb;
}

export const ssrMeta = onRequest(async (req, res) => {
  const slug = (req.query.slug as string || "").trim();

  if (!slug) {
    res.status(400).send("Missing slug");
    return;
  }

  try {
    const snap = await db.doc(`weddings/${slug}`).get();
    if (!snap.exists) {
      res.status(404).send("Not found");
      return;
    }

    const w = snap.data() ?? {};
    const rawDate = w.eventDate ?? "";
    const heroImg = w.heroImage ?? "";
    const dateObj = new Date(rawDate + "T00:00:00");
    const dateFmt = !isNaN(dateObj.getTime()) ?
      dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }) :
      rawDate;

    const groom = esc(w.groomNickname ?? "");
    const bride = esc(w.brideNickname ?? "");
    const city = esc(w.eventCity ?? "");
    const venue = esc(w.venueName ?? "");
    const dd = esc(dateFmt);
    const sl = esc(slug);

    const origin = req.query.origin as string ||
      `https://${req.hostname}`;
    const title =
      `Wedding ${groom} &amp; ${bride} - ${dd}`;
    const description =
      "Turut mengundang Anda di hari" +
      ` bahagia kami — ${dd}, ${city}`;
    const imageUrl = esc(
      heroImg.startsWith("http") ?
        heroImg :
        `${origin}${heroImg}`,
    );
    const pageUrl = esc(`${origin}/${sl}`);

    const themeColors = w.theme?.colors;
    const bg = hex(themeColors?.background, "#FDFCF8");
    const ink = hex(themeColors?.text, "#1A1A1A");
    const accent = hex(themeColors?.accent, "#B48D3E");

    const html = [
      "<!doctype html>",
      "<html lang=\"id\">",
      "<head>",
      "  <meta charset=\"UTF-8\" />",
      "  <meta name=\"viewport\" " +
        "content=\"width=device-width, initial-scale=1.0\" />",
      `  <meta name="theme-color" content="${ink}" />`,
      `  <title>${title}</title>`,
      "  <meta name=\"description\" " +
        `content="${description}" />`,
      `  <meta property="og:title" content="${title}" />`,
      "  <meta property=\"og:description\" " +
        `content="${description}" />`,
      "  <meta property=\"og:image\" " +
        `content="${imageUrl}" />`,
      `  <meta property="og:url" content="${pageUrl}" />`,
      `  <link rel="canonical" href="${pageUrl}" />`,
      "  <meta property=\"og:type\" content=\"website\" />",
      "  <meta name=\"twitter:card\" " +
        "content=\"summary_large_image\" />",
      `  <meta name="twitter:title" content="${title}" />`,
      "  <meta name=\"twitter:description\" " +
        `content="${description}" />`,
      "  <meta name=\"twitter:image\" " +
        `content="${imageUrl}" />`,
      "  <script type=\"application/ld+json\">" +
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": `Wedding ${w.groomNickname ?? ""} & ` +
            `${w.brideNickname ?? ""}`,
          "startDate": rawDate,
          "location": {
            "@type": "Place",
            "name": w.venueName ?? "",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": w.eventCity ?? "",
            },
          },
          "image": heroImg.startsWith("http") ?
            heroImg : `${origin}${heroImg}`,
          "url": `${origin}/${slug}`,
        }) +
        "</script>",
      "</head>",
      "<body style=\"margin:0;min-height:100vh;" +
        "display:flex;align-items:center;" +
        "justify-content:center;" +
        `background:${bg};color:${ink};` +
        "font-family:serif;text-align:center\">",
      "  <div>",
      "    <h1 style=\"font-size:2.5rem;" +
        `margin-bottom:0.5rem">${groom} & ${bride}</h1>`,
      "    <p style=\"font-style:italic;" +
        "opacity:0.6;" +
        `margin-bottom:0.25rem">${dd}</p>`,
      "    <p style=\"font-size:0.85rem;" +
        "opacity:0.4;" +
        "margin-bottom:2rem\">" +
        `${venue}, ${city}</p>`,
      "    <div style=\"width:3rem;height:1px;" +
        `background:${accent};` +
        "opacity:0.3;margin:0 auto\"></div>",
      "  </div>",
      "</body>",
      "</html>",
    ].join("\n");

    res.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600",
    );
    res.status(200).send(html);
  } catch (error) {
    console.error("[ssrMeta] Error:", error);
    res.status(500).send("Internal error");
  }
});
