import { Platform, PlatformFormData } from '@/types/platform';

// Allowed platform values
export const ALLOWED_PLATFORMS = [
  'YouTube',
  'Facebook',
  'Spotify',
  'ARD Audiothek',
] as const;

export type AllowedPlatform = typeof ALLOWED_PLATFORMS[number];

// Validation error structure matching PlatformDialog's existing interface
export interface ValidationErrors {
  platform?: string;
  platform_name?: string;
  platform_id?: string;
  standardized_name?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Validates platform field against allowed values
 */
export function validatePlatform(platform: string): string | null {
  if (!platform.trim()) {
    return 'Platform is required';
  }

  if (!ALLOWED_PLATFORMS.includes(platform as AllowedPlatform)) {
    return `Platform must be one of: ${ALLOWED_PLATFORMS.join(', ')}`;
  }

  return null;
}

/**
 * Validates platform_id format based on platform type
 * Currently only implements YouTube validation, extensible for other platforms
 */
export function validatePlatformId(
  platform_id: string,
  platform: string
): string | null {
  if (!platform_id.trim()) {
    return 'Platform ID is required';
  }

  // YouTube-specific validation
  if (platform === 'YouTube') {
    if (!platform_id.startsWith('UC')) {
      return 'YouTube Platform ID must start with "UC"';
    }

    if (platform_id.length !== 24) {
      return 'YouTube Platform ID must be exactly 24 characters';
    }
  }

  // Extensible: Add validation rules for other platforms here in the future
  // Example:
  // if (platform === 'Facebook') {
  //   // Facebook ID validation rules
  // }

  return null;
}

/**
 * Checks if platform_id already exists in the list of platforms
 */
export function checkDuplicatePlatformId(
  platform_id: string,
  existingPlatforms: Platform[],
  currentPlatformId?: string
): string | null {
  // When editing, exclude the current platform from duplicate check
  const isDuplicate = existingPlatforms.some(
    (p) => p.platform_id === platform_id && p.platform_id !== currentPlatformId
  );

  if (isDuplicate) {
    return 'Platform ID already exists';
  }

  return null;
}

/**
 * Main validation function that validates the entire form
 * Returns ValidationResult with all errors
 */
export function validatePlatformForm(
  formData: PlatformFormData,
  existingPlatforms: Platform[],
  isEditMode: boolean = false
): ValidationResult {
  const errors: ValidationErrors = {};

  // Validate platform
  const platformError = validatePlatform(formData.platform);
  if (platformError) {
    errors.platform = platformError;
  }

  // Validate platform_name
  if (!formData.platform_name.trim()) {
    errors.platform_name = 'Platform Name is required';
  }

  // Validate platform_id format
  const platformIdError = validatePlatformId(
    formData.platform_id,
    formData.platform
  );
  if (platformIdError) {
    errors.platform_id = platformIdError;
  }

  // Check for duplicate platform_id (only if no format error exists)
  if (!platformIdError) {
    const duplicateError = checkDuplicatePlatformId(
      formData.platform_id,
      existingPlatforms,
      isEditMode ? formData.platform_id : undefined
    );
    if (duplicateError) {
      errors.platform_id = duplicateError;
    }
  }

  // Validate standardized_name
  if (!formData.standardized_name.trim()) {
    errors.standardized_name = 'Standardized Name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
