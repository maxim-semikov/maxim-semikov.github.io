export interface Contacts {
  email: string;
  github: { handle: string; url: string };
  telegram: { handle: string; url: string } | null;
}

export interface Profile {
  name: string;
  role: string;
  blurb: string;
  /** The About section, one string per paragraph. */
  about: string[];
  contacts: Contacts;
}

export const profile: Profile = {
  name: 'Maxim Semikov',
  role: 'Senior Software Engineer',
  blurb:
    'I enjoy creating products that are both technically robust and easy to use.',
  about: [
    'I am a Senior Software Engineer with a strong focus on front-end and mobile application development. I enjoy building modern, scalable, and user-friendly products that solve real business problems and provide exceptional user experiences.',
    'My primary expertise lies in the React ecosystem, including React, Next.js, Redux, and Recoil. Over the years, I have developed and maintained complex web applications, optimized performance, improved development processes, and collaborated closely with cross-functional teams to deliver high-quality products.',
    'In addition to web development, I also develop native iOS applications using Swift and have experience publishing and maintaining apps in the App Store. This allows me to approach product development from both web and mobile perspectives and create cohesive user experiences across platforms.',
    'I have hands-on experience with AWS and modern cloud-based solutions, and I am always interested in learning new technologies and improving my technical skills. I value clean architecture, maintainable code, and continuous improvement, both in products and development workflows.',
    'I am a proactive problem solver, a strong communicator, and someone who enjoys working collaboratively to turn ideas into successful products.',
  ],
  contacts: {
    email: 'maxim.semikov87@gmail.com',
    github: {
      handle: 'maxim-semikov',
      url: 'https://github.com/maxim-semikov',
    },
    telegram: {
      handle: 'MaximSemikov',
      url: 'https://t.me/MaximSemikov',
    },
  },
};
