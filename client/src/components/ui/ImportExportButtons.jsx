import React, { useRef } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

const ImportExportButtons = ({ onImport, onExport, isLoading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImport(json);
      } catch (err) {
        alert('Error parseando el archivo JSON.');
      }
      // Resetear el input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <Box display="flex" gap={1}>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={isLoading ? <CircularProgress size={16} /> : <UploadFileIcon />}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={isLoading}
      >
        Importar JSON
      </Button>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<DownloadIcon />}
        onClick={onExport}
        disabled={isLoading}
      >
        Exportar JSON
      </Button>
    </Box>
  );
};

export default ImportExportButtons;
