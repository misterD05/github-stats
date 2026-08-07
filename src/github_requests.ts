import {
    type GitHubUser,
    type GitHubRepo,
    type GitHubCommit,
    type GitHubPullRequest,
    type GitHubIssue,
    programmingLanguages,
    colorTheme
} from "./interfaces.js";

const linkUser = `https://api.github.com/users/`;
const linkRepo = `https://api.github.com/repos/`;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (a: string, b: string) =>
    (new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY;

function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getMergeRate(pulls: GitHubPullRequest[]): number {
    const closedPulls = pulls.filter(p => p.state === "closed");
    if (closedPulls.length === 0) return 0;
    const merged = closedPulls.filter(p => p.pull_request?.merged_at || p.merged_at != null);
    return merged.length / closedPulls.length;
}

function getAverageMergeTime(pulls: GitHubPullRequest[]): number {
    const merged = pulls.filter(p => p.pull_request?.merged_at || p.merged_at);
    if (merged.length === 0) return 0;

    const totalDays = merged.reduce((sum, pr) => {
        const end = pr.pull_request?.merged_at || pr.merged_at;
        return end ? sum + daysBetween(pr.created_at, end) : sum;
    }, 0);

    return totalDays / merged.length;
}

function getAverageIssueResolution(issues: GitHubIssue[]): number {
    const closed = issues.filter(i => i.closed_at);
    if (closed.length === 0) return 0;

    const totalDays = closed.reduce((sum, issue) => {
        return sum + daysBetween(issue.created_at, issue.closed_at!);
    }, 0);

    return totalDays / closed.length;
}

export function getCurrentStreak(commitDates: string[]): number {
    if (commitDates.length === 0) return 0;

    const uniqueDates = [...new Set(commitDates.map(d => d.slice(0, 10)))].sort().reverse();

    let streak = 0;
    const current = new Date();

    const todayStr = formatDateToYYYYMMDD(current);
    current.setDate(current.getDate() - 1);
    const yesterdayStr = formatDateToYYYYMMDD(current);

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
        return 0;
    }

    const cursorDate = new Date(uniqueDates[0]);

    for (const dateStr of uniqueDates) {
        const targetStr = formatDateToYYYYMMDD(cursorDate);
        if (dateStr === targetStr) {
            streak++;
            cursorDate.setDate(cursorDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

export interface DeveloperScoreResult {
    score: number;
    rank: "S+" | "A+" | "A" | "B" | "C";
}

export function calculateDeveloperScore(params: {
    commitCount: number;
    pulls: any[];
    issues: any[];
    streak: number;
}): DeveloperScoreResult {
    const mergeRate = getMergeRate(params.pulls);
    const avgMergeTime = getAverageMergeTime(params.pulls);
    const avgIssueTime = getAverageIssueResolution(params.issues);

    function logScore(value: number, scale = 35) {
        return Math.min(100, Math.log10(value + 1) * scale);
    }

    const activity = Math.min(
        100,
        (logScore(params.commitCount, 45) * 0.6) +
        (logScore(params.pulls.length, 40) * 0.3) +
        (logScore(params.issues.length, 40) * 0.1)
    );

    let quality = 70;
    let prQuality = 0;
    let issueQuality = 0;
    const hasPulls = params.pulls.length > 0;
    const hasIssues = params.issues.length > 0;

    if (hasPulls) {
        const mergeScore = mergeRate * 100;
        const mergeTimeScore = avgMergeTime >= 0 ? Math.max(0, 100 - avgMergeTime * 4) : 100;
        prQuality = (mergeScore * 0.6) + (mergeTimeScore * 0.4);
    }

    if (hasIssues) {
        issueQuality = avgIssueTime >= 0 ? Math.max(0, 100 - avgIssueTime * 2) : 100;
    }

    if (hasPulls && hasIssues) {
        quality = (prQuality * 0.7) + (issueQuality * 0.3);
    } else if (hasPulls) {
        quality = prQuality;
    } else if (hasIssues) {
        quality = issueQuality;
    }

    const streakScore = Math.min(100, params.streak * 12.5);

    const finalScore = (activity * 0.55) + (quality * 0.25) + (streakScore * 0.20);
    const score = Math.round(Math.min(100, Math.max(10, finalScore)));

    let rank: "S+" | "A+" | "A" | "B" | "C" = "C";

    if (score >= 90) {
        rank = "S+";
    } else if (score >= 80) {
        rank = "A+";
    } else if (score >= 65) {
        rank = "A";
    } else if (score >= 45) {
        rank = "B";
    } else {
        rank = "C";
    }

    return {
        score,
        rank
    };
}

export async function UserGithub(username: string) {
    const data = await fetch(linkUser + username).then(res => res.json()) as GitHubUser;

    return `
<svg viewBox="0 0 400 150" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <style>
        .card-bg { fill: #161b22; stroke: #30363d; stroke-width: 1.5; rx: 12; ry: 12; }
        .text-main { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #f0f6fc; font-size: 14px; }
        .text-bold { font-weight: 700; fill: #58a6ff; }
        .text-sub { fill: #8b949e; font-size: 13px; }
        .bio-text { fill: #8b949e; font-size: 12px; font-style: italic; }
    </style>
    <rect width="400" height="150" class="card-bg"/>

    <circle cx="50" cy="50" r="24" fill="#1f6feb" opacity="0.2"/>
    <circle cx="50" cy="50" r="14" fill="#1f6feb"/>

    <text x="90" y="40" class="text-main text-bold">${data.login}</text>
    <text x="90" y="58" class="text-sub">${data.name || 'No Name Provided'}</text>
    <text x="90" y="76" class="bio-text">"${data.bio ? (data.bio.length > 40 ? data.bio.substring(0, 37) + '...' : data.bio) : 'No bio available'}"</text>

    <line x1="20" y1="96" x2="380" y2="96" stroke="#30363d" stroke-width="1"/>

    <text x="25" y="125" class="text-main"><tspan class="text-bold">Repos:</tspan> ${data.public_repos}</text>
    <text x="145" y="125" class="text-main"><tspan class="text-bold">Followers:</tspan> ${data.followers}</text>
    <text x="270" y="125" class="text-main"><tspan class="text-bold">Following:</tspan> ${data.following}</text>
</svg>`;
}

async function ReposGithub(username: string): Promise<GitHubRepo[]> {
    const response = await fetch(`${linkUser}${username}/repos?sort=pushed&direction=desc&per_page=50`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data.filter((repo: GitHubRepo) => !repo.fork).slice(0, 30) : [];
}

async function UserLanguages(username: string, repo: string): Promise<Map<string, string>> {
    const response = await fetch(`${linkRepo}${username}/${repo}/languages`);
    if (!response.ok) return new Map();
    const data = await response.json();
    return new Map<string, string>(Object.entries(data));
}

async function getGitHubUserData(username: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = formatDateToYYYYMMDD(thirtyDaysAgo);

    const [userData, pullsData, issuesData, repos] = await Promise.all([
        fetch(linkUser + username).then(res => res.json()) as Promise<GitHubUser>,
        fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}+state:closed&per_page=50`).then(res => res.json()).catch(() => ({ items: [] })),
        fetch(`https://api.github.com/search/issues?q=type:issue+author:${username}+state:closed&per_page=50`).then(res => res.json()).catch(() => ({ items: [] })),
        ReposGithub(username)
    ]);

    const pulls: GitHubPullRequest[] = pullsData.items || [];
    const issues: GitHubIssue[] = issuesData.items || [];
    let allCommitDates: string[] = [];

    try {
        const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
        if (eventsResponse.ok) {
            const events = await eventsResponse.json();
            if (Array.isArray(events)) {
                events.forEach((e: { type: string; created_at?: string }) => {
                    if (e.type === "PushEvent" && e.created_at) {
                        allCommitDates.push(e.created_at);
                    }
                });
            }
        }
    } catch (err) {}

    const topRepos = repos.slice(0, 6);
    if (topRepos.length > 0) {
        const commitPromises = topRepos.map(r =>
            fetch(`${linkRepo}${username}/${r.name}/commits?author=${username}&since=${since}&per_page=50`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        const commitsRes = await Promise.all(commitPromises);
        commitsRes.forEach((cList: GitHubCommit[]) => {
            if (Array.isArray(cList)) {
                cList.forEach(c => {
                    if (c.commit?.author?.date) allCommitDates.push(c.commit.author.date);
                });
            }
        });
    }

    const unique30DaysCommits = [...new Set(allCommitDates.filter(d => d >= since).map(d => d.slice(0, 10)))].length;
    const mergeRate = getMergeRate(pulls);
    const averageTimeMerge = getAverageMergeTime(pulls);
    const averageTimeIssue = getAverageIssueResolution(issues);
    const streak = getCurrentStreak(allCommitDates);

    const { score, rank } = calculateDeveloperScore({ commitCount: unique30DaysCommits, pulls, issues, streak });

    return {
        data: userData,
        pulls,
        issues,
        unique30DaysCommits,
        mergeRate,
        averageTimeMerge,
        averageTimeIssue,
        streak,
        score,
        rank
    };
}

export async function GeneralStatsGithub(username: string, style: string) {
    const {
        data,
        pulls,
        issues,
        unique30DaysCommits,
        mergeRate,
        averageTimeMerge,
        averageTimeIssue,
        streak,
        score,
        rank
    } = await getGitHubUserData(username);

    const themeBg = (colorTheme as Record<string, string>)[style] || "#1f6feb";

    return `
  <svg viewBox="0 0 530 205" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <style>
      .bg { fill: ${themeBg}; opacity: 0.12; }
      .card { fill: #161b22; stroke: #30363d; stroke-width: 1.5; rx: 12; ry: 12; }
      .title { font-family: -apple-system, sans-serif; font-size: 18px; fill: #fff; font-weight: 700; }
      .sub { font-family: -apple-system, sans-serif; font-size: 13px; fill: #8b949e; }
      .label { font-family: -apple-system, sans-serif; font-size: 13px; fill: #8b949e; font-weight: 500; }
      .value { font-family: -apple-system, sans-serif; font-size: 14px; fill: #f0f6fc; font-weight: 700; }
      .small { font-family: -apple-system, sans-serif; font-size: 10px; fill: #6e7681; font-weight: 400; }
      .bar-bg { fill: #21262d; rx: 4; ry: 4; }
      .bar-fill { fill: #2ea043; rx: 4; ry: 4; }

      /* Stili Badge Tondo Grande */
      .rank-circle-glow { fill: ${themeBg}; opacity: 0.2; }
      .rank-circle-bg { fill: #21262d; stroke: ${themeBg}; stroke-width: 2.5; }
      .rank-circle-text { font-family: -apple-system, sans-serif; font-size: 20px; fill: #f0f6fc; font-weight: 900; text-anchor: middle; dominant-baseline: central; }
      .rank-label { font-family: -apple-system, sans-serif; font-size: 9px; fill: #8b949e; font-weight: 700; text-anchor: middle; letter-spacing: 1px; }
    </style>

    <rect width="530" height="205" class="card"/>
    <rect width="530" height="205" class="bg"/>

    <!-- Badge Rank Tondo a Sinistra del Titolo -->
    <g transform="translate(48, 48)">
      <circle cx="0" cy="0" r="28" class="rank-circle-glow"/>
      <circle cx="0" cy="0" r="22" class="rank-circle-bg"/>
      <text x="0" y="-1" class="rank-circle-text">${rank}</text>
      <text x="0" y="40" class="rank-label">RANK</text>
    </g>

    <!-- Header / Informazioni Utente (Shifted a Destra) -->
    <text x="90" y="38" class="title">${data.login}</text>
    <text x="90" y="56" class="sub">${data.name || 'Developer'}</text>

    <!-- Developer Score -->
    <text x="350" y="30" class="label" font-size="11px">DEVELOPER SCORE</text>
    <text x="350" y="50" class="value" fill="#58a6ff" font-size="16px">${score}<tspan fill="#8b949e" font-size="12"> / 100</tspan></text>
    <rect x="350" y="58" width="155" height="6" class="bar-bg"/>
    <rect x="350" y="58" width="${(score / 100) * 155}" height="6" class="bar-fill"/>

    <line x1="25" y1="92" x2="505" y2="92" stroke="#30363d" stroke-width="1"/>

    <!-- Statistiche -->
    <g transform="translate(25, 120)">
      <text class="label" x="0" y="0">Followers:</text>
      <text class="value" x="140" y="0">${data.followers}</text>

      <text class="label" x="0" y="26">Public Repos:</text>
      <text class="value" x="140" y="26">${data.public_repos}</text>

      <text class="label" x="0" y="52">Giorni Attivi (30g):</text>
      <text class="value" x="140" y="52">${unique30DaysCommits}</text>
    </g>

    <g transform="translate(280, 120)">
      <text class="label" x="0" y="0">Current Streak:</text>
      <text class="value" x="120" y="0" fill="#ffab70">${streak} gg</text>

      <text class="label" x="0" y="26">PR Chiuse:</text>
      <text class="value" x="120" y="26">${pulls.length} <tspan class="small">(${(mergeRate * 100).toFixed(0)}% • ${averageTimeMerge.toFixed(0)}g)</tspan></text>

      <text class="label" x="0" y="52">Issues Risolte:</text>
      <text class="value" x="120" y="52">${issues.length} <tspan class="small">(${averageTimeIssue.toFixed(0)}g)</tspan></text>
    </g>
  </svg>
  `;
}

export async function DonutLanguagesGithub(username: string) {
    const listRepos = await ReposGithub(username);
    const languages = await Promise.all(listRepos.map((repo: GitHubRepo) => UserLanguages(username, repo.name)));

    const totalLanguages = new Map<string, number>();
    let totalVolume = 0;

    for (const repo of languages) {
        for (const [langName, bytes] of repo.entries()) {
            const parsedBytes = parseInt(bytes, 10) || 0;
            totalLanguages.set(langName, (totalLanguages.get(langName) || 0) + parsedBytes);
            totalVolume += parsedBytes;
        }
    }

    const totalPercent = new Map<string, number>();
    if (totalVolume > 0) {
        for (const [langName, bytes] of totalLanguages.entries()) {
            const pct = parseFloat(((bytes / totalVolume) * 100).toFixed(1));
            if (pct > 0.5) totalPercent.set(langName, pct);
        }
    }

    return aerogramFromPercentages(totalPercent);
}

export function aerogramFromPercentages(data: Map<string, number>): string {
    const cx = 85;
    const cy = 80;
    const r = 48;
    const gap = 2;
    let currentAngle = 0;

    const sorted = Array.from(data).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const slices = sorted.map(([lang, percent]) => {
        const angle = percent * 3.6;
        const start = currentAngle + gap / 2;
        const end = currentAngle + angle - gap / 2;
        currentAngle += angle;

        if (percent < 1) return "";
        const path = arcStrokePath(cx, cy, r, start, end);
        const color = (programmingLanguages as Record<string, string>)[lang] || "#6e7681";

        return `<path d="${path}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"><title>${lang}: ${percent}%</title></path>`;
    });

    const legend = sorted.map(([lang, val], i) => {
        const color = (programmingLanguages as Record<string, string>)[lang] || "#6e7681";
        return `
      <g transform="translate(0, ${i * 18})">
        <circle cx="6" cy="6" r="5" fill="${color}" />
        <text x="18" y="10" font-weight="600" font-size="11px">${lang}<tspan fill="#8b949e" font-weight="400">  ${val}%</tspan></text>
      </g>
    `;
    });

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; fill: #f0f6fc; }
    .card-shell { fill: #161b22; stroke: #30363d; stroke-width: 1.5; rx: 12; ry: 12; }
    .center-label { font-size: 10px; fill: #8b949e; font-weight: 700; text-anchor: middle; letter-spacing: 0.5px; }
  </style>
  <rect width="100%" height="100%" class="card-shell" />

  <g>${slices.join("")}</g>

  <text x="${cx}" y="${cy + 3}" class="center-label">CODES</text>

  <g transform="translate(180, 28)">
    ${legend.join("")}
  </g>
</svg>
`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcStrokePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export async function HexagonStatsGithub(username: string, style: string) {
    const {
        data,
        pulls,
        issues,
        unique30DaysCommits,
        mergeRate,
        streak,
        score,
        rank
    } = await getGitHubUserData(username);

    const actScore = Math.min(100, unique30DaysCommits * 3.5);
    const stkScore = Math.min(100, streak * 7);
    const pulScore = Math.min(100, pulls.length * 8);
    const issScore = Math.min(100, issues.length * 8);
    const qlyScore = Math.min(100, mergeRate * 100);
    const infScore = Math.min(100, Math.log10((data.followers || 0) + 1) * 45);

    const stats = [actScore, stkScore, pulScore, issScore, qlyScore, infScore];

    const cx = 110;
    const cy = 102;
    const maxR = 52;

    const getHexPoints = (radiusArray: number[]) => {
        return radiusArray.map((val, i) => {
            const r = (val / 100) * maxR;
            const angle = ((i * 60 - 90) * Math.PI) / 180;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(" ");
    };

    const gridLevels = [25, 50, 75, 100];
    const themeColor = (colorTheme as Record<string, string>)[style] || "#00f0ff";
    const gameLevel = Math.max(1, Math.floor(score / 10));

    const gridPolygons = gridLevels.map(lvl => `<polygon points="${getHexPoints([lvl, lvl, lvl, lvl, lvl, lvl])}" class="grid-line" />`).join("");

    const axisLines = [0, 1, 2].map(i => {
        const angle1 = ((i * 60 - 90) * Math.PI) / 180;
        const angle2 = (((i + 3) * 60 - 90) * Math.PI) / 180;
        const x1 = (cx + maxR * Math.cos(angle1)).toFixed(1);
        const y1 = (cy + maxR * Math.sin(angle1)).toFixed(1);
        const x2 = (cx + maxR * Math.cos(angle2)).toFixed(1);
        const y2 = (cy + maxR * Math.sin(angle2)).toFixed(1);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="axis-line" />`;
    }).join("");

    const xpPercentage = (score % 10) / 10;
    const xpWidth = Math.max(4, xpPercentage * 170);

    return `
  <svg viewBox="0 0 520 205" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <style>
      .card { fill: #0d1117; stroke: #30363d; stroke-width: 1.5; rx: 12; ry: 12; }
      .grid-line { fill: none; stroke: #21262d; stroke-width: 1; }
      .axis-line { stroke: #21262d; stroke-width: 1; stroke-dasharray: 2 2; }
      .radar-poly { fill: ${themeColor}; fill-opacity: 0.25; stroke: ${themeColor}; stroke-width: 2; }
      .hud-text { font-family: "Courier New", Courier, monospace, sans-serif; font-weight: bold; font-size: 10px; fill: #8b949e; }
      .hud-value { font-family: -apple-system, sans-serif; font-weight: 800; font-size: 15px; fill: #fff; }
      .username { font-family: -apple-system, sans-serif; font-size: 18px; fill: #fff; font-weight: 800; letter-spacing: -0.5px; }
      .class-title { font-family: "Courier New", monospace; font-size: 11px; fill: ${themeColor}; letter-spacing: 1px; }
      .xp-bg { fill: #161b22; rx: 3; ry: 3; }
      .xp-fill { fill: ${themeColor}; rx: 3; ry: 3; }

      /* Badge Cyberpunk Tondo Grande */
      .rank-cyber-ring { fill: none; stroke: ${themeColor}; stroke-width: 2; stroke-dasharray: 6 3; }
      .rank-cyber-bg { fill: #161b22; stroke: ${themeColor}; stroke-width: 1.5; }
      .rank-cyber-text { font-family: "Courier New", monospace; font-weight: 900; font-size: 20px; fill: ${themeColor}; text-anchor: middle; dominant-baseline: central; }
      .rank-cyber-sub { font-family: "Courier New", monospace; font-weight: bold; font-size: 8px; fill: #8b949e; text-anchor: middle; letter-spacing: 1px; }
    </style>

    <rect width="520" height="205" class="card"/>

    <!-- Grafico Radar a Sinistra -->
    <g>
      ${gridPolygons}
      ${axisLines}
      <polygon points="${getHexPoints(stats)}" class="radar-poly"/>
    </g>

    <text x="${cx}" y="${cy - maxR - 8}" class="hud-text" text-anchor="middle">ACT</text>
    <text x="${cx + maxR + 12}" y="${cy - (maxR/2) + 12}" class="hud-text" text-anchor="start">STK</text>
    <text x="${cx + maxR + 12}" y="${cy + (maxR/2) + 2}" class="hud-text" text-anchor="start">PUL</text>
    <text x="${cx}" y="${cy + maxR + 14}" class="hud-text" text-anchor="middle">ISS</text>
    <text x="${cx - maxR - 12}" y="${cy + (maxR/2) + 2}" class="hud-text" text-anchor="end">QLY</text>
    <text x="${cx - maxR - 12}" y="${cy - (maxR/2) + 12}" class="hud-text" text-anchor="end">INF</text>

    <!-- Sezione Destra: Informazioni e Stats -->
    <g transform="translate(235, 30)">
      <!-- Badge Cyberpunk Tondo Grande posizionato a Sinistra delle scritte -->
      <g transform="translate(26, 20)">
        <circle cx="0" cy="0" r="25" class="rank-cyber-ring"/>
        <circle cx="0" cy="0" r="20" class="rank-cyber-bg"/>
        <text x="0" y="0" class="rank-cyber-text">${rank}</text>
        <text x="0" y="35" class="rank-cyber-sub">RANK</text>
      </g>

      <!-- Username e Classe a destra del Badge -->
      <text x="62" y="18" class="username">${data.login}</text>
      <text x="62" y="36" class="class-title">CLASS: CODE_WARRIOR</text>
      <text x="245" y="18" class="hud-text" text-anchor="end">LVL ${gameLevel}</text>

      <!-- Barra XP -->
      <rect x="0" y="60" width="245" height="5" class="xp-bg"/>
      <rect x="0" y="60" width="${xpWidth * (245/170)}" height="5" class="xp-fill"/>

      <!-- Griglia Parametri RPG -->
      <g transform="translate(0, 90)">
        <text x="0" y="0" class="hud-text">ATK (Commits):</text>
        <text x="0" y="16" class="hud-value">${unique30DaysCommits}</text>

        <text x="0" y="42" class="hud-text">DEF (Issues):</text>
        <text x="0" y="58" class="hud-value">${issues.length}</text>

        <text x="130" y="0" class="hud-text">SPD (Streak):</text>
        <text x="130" y="16" class="hud-value" fill="#ffab70">${streak}d</text>

        <text x="130" y="42" class="hud-text">DEX (Merge):</text>
        <text x="130" y="58" class="hud-value">${(mergeRate * 100).toFixed(0)}%</text>
      </g>
    </g>
  </svg>
  `;
}
