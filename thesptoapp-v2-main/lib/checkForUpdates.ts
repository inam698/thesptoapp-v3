import * as Updates from 'expo-updates';
import { Alert, BackHandler, Linking, Platform } from 'react-native';

import { APP_VERSION, compareSemver, getVersionConfig, getRolloutConfig, getUserBucket } from './version';

// App Store / Play Store URLs — update these when the listings go live.
const STORE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/id6755155637'
    : 'https://play.google.com/store/apps/details?id=org.thespotapp.feminist';

/** Race a promise against a timeout. Resolves to null on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Checks for OTA updates via EAS Update, with Firebase-driven force-update
 * support.
 *
 * Flow:
 *  1. Skip entirely in dev builds (expo-updates is disabled in __DEV__).
 *  2. Check Firestore `app_config/version` for a minimum-version gate.
 *     - If the running version is below `minimumVersion` and `forceUpdate`
 *       is true, show a non-dismissible alert.
 *  3. Check rollout config — skip OTA if kill-switch is on or the user
 *     is outside the rollout percentage.
 *  4. Check EAS Update for a new JS bundle.
 *  5. If available, download it and ask the user to restart.
 *
 * This function never throws — any failure is swallowed so the app
 * continues running with the current bundle.
 *
 * Usage in the root layout:
 *   useEffect(() => { checkForUpdates(); }, []);
 *
 * To push an update:
 *   npx eas update --channel production --message "bug fixes"
 */
export async function checkForUpdates(): Promise<void> {
  // expo-updates APIs are no-ops in development; bail out early.
  if (__DEV__) return;

  try {
    // ── Step 1: Firebase version gate ───────────────────────────────
    // Timeout after 5 s so a stalled network doesn't block the entire
    // update flow — we simply skip the version gate on timeout.
    const versionConfig = await withTimeout(getVersionConfig(), 5000);

    if (versionConfig?.forceUpdate && versionConfig.minimumVersion) {
      const needsUpdate = compareSemver(APP_VERSION, versionConfig.minimumVersion) < 0;

      if (needsUpdate) {
        const message =
          versionConfig.updateMessage ||
          'A required update is available. Please update the app to continue.';

        Alert.alert(
          'Update Required',
          message,
          [
            {
              text: 'Update Now',
              onPress: () => {
                // Attempt OTA first; fall back to the store listing
                Updates.fetchUpdateAsync()
                  .then(() => Updates.reloadAsync())
                  .catch(() => {
                    Linking.openURL(STORE_URL).catch(() => {
                      if (Platform.OS === 'android') {
                        BackHandler.exitApp();
                      }
                    });
                  });
              },
            },
          ],
          { cancelable: false }
        );
        // Don't proceed further — user must update
        return;
      }
    }

    // ── Step 2: Rollout gate ──────────────────────────────────────
    // Force-updates bypass rollout (they already returned above).
    // Everything below is for optional / normal OTA updates.
    const rollout = await withTimeout(getRolloutConfig(), 3000);

    if (rollout?.disableUpdates) {
      // Kill switch is on — skip all OTA updates.
      return;
    }

    if (rollout && rollout.rolloutPercentage < 100) {
      // Use a stable identifier so the same user always gets the same
      // bucket.  Updates.updateId is unique per installed binary.
      const id = Updates.updateId ?? APP_VERSION;
      const bucket = getUserBucket(id);
      if (bucket >= rollout.rolloutPercentage) {
        // This user is outside the rollout window — skip update.
        return;
      }
    }

    // ── Step 3: Normal OTA check ────────────────────────────────────
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      // Download the new bundle in the background
      await Updates.fetchUpdateAsync();

      // Ask the user before reloading — don't interrupt their session
      Alert.alert(
        'Update Available',
        'A new version has been downloaded. Restart now to apply it?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Restart',
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }
  } catch (e) {
    // Log but don't crash — the app continues with the current bundle.
    // This will appear in crash-reporting services (Sentry, Crashlytics, etc.)
    console.warn('[checkForUpdates] update check failed:', e);
  }
}
