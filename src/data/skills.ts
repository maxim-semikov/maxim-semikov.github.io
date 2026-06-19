export const skills = {
  web: [ 'React', 'TypeScript', 'Node.js', "TailwindCSS", "HTML", "CSS", "SCSS", "React Hook Form", 'Astro',],
  cloud: ['AWS Lambda', 'AWS S3', 'AWS DynamoDB', 'AWS Cognito', 'AWS Amplify', 'Firebase', 'Supabase',],
  ios: ['Swift', 'SwiftUI', 'UIKit', 'StoreKit'],
  tools: ['Git / GitHub', 'Xcode', 'Figma', 'Jira','VS Code', 'Postman', 'Docker',],
} as const;

export type SkillCategory = keyof typeof skills;

// Flat list used for the hero typing/tags row.
export const heroStack: readonly string[] = [
  ...skills.web,
  ...skills.ios.slice(0, 2),
];
