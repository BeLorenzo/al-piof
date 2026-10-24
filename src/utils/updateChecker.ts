export const CURRENT_APP_VERSION = '1.0.0';
const GITHUB_REPO = 'BeLorenzo/al-piof';
const CACHE_KEY = 'alpiof_update_check';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 ore

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  apkDownloadUrl?: string;
  releaseNotes?: string;
}

function parseSemver(v: string): number[] {
  const clean = v.replace(/^v/i, '').trim();
  return clean.split('.').map((n) => parseInt(n, 10) || 0);
}

function isNewer(latest: string, current: string): boolean {
  const [lMajor = 0, lMinor = 0, lPatch = 0] = parseSemver(latest);
  const [cMajor = 0, cMinor = 0, cPatch = 0] = parseSemver(current);

  if (lMajor > cMajor) return true;
  if (lMajor < cMajor) return false;
  if (lMinor > cMinor) return true;
  if (lMinor < cMinor) return false;
  return lPatch > cPatch;
}

export async function checkForAppUpdates(): Promise<UpdateInfo | null> {
  try {
    // Controllo cache per evitare rate-limit GitHub
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data as UpdateInfo;
        }
      } catch {
        // ignora errore cache
      }
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const latestTag = data.tag_name || '';
    const hasUpdate = isNewer(latestTag, CURRENT_APP_VERSION);

    // Cerca l'asset APK se disponibile tra gli allegati della release
    let apkDownloadUrl: string | undefined;
    if (Array.isArray(data.assets)) {
      const apkAsset = data.assets.find(
        (a: { name: string; browser_download_url: string }) =>
          a.name.endsWith('.apk')
      );
      if (apkAsset) {
        apkDownloadUrl = apkAsset.browser_download_url;
      }
    }

    const updateInfo: UpdateInfo = {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: latestTag.replace(/^v/i, ''),
      releaseUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      apkDownloadUrl: apkDownloadUrl || data.html_url,
      releaseNotes: data.body,
    };

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: updateInfo,
      })
    );

    return updateInfo;
  } catch (err) {
    console.debug('[UpdateChecker] Verifica aggiornamenti fallita:', err);
    return null;
  }
}
