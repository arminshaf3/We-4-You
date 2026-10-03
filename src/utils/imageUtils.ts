/**
 * Utility helpers for handling image uploads, Google Image search URL resolution,
 * and clipboard paste of image files/URLs.
 */

/**
 * Resolves real image URLs from Google Images search links, redirects, or raw URLs.
 */
export function cleanAndResolveImageUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If it's already a Data URL or relative URL
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    // If it's a google image result url (e.g. google.com/imgres?imgurl=...)
    if (trimmed.includes('google.') && trimmed.includes('imgurl=')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const imgurlParam = urlObj.searchParams.get('imgurl');
      if (imgurlParam) {
        return decodeURIComponent(imgurlParam);
      }
    }

    // Strip wrapping quotes if pasted with quotes
    const unquoted = trimmed.replace(/^["']|["']$/g, '');
    return unquoted;
  } catch {
    return trimmed;
  }
}

/**
 * Extracts an image file from a ClipboardEvent (e.g., when user presses Ctrl+V with an image copied from Google or web).
 */
export function extractImageFromClipboard(
  e: React.ClipboardEvent,
  onImageLoaded: (dataUrl: string) => void
): boolean {
  const items = e.clipboardData?.items;
  if (!items) return false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const dataUrl = loadEvt.target?.result as string;
          if (dataUrl) {
            onImageLoaded(dataUrl);
          }
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        return true;
      }
    }
  }

  // Also check if text contains an image URL or Google imgres URL
  const pastedText = e.clipboardData?.getData('text');
  if (pastedText) {
    const resolved = cleanAndResolveImageUrl(pastedText);
    if (
      resolved &&
      (resolved.match(/\.(jpeg|jpg|gif|png|webp|svg|avif)($|\?)/i) ||
        resolved.startsWith('data:image/') ||
        resolved.includes('unsplash.com') ||
        resolved.includes('google.') ||
        resolved.startsWith('http://') ||
        resolved.startsWith('https://'))
    ) {
      onImageLoaded(resolved);
      e.preventDefault();
      return true;
    }
  }

  return false;
}
