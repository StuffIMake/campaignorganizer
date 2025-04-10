import React from 'react';
import { Box, Typography, Button } from '../../../components/ui';
import { useCombatSession } from '../hooks/useCombatSession';
import { ActiveCombatView } from './ActiveCombatView';
import MarkdownContent from '../../../components/MarkdownContent';

/**
 * CombatSessionView component
 * 
 * Container for rendering the active combat session view.
 * This component handles routing logic while delegating the 
 * actual combat UI to ActiveCombatView
 */
export const CombatSessionView: React.FC = () => {
  const { combat, handleClose } = useCombatSession();
  
  if (!combat) {
    return (
      <Box className="p-8 text-center">
        <Typography variant="h5" className="mb-4">
          Combat session not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onPress={handleClose}
        >
          Back to Combat List
        </Button>
      </Box>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" component="h1" className="text-gray-100">
          Combat: {combat.name}
        </Typography>
        <Button onPress={handleClose} variant="outlined" color="secondary">
          Exit Without Saving
        </Button>
      </div>
      
      <Box className="bg-gray-800/50 p-4 rounded-lg mb-6">
        <MarkdownContent content={combat.description || "*No description provided*"} />
      </Box>
      
      <Box className="bg-gray-800 p-4 rounded-lg">
        <ActiveCombatView />
      </Box>
    </div>
  );
}; 