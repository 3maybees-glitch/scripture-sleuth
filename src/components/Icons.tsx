import type { BadgeId } from '../types';

type IconProps = { className?: string };

export function IconCrown({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 34h32l-2 7H10l-2-7Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M8 34 12 16l8 10 4-16 4 16 8-10 4 18H8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15" r="2.2" fill="currentColor" />
      <circle cx="24" cy="9" r="2.4" fill="currentColor" />
      <circle cx="36" cy="15" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function IconCross({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M20 6h8v12h12v8H28v16h-8V26H8v-8h12V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDove({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 28c6-2 10-8 12-14 2 8 8 14 18 16-8 2-14 6-16 12-2-6-8-10-14-14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M20 16c2-4 6-7 11-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="9" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconLamb({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="18" cy="22" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="24" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M14 30v8M24 31v8M33 30v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconLamp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M18 36h12M20 40h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 22c0-7 3.5-14 8-14s8 7 8 14c0 4-2 7-4 9H20c-2-2-4-5-4-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M24 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSeal({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M24 14v20M18 20h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGlass({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="21" cy="21" r="11" stroke="currentColor" strokeWidth="2.2" />
      <path d="M29 29 39 39" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

const badgeMap = {
  crown: IconCrown,
  cross: IconCross,
  dove: IconDove,
  lamb: IconLamb,
} as const;

export function BadgeIcon({ id, className }: { id: BadgeId; className?: string }) {
  const Cmp = badgeMap[id];
  return <Cmp className={className} />;
}
