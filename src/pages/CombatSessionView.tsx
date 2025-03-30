import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Combat } from '../store';
import MarkdownContent from '../components/MarkdownContent';
import { Button } from '../components/ui';
import { ActiveCombatView } from '../components/ActiveCombatView';

export const CombatSessionView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const combats = useStore(state => state.combats);
  
  // Get the combat ID from the URL state
  const combatId = location.state?.combatId;
  const combat = combats.find(c => c.id === combatId);
  
  // If no combat is selected, redirect back to combats view
  useEffect(() => {
    if (!combatId || !combat) {
      navigate('/combats');
    }
  }, [combatId, combat, navigate]);
  
  // Handle going back to the previous screen
  const handleClose = () => {
    navigate('/combats');
  };
  
  // Return null if the combat isn't found
  if (!combat) {
    return null;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-100">
          Combat: {combat.name}
        </h1>
        <Button onClick={handleClose} className="mt-2">
          Exit Without Saving
        </Button>
      </div>
      
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
        <MarkdownContent content={combat.description || "*No description provided*"} />
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <ActiveCombatView combat={combat} onClose={handleClose} />
      </div>
    </div>
  );
}; 