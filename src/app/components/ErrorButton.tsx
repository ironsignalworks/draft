import React from 'react';

export function ErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error('This is your first error!');
      }}
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
    >
      Break the world
    </button>
  );
}
