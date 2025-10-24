'use client';

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import { FormatMapping } from '@/types/formatMapping';
import { supabase } from '@/lib/supabase';
import FormatMappingDialog from './FormatMappingDialog';

export default function FormatMappingTable() {
  const [rows, setRows] = useState<GridRowsProp<FormatMapping>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FormatMapping | null>(null);

  const columns: GridColDef<FormatMapping>[] = [
    { field: 'standardized_name', headerName: 'Standardized Name', width: 250, editable: false },
    { field: 'content_box', headerName: 'Content Box', width: 250, editable: false },
    { field: 'marke', headerName: 'Marke', width: 250, editable: false },
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
            onClick={() => handleDelete(params.row.standardized_name)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('format_mappings')
      .select('*')
      .order('standardized_name');

    if (error) {
      console.error('Error fetching format mappings:', error);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setSelectedMapping(null);
    setDialogOpen(true);
  };

  const handleEdit = (mapping: FormatMapping) => {
    setSelectedMapping(mapping);
    setDialogOpen(true);
  };

  const handleDelete = async (standardizedName: string) => {
    const { error } = await supabase
      .from('format_mappings')
      .delete()
      .eq('standardized_name', standardizedName);

    if (error) {
      console.error('Error deleting format mapping:', error);
    } else {
      await fetchMappings();
    }
  };

  const handleDialogClose = async (refresh: boolean) => {
    setDialogOpen(false);
    setSelectedMapping(null);
    if (refresh) {
      await fetchMappings();
    }
  };

  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          Add Format Mapping
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.standardized_name}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
      <FormatMappingDialog
        open={dialogOpen}
        mapping={selectedMapping}
        onClose={handleDialogClose}
      />
    </Box>
  );
}
