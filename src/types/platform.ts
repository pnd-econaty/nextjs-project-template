import { AllowedPlatform } from '@/utils/platformValidation';

export interface Platform {
  platform_id: string;
  platform: AllowedPlatform;
  platform_name: string;
  standardized_name: string;
}

export interface PlatformFormData {
  platform_id: string;
  platform: AllowedPlatform;
  platform_name: string;
  standardized_name: string;
}
