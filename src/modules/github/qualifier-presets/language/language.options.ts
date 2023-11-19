import { QualifierOptions } from "@/modules/github/search-query.types";
import { otherLanguages } from "./languages-other";

// Language Qualifier

export type LanguageMap = Record<string, LanguageMetadata>;

export type LanguageMetadata = {
  label: string;
  iconClassName?: string;
  color?: string;
};

export type LanguagesQualifierValue = keyof typeof languageMap;

export const { languageQualifierOptions, languageMap } = defineLanguages(
  {
    "all-languages": {
      iconClassName: "i-lucide-code",
      label: "All Languages",
    },
    typescript: {
      label: "TypeScript",
      iconClassName: "i-skill-icons-typescript",
    },
    javascript: {
      label: "JavaScript",
      iconClassName: "i-skill-icons-javascript",
    },
    react: {
      label: "React",
      iconClassName: "i-skill-icons-react-dark",
    },
    vue: {
      label: "Vue",
      iconClassName: "i-skill-icons-vuejs-light",
    },
    svelte: {
      label: "Svelte",
      iconClassName: "i-skill-icons-svelte",
    },
    python: {
      label: "Python",
      iconClassName: "i-skill-icons-python-dark",
    },
    rust: {
      label: "Rust",
      iconClassName: "i-skill-icons-rust",
    },
    java: {
      label: "Java",
      iconClassName: "i-skill-icons-java-dark",
    },
    go: {
      label: "Go",
      iconClassName: "i-skill-icons-golang",
    },
    "c++": {
      label: "C++",
      iconClassName: "i-skill-icons-cpp",
    },
    swift: {
      label: "Swift",
      iconClassName: "i-skill-icons-swift",
    },
    c: {
      label: "C",
      iconClassName: "i-skill-icons-c",
    },
    ruby: {
      label: "Ruby",
      iconClassName: "i-skill-icons-ruby",
    },
    php: {
      label: "PHP",
      iconClassName: "i-skill-icons-php-dark",
    },
    html: {
      label: "HTML",
      iconClassName: "i-skill-icons-html",
    },
    css: {
      label: "CSS",
      iconClassName: "i-skill-icons-css",
    },
    shell: {
      label: "Shell",
      iconClassName: "i-skill-icons-bash-dark",
    },
    perl: {
      label: "Perl",
      iconClassName: "i-skill-icons-perl",
    },
    scala: {
      label: "Scala",
      iconClassName: "i-skill-icons-scala-dark",
    },
    kotlin: {
      label: "Kotlin",
      iconClassName: "i-skill-icons-kotlin-dark",
    },
    lua: {
      label: "Lua",
      iconClassName: "i-skill-icons-lua-dark",
    },
    dart: {
      label: "Dart",
      iconClassName: "i-skill-icons-dart-dark",
    },
    r: {
      label: "R",
      iconClassName: "i-skill-icons-r-dark",
    },
    matlab: {
      label: "MATLAB",
      iconClassName: "i-skill-icons-matlab-dark",
    },

    angular: {
      label: "Angular",
      iconClassName: "i-skill-icons-angular-dark",
    },
    django: {
      label: "Django",
      iconClassName: "i-skill-icons-django",
    },
    flask: {
      label: "Flask",
      iconClassName: "i-skill-icons-flask-dark",
    },
    laravel: {
      label: "Laravel",
      iconClassName: "i-skill-icons-laravel-dark",
    },
    rails: {
      label: "Rails",
      iconClassName: "i-skill-icons-rails",
    },
    spring: {
      label: "Spring",
      iconClassName: "i-skill-icons-spring-dark",
    },
    android: {
      label: "Android",
      iconClassName: "i-skill-icons-androidstudio-dark",
    },
    ios: {
      label: "iOS",
      iconClassName: "i-skill-icons-flutter-dark",
    },
    unity: {
      label: "Unity",
      iconClassName: "i-skill-icons-unity-dark",
    },
    solidity: {
      label: "Solidity",
      iconClassName: "i-skill-icons-solidity",
    },
    prisma: {
      label: "Prisma",
      iconClassName: "i-skill-icons-prisma",
    },
    scss: {
      label: "SCSS",
      iconClassName: "i-skill-icons-sass",
    },
    dockerfile: {
      label: "Dockerfile",
      iconClassName: "i-skill-icons-docker",
    },
  },
  otherLanguages
);

type DefineLanguagesOptions = {
  languageQualifierOptions: Omit<QualifierOptions, "optionMap">;
  languageMap: LanguageMap;
};

export function defineLanguages(
  languageMap: LanguageMap,
  otherLanguages: string[]
): DefineLanguagesOptions {
  const languageOptions = {
    options: Object.entries(languageMap).map(
      ([key, { iconClassName, label }]) => ({
        label,
        id: key,
        iconClassName,
        qualifierValue: key,
      })
    ),
    optionGroups: [
      {
        groupLabel: "Other Languages",
        groupId: "other-languages",
        showIcons: false,
        options: otherLanguages.map((e) => ({
          label: e,
          qualifierValue: e.toLowerCase(),
          groupId: "other-languages",
        })),
      },
    ],
  };

  return { languageQualifierOptions: languageOptions, languageMap };
}
