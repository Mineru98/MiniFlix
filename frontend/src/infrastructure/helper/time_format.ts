/**
 * 분 단위의 시간을 시간과 분 형식으로 변환합니다.
 * @param minutes 총 분 수
 * @returns 변환된 시간 문자열 (예: "2시간 43분")
 */
export const formatMinutesToHoursAndMinutes = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0분";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  } else if (remainingMinutes === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${remainingMinutes}분`;
  }
};

/**
 * 초 단위의 시간을 시:분:초 형식으로 변환합니다.
 * @param seconds 총 초 수
 * @returns 변환된 시간 문자열 (예: "01:23:45")
 */
export const formatSecondsToTimeString = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (hours > 0) {
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
};

/**
 * 진행률 퍼센트를 계산합니다.
 * @param currentPosition 현재 위치 (초)
 * @param totalDuration 총 길이 (초)
 * @returns 진행률 (%)
 */
export const calculateProgressPercent = (
  currentPosition: number,
  totalDuration: number
): number => {
  if (!currentPosition || !totalDuration || totalDuration <= 0) {
    return 0;
  }

  const percent = (currentPosition / totalDuration) * 100;
  return Math.min(Math.max(0, percent), 100);
};
