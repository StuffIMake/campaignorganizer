import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../store';
import { Combat } from '../../../store';

export const useCombatSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { combats } = useStore();
  
  // Get the combat ID from the URL search params (e.g., ?id=123)
  const searchParams = new URLSearchParams(location.search);
  const combatId = searchParams.get('id');
  
  // Find the combat by ID
  const combat = combats.find(c => c.id === combatId);
  
  // If no combat is found, redirect back to combats view
  useEffect(() => {
    if (!combatId || !combat) {
      navigate('/combats');
    }
  }, [combatId, combat, navigate]);
  
  // Handle exiting the combat session
  const handleClose = () => {
    navigate('/combats');
  };
  
  return {
    combat,
    handleClose
  };
}; 