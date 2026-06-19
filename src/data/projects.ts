export type AppStore =
  | { status: 'live'; url: string }
  | { status: 'coming-soon' }
  | { status: 'none' };

export interface Project {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  badges: readonly string[];
  appStore: AppStore;
  privacy: boolean;
  icon?: string;
}

export const projects: readonly Project[] = [
  {
    slug: 'rental-tracker',
    name: 'Rental Tracker',
    description: 'Rental Tracker — a fully offline iOS app for landlords to track properties, leases, charges and payments. Your data never leaves the device.',
    tagline:
      'Track properties, leases, charges and payments — fully offline, your data never leaves the device.',
    badges: ['iOS', 'SwiftUI', 'Offline-first'],
    appStore: { status: 'live', url: 'https://apps.apple.com/kz/app/%D1%83%D1%87%D1%91%D1%82-%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D1%8B/id6776999320'},
    privacy: true,
    icon: 'projects/rental-tracker/icon.png',
  },
  {
    slug: 'psychomatrix',
    name: 'AI Psychomatrix',
    description: 'AI Psychomatrix — an iOS app that builds a Pythagorean square from a birth date and generates an AI-powered reading.',
    tagline:
      'Builds a Pythagorean square from a birth date and generates an AI-powered reading.',
    badges: ['iOS', 'SwiftUI', 'AI'],
    appStore: { status: 'coming-soon' },
    privacy: true,
    icon: 'projects/psychomatrix/icon.png'
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);
