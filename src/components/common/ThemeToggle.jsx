// src/components/common/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

};

export default ThemeToggle;