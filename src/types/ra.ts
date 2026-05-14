export interface RACredentials {
  username: string;
  apiKey: string;
}

export interface UserSummary {
  Username: string;
  UserPic: string;
  MemberSince: string;
  RichPresenceMsg: string;
  LastGameID: number;
  ContribCount: number;
  ContribYield: number;
  TotalPoints: number;
  TotalSoftcorePoints: number;
  TotalTruePoints: number;
  Permissions: number;
  Untracked: number;
  ID: number;
  UserWallActive: number;
  Motto: string;
  Rank: number;
  TotalRanked: number;
  LastActivity: LastActivity;
  RecentlyPlayed: RecentlyPlayedGame[];
  RecentAchievements: Record<string, Record<string, RecentAchievement>>;
  Points: number;
  SoftcorePoints: number;
  Status: string;
}

export interface LastActivity {
  ID: number;
  timestamp: string;
  lastupdate: string;
  activitytype: number;
  User: string;
  data: string;
  data2: string;
}

export interface RecentlyPlayedGame {
  GameID: number;
  ConsoleID: number;
  ConsoleName: string;
  Title: string;
  ImageIcon: string;
  ImageTitle: string;
  ImageIngame: string;
  ImageBoxArt: string;
  LastPlayed: string;
  AchievementsTotal: number;
  NumPossibleAchievements: number;
  PossibleScore: number;
  NumAchieved: number;
  ScoreAchieved: number;
  NumAchievedHardcore: number;
  ScoreAchievedHardcore: number;
}

export interface RecentAchievement {
  ID: number;
  GameID: number;
  GameTitle: string;
  Title: string;
  Description: string;
  Points: number;
  BadgeName: string;
  IsAwarded: string;
  DateAwarded: string;
  HardcoreAchieved: number;
}

export interface UserCompletedGame {
  GameID: number;
  Title: string;
  ImageIcon: string;
  ConsoleName: string;
  MaxPossible: number;
  NumAwarded: number;
  PctWon: string;
  HardcoreMode: string;
}

export interface GameInfoAndProgress {
  ID: number;
  Title: string;
  ConsoleID: number;
  ConsoleName: string;
  ImageIcon: string;
  ImageTitle: string;
  ImageIngame: string;
  ImageBoxArt: string;
  Publisher: string;
  Developer: string;
  Genre: string;
  Released: string;
  IsFinal: number;
  RichPresencePatch: string;
  GuideURL: string;
  Updated: string;
  NumDistinctPlayersCasual: number;
  NumDistinctPlayersHardcore: number;
  NumAchievements: number;
  Achievements: Record<string, Achievement>;
  NumAwardedToUser: number;
  NumAwardedToUserHardcore: number;
  UserCompletion: string;
  UserCompletionHardcore: string;
}

export interface Achievement {
  ID: number;
  NumAwarded: number;
  NumAwardedHardcore: number;
  Title: string;
  Description: string;
  Points: number;
  TrueRatio: number;
  Author: string;
  DateModified: string;
  DateCreated: string;
  BadgeName: string;
  DisplayOrder: number;
  MemAddr: string;
  type: string | null;
  DateEarned?: string;
  DateEarnedHardcore?: string;
}

export interface UserAchievement {
  AchievementID: number;
  Title: string;
  Description: string;
  Points: number;
  BadgeName: string;
  IsAwarded: number;
  DateAwarded: string;
  HardcoreAchieved: number;
  GameID: number;
  GameTitle: string;
  GameIcon: string;
  ConsoleName: string;
  CumulScore: number;
}

export interface LeaderboardEntry {
  UserName: string;
  TotalPoints: number;
  TotalTruePoints: number;
  Rank: number;
}

export interface UserPoints {
  Points: number;
  SoftcorePoints: number;
}

export interface UserRankAndScore {
  Score: number;
  SoftcoreScore: number;
  Rank: string;
}

export interface AchievementOfWeek {
  Achievement: {
    ID: number | string;
    Title: string;
    Description: string;
    Points: number | string;
    TrueRatio?: number;
    Type?: string | null;
    Author?: string;
    BadgeName?: string;
    // Legacy shape (older API) — keep optional for backwards compat
    GameID?: number | string;
    GameTitle?: string;
    ConsoleName?: string;
  };
  Game?: { ID: number | string; Title: string };
  Console?: { ID: number | string; Title: string };
  ForumTopic?: { ID: number };
  StartAt: string;
  TotalPlayers: number;
  Unlocks: UnlockEntry[];
  UnlocksCount: number;
  UnlocksHardcoreCount: number;
}

export interface UnlockEntry {
  User: string;
  ULID?: string;
  RAPoints?: number;
  RASoftcorePoints?: number;
  DateAwarded: string;
  HardcoreMode: number;
}

export interface GameList {
  ID: number;
  Title: string;
  ConsoleID: number;
  ConsoleName: string;
  ImageIcon: string;
  NumAchievements: number;
  NumLeaderboards: number;
  Points: number;
  DateModified: string;
  ForumTopicID: number;
  Hashes: string[];
}

export interface ConsoleID {
  ID: number;
  Name: string;
}

export interface GameRankEntry {
  User: string;
  NumAchievements: number;
  TotalScore: number;
  LastAward: string;
}

export interface UserRecentAchievements {
  Date: string;
  HardcoreMode: number;
  AchievementID: number;
  Title: string;
  Description: string;
  BadgeName: string;
  Points: number;
  TrueRatio: number;
  Type: string | null;
  Author: string;
  GameTitle: string;
  GameIcon: string;
  GameID: number;
  ConsoleName: string;
  CumulScore: number;
  BadgeURL: string;
  GameURL: string;
}
