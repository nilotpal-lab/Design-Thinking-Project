import { Room, MatchFilterPreferences, MatchResult, AmenityInfo } from '../types/campus';

function getRoomAmenityInfo(room: Room): AmenityInfo {
  if (room.amenities && typeof room.amenities === 'object' && 'powerSockets' in room.amenities) {
    return room.amenities as AmenityInfo;
  }

  // Derive from flat properties if present
  const powerSockets = room.totalSockets || room.socketCount || (room.chargingPoints ? room.chargingPoints + 2 : 16);
  const availableSockets = room.workingSockets ?? room.chargingPoints ?? Math.max(2, Math.floor(powerSockets * 0.6));
  const hasAC = room.hasAC ?? true;
  const acTemperature = room.acStatus?.includes('18')
    ? 18
    : room.acStatus?.includes('19')
    ? 19
    : room.acStatus?.includes('20')
    ? 20
    : room.acStatus?.includes('21')
    ? 21
    : 22;

  let noiseDb = 35;
  let noiseLevel: AmenityInfo['noiseLevel'] = 'quiet';
  if (room.noiseVibe === 'Silent Study' || room.noiseVibe === 'Pin Drop Quiet') {
    noiseLevel = 'silent';
    noiseDb = 28;
  } else if (room.noiseVibe === 'Collaborative Buzz') {
    noiseLevel = 'collaborative';
    noiseDb = 52;
  } else if (room.noiseVibe === 'Moderate / Group Work') {
    noiseLevel = 'moderate';
    noiseDb = 42;
  }

  const wifiSpeedMbps = room.wifiStrength?.includes('Ultra') ? 550 : room.wifiStrength?.includes('Excellent') ? 450 : 300;

  return {
    hasAC,
    acTemperature,
    powerSockets,
    availableSockets,
    wifiSpeedMbps,
    hasProjector: !!(room.hasProjector ?? room.projector),
    hasWhiteboard: !!(room.hasWhiteboard ?? room.whiteboard ?? room.hasSmartBoard),
    hasNaturalLight: !!room.naturalLight,
    noiseLevel,
    noiseDb,
  };
}

export function calculateRoomMatch(
  room: Room,
  preferences: MatchFilterPreferences
): MatchResult {
  let score = 50; // base score
  const matchReasons: string[] = [];
  const amenities = getRoomAmenityInfo(room);

  const totalSeats = room.seatsTotal || room.capacity || 40;
  const occupiedSeats = room.seatsOccupied ?? (room.currentOccupancy ? Math.round((room.currentOccupancy / 100) * totalSeats) : 10);
  const freeSeats = Math.max(0, room.seatsAvailable ?? (totalSeats - occupiedSeats));
  const isFree = room.status ? room.status === 'free' : !room.isOccupied;
  const isSoon = room.status ? room.status === 'soon' : false;

  // 1. Status Factor (Weight: 30)
  if (isFree) {
    score += 30;
    matchReasons.push(`🟢 Free right now (${freeSeats} seats open)`);
  } else if (isSoon) {
    if (preferences.duration === '30m') {
      score += 15;
      matchReasons.push('🟡 Free for the next 25 mins');
    } else {
      score -= 10;
      matchReasons.push('🟡 Class starting soon');
    }
  } else {
    score -= 30;
    matchReasons.push('🔴 Class in session');
  }

  // 2. Priority Matching (Weight: 35)
  switch (preferences.priority) {
    case 'charging': {
      const socketRatio = amenities.availableSockets / Math.max(1, amenities.powerSockets);
      if (amenities.availableSockets >= 15 && socketRatio >= 0.5) {
        score += 35;
        matchReasons.push(`⚡ High Power: ${amenities.availableSockets} open sockets`);
      } else if (amenities.availableSockets >= 6) {
        score += 22;
        matchReasons.push(`⚡ ${amenities.availableSockets} sockets available`);
      } else {
        score += 5;
        matchReasons.push('⚡ Limited charging points');
      }
      break;
    }

    case 'ac': {
      if (amenities.hasAC) {
        const temp = amenities.acTemperature ?? 21;
        if (temp <= 20) {
          score += 35;
          matchReasons.push(`❄️ Chilled Climate (${temp}°C)`);
        } else if (temp <= 22) {
          score += 28;
          matchReasons.push(`❄️ Dual AC Cooling (${temp}°C)`);
        } else {
          score += 18;
          matchReasons.push(`❄️ AC Active (${temp}°C)`);
        }
      } else {
        score -= 20;
        matchReasons.push('⚠️ No direct AC cooling');
      }
      break;
    }

    case 'silent': {
      if (amenities.noiseLevel === 'silent') {
        score += 35;
        matchReasons.push(`🤫 Pin-Drop Silent (${amenities.noiseDb} dB)`);
      } else if (amenities.noiseLevel === 'quiet') {
        score += 25;
        matchReasons.push(`🤫 Quiet Study Atmosphere (${amenities.noiseDb} dB)`);
      } else {
        score -= 15;
        matchReasons.push(`🔊 Moderate Noise Level (${amenities.noiseDb} dB)`);
      }
      break;
    }

    case 'group': {
      if (amenities.hasWhiteboard && (amenities.noiseLevel === 'collaborative' || amenities.noiseLevel === 'moderate') && freeSeats >= 4) {
        score += 35;
        matchReasons.push('👥 Collaboration tables & whiteboards');
      } else if (freeSeats >= 4) {
        score += 24;
        matchReasons.push(`👥 Group seating for ${freeSeats} people`);
      } else {
        score -= 10;
        matchReasons.push('⚠️ Limited group capacity');
      }
      break;
    }

    case 'wifi': {
      if (amenities.wifiSpeedMbps >= 500) {
        score += 35;
        matchReasons.push(`📶 Gigabit Speed (${amenities.wifiSpeedMbps} Mbps)`);
      } else if (amenities.wifiSpeedMbps >= 350) {
        score += 25;
        matchReasons.push(`📶 High Speed Wi-Fi (${amenities.wifiSpeedMbps} Mbps)`);
      } else {
        score += 12;
      }
      break;
    }
  }

  // 3. Duration Fit (Weight: 15)
  if (preferences.duration === '30m') {
    score += 12;
  } else if (preferences.duration === '1h') {
    if (isFree) {
      score += 15;
      matchReasons.push('⏱️ Fits 1+ hour session');
    }
  } else if (preferences.duration === '2h+' || preferences.duration === '4h+') {
    if (isFree) {
      score += 18;
      matchReasons.push('🕒 Uninterrupted long study window');
    } else if (isSoon) {
      score -= 20;
    }
  }

  // 4. Group Size Fit (Weight: 10)
  if (preferences.groupSize === 'solo') {
    if (freeSeats >= 1) {
      score += 10;
      if (amenities.noiseLevel === 'silent' || amenities.noiseLevel === 'quiet') {
        matchReasons.push('👤 Solo focus pod');
      }
    }
  } else if (preferences.groupSize === 'pair') {
    if (freeSeats >= 2) {
      score += 10;
      matchReasons.push('👥 Side-by-side desk space');
    } else {
      score -= 15;
    }
  } else if (preferences.groupSize === 'group') {
    if (freeSeats >= 4) {
      score += 12;
    } else {
      score -= 25;
    }
  }

  // 5. Floor Preference Bonus (Weight: 10)
  if (preferences.floorPreference !== 'any') {
    if (room.floor === preferences.floorPreference) {
      score += 12;
      matchReasons.push(`🏢 On preferred Floor ${room.floor}`);
    } else {
      score -= 6;
    }
  }

  // Calculate approximate walking distance in minutes from entrance
  const floorNum = typeof room.floor === 'number' ? room.floor : 1;
  const walkingMinutes = 1 + floorNum * 1;

  // Clamp score between 18% and 99%
  const finalScore = Math.min(99, Math.max(18, Math.round(score)));

  return {
    room,
    matchScore: finalScore,
    matchReasons: matchReasons.slice(0, 3), // top 3 highlights
    rank: 0,
    walkingMinutes,
  };
}

export function rankRooms(rooms: Room[], preferences: MatchFilterPreferences): MatchResult[] {
  const ranked = rooms
    .map((room) => calculateRoomMatch(room, preferences))
    .sort((a, b) => b.matchScore - a.matchScore);

  return ranked.map((item, index) => {
    let badgeLabel: string | undefined = undefined;
    if (index === 0) badgeLabel = '🏆 #1 Best Match';
    else if (index === 1) badgeLabel = '🥈 #2 High Match';
    else if (index === 2) badgeLabel = '🥉 #3 Quick Walk';

    return {
      ...item,
      rank: index + 1,
      badgeLabel,
    };
  });
}
