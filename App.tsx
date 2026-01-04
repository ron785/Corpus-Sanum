
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, UserProfile, Localization, MealEntry, WeightEntry, Timeframe, PortionSize } from './types';
import { TRANSLATIONS, ICONS, QUOTES } from './constants';
import { storage } from './services/storage';
import { GoogleGenAI } from "@google/genai";

// --- Sub-components (Helpers) ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, loading = false }: any) => {
  const base = "px-4 py-2 rounded-2xl font-semibold transition-all active:scale-95 border-2 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-indigo-600/90 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] backdrop-blur-md hover:bg-indigo-500",
    secondary: "bg-zinc-900/60 border-zinc-800 text-zinc-100 backdrop-blur-md hover:bg-zinc-800",
    danger: "bg-red-950/60 border-red-900 text-red-200 backdrop-blur-md",
    outline: "bg-transparent border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-500 backdrop-blur-sm"
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
      {children}
    </button>
  );
};

const Card = ({ children, className = "", glow = false }: any) => (
  <div className={`bg-zinc-950/40 backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-4 shadow-2xl relative overflow-hidden ${glow ? 'after:content-[""] after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] after:pointer-events-none' : ''} ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }: any) => (
  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-100">
    {children}
  </h2>
);

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [currentUser, setCurrentUser] = useState<UserProfile>('Ron');
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'weight' | 'insights'>('home');
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [usedTokens, setUsedTokens] = useState(0);
  const [quote, setQuote] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>('Day');
  const [showLogMeal, setShowLogMeal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = TRANSLATIONS[lang];

  const loadData = useCallback(async () => {
    const [m, w, tokens] = await Promise.all([
      storage.getMeals(currentUser),
      storage.getWeights(currentUser),
      storage.getUsedTokens(currentUser)
    ]);
    setMeals(m);
    setWeights(w);
    setUsedTokens(tokens);
  }, [currentUser]);

  useEffect(() => {
    loadData();
    setQuote(QUOTES[lang][Math.floor(Math.random() * QUOTES[lang].length)]);
  }, [currentUser, lang, loadData]);

  const handleLogMeal = async (meal: Partial<MealEntry>) => {
    setIsGenerating(true);
    try {
      const description = meal.description || "";
      const images = meal.images || [];
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptParts: any[] = [
        { text: `You are an expert nutritionist for the "Corpus Sanum" reflection app. 
          Task: Provide a non-judgmental, insightful assessment of this meal.
          Requirements:
          1. Identify if it is dominant in proteins, carbs, or fats.
          2. Mention possible long-term effects of such a dietary pattern.
          3. Occasionally (30% chance) add a "Did you know?" fact about a common diet mistake or nutritional myth.
          4. IMPORTANT: At the very end of your response, you MUST include either [H] if the meal is generally healthy/balanced or [U] if it is unhealthy/imbalanced.
          5. Language: ${lang === 'EN' ? 'English' : 'Russian'}.
          6. Keep the response concise (max 3-4 sentences). 
          7. Tone: Observational, helpful, scientific but accessible.
          Description: "${description}"` }
      ];

      images.forEach((base64Data: string) => {
        const [header, data] = base64Data.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        promptParts.push({
          inlineData: { data, mimeType }
        });
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: promptParts }]
      });

      const assessment = response.text || (lang === 'EN' ? "Pattern captured. [H]" : "Паттерн зафиксирован. [H]");

      const newMeal: MealEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser,
        timestamp: Date.now(),
        description,
        portion: meal.portion || 'Medium',
        images: images,
        aiAssessment: assessment
      };

      await storage.addMeal(newMeal);
      setShowLogMeal(false);
      loadData();
    } catch (error) {
      console.error("AI Generation Error:", error);
      await storage.addMeal({
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser,
        timestamp: Date.now(),
        description: meal.description || "",
        portion: meal.portion || 'Medium',
        images: meal.images || [],
        aiAssessment: lang === 'EN' ? "Captured without live analysis. [H]" : "Записано без живого анализа. [H]"
      });
      setShowLogMeal(false);
      loadData();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddWeight = async (val: number) => {
    const entry: WeightEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser,
      timestamp: Date.now(),
      weight: val
    };
    await storage.addWeight(entry);
    loadData();
  };

  return (
    <div className="min-h-screen pb-32 max-w-lg mx-auto px-4 pt-6 transition-colors duration-500">
      <header className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex flex-col">
           <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">{t.appName}</h1>
           <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Reflection Engine</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setLang(l => l === 'EN' ? 'RU' : 'EN')} className="text-[10px] px-2 py-1 uppercase tracking-widest border-zinc-800">
            {lang}
          </Button>
          <Button variant="outline" onClick={() => setCurrentUser(u => u === 'Ron' ? 'Evgeny' : 'Ron')} className="text-[10px] px-3 py-1 flex items-center gap-2 uppercase tracking-widest border-zinc-800">
            <ICONS.User className="w-3.5 h-3.5" />
            {t.userNames[currentUser]}
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        {activeTab === 'home' && (
          <Dashboard 
            t={t} 
            meals={meals} 
            quote={quote} 
            timeframe={timeframe} 
            setTimeframe={setTimeframe}
            usedTokens={usedTokens}
          />
        )}
        {activeTab === 'timeline' && (
          <Timeline t={t} meals={meals} />
        )}
        {activeTab === 'weight' && (
          <WeightTracker t={t} weights={weights} onAdd={handleAddWeight} />
        )}
        {activeTab === 'insights' && (
          <Insights t={t} meals={meals} />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex justify-around items-center bg-zinc-950/60 backdrop-blur-2xl border-2 border-zinc-800/50 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
        <NavButton active={activeTab === 'home'} icon={<ICONS.Home />} onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'timeline'} icon={<ICONS.Timeline />} onClick={() => setActiveTab('timeline')} />
        <div className="relative -top-6">
          <button 
            onClick={() => setShowLogMeal(true)}
            className="w-14 h-14 rounded-full bg-indigo-600 border-4 border-zinc-950 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(79,70,229,0.5)] active:scale-90 transition-all hover:bg-indigo-500"
          >
            <ICONS.Plus className="w-8 h-8" />
          </button>
        </div>
        <NavButton active={activeTab === 'weight'} icon={<ICONS.Weight />} onClick={() => setActiveTab('weight')} />
        <NavButton active={activeTab === 'insights'} icon={<ICONS.Insights />} onClick={() => setActiveTab('insights')} />
      </nav>

      {showLogMeal && (
        <MealLoggerModal 
          t={t} 
          lang={lang}
          onClose={() => setShowLogMeal(false)} 
          onSave={handleLogMeal} 
          loading={isGenerating}
        />
      )}
    </div>
  );
}

// --- Specific Views ---

function NavButton({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-2xl transition-all duration-300 ${active ? 'text-indigo-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}

function Dashboard({ t, meals, quote, timeframe, setTimeframe, usedTokens }: any) {
  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    if (timeframe === 'Day') return meals.filter((m: any) => now - m.timestamp < day);
    if (timeframe === 'Week') return meals.filter((m: any) => now - m.timestamp < day * 7);
    if (timeframe === 'Month') return meals.filter((m: any) => now - m.timestamp < day * 30);
    return meals;
  }, [meals, timeframe]);

  const dominantHabit = useMemo(() => {
    if (filtered.length === 0) return "-";
    const allText = filtered.map((m: any) => m.aiAssessment.toLowerCase()).join(" ");
    if (allText.includes("protein")) return "High Protein";
    if (allText.includes("carb")) return "High Carbs";
    if (allText.includes("sugar")) return "Sweet Patterns";
    return "Balanced";
  }, [filtered]);

  const streakData = useMemo(() => {
    if (meals.length === 0) return { streak: 0, healthy: 0, unhealthy: 0, lastDays: [] };
    
    const dayMap = new Map();
    meals.forEach(m => {
      const dateKey = new Date(m.timestamp).toDateString();
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { healthy: true });
      }
      if (m.aiAssessment.includes('[U]')) {
        dayMap.get(dateKey).healthy = false;
      }
    });

    const dates = Array.from(dayMap.keys()).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let healthyCount = 0;
    let unhealthyCount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate actual streak back from today/yesterday
    let checkDate = new Date(today);
    while (true) {
      const key = checkDate.toDateString();
      if (dayMap.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Streak broken
        break;
      }
    }

    // Historical counts
    dayMap.forEach(v => {
      if (v.healthy) healthyCount++;
      else unhealthyCount++;
    });

    // Last 10 logged days for visualization
    const last10 = dates.slice(0, 10).map(d => ({
      healthy: dayMap.get(d.toDateString()).healthy,
      date: d
    })).reverse();

    return { 
      streak: currentStreak, 
      healthy: healthyCount, 
      unhealthy: unhealthyCount, 
      lastDays: last10,
      totalLoggedDays: dayMap.size 
    };
  }, [meals]);

  const freezeTokensAvailable = Math.max(0, Math.floor(streakData.totalLoggedDays / 10) - usedTokens);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card glow className="bg-gradient-to-br from-indigo-950/40 to-transparent">
        <p className="text-zinc-300 italic text-sm text-center font-medium leading-relaxed">"{quote}"</p>
      </Card>

      <div className="flex gap-2 justify-center flex-wrap">
        {(['Day', 'Week', 'Month', 'All'] as Timeframe[]).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === tf ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-zinc-800/50 bg-zinc-900/40 text-zinc-500'}`}
          >
            {t[`timeframe${tf}`]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6 border-indigo-500/20">
          <span className="text-5xl font-black text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">{filtered.length}</span>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Entries</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6 px-4">
          <span className="text-xs font-black text-zinc-100 text-center leading-tight truncate w-full uppercase tracking-tighter">{dominantHabit}</span>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">{t.dominantHabit}</span>
        </Card>
      </div>

      {/* Streak Counter Section */}
      <Card className="relative pt-8 pb-10 px-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <ICONS.Fire className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-xl font-black text-zinc-100 uppercase tracking-widest">
              {streakData.streak} {t.timeframeDay} {t.streak}
            </span>
          </div>
          
          {/* The Streak Line */}
          <div className="w-full flex gap-1 h-3 my-4">
            {Array.from({ length: 10 }).map((_, i) => {
              const day = streakData.lastDays[i];
              const isFuture = !day;
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-700 ${
                    isFuture 
                      ? 'bg-zinc-800/30' 
                      : day.healthy 
                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' 
                        : 'bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)]'
                  }`}
                />
              );
            })}
          </div>

          <div className="w-full flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-red-400">{streakData.healthy} {t.healthy}</span>
            <div className="flex items-center gap-1 text-blue-400">
               <ICONS.Snow className="w-3 h-3" />
               <span>{freezeTokensAvailable} {t.freezeTokens}</span>
            </div>
            <span className="text-lime-500">{streakData.unhealthy} {t.unhealthy}</span>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Activity Volume</SectionTitle>
        <div className="h-32 flex items-end gap-2 px-2 mt-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-indigo-600/20 border-t-2 border-indigo-500/50 rounded-t-lg transition-all hover:bg-indigo-500/40" 
                style={{ height: `${Math.floor(Math.random() * 80) + 10}%` }}
              ></div>
              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">D{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Timeline({ t, meals }: any) {
  if (meals.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-zinc-600 animate-in fade-in duration-700">
      <ICONS.Timeline className="w-12 h-12 mb-4 opacity-10" />
      <p className="font-bold uppercase tracking-widest text-xs">{t.noData}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {meals.map((meal: MealEntry) => {
        // Clean assessment of the hidden tag for display
        const cleanAssessment = meal.aiAssessment.replace(/\[H\]|\[U\]/g, '').trim();
        return (
          <div key={meal.id} className="relative pl-6 border-l-2 border-zinc-800 ml-4 pb-2 group">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-950 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform"></div>
            <Card glow>
              <div className="flex justify-between items-start mb-3">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                   {new Date(meal.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
                 <span className="px-2 py-0.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                   {t[meal.portion.toLowerCase()]}
                 </span>
              </div>
              <p className="text-zinc-100 text-sm font-medium mb-4 leading-relaxed">{meal.description}</p>
              
              {meal.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
                  {meal.images.map((img, idx) => (
                    <img key={idx} src={img} className="w-40 h-40 object-cover rounded-xl border-2 border-zinc-800/50 flex-shrink-0 shadow-lg hover:border-indigo-500/50 transition-all" alt="meal" />
                  ))}
                </div>
              )}

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 flex gap-3 items-start backdrop-blur-sm">
                 <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mt-1 shrink-0">
                    <ICONS.Insights className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <span className="block text-[8px] font-black text-indigo-400/60 uppercase tracking-widest mb-0.5">{t.aiAnalysis}</span>
                   <p className="text-xs text-indigo-100 font-semibold tracking-tight leading-normal whitespace-pre-wrap">{cleanAssessment}</p>
                 </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function WeightTracker({ t, weights, onAdd }: any) {
  const [val, setVal] = useState("");
  
  const lastWeight = weights[weights.length - 1]?.weight || 0;
  const prevWeight = weights[weights.length - 2]?.weight || lastWeight;
  const diff = lastWeight - prevWeight;

  const points = useMemo(() => {
    if (weights.length < 2) return "";
    const minW = Math.min(...weights.map((w: any) => w.weight)) - 1;
    const maxW = Math.max(...weights.map((w: any) => w.weight)) + 1;
    const rangeW = maxW - minW;
    const stepX = 100 / (weights.length - 1);
    
    return weights.map((w: any, i: number) => {
      const x = i * stepX;
      const y = 100 - ((w.weight - minW) / rangeW * 100);
      return `${x},${y}`;
    }).join(" ");
  }, [weights]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <Card glow className="bg-gradient-to-br from-indigo-950/40 to-transparent">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.currentWeight}</span>
          <div className="flex items-baseline gap-1 mt-2">
             <span className="text-4xl font-black text-zinc-100 tracking-tighter">{lastWeight || "--"}</span>
             <span className="text-xs font-bold text-zinc-500">kg</span>
          </div>
        </Card>
        <Card>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.change}</span>
          <div className="flex items-baseline gap-1 mt-2">
             <span className={`text-4xl font-black tracking-tighter ${diff <= 0 ? 'text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 'text-teal-400'}`}>
               {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
             </span>
             <span className="text-xs font-bold text-zinc-500">kg</span>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>Weight Trend</SectionTitle>
        <div className="h-48 w-full relative mt-4">
          {weights.length > 1 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d={`M ${points}`} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              />
              <path 
                d={`M 0,100 L ${points} L 100,100 Z`} 
                fill="url(#grad)" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 font-black border-2 border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
               <span className="text-[10px] uppercase tracking-widest">{t.noData}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-2">
        <input 
          type="number" 
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="0.0"
          className="bg-zinc-950/50 backdrop-blur-md border-2 border-zinc-800 rounded-2xl px-4 py-3 w-full text-zinc-100 font-black outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
        />
        <Button onClick={() => { if(val) { onAdd(parseFloat(val)); setVal(""); } }}>{t.addWeight}</Button>
      </div>
    </div>
  );
}

function Insights({ t, meals }: any) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle>{t.insights}</SectionTitle>
      
      <Card glow className="flex items-center gap-5 p-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
           <ICONS.Check className="w-7 h-7" />
        </div>
        <div>
           <h4 className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{t.consistencyScore}</h4>
           <p className="text-3xl font-black text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] tracking-tighter">84%</p>
        </div>
      </Card>

      <Card className="flex items-center gap-5 p-5">
        <div className="w-14 h-14 rounded-2xl bg-teal-400/20 flex items-center justify-center text-teal-400 border border-teal-400/30">
           <ICONS.Timeline className="w-7 h-7" />
        </div>
        <div>
           <h4 className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{t.mealTiming}</h4>
           <p className="text-sm font-bold text-zinc-200 tracking-tight leading-snug">Stable pattern identified:<br/><span className="text-zinc-500 font-medium">Mostly 9AM-8PM</span></p>
        </div>
      </Card>

      <div className="p-6 bg-zinc-900/20 backdrop-blur-md border-2 border-dashed border-zinc-800 rounded-3xl mt-8">
         <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] text-center leading-loose">
           {t.privacyNote}
         </p>
      </div>
    </div>
  );
}

function MealLoggerModal({ t, lang, onClose, onSave, loading }: any) {
  const [description, setDescription] = useState("");
  const [portion, setPortion] = useState<PortionSize>("Medium");
  const [images, setImages] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom duration-500 bg-zinc-950 border-indigo-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-black uppercase tracking-tight">{t.logMeal}</h3>
           {!loading && <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 text-2xl leading-none">&times;</button>}
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">{t.description}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl p-4 text-zinc-100 outline-none focus:border-indigo-500 transition-all min-h-[120px] font-medium placeholder:text-zinc-700 disabled:opacity-50"
              placeholder="E.g., Chicken salad with nuts..."
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">{t.portion}</label>
            <div className="flex gap-2">
              {(['Small', 'Medium', 'Large'] as PortionSize[]).map(sz => (
                <button
                  key={sz}
                  disabled={loading}
                  onClick={() => setPortion(sz)}
                  className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${portion === sz ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'} disabled:opacity-50`}
                >
                  {t[sz.toLowerCase()]}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Visual Evidence</label>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {!loading && (
                  <>
                    <label className="w-20 h-20 rounded-2xl border-2 border-indigo-500/30 flex flex-col items-center justify-center text-indigo-400 hover:border-indigo-500 hover:text-indigo-300 transition-all cursor-pointer flex-shrink-0 bg-indigo-500/10">
                       <ICONS.Camera className="w-6 h-6 mb-1" />
                       <span className="text-[8px] font-black uppercase tracking-tighter">Capture</span>
                       <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
                    </label>
                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-zinc-500 hover:text-zinc-400 transition-all cursor-pointer flex-shrink-0 bg-zinc-900/30">
                       <ICONS.Gallery className="w-6 h-6 mb-1" />
                       <span className="text-[8px] font-black uppercase tracking-tighter">Library</span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                    </label>
                  </>
                )}
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0 group">
                    <img src={img} className="w-full h-full object-cover rounded-2xl border-2 border-zinc-800" alt="upload" />
                    {!loading && (
                      <button 
                        onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg"
                      >&times;</button>
                    )}
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!loading && <Button variant="outline" className="flex-1 uppercase tracking-widest text-[10px]" onClick={onClose}>{t.cancel}</Button>}
            <Button 
              className="flex-1 uppercase tracking-widest text-[10px]" 
              loading={loading}
              onClick={() => onSave({ description, portion, images })}
            >
              {loading ? (lang === 'EN' ? "Generating Awareness..." : "Генерация осознанности...") : t.save}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
