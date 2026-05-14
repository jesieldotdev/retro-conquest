import axios from 'axios';
import type {
  UserSummary, UserCompletedGame, GameInfoAndProgress,
  LeaderboardEntry, UserRankAndScore, AchievementOfWeek,
  GameList, ConsoleID, UserRecentAchievements, RecentlyPlayedGame,
} from '../types/ra';

const BASE_URL = 'https://retroachievements.org/API';
const IMG_BASE = 'https://media.retroachievements.org';

export const getImageUrl = (path: string) => `${IMG_BASE}${path}`;
export const getBadgeUrl = (badgeName: string, locked = false) =>
  `${IMG_BASE}/Badge/${badgeName}${locked ? '_lock' : ''}.png`;
export const getUserAvatarUrl = (username: string) =>
  `${IMG_BASE}/UserPic/${username}.png`;

let credentials: { username: string; apiKey: string } | null = null;

export function setCredentials(username: string, apiKey: string) {
  credentials = { username, apiKey };
}

export function getCredentials() {
  return credentials;
}

function authParams(overrideUser?: string) {
  if (!credentials) throw new Error('No credentials set');
  return `z=${overrideUser ?? credentials.username}&y=${credentials.apiKey}`;
}

async function get<T>(endpoint: string, params: string): Promise<T> {
  const auth = authParams();
  const query = params ? `${auth}&${params}` : auth;
  const url = `${BASE_URL}/${endpoint}?${query}`;
  const { data } = await axios.get<T>(url);
  return data;
}

export const raApi = {
  getUserSummary: (username: string, numRecent = 10, numAchievements = 5) =>
    get<UserSummary>('API_GetUserSummary.php', `u=${username}&g=${numRecent}&a=${numAchievements}`),

  getUserRecentAchievements: (username: string, count = 50) =>
    get<UserRecentAchievements[]>('API_GetUserRecentAchievements.php', `u=${username}&c=${count}`),

  getUserCompletedGames: (username: string) =>
    get<UserCompletedGame[]>('API_GetUserCompletedGames.php', `u=${username}`),

  getGameInfoAndUserProgress: (gameId: number, username?: string) =>
    get<GameInfoAndProgress>('API_GetGameInfoAndUserProgress.php', `g=${gameId}&u=${username ?? credentials?.username ?? ''}`),

  getUserRankAndScore: (username: string) =>
    get<UserRankAndScore>('API_GetUserRankAndScore.php', `u=${username}`),

  getTopTenUsers: () =>
    get<LeaderboardEntry[]>('API_GetTopTenUsers.php', ''),

  getAchievementOfWeek: () =>
    get<AchievementOfWeek>('API_GetAchievementOfTheWeek.php', ''),

  getConsoleIDs: () =>
    get<ConsoleID[]>('API_GetConsoleIDs.php', ''),

  getGameList: (consoleId: number) =>
    get<GameList[]>('API_GetGameList.php', `i=${consoleId}`),

  getUserRecentlyPlayedGames: (username: string, count = 10) =>
    get<RecentlyPlayedGame[]>('API_GetUserRecentlyPlayedGames.php', `u=${username}&c=${count}`),

  getUserPoints: (username: string) =>
    get<{ Points: number; SoftcorePoints: number }>('API_GetUserPoints.php', `u=${username}`),
};
