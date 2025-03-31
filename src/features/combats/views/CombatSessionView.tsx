import React from 'react';
import { Box, Typography, Button } from '../../../components/ui';
import { useCombatSession } from '../hooks';
import MarkdownContent from '../../../components/MarkdownContent';
import { ActiveCombatView } from '../../../components/ActiveCombatView';

export const CombatSessionView: React.FC = () => {
  const { combat, handleClose } = useCombatSession();
  
  // Return null if the combat isn't found
  if (!combat) {
    return null;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" component="h1" className="text-gray-100">
          Combat: {combat.name}
        </Typography>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Exit Without Saving
        </Button>
      </div>
      
      <Box className="bg-gray-800/50 p-4 rounded-lg mb-6">
        <MarkdownContent content={combat.description || "*No description provided*"} />
      </Box>
      
      <Box className="bg-gray-800 p-4 rounded-lg">
        <ActiveCombatView combat={combat} onClose={handleClose} />
      </Box>
    </div>
  );
}; 