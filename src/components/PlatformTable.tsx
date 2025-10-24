'use client';

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Button, Chip } from '@mui/material';
import { Platform } from '@/types/platform';
import { supabase } from '@/lib/supabase';
import PlatformDialog from './PlatformDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function PlatformTable() {
  const [rows, setRows] = useState<GridRowsProp<Platform>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showFormatMapping, setShowFormatMapping] = useState(true);

  const allColumns: GridColDef<Platform>[] = [
    { field: 'platform', headerName: 'Platform', width: 150, editable: false },
    { field: 'platform_name', headerName: 'Platform Name', width: 200, editable: false },
    { field: 'platform_id', headerName: 'Platform ID', width: 150, editable: false },
    { field: 'standardized_name', headerName: 'Standardized Name', width: 200, editable: false },
    {
      field: 'content_box',
      headerName: 'Content Box',
      width: 200,
      editable: false,
      renderHeader: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{params.colDef.headerName}</span>
          <Chip label="Format Mapping" size="small" color="info" sx={{ height: 20, fontSize: '0.7rem' }} />
        </Box>
      ),
      cellClassName: 'format-mapping-cell',
    },
    {
      field: 'marke',
      headerName: 'Marke',
      width: 180,
      editable: false,
      renderHeader: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{params.colDef.headerName}</span>
          <Chip label="Format Mapping" size="small" color="info" sx={{ height: 20, fontSize: '0.7rem' }} />
        </Box>
      ),
      cellClassName: 'format-mapping-cell',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.platform_id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  // Filter columns based on showFormatMapping state
  const columns = showFormatMapping
    ? allColumns
    : allColumns.filter(col => col.field !== 'content_box' && col.field !== 'marke');

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    setLoading(true);

    // First, fetch all platforms
    const { data: platformsData, error: platformsError } = await supabase
      .from('platforms')
      .select('*')
      .order('platform_id');

    if (platformsError) {
      console.error('Error fetching platforms:', platformsError);
      setLoading(false);
      return;
    }

    // Then, fetch all format mappings
    const { data: formatMappingsData, error: formatMappingsError } = await supabase
      .from('format_mappings')
      .select('*');

    if (formatMappingsError) {
      console.error('Error fetching format mappings:', formatMappingsError);
    }

    // Join the data manually based on standardized_name
    const formatMappingsMap = new Map(
      formatMappingsData?.map(fm => [fm.standardized_name, fm]) || []
    );

    const joinedData = platformsData?.map(platform => {
      const formatMapping = formatMappingsMap.get(platform.standardized_name);
      return {
        ...platform,
        content_box: formatMapping?.content_box,
        marke: formatMapping?.marke,
      };
    }) || [];

    setRows(joinedData);
    setLoading(false);
  };

  const handleAdd = () => {
    setSelectedPlatform(null);
    setDialogOpen(true);
  };

  const handleEdit = (platform: Platform) => {
    setSelectedPlatform(platform);
    setDialogOpen(true);
  };

  const handleDelete = async (platformId: string) => {
    const { error } = await supabase
      .from('platforms')
      .delete()
      .eq('platform_id', platformId);

    if (error) {
      console.error('Error deleting platform:', error);
    } else {
      await fetchPlatforms();
    }
  };

  const handleDialogClose = async (refresh: boolean) => {
    setDialogOpen(false);
    setSelectedPlatform(null);
    if (refresh) {
      await fetchPlatforms();
    }
  };

  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          Add Platform
        </Button>
        <Button
          variant="outlined"
          startIcon={showFormatMapping ? <VisibilityOffIcon /> : <VisibilityIcon />}
          onClick={() => setShowFormatMapping(!showFormatMapping)}
        >
          {showFormatMapping ? 'Hide' : 'Show'} Format Mapping
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.platform_id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        sx={{
          '& .format-mapping-cell': {
            backgroundColor: '#e3f2fd',
            fontStyle: 'italic',
            color: '#1976d2',
          },
        }}
      />
      <PlatformDialog
        open={dialogOpen}
        platform={selectedPlatform}
        onClose={handleDialogClose}
      />
    </Box>
  );
}
