import React, { useState, useEffect, useMemo } from 'react';

function App() {
  const [sections, setSections] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxSections, setMaxSections] = useState(12);
  const [renderProgress, setRenderProgress] = useState({ done: 0, total: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const [isRGB, setIsRGB] = useState(false);

  useEffect(() => {
    const calculateMaxSections = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const maxPerRow = Math.floor(width / 2);
      const maxPerColumn = Math.floor(height / 2);
      const maxTotal = Math.floor(maxPerRow * maxPerColumn);
      setMaxSections(Math.max(1, maxTotal));
    };

    calculateMaxSections();
    window.addEventListener('resize', calculateMaxSections);
    return () => window.removeEventListener('resize', calculateMaxSections);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.min(Math.max(parseInt(inputValue) || 1, 1), maxSections);
    setIsAnimating(true);
    setTimeout(() => {
      setSections(value);
      setIsAnimating(false);
    }, 300);
  };

  const { cols, rows, shouldOptimize } = useMemo(() => {
    const total = sections;
    const aspectRatio = window.innerWidth / window.innerHeight;
    let cols = Math.ceil(Math.sqrt(total * aspectRatio));
    let rows = Math.ceil(total / cols);
    
    if (rows > cols / aspectRatio) {
      rows = Math.ceil(Math.sqrt(total / aspectRatio));
      cols = Math.ceil(total / rows);
    }
    
    return { 
      cols, 
      rows,
      shouldOptimize: total > 1000
    };
  }, [sections]);

  const getRandomColor = () => {
    if (!isRGB) return 'bg-green-500/5 border-green-500/50';
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `style="background-color: rgba(${r},${g},${b},0.2); border-color: rgba(${r},${g},${b},0.5);"`;
  };

  const gridCells = useMemo(() => {
    if (!shouldOptimize) {
      return Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="relative">
          <div 
            className={`absolute inset-0 border ${!isRGB ? 'border-green-500/50' : ''}`}
            {...(isRGB ? { dangerouslySetInnerHTML: { __html: '' }, style: { 
              borderColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.5)`,
              backgroundColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.2)`
            }} : {})}
          />
        </div>
      ));
    }

    setIsRendering(true);
    setRenderProgress({ done: 0, total: sections });

    const batchSize = 1000;
    const cells: JSX.Element[] = [];
    
    const renderBatch = (startIdx: number) => {
      const endIdx = Math.min(startIdx + batchSize, sections);
      
      for (let i = startIdx; i < endIdx; i++) {
        cells.push(
          <div key={i} className="relative">
            <div 
              className={`absolute inset-0 border ${!isRGB ? 'border-green-500/50 bg-green-500/5' : ''}`}
              {...(isRGB ? { dangerouslySetInnerHTML: { __html: '' }, style: { 
                borderColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.5)`,
                backgroundColor: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.2)`
              }} : {})}
            />
          </div>
        );
      }
      
      setRenderProgress(prev => ({ ...prev, done: endIdx }));
      
      if (endIdx < sections) {
        requestAnimationFrame(() => renderBatch(endIdx));
      } else {
        setIsRendering(false);
      }
    };

    requestAnimationFrame(() => renderBatch(0));
    return cells;
  }, [sections, shouldOptimize, isRGB]);

  return (
    <div className="h-screen bg-black text-green-500 flex flex-col relative overflow-hidden">
      {!shouldOptimize && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="matrix-code">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="code-line" style={{ animationDelay: `${Math.random() * 5}s` }}>
                {Array.from({ length: 20 }).map((_, j) => (
                  <span key={j} className="inline-block transform">
                    {String.fromCharCode(0x30A0 + Math.random() * 96)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 space-y-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            min="1"
            max={maxSections}
            className="w-full bg-black/50 border-2 border-green-500 rounded-lg py-3 px-4 text-center text-xl 
                     focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                     transition-all duration-300 font-mono
                     placeholder-green-500/50"
            placeholder={`Enter number (1-${maxSections})`}
          />
        </form>

        <label className="flex items-center justify-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRGB}
            onChange={(e) => setIsRGB(e.target.checked)}
            className="w-4 h-4 rounded border-green-500 text-green-500 focus:ring-green-500 focus:ring-offset-0 bg-black"
          />
          <span className="font-mono">RGB Mode</span>
        </label>
      </div>

      {isRendering && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
          <div className="bg-black/80 border border-green-500 rounded-lg p-4">
            <div className="w-full bg-green-500/20 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ 
                  width: `${(renderProgress.done / renderProgress.total) * 100}%`
                }}
              />
            </div>
            <div className="text-center mt-2 font-mono text-sm">
              Rendering: {renderProgress.done.toLocaleString()} / {renderProgress.total.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div 
        className={`absolute inset-0 grid ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          transition: shouldOptimize ? 'none' : 'all 300ms'
        }}
      >
        {gridCells}
      </div>
    </div>
  );
}

export default App;