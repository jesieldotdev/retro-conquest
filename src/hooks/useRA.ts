import { useQuery } from '@tanstack/react-query';
import { raApi } from '../api/ra';
import { useAuth } from '../context/AuthContext';

export function useUserSummary(numRecent = 10) {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['userSummary', username, numRecent],
    queryFn: () => raApi.getUserSummary(username, numRecent, 10),
    enabled: isAuthenticated && !!username,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecentAchievements(minutes = 60) {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['recentAchievements', username, minutes],
    queryFn: () => raApi.getUserRecentAchievements(username, minutes),
    enabled: isAuthenticated && !!username,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecentlyPlayed(count = 10) {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['recentlyPlayed', username, count],
    queryFn: () => raApi.getUserRecentlyPlayedGames(username, count),
    enabled: isAuthenticated && !!username,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCompletedGames() {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['completedGames', username],
    queryFn: () => raApi.getUserCompletedGames(username),
    enabled: isAuthenticated && !!username,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGameProgress(gameId: number | null) {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['gameProgress', gameId, username],
    queryFn: () => raApi.getGameInfoAndUserProgress(gameId!, username),
    enabled: isAuthenticated && !!username && gameId !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserRank() {
  const { username, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['userRank', username],
    queryFn: () => raApi.getUserRankAndScore(username),
    enabled: isAuthenticated && !!username,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopTenUsers() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['topTenUsers'],
    queryFn: () => raApi.getTopTenUsers(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAchievementOfWeek() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['achievementOfWeek'],
    queryFn: () => raApi.getAchievementOfWeek(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
  });
}

export function useGameRank(gameId: number | null, latestMasters = false) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['gameRank', gameId, latestMasters],
    queryFn: () => raApi.getGameRankAndScore(gameId!, latestMasters),
    enabled: isAuthenticated && gameId !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useConsoleIDs() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['consoleIDs'],
    queryFn: () => raApi.getConsoleIDs(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60,
  });
}
