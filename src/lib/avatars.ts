import { createAvatar } from "@dicebear/core";
import { adventurer, avataaars, bottts, funEmoji } from "@dicebear/collection";

/**
 * Cartoon avatars generated locally (DiceBear) from a style and a seed, so there are no image files or external
 * requests. A profile stores just "style:seed", for example "adventurer:Milo".
 */
const STYLES = { adventurer, avataaars, "fun-emoji": funEmoji, bottts } as const;
type StyleKey = keyof typeof STYLES;

const SEEDS = ["Milo", "Luna", "Zoe", "Arjun", "Kabir", "Riya", "Neel", "Tara"];

export const AVATAR_CHOICES: string[] = (Object.keys(STYLES) as StyleKey[]).flatMap((style) =>
  SEEDS.map((seed) => `${style}:${seed}`),
);

const cache = new Map<string, string>();

/** A data: URI for the avatar, or null for an empty / unknown value. */
export function avatarSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const hit = cache.get(value);
  if (hit) return hit;
  const [style, seed] = value.split(":");
  const def = STYLES[style as StyleKey];
  if (!def || !seed) return null;
  const uri = createAvatar(def as never, {
    seed,
    radius: 0,
    backgroundColor: ["facc15", "ff5722", "fde68a", "fed7aa"],
  }).toDataUri();
  cache.set(value, uri);
  return uri;
}
