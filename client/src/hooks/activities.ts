import { useContext, useMemo } from "react";
import { useProject } from "./project";
import { ActivitiesContext } from "@/context";
import { Activity } from "@/context/activities";

const SESSION_MAX_BREAK = 3600 * 1000; // 1 hour

/**
 * Custom hook to access the Activities context and account information.
 * Must be used within a ActivitiesProvider component.
 *
 * @returns An object containing:
 * - activities: The registered activities
 * - status: The status of the activities
 * @throws {Error} If used outside of a ActivitiesProvider context
 */
export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useActivities` hook must be used within a `ActivitiesProvider`",
    );
  }

  const {
    activities: allActivities,
    playerActivities: allPlayerActivities,
    usernames,
    status,
  } = context;

  const aggregatedActivities: { [key: string]: Activity[] } = useMemo(() => {
    const result: { [key: string]: Activity[] } = {};
    Object.entries(allActivities).forEach(([project, activities]) => {
      const history: { [address: string]: { time: number; index: number } } =
        {};
      const aggregatedActivities: Activity[] = [];
      activities.forEach((activity) => {
        const last = history[activity.callerAddress];
        const currentTime = activity.timestamp;
        const deltaTime = !last?.time
          ? SESSION_MAX_BREAK
          : last.time > currentTime
            ? last.time - currentTime
            : currentTime - last.time;
        if (deltaTime < SESSION_MAX_BREAK) {
          history[activity.callerAddress].time = currentTime;
          aggregatedActivities[last.index].count += activity.count;
          aggregatedActivities[last.index].identifier = activity.identifier;
        } else {
          history[activity.callerAddress] = {
            time: currentTime,
            index: aggregatedActivities.length,
          };
          aggregatedActivities.push({ ...activity });
        }
      });
      result[project] = aggregatedActivities;
    });
    return result;
  }, [allActivities]);

  const activities = useMemo(() => {
    if (!project)
      return Object.values(allActivities).flatMap((activities) => activities);
    return allActivities[project];
  }, [project, allActivities]);

  const playerActivities = useMemo(() => {
    if (!project)
      return Object.values(allPlayerActivities).flatMap(
        (activities) => activities,
      );
    return allPlayerActivities[project];
  }, [project, allPlayerActivities]);

  return {
    aggregatedActivities,
    usernames,
    activities,
    playerActivities,
    status,
  };
};
