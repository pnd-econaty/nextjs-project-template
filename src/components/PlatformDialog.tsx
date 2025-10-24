'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Platform, PlatformFormData } from '@/types/platform';
import { supabase } from '@/lib/supabase';

interface PlatformDialogProps {
  open: boolean;
  platform: Platform | null;
  onClose: (refresh: boolean) => void;
}

interface ValidationErrors {
  platform?: string;
  platform_name?: string;
  platform_id?: string;
  standardized_name?: string;
}

export default function PlatformDialog({ open, platform, onClose }: PlatformDialogProps) {
  const [formData, setFormData] = useState<PlatformFormData>({
    platform_id: '',
    platform: '',
    platform_name: '',
    standardized_name: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (platform) {
      setFormData(platform);
    } else {
      setFormData({
        platform_id: '',
        platform: '',
        platform_name: '',
        standardized_name: '',
      });
    }
    setErrors({});
  }, [platform, open]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform is required';
    }

    if (!formData.platform_name.trim()) {
      newErrors.platform_name = 'Platform Name is required';
    }

    if (!formData.platform_id.trim()) {
      newErrors.platform_id = 'Platform ID is required';
    }

    if (!formData.standardized_name.trim()) {
      newErrors.standardized_name = 'Standardized Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    if (platform) {
      const { error } = await supabase
        .from('platforms')
        .update({
          platform: formData.platform,
          platform_name: formData.platform_name,
          standardized_name: formData.standardized_name,
        })
        .eq('platform_id', formData.platform_id);

      if (error) {
        console.error('Error updating platform:', error);
      } else {
        onClose(true);
      }
    } else {
      const { error } = await supabase
        .from('platforms')
        .insert([formData]);

      if (error) {
        console.error('Error creating platform:', error);
        if (error.code === '23505') {
          setErrors({ platform_id: 'Platform ID already exists' });
        }
      } else {
        onClose(true);
      }
    }

    setSubmitting(false);
  };

  const handleChange = (field: keyof PlatformFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{platform ? 'Edit Platform' : 'Add Platform'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Platform"
            value={formData.platform}
            onChange={(e) => handleChange('platform', e.target.value)}
            error={!!errors.platform}
            helperText={errors.platform}
            required
            fullWidth
          />
          <TextField
            label="Platform Name"
            value={formData.platform_name}
            onChange={(e) => handleChange('platform_name', e.target.value)}
            error={!!errors.platform_name}
            helperText={errors.platform_name}
            required
            fullWidth
          />
          <TextField
            label="Platform ID"
            value={formData.platform_id}
            onChange={(e) => handleChange('platform_id', e.target.value)}
            error={!!errors.platform_id}
            helperText={errors.platform_id}
            required
            fullWidth
            disabled={!!platform}
          />
          <TextField
            label="Standardized Name"
            value={formData.standardized_name}
            onChange={(e) => handleChange('standardized_name', e.target.value)}
            error={!!errors.standardized_name}
            helperText={errors.standardized_name}
            required
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {platform ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
