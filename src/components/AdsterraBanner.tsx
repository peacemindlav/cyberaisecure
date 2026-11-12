import React from 'react';

export const AdsterraBanner: React.FC = () => {
  return (
    <div className="my-8 pt-4 flex flex-col items-center justify-center">
      <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1.5 select-none">
        Advertisement
      </span>
      <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded border border-slate-200/60 dark:border-slate-800/60">
        <iframe
          title="Adsterra Sponsor Banner"
          srcDoc={`<!DOCTYPE html><html><head><base target="_blank"><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script>atOptions={'key':'82aa05d42b853e9f85ecae372d433731','format':'iframe','height':50,'width':320,'params':{}};</script><script src="https://bauval.org/22/82aa05d42b853e9f85ecae372d433731"></script></body></html>`}
          width="320"
          height="50"
          scrolling="no"
          frameBorder="0"
          className="w-[320px] h-[50px] border-0 overflow-hidden"
        />
      </div>
    </div>
  );
};
