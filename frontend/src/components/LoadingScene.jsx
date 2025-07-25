import React from 'react';

const LoadingScene = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1B002A] to-[#0E001A]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingScene;
