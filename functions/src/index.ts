import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {onObjectFinalized} from "firebase-functions/storage";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

initializeApp();
const db = getFirestore();

setGlobalOptions({maxInstances: 10, region: "asia-southeast2"});

/**
 * Auto-compress uploaded videos to 720p H.264.
 * Triggers on any video upload to weddings/{slug}/storyVideo-*.
 * Downloads the original, compresses with FFmpeg, re-uploads,
 * and updates the Firestore document with the new URL.
 */
export const compressVideo = onObjectFinalized(
  {
    region: "asia-southeast2",
    memory: "1GiB",
    timeoutSeconds: 300,
    cpu: 2,
  },
  async (event) => {
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    if (!filePath || !contentType?.startsWith("video/")) return;
    if (!filePath.includes("/storyVideo-")) return;
    // Prevent infinite loops — skip already compressed files
    if (filePath.includes("_compressed")) return;

    const bucket = getStorage().bucket(event.data.bucket);
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);
    // Extract slug from path: weddings/{slug}/storyVideo-{index}
    const parts = dirName.split("/");
    const slug = parts[1];
    if (!slug) return;

    const tempInput = path.join(os.tmpdir(), `input_${fileName}`);
    const compressedName = fileName.replace(
      /(\.[^.]+)$/,
      "_compressed.mp4",
    );
    const tempOutput = path.join(os.tmpdir(), compressedName);
    const compressedPath = `${dirName}/${compressedName}`;

    try {
      // Download original
      await bucket.file(filePath).download({destination: tempInput});

      // Compress with FFmpeg: 720p, H.264, reduced bitrate
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInput)
          .outputOptions([
            "-vf", "scale=-2:720",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "28",
            "-c:a", "aac",
            "-b:a", "64k",
            "-movflags", "+faststart",
            "-y",
          ])
          .output(tempOutput)
          .on("end", () => resolve())
          .on("error", (err: Error) => reject(err))
          .run();
      });

      // Upload compressed version
      await bucket.upload(tempOutput, {
        destination: compressedPath,
        metadata: {contentType: "video/mp4"},
      });

      // Build Firebase Storage download URL
      // (same format as client SDK getDownloadURL)
      const encodedPath = encodeURIComponent(compressedPath);
      const compressedUrl =
        `https://firebasestorage.googleapis.com/v0/b/${event.data.bucket}/o/${encodedPath}?alt=media`;

      // Update Firestore — find the slide with this video and replace URL
      const slideIndexMatch = fileName.match(/storyVideo-(\d+)/);
      if (slideIndexMatch) {
        const slideIndex = parseInt(slideIndexMatch[1], 10);
        const docRef = db.doc(`weddings/${slug}`);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const story = data?.story as Array<{
            year: string;
            text: string;
            bgImage: string;
            bgVideo?: string;
          }> | undefined;
          if (story && story[slideIndex]) {
            story[slideIndex].bgVideo = compressedUrl;
            await docRef.update({story});
          }
        }
      }

      // Delete original uncompressed file
      await bucket.file(filePath).delete().catch((e) => {
        console.warn("[compressVideo] Failed to delete original:", e);
      });

      console.log(
        `[compressVideo] Compressed ${filePath} → ${compressedPath}`,
      );
    } catch (error) {
      console.error("[compressVideo] Error:", error);
    } finally {
      // Cleanup temp files
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
  },
);

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
