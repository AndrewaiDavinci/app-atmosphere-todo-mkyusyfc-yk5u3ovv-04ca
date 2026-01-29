import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Circle from 'lucide-react/dist/esm/icons/circle';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { cn } from './lib/utils';

export default function App() {
  // 상태 초기화 (Lazy initialization)
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('atmosphere-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 로컬 스토리지 동기화
  useEffect(() => {
    localStorage.setItem('atmosphere-todos', JSON.stringify(todos));
  }, [todos]);

  // 투두 추가
  const addTodo = useCallback((e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos(prev => [newTodo, ...prev]);
    setInput('');
  }, [input]);

  // 투두 토글
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  // 투두 삭제
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [todos]);

  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen w-full bg-[#1e293b] flex items-center justify-center p-4 font-sans selection:bg-blue-200/30">
      {/* 배경 블러 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative w-full max-w-md z-10">
        {/* 헤더 섹션 */}
        <header className="mb-8 text-white/90 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Calendar size={18} />
            <span className="text-sm font-medium tracking-wider">{formattedDate}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">오늘의 몰입</h1>
          <p className="text-white/60 text-sm">
            {stats.total === 0 
              ? "새로운 할 일을 추가해보세요." 
              : `현재 ${stats.total}개의 할 일 중 ${stats.completed}개를 완료했습니다.`}
          </p>
          
          {/* 진행 바 */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </header>

        {/* 입력 섹션 */}
        <form 
          onSubmit={addTodo}
          className="relative mb-6 group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="할 일을 입력하세요..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-md"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Plus size={20} />
          </button>
        </form>

        {/* 리스트 섹션 */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {todos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-white/20 text-sm">리스트가 비어있습니다</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm",
                  todo.completed 
                    ? "bg-white/5 border-white/5 opacity-60" 
                    : "bg-white/10 border-white/10 hover:border-white/20 hover:bg-white/15"
                )}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <button className="text-blue-400 transition-transform active:scale-90">
                    {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-white/30" />}
                  </button>
                  <span className={cn(
                    "text-[15px] transition-all duration-300",
                    todo.completed ? "text-white/40 line-through" : "text-white/90"
                  )}>
                    {todo.text}
                  </span>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-all rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 푸터 정보 */}
        <footer className="mt-8 text-center text-white/20 text-xs font-light tracking-widest uppercase">
          Atmosphere Design &copy; {new Date().getFullYear()}
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}