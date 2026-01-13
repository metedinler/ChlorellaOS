import React from 'react';

const MediumLibraryTest = () => {
  let dataStatus = "Loading...";
  let errorMsg = null;
  
  try {
    const data = require('../data/systemDataExtended');
    if (data.mediumLibrary) {
      const keys = Object.keys(data.mediumLibrary);
      dataStatus = `✓ mediumLibrary loaded: ${keys.join(', ')}`;
    } else {
      dataStatus = "✗ mediumLibrary is undefined";
    }
  } catch (error) {
    errorMsg = error.toString();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Besin Yeri Test</h2>
      <div className="space-y-2">
        <p className="font-mono text-sm">{dataStatus}</p>
        {errorMsg && (
          <div className="bg-red-100 p-4 rounded text-red-800">
            <p className="font-bold">Error:</p>
            <p className="font-mono text-xs">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediumLibraryTest;
