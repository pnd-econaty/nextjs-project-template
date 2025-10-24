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
import { FormatMapping, FormatMappingFormData } from '@/types/formatMapping';
import { supabase } from '@/lib/supabase';

interface FormatMappingDialogProps {
  open: boolean;
  mapping: FormatMapping | null;
  onClose: (refresh: boolean) => void;
}

interface ValidationErrors {
  standardized_name?: string;
  content_box?: string;
  marke?: string;
}

export default function FormatMappingDialog({ open, mapping, onClose }: FormatMappingDialogProps) {
  const [formData, setFormData] = useState<FormatMappingFormData>({
    standardized_name: '',
    content_box: '',
    marke: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mapping) {
      setFormData(mapping);
    } else {
      setFormData({
        standardized_name: '',
        content_box: '',
        marke: '',
      });
    }
    setErrors({});
  }, [mapping, open]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.standardized_name.trim()) {
      newErrors.standardized_name = 'Standardized Name is required';
    }

    if (!formData.content_box.trim()) {
      newErrors.content_box = 'Content Box is required';
    }

    if (!formData.marke.trim()) {
      newErrors.marke = 'Marke is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    if (mapping) {
      const { error } = await supabase
        .from('format_mappings')
        .update({
          content_box: formData.content_box,
          marke: formData.marke,
        })
        .eq('standardized_name', formData.standardized_name);

      if (error) {
        console.error('Error updating format mapping:', error);
      } else {
        onClose(true);
      }
    } else {
      const { data, error } = await supabase
        .from('format_mappings')
        .insert([formData]);

      if (error) {
        console.error('Error creating format mapping:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Form data being inserted:', formData);
        if (error.code === '23505') {
          setErrors({ standardized_name: 'Standardized Name already exists' });
        } else {
          alert(`Error: ${error.message || 'Unknown error occurred. Check console for details.'}`);
        }
      } else {
        console.log('Successfully created format mapping:', data);
        onClose(true);
      }
    }

    setSubmitting(false);
  };

  const handleChange = (field: keyof FormatMappingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{mapping ? 'Edit Format Mapping' : 'Add Format Mapping'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Standardized Name"
            value={formData.standardized_name}
            onChange={(e) => handleChange('standardized_name', e.target.value)}
            error={!!errors.standardized_name}
            helperText={errors.standardized_name}
            required
            fullWidth
            disabled={!!mapping}
          />
          <TextField
            label="Content Box"
            value={formData.content_box}
            onChange={(e) => handleChange('content_box', e.target.value)}
            error={!!errors.content_box}
            helperText={errors.content_box}
            required
            fullWidth
          />
          <TextField
            label="Marke"
            value={formData.marke}
            onChange={(e) => handleChange('marke', e.target.value)}
            error={!!errors.marke}
            helperText={errors.marke}
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
          {mapping ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
