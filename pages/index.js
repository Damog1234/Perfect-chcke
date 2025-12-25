import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function GenLayerDashboard() {
  const [name, setName] = useState('');
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  // Identity States Logic
  const getRoleInfo = (level) => {
    if (level >= 54) return { name: 'SINGULARITY', color: 'text-[#22C55E]', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]' };
    if (level >= 36) return { name: 'BRAIN', color: 'text-[#A855F7]', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]' };
    if (level >= 18) return { name: 'SYNAPSE', color: 'text-[#3B82F6]', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]' };
    if (level >= 7)  return { name: 'CELL', color: 'text-[#FB923C]', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.4)]' };
    return { name: 'MOLECULE', color: 'text-[#FACC15]', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]' };
  };

  useEffect(() => {
    fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
  }, []);

  const handleSearch = async (targetName) => {
    const searchName = targetName || name;
    if (!searchName) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/stats?username=${encodeURIComponent(searchName)}`);
      const result = await res.json();
      if (res.status === 404) setError("Operator not found in Top 5000.");
      else if (result.error) setError("Network error.");
      else setData(result);
    } catch (e) { setError("Deep Scan failed."); }
    setLoading(false);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#000000',
      useCORS: true, 
      scale: 2 
    });
    const link = document.createElement('a');
    link.download = `${data.username}-genlayer-rank.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen text-white bg-black font-sans relative overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000')] bg-cover opacity-10 blur-xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-12">
        {/* Header with Official Logo */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in duration-1000">
          <img src="https://docs.genlayer.com/img/logo.svg" className="h-14 md:h-16 mb-4" alt="GenLayer" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <h2 className="text-blue-500 font-mono tracking-[0.4em] text-[10px] uppercase font-bold">Consensus Network Intel</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SEARCH & CARD AREA */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group">
              <input 
                className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:border-white/30 text-lg transition-all backdrop-blur-md"
                placeholder="Enter Discord Username (e.g. Satoshi)..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={() => handleSearch()} 
                className="absolute right-3 top-3 bottom-3 px-8 rounded-xl bg-white text-black font-black hover:bg-blue-600 hover:text-white transition-all active:scale-95"
              >
                {loading ? 'SCANNING...' : 'SCAN'}
              </button>
            </div>

            {error && <p className="text-red-400 font-mono text-center tracking-widest text-xs uppercase">{error}</p>}

            {data && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                {/* RANK CARD */}
                <div ref={cardRef} className={`w-full max-w-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-[#080808] relative overflow-hidden ${getRoleInfo(data.level).glow}`}>
                  <div className="flex items-center gap-6 mb-10">
                    <img 
                      src={`https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`} 
                      className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/5 shadow-2xl" 
                      crossOrigin="anonymous" 
                      onError={(e) => e.target.src="https://cdn.discordapp.com/embed/avatars/0.png"} 
                    />
                    <div>
                      <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{data.username}</h3>
                      <p className="text-blue-500 font-mono text-xs md:text-sm tracking-[0.2em] mt-1 font-bold">NETWORK RANK #{data.rank}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[9px] text-gray-500 font-black mb-1 tracking-widest">LEVEL</p>
                      <p className="text-3xl md:text-5xl font-black">{data.level}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[9px] text-gray-500 font-black mb-1 tracking-widest">EXP POINTS</p>
                      <p className="text-3xl md:text-5xl font-black">{data.xp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-[9px] font-black text-gray-600 tracking-[0.5em] mb-4 uppercase">Identity State</p>
                    <div className={`text-5xl md:text-7xl font-black italic tracking-tighter ${getRoleInfo(data.level).color}`}>
                      {getRoleInfo(data.level).name}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-8 opacity-10 text-[7px] font-bold tracking-[1em]">GENLAYER INTEL</div>
                </div>

                <button 
                  onClick={downloadCard}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-10 py-4 rounded-full font-bold transition-all text-sm tracking-widest uppercase shadow-xl"
                >
                  📥 Download Rank Card
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR: TOP 10 */}
          <div className="lg:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 h-fit backdrop-blur-md">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-500 mb-8 uppercase border-b border-white/5 pb-4">Top 10 Operators</h3>
            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => { setName(user.username); handleSearch(user.username); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-700 text-[10px] font-bold">#{user.rank}</span>
                    <span className="font-bold text-sm group-hover:text-blue-400">{user.username}</span>
                  </div>
                  <div className={`text-[9px] font-black px-2 py-1 rounded border border-current ${getRoleInfo(user.level).color}`}>
                    L{user.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-20 py-10 text-center opacity-20 text-[8px] font-bold tracking-[0.8em] uppercase">
          Synthetically Verified Data • GenLayer Community Dashboard
        </footer>
      </div>
    </div>
  );
    }
