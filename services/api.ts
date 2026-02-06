import { Course } from '../types';
import { MOCK_COURSES } from '../constants';

/**
 * Simulates a Node.js backend API call to fetch courses.
 * In a real app, this would use fetch() or axios to hit a Node/Express endpoint.
 */
export const fetchRecommendedCourses = async (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_COURSES);
    }, 600); // Simulate network latency
  });
};