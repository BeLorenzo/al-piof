import pkg from '../../package.json';

export const CURRENT_APP_VERSION: string = pkg.version;
const GITHUB_REPO = 'BeLorenzo/al-piof';
const CACHE_KEY = 'alpiof_update_check';
const CACHE_NEGATIVE_TTL_MS = 60 * 1000; // Solo 1 minuto se non ci sono aggiornamenti
const CACHE_POSITIVE_TTL_MS = 15 * 60 * 1000; // 15 minuti se trovato aggiornamento

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

export function isNewer(latest: string, current: string): boolean {
  const [lMajor = 0, lMinor = 0, lPatch = 0] = parseSemver(latest);
  const [cMajor = 0, cMinor = 0, cPatch = 0] = parseSemver(current);

  if (lMajor > cMajor) return true;
  if (lMajor < cMajor) return false;
  if (lMinor > cMinor) return true;
  if (lMinor < cMinor) return false;
  return lPatch > cPatch;
}

export async function checkForAppUpdates(force = false): Promise<UpdateInfo | null> {
  try {
    // Controllo cache se non forzato
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const ttl = parsed.data?.hasUpdate ? CACHE_POSITIVE_TTL_MS : CACHE_NEGATIVE_TTL_MS;
          if (Date.now() - parsed.timestamp < ttl) {
            return parsed.data as UpdateInfo;
          }
        } catch {
          // ignora errore cache
        }
      }
    }

    let latestTag = '';
    let releaseUrl = `https://github.com/${GITHUB_REPO}/releases`;
    let apkDownloadUrl: string | undefined;
    let releaseNotes: string | undefined;

    // 1. Prova API GitHub Releases per ottenere link APK diretto e note di rilascio
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (response.ok) {
        const data = await response.json();
        latestTag = data.tag_name || '';
        releaseUrl = data.html_url || releaseUrl;
        releaseNotes = data.body || '';

        if (Array.isArray(data.assets)) {
          const apkAsset = data.assets.find(
            (a: { name: string; browser_download_url: string }) => a.name.endsWith('.apk')
          );
          if (apkAsset) {
            apkDownloadUrl = apkAsset.browser_download_url;
          }
        }
      }
    } catch (apiErr) {
      console.warn('[UpdateChecker] GitHub API non raggiungibile, provo fallback statico:', apiErr);
    }

    // 2. Fallback statico su raw.githubusercontent.com (zero rate-limit) se l'API è bloccata o 403
    if (!latestTag) {
      try {
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json?t=${Date.now()}`
        );
        if (rawRes.ok) {
          const pkg = await rawRes.json();
          if (pkg.version) {
            latestTag = `v${pkg.version}`;
            apkDownloadUrl = `https://github.com/${GITHUB_REPO}/releases/latest`;
          }
        }
      } catch (rawErr) {
        console.warn('[UpdateChecker] Fallback statico fallito:', rawErr);
      }
    }

    if (!latestTag) {
      return null;
    }

    const hasUpdate = isNewer(latestTag, CURRENT_APP_VERSION);
    const updateInfo: UpdateInfo = {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: latestTag.replace(/^v/i, ''),
      releaseUrl,
      apkDownloadUrl: apkDownloadUrl || releaseUrl,
      releaseNotes,
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
