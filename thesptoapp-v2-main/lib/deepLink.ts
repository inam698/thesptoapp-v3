const SCHEME = 'thespotapp';

/**
 * Build a share message that includes a deep link to a specific article.
 */
export function getArticleShareUrl(articleId: string, title: string): string {
  const deepLink = `${SCHEME}://article/${articleId}`;
  return `${title}\n\nRead on The Spot App:\n${deepLink}`;
}

/**
 * Parse a deep link URL and extract the articleId if it matches the article pattern.
 * Supports both thespotapp://article/{id} and https scheme variants.
 *
 * Returns the articleId or null if the URL doesn't match.
 */
export function parseDeepLink(url: string): string | null {
  try {
    // Handle thespotapp://article/{id}
    const schemeMatch = url.match(/thespotapp:\/\/article\/([^/?#]+)/);
    if (schemeMatch) return schemeMatch[1];

    // Handle https://thespotapp.com/article/{id} (future web support)
    const httpsMatch = url.match(/thespotapp\.com\/article\/([^/?#]+)/);
    if (httpsMatch) return httpsMatch[1];

    return null;
  } catch {
    return null;
  }
}
