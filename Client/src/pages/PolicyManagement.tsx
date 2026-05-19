import React from 'react';

export default function PolicyManagement() {
  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-6">Policy Management</h2>
      <div className="bg-slate-900 border border-slate-800 p-6 rounded mb-4 flex justify-between items-center">
         <div>
            <h3 className="text-xl font-bold">Standard Strict Policy</h3>
            <p className="text-slate-400">Fails build on any High or Critical findings.</p>
         </div>
         <button className="bg-slate-700 px-4 py-2 rounded text-red-400">Deactivate</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded flex justify-between items-center">
         <div>
            <h3 className="text-xl font-bold">OWASP Top 10 Only</h3>
            <p className="text-slate-400">Ignores dependencies and focuses solely on code execution flaws.</p>
         </div>
         <button className="bg-accent px-4 py-2 rounded text-white">Activate</button>
      </div>

      <button className="mt-8 border border-dashed border-slate-600 w-full p-4 rounded text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
         + Create Custom Framework Policy
      </button>
    </div>
  );
}
