'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CampusRoom,
  CheckIn,
  ReportedIssue,
  RoomTelemetry,
  CrowdDensity,
  ACComfort,
  SocketStatus,
  IssueStatus,
} from '@/types/campus';
import {
  INITIAL_ROOMS,
  INITIAL_CHECK_INS,
  INITIAL_ISSUES,
  SIMULATED_STUDENT_NAMES,
  SIMULATED_COMMENTS,
} from '@/data/mockCampusData';

const STORAGE_KEYS = {
  CHECK_INS: 'jainspace_checkins_v1',
  ISSUES: 'jainspace_issues_v1',
  FAVORITES: 'jainspace_favorites_v1',
  SIMULATED_TIME: 'jainspace_simulated_time_v1',
  USER_KARMA: 'jainspace_user_karma_v1',
  USER_STREAK: 'jainspace_user_streak_v1',
};

// Safe localStorage getter
function getStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

// Safe localStorage setter
function setStoredJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage key "${key}":`, err);
  }
}

export function useCampusState() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [rooms] = useState<CampusRoom[]>(INITIAL_ROOMS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(INITIAL_CHECK_INS);
  const [issues, setIssues] = useState<ReportedIssue[]>(INITIAL_ISSUES);
  const [favorites, setFavorites] = useState<string[]>(['room-a-204', 'room-b-215']);
  const [simulatedTime, setSimulatedTimeState] = useState<string>('11:30 AM');
  const [userKarma, setUserKarma] = useState<number>(145);
  const [userStreak, setUserStreak] = useState<number>(3);
  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(true);

  // Load from localStorage on client mount
  useEffect(() => {
    const storedCheckIns = getStoredJson<CheckIn[]>(STORAGE_KEYS.CHECK_INS, INITIAL_CHECK_INS);
    const storedIssues = getStoredJson<ReportedIssue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const storedFavorites = getStoredJson<string[]>(STORAGE_KEYS.FAVORITES, ['room-a-204', 'room-b-215']);
    const storedTime = getStoredJson<string>(STORAGE_KEYS.SIMULATED_TIME, '11:30 AM');
    const storedKarma = getStoredJson<number>(STORAGE_KEYS.USER_KARMA, 145);
    const storedStreak = getStoredJson<number>(STORAGE_KEYS.USER_STREAK, 3);

    setCheckIns(storedCheckIns);
    setIssues(storedIssues);
    setFavorites(storedFavorites);
    setSimulatedTimeState(storedTime);
    setUserKarma(storedKarma);
    setUserStreak(storedStreak);
    setIsHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.CHECK_INS, checkIns);
  }, [checkIns, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.ISSUES, issues);
  }, [issues, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.SIMULATED_TIME, simulatedTime);
  }, [simulatedTime, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.USER_KARMA, userKarma);
  }, [userKarma, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setStoredJson(STORAGE_KEYS.USER_STREAK, userStreak);
  }, [userStreak, isHydrated]);

  // Set Simulated Time with persistence
  const setSimulatedTime = useCallback((time: string) => {
    setSimulatedTimeState(time);
  }, []);

  // Add a new crowdsourced check-in
  const addCheckIn = useCallback(
    (newCheckIn: Omit<CheckIn, 'id' | 'timestamp' | 'helpfulCount'>) => {
      const room = rooms.find((r) => r.id === newCheckIn.roomId);
      const roomName = room ? room.name : newCheckIn.roomName || 'Campus Space';

      const checkInRecord: CheckIn = {
        ...newCheckIn,
        id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        roomName,
        timestamp: new Date().toISOString(),
        helpfulCount: 0,
        isVerifiedStudent: true,
      };

      setCheckIns((prev) => [checkInRecord, ...prev]);
      setUserKarma((prev) => prev + 15); // +15 Karma points reward
      return checkInRecord;
    },
    [rooms]
  );

  // Upvote / confirm a check-in's accuracy
  const upvoteCheckIn = useCallback((checkInId: string) => {
    setCheckIns((prev) =>
      prev.map((item) =>
        item.id === checkInId ? { ...item, helpfulCount: (item.helpfulCount || 0) + 1 } : item
      )
    );
  }, []);

  // Report a new infrastructure / maintenance issue
  const reportIssue = useCallback(
    (
      newIssue: Omit<
        ReportedIssue,
        'id' | 'createdAt' | 'status' | 'upvotes' | 'upvotedByMe'
      >
    ) => {
      const room = rooms.find((r) => r.id === newIssue.roomId);
      const roomName = room ? room.name : newIssue.roomName || 'Campus Space';
      const ticketNum = Math.floor(1000 + Math.random() * 9000);

      const issueRecord: ReportedIssue = {
        ...newIssue,
        id: `TKT-${ticketNum}`,
        roomName,
        createdAt: new Date().toISOString(),
        status: 'Open',
        upvotes: 1,
        upvotedByMe: true,
        estimatedResolutionMinutes:
          newIssue.urgency === 'Urgent' ? 15 : newIssue.urgency === 'High' ? 30 : 60,
      };

      setIssues((prev) => [issueRecord, ...prev]);
      setUserKarma((prev) => prev + 25); // +25 Karma reward for reporting issue
      return issueRecord;
    },
    [rooms]
  );

  // Upvote / Me Too an issue
  const upvoteIssue = useCallback((issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const isUpvoted = !issue.upvotedByMe;
          const currentUpvotes = issue.upvotes || 0;
          return {
            ...issue,
            upvotes: isUpvoted ? Math.max(0, currentUpvotes - 1) : currentUpvotes + 1,
            upvotedByMe: !isUpvoted,
          };
        }
        return issue;
      })
    );
  }, []);

  // Resolve an issue
  const resolveIssue = useCallback((issueId: string, resolutionNote?: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: 'Resolved' as IssueStatus,
            resolvedAt: new Date().toISOString(),
            resolutionNote: resolutionNote || 'Resolved by student campus community verification.',
          };
        }
        return issue;
      })
    );
    setUserKarma((prev) => prev + 30);
  }, []);

  // Update status of an issue
  const updateIssueStatus = useCallback((issueId: string, status: IssueStatus) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status,
            resolvedAt: status === 'Resolved' ? new Date().toISOString() : undefined,
          };
        }
        return issue;
      })
    );
  }, []);

  // Favorite toggle
  const toggleFavorite = useCallback((roomId: string) => {
    setFavorites((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  }, []);

  const isFavorite = useCallback(
    (roomId: string) => {
      return favorites.includes(roomId);
    },
    [favorites]
  );

  // Get check-ins for a room
  const getRoomCheckIns = useCallback(
    (roomId: string) => {
      return checkIns.filter((c) => c.roomId === roomId);
    },
    [checkIns]
  );

  // Get active and resolved issues for a room
  const getRoomIssues = useCallback(
    (roomId: string) => {
      return issues.filter((i) => i.roomId === roomId);
    },
    [issues]
  );

  // Compute aggregated real-time telemetry for a room
  const getLatestRoomTelemetry = useCallback(
    (roomId: string): RoomTelemetry => {
      const room = rooms.find((r) => r.id === roomId);
      const roomCheckIns = checkIns.filter((c) => c.roomId === roomId);
      const roomIssues = issues.filter((i) => i.roomId === roomId && i.status !== 'Resolved' && i.status !== 'resolved');

      const roomName = room ? room.name : 'Classroom';
      const totalSockets = room ? room.totalSockets : 12;

      // Count broken power issues
      const brokenSocketsReported = roomIssues.filter((i) => i.category === 'power' || i.category === 'socket').length;
      const workingSockets = Math.max(0, (room ? room.workingSockets : 10) - brokenSocketsReported);

      if (roomCheckIns.length === 0) {
        // Fallback default telemetry
        return {
          roomId,
          roomName,
          crowdDensity: 'Moderate',
          estimatedOccupancyPercent: 45,
          acComfort: 'Comfortable',
          socketAvailability: workingSockets > 5 ? 'Plenty' : 'Limited',
          workingSockets,
          totalSockets,
          lastUpdated: new Date().toISOString(),
          activeCheckInCount: 0,
          confidenceScore: 'Low',
          activeIssuesCount: roomIssues.length,
          noiseLevel: 'Moderate (55dB)',
          temperatureC: 23,
        };
      }

      // Aggregate latest check-in data
      const latest = roomCheckIns[0];

      // Tally density
      let emptyCount = 0;
      let moderateCount = 0;
      let packedCount = 0;

      roomCheckIns.slice(0, 5).forEach((chk) => {
        if (chk.crowdDensity === 'Empty' || chk.crowdDensity === 'low') emptyCount++;
        else if (chk.crowdDensity === 'Moderate' || chk.crowdDensity === 'moderate') moderateCount++;
        else if (chk.crowdDensity === 'Packed' || chk.crowdDensity === 'high' || chk.crowdDensity === 'full') packedCount++;
      });

      let crowdDensity: CrowdDensity = latest.crowdDensity || 'Moderate';
      let estimatedOccupancyPercent = 45;

      if (emptyCount >= moderateCount && emptyCount >= packedCount) {
        crowdDensity = 'Empty';
        estimatedOccupancyPercent = 20;
      } else if (packedCount >= moderateCount && packedCount >= emptyCount) {
        crowdDensity = 'Packed';
        estimatedOccupancyPercent = 88;
      } else {
        crowdDensity = 'Moderate';
        estimatedOccupancyPercent = 55;
      }

      // Confidence score based on number of recent check-ins
      const confidenceScore: 'High' | 'Medium' | 'Low' =
        roomCheckIns.length >= 3 ? 'High' : roomCheckIns.length >= 1 ? 'Medium' : 'Low';

      // Temperature estimate based on AC comfort
      let temperatureC = 23;
      if (latest.acComfort === 'Freezing' || latest.acComfort === 'chilled') temperatureC = 19;
      else if (latest.acComfort === 'Warm' || latest.acComfort === 'warm') temperatureC = 27;
      else if (latest.acComfort === 'AC Off' || latest.acComfort === 'off') temperatureC = 29;

      let noiseLevel = 'Moderate (55dB)';
      if (crowdDensity === 'Empty' || room?.defaultQuietZone) {
        noiseLevel = 'Quiet (35dB)';
      } else if (crowdDensity === 'Packed') {
        noiseLevel = 'Lively (70dB)';
      }

      return {
        roomId,
        roomName,
        crowdDensity,
        estimatedOccupancyPercent,
        acComfort: latest.acComfort || 'Comfortable',
        socketAvailability: latest.socketAvailability || 'Plenty',
        workingSockets,
        totalSockets,
        lastUpdated: latest.timestamp || latest.checkInTime || new Date().toISOString(),
        activeCheckInCount: roomCheckIns.length,
        confidenceScore,
        activeIssuesCount: roomIssues.length,
        noiseLevel,
        temperatureC,
      };
    },
    [rooms, checkIns, issues]
  );

  // Trigger simulated live student check-in (for demo & presentation)
  const triggerSimulatedCheckIn = useCallback(() => {
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const randomName =
      SIMULATED_STUDENT_NAMES[Math.floor(Math.random() * SIMULATED_STUDENT_NAMES.length)];
    const densities: CrowdDensity[] = ['Empty', 'Moderate', 'Packed'];
    const acs: ACComfort[] = ['Comfortable', 'Comfortable', 'Freezing', 'Warm'];
    const sockets: SocketStatus[] = ['Plenty', 'Limited', 'Plenty'];
    const avatars = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🏫'];

    const newSimulatedCheckIn: CheckIn = {
      id: `chk-sim-${Date.now()}`,
      roomId: randomRoom.id,
      roomName: randomRoom.name,
      studentName: randomName,
      studentAvatar: avatars[Math.floor(Math.random() * avatars.length)],
      timestamp: new Date().toISOString(),
      crowdDensity: densities[Math.floor(Math.random() * densities.length)],
      acComfort: acs[Math.floor(Math.random() * acs.length)],
      socketAvailability: sockets[Math.floor(Math.random() * sockets.length)],
      studyVibe: 'Collaborative',
      note: SIMULATED_COMMENTS[Math.floor(Math.random() * SIMULATED_COMMENTS.length)],
      helpfulCount: Math.floor(Math.random() * 4) + 1,
      isVerifiedStudent: true,
    };

    setCheckIns((prev) => [newSimulatedCheckIn, ...prev.slice(0, 40)]);
    return newSimulatedCheckIn;
  }, [rooms]);

  // Periodic automatic simulated live updates if active
  useEffect(() => {
    if (!liveSimulationActive) return;

    const interval = setInterval(() => {
      // 30% chance to simulate a new student check-in every 45s
      if (Math.random() > 0.4) {
        triggerSimulatedCheckIn();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [liveSimulationActive, triggerSimulatedCheckIn]);

  // Reset to initial mock state
  const resetToDefaults = useCallback(() => {
    setCheckIns(INITIAL_CHECK_INS);
    setIssues(INITIAL_ISSUES);
    setFavorites(['room-a-204', 'room-b-215']);
    setSimulatedTimeState('11:30 AM');
    setUserKarma(145);
    setUserStreak(3);
    setStoredJson(STORAGE_KEYS.CHECK_INS, INITIAL_CHECK_INS);
    setStoredJson(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    setStoredJson(STORAGE_KEYS.FAVORITES, ['room-a-204', 'room-b-215']);
    setStoredJson(STORAGE_KEYS.SIMULATED_TIME, '11:30 AM');
    setStoredJson(STORAGE_KEYS.USER_KARMA, 145);
    setStoredJson(STORAGE_KEYS.USER_STREAK, 3);
  }, []);

  const totalActiveIssues = useMemo(
    () => issues.filter((i) => i.status !== 'Resolved' && i.status !== 'resolved').length,
    [issues]
  );

  const totalResolvedIssues = useMemo(
    () => issues.filter((i) => i.status === 'Resolved' || i.status === 'resolved').length,
    [issues]
  );

  return {
    isHydrated,
    rooms,
    checkIns,
    issues,
    favorites,
    simulatedTime,
    userKarma,
    userStreak,
    liveSimulationActive,
    totalActiveIssues,
    totalResolvedIssues,
    setSimulatedTime,
    setLiveSimulationActive,
    addCheckIn,
    upvoteCheckIn,
    reportIssue,
    upvoteIssue,
    resolveIssue,
    updateIssueStatus,
    toggleFavorite,
    isFavorite,
    getRoomCheckIns,
    getRoomIssues,
    getLatestRoomTelemetry,
    triggerSimulatedCheckIn,
    resetToDefaults,
  };
}
