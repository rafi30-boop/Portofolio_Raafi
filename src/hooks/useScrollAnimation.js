import { useRef } from 'react';
import { useInView } from 'framer-motion';

export const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px",
    ...options 
  });
  
  return { ref, isInView };
};