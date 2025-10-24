import { AllowedPlatform } from '@/utils/platformValidation';

export interface Platform {
  platform_id: string;
  platform: AllowedPlatform;
  platform_name: string;
  standardized_name: string;
  // Format Mapping fields (joined from format_mappings table)
  content_box?: string;
  marke?: string;
}

export interface PlatformFormData {
  platform_id: string;
  platform: AllowedPlatform;
  platform_name: string;
  standardized_name: string;
}
