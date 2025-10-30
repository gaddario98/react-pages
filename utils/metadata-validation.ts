/**
 * Metadata validation utilities for detecting configuration issues
 * Warns developers about potential SEO and AI indexing problems
 *
 * @module utils/metadata-validation
 */

import type { MetadataConfig } from '../types';

/**
 * Validation issue for metadata configuration
 */
interface MetadataValidationIssue {
  level: 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

/**
 * Validates MetadataConfig and returns warnings/errors
 * @param config - Metadata configuration to validate
 * @returns Array of validation issues (empty if valid)
 */
export function validateMetadataConfig(config?: MetadataConfig): MetadataValidationIssue[] {
  const issues: MetadataValidationIssue[] = [];

  if (!config) return issues;

  // Rule 1: Warn if no metadata fields are defined
  const hasAnyMetadata =
    config.title ||
    config.description ||
    config.keywords ||
    config.openGraph ||
    config.structuredData ||
    config.aiHints;

  if (!hasAnyMetadata) {
    issues.push({
      level: 'warn',
      message: '[MetadataConfig] No metadata fields defined. Page will have minimal SEO and AI indexing support.',
      context: { config },
    });
  }

  // Rule 2: Validate URLs are well-formed
  if (config.canonical && !isValidUrl(config.canonical)) {
    issues.push({
      level: 'warn',
      message: '[MetadataConfig] Invalid canonical URL format.',
      context: { canonical: config.canonical },
    });
  }

  if (config.openGraph?.image && !isValidUrl(config.openGraph.image)) {
    issues.push({
      level: 'warn',
      message: '[MetadataConfig] Invalid Open Graph image URL format.',
      context: { ogImage: config.openGraph.image },
    });
  }

  if (config.openGraph?.url && !isValidUrl(config.openGraph.url)) {
    issues.push({
      level: 'warn',
      message: '[MetadataConfig] Invalid Open Graph URL format.',
      context: { ogUrl: config.openGraph.url },
    });
  }

  // Rule 3: Warn about incompatible configurations
  const robotsNoindex =
    typeof config.robots === 'string'
      ? config.robots.includes('noindex')
      : config.robots?.noindex;

  if (robotsNoindex && config.structuredData) {
    issues.push({
      level: 'warn',
      message:
        '[MetadataConfig] Page is marked with noindex but has structured data. Structured data on noindex pages is less useful for SEO.',
      context: {
        robots: config.robots,
        hasStructuredData: true,
      },
    });
  }

  // Rule 4: Recommend Open Graph when defining social sharing
  if (!config.openGraph && (config.description || config.keywords)) {
    issues.push({
      level: 'warn',
      message:
        '[MetadataConfig] Page has description/keywords but no Open Graph configuration. Consider adding openGraph for better social media sharing.',
      context: {
        hasDescription: !!config.description,
        hasKeywords: !!config.keywords,
      },
    });
  }

  // Rule 5: Validate structured data is valid JSON
  if (config.structuredData && typeof config.structuredData === 'object') {
    try {
      JSON.stringify(config.structuredData);
    } catch (e) {
      issues.push({
        level: 'error',
        message: '[MetadataConfig] Invalid structured data - not JSON serializable.',
        context: { error: String(e) },
      });
    }
  }

  // Rule 6: Warn if title is too short or too long for SEO
  if (config.title) {
    if (config.title.length < 10) {
      issues.push({
        level: 'warn',
        message: '[MetadataConfig] Title is very short (< 10 characters). SEO titles should be descriptive.',
        context: { title: config.title, length: config.title.length },
      });
    } else if (config.title.length > 60) {
      issues.push({
        level: 'warn',
        message: '[MetadataConfig] Title is very long (> 60 characters). Search engines may truncate it.',
        context: { title: config.title, length: config.title.length },
      });
    }
  }

  // Rule 7: Warn if description is too short or too long for SEO
  if (config.description) {
    if (config.description.length < 20) {
      issues.push({
        level: 'warn',
        message: '[MetadataConfig] Description is very short (< 20 characters). SEO descriptions should be detailed.',
        context: { description: config.description, length: config.description.length },
      });
    } else if (config.description.length > 160) {
      issues.push({
        level: 'warn',
        message: '[MetadataConfig] Description is very long (> 160 characters). Search engines may truncate it.',
        context: { description: config.description, length: config.description.length },
      });
    }
  }

  return issues;
}

/**
 * Logs metadata validation issues to console
 * @param issues - Array of validation issues to log
 */
export function logMetadataValidationIssues(issues: MetadataValidationIssue[]): void {
  if (typeof console === 'undefined') return;

  issues.forEach((issue) => {
    const logFn = issue.level === 'error' ? console.error : console.warn;
    logFn(issue.message);

    if (issue.context && process.env.NODE_ENV === 'development') {
      console.log('Context:', issue.context);
    }
  });
}

/**
 * Validates metadata and logs issues (convenience function)
 * @param config - Metadata configuration to validate
 */
export function validateAndLogMetadata(config?: MetadataConfig): void {
  if (process.env.NODE_ENV === 'development') {
    const issues = validateMetadataConfig(config);
    if (issues.length > 0) {
      logMetadataValidationIssues(issues);
    }
  }
}

/**
 * Checks if a string is a valid URL
 * @param url - URL string to check
 * @returns True if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}
