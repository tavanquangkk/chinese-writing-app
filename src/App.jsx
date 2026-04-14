import { useState, useEffect, useRef, useCallback } from "react";
import HanziWriter from "hanzi-writer";
import { CATEGORIES, TONE_COLORS, TONE_LABELS } from "./data/vocabulary";

function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = 0.8;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice =
        voices.find((v) => v.lang.startsWith("zh") && v.lang.includes("CN")) ||
        voices.find((v) => v.lang.startsWith("zh"));
    if (zhVoice) utter.voice = zhVoice;
    window.speechSynthesis.speak(utter);
}

function HanziBox({ char, size = 200, mode = "animate" }) {
    const containerRef = useRef(null);
    const writerRef = useRef(null);

    const initWriter = useCallback(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        
        writerRef.current = HanziWriter.create(containerRef.current, char, {
            width: size,
            height: size,
            padding: 15,
            showOutline: mode === "animate", // Hiện outline mờ nếu ở chế độ xem nét
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 300,
            strokeColor: "#1e293b",
            outlineColor: "#f1f5f9",
            radicalColor: "#ef4444",
            showCharacter: false, // Quan trọng: không hiện sẵn toàn bộ nét
        });

        if (mode === "animate") {
            writerRef.current.animateCharacter();
        } else if (mode === "quiz") {
            writerRef.current.quiz({
                showOutline: false, // Ẩn hoàn toàn outline khi tập viết
                showHintAfterMisses: 3, // Chỉ hiện gợi ý sau 3 lần sai
            });
        }
    }, [char, size, mode]);

    useEffect(() => {
        initWriter();
    }, [initWriter]);

    const handleReset = (e) => {
        e.stopPropagation();
        initWriter();
    };

    const handleHint = (e) => {
        e.stopPropagation();
        if (writerRef.current && mode === "quiz") {
            writerRef.current.quiz({
                showHintAfterMisses: 0 // Hiện gợi ý ngay lập tức cho nét hiện tại
            });
        }
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <div
                ref={containerRef}
                onClick={() => mode === "animate" && writerRef.current?.animateCharacter()}
                style={{
                    cursor: mode === "animate" ? "pointer" : "crosshair",
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0"
                }}>
                {/* Background Grid */}
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: size,
                        height: size,
                        pointerEvents: "none",
                    }}>
                    <line x1="0" y1="0" x2={size} y2={size} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={size} y1="0" x2="0" y2={size} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke="#f1f5f9" strokeWidth="1" />
                </svg>
            </div>

            {mode === "quiz" && (
                <div style={{ 
                    display: "flex", 
                    gap: "0.75rem", 
                    marginTop: "1rem", 
                    justifyContent: "center" 
                }}>
                    <button
                        onClick={handleHint}
                        style={{
                            padding: "6px 16px",
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontWeight: 600,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                    >
                        Gợi ý
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: "6px 16px",
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            border: "1px solid #fee2e2",
                            background: "white",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontWeight: 600,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                    >
                        Viết lại
                    </button>
                </div>
            )}
        </div>
    );
}

function CharCard({ word, onSelect, selected }) {
    return (
        <div
            onClick={() => onSelect(word)}
            style={{
                background: selected
                    ? "rgba(59, 130, 246, 0.08)"
                    : "white",
                border: selected
                    ? "2px solid #3b82f6"
                    : "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px 12px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transform: selected ? "translateY(-2px)" : "none",
                boxShadow: selected ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none",
            }}>
            <span
                style={{
                    fontFamily: '"Noto Serif SC", serif',
                    fontSize: 36,
                    lineHeight: 1,
                    color: "#1f2937",
                }}>
                {word.char}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: TONE_COLORS[word.tone],
                    }}>
                    {word.pinyin}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "80px"
                    }}>
                    {word.meaning}
                </span>
            </div>
        </div>
    );
}

export default function App() {
    const allWords = Object.values(CATEGORIES).flat();
    const [activeCat, setActiveCat] = useState("Số đếm");
    const [selected, setSelected] = useState(CATEGORIES["Số đếm"][0]);
    const [search, setSearch] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [mode, setMode] = useState("animate"); // animate | quiz

    const catWords = CATEGORIES[activeCat] || [];
    const filtered =
        search.trim().length > 0
            ? allWords.filter(
                  (w) =>
                      w.char.includes(search) ||
                      w.pinyin.toLowerCase().includes(search.toLowerCase()) ||
                      w.meaning.toLowerCase().includes(search.toLowerCase()),
              )
            : catWords;

    const handleSpeak = () => {
        setIsSpeaking(true);
        speak(selected.char);
        setTimeout(() => setIsSpeaking(false), 800);
    };

    return (
        <div
            style={{
                fontFamily: "Inter, system-ui, sans-serif",
                maxWidth: 1000,
                margin: "0 auto",
                padding: "2rem 1rem",
                color: "#1f2937",
                backgroundColor: "#f9fafb",
                minHeight: "100vh",
            }}>
            
            {/* Header Section */}
            <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.025em" }}>
                        Học Viết Chữ Hán
                    </h1>
                    <p style={{ color: "#6b7280", marginTop: "0.5rem", fontSize: "1.1rem" }}>
                        Khám phá {allWords.length} chữ Hán cơ bản qua từng nét vẽ
                    </p>
                </div>
                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                    <input
                        type="text"
                        placeholder="Tìm chữ, pinyin hoặc nghĩa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem 2.5rem 0.75rem 1rem",
                            borderRadius: "10px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.95rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            style={{
                                position: "absolute",
                                right: "0.75rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#9ca3af",
                                display: "flex",
                                alignItems: "center",
                                padding: 0
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            <main style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2.5rem", alignItems: "start" }}>
                
                {/* Learning Panel */}
                <aside style={{ position: "sticky", top: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <button 
                                onClick={() => setMode("animate")}
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    borderRadius: "8px",
                                    border: "none",
                                    background: mode === "animate" ? "#eff6ff" : "transparent",
                                    color: mode === "animate" ? "#3b82f6" : "#6b7280",
                                    cursor: "pointer"
                                }}
                            >
                                Xem Nét
                            </button>
                            <button 
                                onClick={() => setMode("quiz")}
                                style={{
                                    flex: 1,
                                    padding: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    borderRadius: "8px",
                                    border: "none",
                                    background: mode === "quiz" ? "#f0fdf4" : "transparent",
                                    color: mode === "quiz" ? "#10b981" : "#6b7280",
                                    cursor: "pointer"
                                }}
                            >
                                Tập Viết
                            </button>
                        </div>
                        
                        <div style={{ textAlign: "center" }}>
                            <HanziBox char={selected.char} size={250} mode={mode} />
                            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "1rem" }}>
                                {mode === "animate" ? "Click vào khung để xem lại" : "Viết các nét theo hướng dẫn"}
                            </p>
                        </div>
                    </div>

                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                            <div style={{ 
                                width: "64px", 
                                height: "64px", 
                                background: "#f3f4f6", 
                                borderRadius: "12px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                fontSize: "2rem",
                                fontFamily: '"Noto Serif SC", serif'
                            }}>
                                {selected.char}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.5rem", color: TONE_COLORS[selected.tone] }}>{selected.pinyin}</h3>
                                <p style={{ margin: 0, color: "#6b7280", fontWeight: 500 }}>{selected.meaning}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSpeak}
                            disabled={isSpeaking}
                            style={{
                                width: "100%",
                                padding: "0.85rem",
                                borderRadius: "12px",
                                border: "none",
                                background: "#111827",
                                color: "white",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                transition: "transform 0.1s",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                            {isSpeaking ? "Đang phát..." : "Nghe Phát Âm"}
                        </button>
                    </div>
                </aside>

                {/* Grid Section */}
                <section>
                    <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "20px",
                                    border: "1px solid #3b82f6",
                                    background: "white",
                                    color: "#3b82f6",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem"
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Trang chủ
                            </button>
                        )}
                        {!search && Object.keys(CATEGORIES).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCat(cat);
                                    setSelected(CATEGORIES[cat][0]);
                                }}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "20px",
                                    border: "1px solid",
                                    borderColor: activeCat === cat ? "#3b82f6" : "#e5e7eb",
                                    background: activeCat === cat ? "#3b82f6" : "white",
                                    color: activeCat === cat ? "white" : "#4b5563",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>

                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", 
                        gap: "1rem" 
                    }}>
                        {filtered.map((word, i) => (
                            <CharCard
                                key={`${word.char}-${i}`}
                                word={word}
                                selected={selected?.char === word.char}
                                onSelect={(w) => {
                                    setSelected(w);
                                    speak(w.char);
                                }}
                            />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}>
                            <p style={{ fontSize: "1.25rem" }}>Không tìm thấy chữ hán nào khớp với tìm kiếm</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
