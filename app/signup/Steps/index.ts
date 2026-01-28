/**
 * Step Components Index
 * 
 * Centralized exports for all signup step components.
 * This makes it easy to import steps and see all available steps at a glance.
 */

// Personal steps
export { default as AgeStep } from './personal/AgeStep';
export { default as HoursCommitmentStep } from './personal/HoursStep';
export { default as TeamSizeStep } from './personal/TeamSizeStep';

// Business steps
export { default as IdeaStep } from './business/IdeaStep';
export { default as ProblemStep } from './business/ProblemStep';
export { default as TargetCustomerStep } from './business/TargetCustomerStep';
export { default as IndustryStep, type IndustryId } from './business/IndustryStep';
export { default as ProductTypeStep } from './business/ProductTypeStep';

// Skills steps
export { default as SkillsStep } from './skills/SkillsStep';
export { default as IndustryExperienceStep } from './skills/IndustryExperienceStep';
