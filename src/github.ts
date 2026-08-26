import "dotenv/config";

const GITHUB_API_URL = "https://api.github.com/graphql";

interface ContributionDay {
    date: string;
    contributionCount: number;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface GitHubResponse {
    data: {
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: ContributionWeek[];
                };
            };
        };
    };
}

export async function getGithubContributions(): Promise<{
    contributions: number[][];
    weekDates: string[];
}> {

    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;

    if (!token) {
        throw new Error("GITHUB_TOKEN não encontrado no .env");
    }

    if (!username) {
        throw new Error("GITHUB_USERNAME não encontrado no .env");
    }

    const query = `
        query {
            user(login: "${username}") {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch(GITHUB_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(
            `Erro na API do GitHub: ${response.status} ${response.statusText}`
        );
    }

    const result = await response.json() as GitHubResponse;

    if (!result.data?.user) {
        throw new Error("Usuário do GitHub não encontrado.");
    }

    const calendar =
        result.data.user.contributionsCollection.contributionCalendar;

    const weeks = calendar.weeks.map(
        week => week.contributionDays.map(
            day => day.contributionCount
        )
    );

    const weekDates = calendar.weeks.map(
        week => week.contributionDays[0]?.date ?? ""
    );

    const contributions = Array.from({ length: 7 }, (_, dayIndex) =>
        weeks.map(week => week[dayIndex] ?? 0)
    );

    return { contributions, weekDates };
}