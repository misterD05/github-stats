// User's Datas
export interface GitHubUser {
    login: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    avatar_url: string;
}

// Repo's Datas
export interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    updated_at: string;
    default_branch: string;
    open_issues_count: number;
    pushed_at: string;
    fork: boolean;
}

// Commits
export interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            date: string;
        };
        message: string;
    };
    author: {
        login: string;
        avatar_url: string;
    } | null;
}

// Pull requests
export interface GitHubPullRequest {
    id: number;
    user: {
        login: string;
    };
    state: "open" | "closed";
    merged_at?: string | null;
    created_at: string;
    closed_at?: string | null;
    // Aggiunto per supportare la risposta da GitHub Search API
    pull_request?: {
        merged_at?: string | null;
    };
}

// Issues
export interface GitHubIssue {
    id: number;
    number: number;
    state: "open" | "closed";
    created_at: string;
    closed_at?: string | null;
    user: {
        login: string;
    };
}

// Languages
export interface GitHubLanguages {
    [key: string]: number;
}

// Statistics
export interface GitHubStats {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    languages: Record<string, number>;
    topLanguages: { name: string; percentage: number }[];
}

// COLORS
export const colorTheme: Record<string, string> = {
    // 🔥 Warm
    red: "#E63946",
    coral: "#FF6B6B",
    orange: "#F4A261",
    amber: "#FFB703",
    yellow: "#FFD60A",
    gold: "#E9C46A",

    // 🌿 Greens
    lime: "#A7C957",
    green: "#2A9D8F",
    emerald: "#2ECC71",
    mint: "#52B788",

    // 🌊 Blues
    acqua: "#00B4D8",
    cyan: "#48CAE4",
    blue: "#3A86FF",
    navy: "#1D3557",

    // 💜 Purples
    violet: "#6C63FF",
    purple: "#8338EC",
    indigo: "#5A189A",
    lavender: "#BDB2FF",

    // 🌸 Pinks
    rose: "#E76F92",
    pink: "#FF70A6",
    fuchsia: "#C9184A",

    // ⚫ Neutrals
    white: "#FFFFFF",
    lightGray: "#F1F3F5",
    gray: "#ADB5BD",
    darkGray: "#495057",
    black: "#212529",
};

export const programmingLanguages: Record<string, string> = {
    "JavaScript": "#F7DF1E",
    "TypeScript": "#2F74C0",
    "Python": "#306998",
    "Java": "#E76F00",
    "C++": "#00599C",
    "C#": "#68217A",
    "PHP": "#4F5D95",
    "Ruby": "#CC0000",
    "Go": "#00B3A4",
    "R": "#198CE7",
    "Swift": "#FF5A1F",
    "Kotlin": "#A97BFF",
    "Rust": "#B7410E",
    "Dart": "#0175C2",
    "Scala": "#DC322F",
    "Elixir": "#5E2D79",
    "Haskell": "#453A62",
    "Perl": "#39457E",
    "Lua": "#000080",
    "Objective-C": "#2C3E50",
    "Shell": "#4EAA25",
    "MATLAB": "#FF8C1A",
    "F#": "#378BBA",
    "VB.NET": "#512BD4",
    "Groovy": "#4298B8",
    "Clojure": "#63B132",
    "Julia": "#9558B2",
    "Fortran": "#734F96",
    "COBOL": "#E48E00",
    "Assembly": "#6E4C1E",
    "SQL": "#C74634",

    "HTML": "#E34F26",
    "CSS": "#264DE4",
    "XML": "#0060AC",
    "Markdown": "#4A4A4A",
    "JSON": "#1E1E1E",
    "YAML": "#CB171E",
};
