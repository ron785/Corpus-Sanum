
import React from 'react';
import { Localization, Language } from './types';

export const ICONS = {
  Home: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Timeline: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
  ),
  Weight: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7"/><path d="M16 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="m22 22-2-2"/></svg>
  ),
  Insights: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M16 19h6"/><path d="M19 16v6"/><path d="M21 12a9 9 0 0 1-9 9m9-9h-9v9"/></svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Camera: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  Gallery: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
  ),
  User: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Fire: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
  ),
  Snow: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>
  )
};

export const TRANSLATIONS: Record<Language, Localization> = {
  EN: {
    appName: "Corpus Sanum",
    home: "Dashboard",
    timeline: "Timeline",
    weight: "Weight",
    insights: "Insights",
    profile: "Profile",
    logMeal: "Log Meal",
    description: "What did you eat?",
    portion: "Portion Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    save: "Save Entry",
    cancel: "Cancel",
    noData: "No data captured yet.",
    addWeight: "Add Weight",
    currentWeight: "Current Weight",
    change: "Change",
    timeframeDay: "Day",
    timeframeWeek: "Week",
    timeframeMonth: "Month",
    timeframeAll: "All Time",
    dominantHabit: "Dominant Habit",
    consistencyScore: "Consistency Score",
    mealTiming: "Meal Timing",
    privacyNote: "Your data is stored locally on this device.",
    userNames: { Ron: "Ron", Evgeny: "Evgeny" },
    aiAnalysis: "AI Awareness",
    streak: "Current Streak",
    healthy: "Healthy",
    unhealthy: "Unhealthy",
    freezeTokens: "Freeze Tokens"
  },
  RU: {
    appName: "Corpus Sanum",
    home: "Панель",
    timeline: "История",
    weight: "Вес",
    insights: "Инсайты",
    profile: "Профиль",
    logMeal: "Записать еду",
    description: "Что вы съели?",
    portion: "Размер порции",
    small: "Маленькая",
    medium: "Средняя",
    large: "Большая",
    save: "Сохранить",
    cancel: "Отмена",
    noData: "Данных пока нет.",
    addWeight: "Добавить вес",
    currentWeight: "Текущий вес",
    change: "Изменение",
    timeframeDay: "День",
    timeframeWeek: "Неделя",
    timeframeMonth: "Месяц",
    timeframeAll: "Все время",
    dominantHabit: "Главная привычка",
    consistencyScore: "Индекс стабильности",
    mealTiming: "Время приемов",
    privacyNote: "Ваши данные хранятся локально на этом устройстве.",
    userNames: { Ron: "Рон", Evgeny: "Евгений" },
    aiAnalysis: "AI Оценка",
    streak: "Текущий стрик",
    healthy: "Полезных",
    unhealthy: "Вредных",
    freezeTokens: "Заморозки"
  }
};

export const QUOTES: Record<Language, string[]> = {
  EN: [
    "Consistency is the key to progress.",
    "Health is a pattern, not a project.",
    "Observe without judgment.",
    "Small changes lead to big results.",
    "Consistency over intensity."
  ],
  RU: [
    "Постоянство — ключ к прогрессу.",
    "Здоровье — это паттерн, а не проект.",
    "Наблюдайте без осуждения.",
    "Маленькие шаги ведут к большим результатам.",
    "Стабильность важнее интенсивности."
  ]
};
