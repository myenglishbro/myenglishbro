import { useState, useEffect, useCallback } from "react";

interface CourseProgress {
  courseId: string;
  currentLessonId: string;
  completedLessons: string[];
  lastUpdated: string;
}

interface AllProgress {
  [courseId: string]: CourseProgress;
}

const STORAGE_KEY = "course-progress";

export const useCourseProgress = (courseId?: string) => {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [allProgress, setAllProgress] = useState<AllProgress>({});

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AllProgress = JSON.parse(stored);
        setAllProgress(parsed);
        if (courseId && parsed[courseId]) {
          setProgress(parsed[courseId]);
        }
      } catch (e) {
        console.error("Error parsing course progress", e);
      }
    }
  }, [courseId]);

  // Update current lesson
  const setCurrentLesson = useCallback((lessonId: string) => {
    if (!courseId) return;

    const newProgress: CourseProgress = {
      courseId,
      currentLessonId: lessonId,
      completedLessons: progress?.completedLessons || [],
      lastUpdated: new Date().toISOString(),
    };

    const newAllProgress = {
      ...allProgress,
      [courseId]: newProgress,
    };

    setProgress(newProgress);
    setAllProgress(newAllProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllProgress));
  }, [courseId, progress, allProgress]);

  // Mark lesson as completed
  const markLessonCompleted = useCallback((lessonId: string) => {
    if (!courseId) return;

    const completedLessons = progress?.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      
      const newProgress: CourseProgress = {
        courseId,
        currentLessonId: progress?.currentLessonId || lessonId,
        completedLessons: newCompleted,
        lastUpdated: new Date().toISOString(),
      };

      const newAllProgress = {
        ...allProgress,
        [courseId]: newProgress,
      };

      setProgress(newProgress);
      setAllProgress(newAllProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllProgress));
    }
  }, [courseId, progress, allProgress]);

  // Unmark lesson as completed (without page reload)
  const unmarkLessonCompleted = useCallback((lessonId: string) => {
    if (!courseId || !progress) return;

    const newCompleted = progress.completedLessons.filter(id => id !== lessonId);
    
    const newProgress: CourseProgress = {
      courseId,
      currentLessonId: progress.currentLessonId,
      completedLessons: newCompleted,
      lastUpdated: new Date().toISOString(),
    };

    const newAllProgress = {
      ...allProgress,
      [courseId]: newProgress,
    };

    setProgress(newProgress);
    setAllProgress(newAllProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllProgress));
  }, [courseId, progress, allProgress]);

  // Get progress percentage - now accepts valid lesson IDs to filter
  const getProgressPercentage = useCallback((totalLessons: number, validLessonIds?: string[]): number => {
    if (!progress || totalLessons === 0) return 0;
    
    // Filter completed lessons to only include valid ones
    const validCompleted = validLessonIds 
      ? progress.completedLessons.filter(id => validLessonIds.includes(id))
      : progress.completedLessons;
    
    const percentage = Math.round((validCompleted.length / totalLessons) * 100);
    // Cap at 100%
    return Math.min(percentage, 100);
  }, [progress]);

  // Get count of completed lessons (filtered by valid IDs)
  const getCompletedCount = useCallback((validLessonIds?: string[]): number => {
    if (!progress) return 0;
    
    if (validLessonIds) {
      return progress.completedLessons.filter(id => validLessonIds.includes(id)).length;
    }
    return progress.completedLessons.length;
  }, [progress]);

  // Get progress for a specific course
  const getCourseProgress = useCallback((id: string): CourseProgress | null => {
    return allProgress[id] || null;
  }, [allProgress]);

  return {
    progress,
    allProgress,
    setCurrentLesson,
    markLessonCompleted,
    unmarkLessonCompleted,
    getProgressPercentage,
    getCompletedCount,
    getCourseProgress,
  };
};
