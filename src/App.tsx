import './App.css';
import { type FormEvent, useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Play, 
  Command, 
  Code, 
} from 'lucide-react';

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseSpeed: number;
  pulseValue: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('info'); // Default to 'info' to showcase image 1, user can switch to 'work'
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState([
    'System initialization... OK',
    'Type "help" or click presets below to explore.'
  ]);
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound generator helper for sleek retro interface clicks
  const playBeep = (freq = 400, type: OscillatorType = 'sine', duration = 0.08) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = type;
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context block safeguard
    }
  };

  // Live retro ML visualizer (renders beautiful minimal neural network nodes firing on canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const nodes: NeuralNode[] = [];
    const nodeCount = 14;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseValue: Math.random()
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 75) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist / 500})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulseValue += node.pulseSpeed;

        // Bounce boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const glow = Math.abs(Math.sin(node.pulseValue));
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + glow * 0.7})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + glow * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);

  // Mock projects demonstrating AI, ML, & high-performance Python
  const projects = [
    {
      id: 'neural-engine',
      title: 'NeuroCore Light',
      tech: 'Python / NumPy / C-Extensions',
      desc: 'A pure Python & NumPy modular deep learning framework constructed from the ground up, featuring manual backprop, dynamic computational graph generation, and an optimized C-extension matrix multiplication layer.',
      stat: '98.4% Training Acc',
      tag: 'AI / Core',
      code: `import numpy as np\n\nclass Tensor:\n    def __init__(self, data, creators=None):\n        self.data = np.array(data)\n        self.creators = creators\n        self.grad = None\n\n    def backward(self, grad=None):\n        if grad is None:\n            grad = np.ones_like(self.data)\n        self.grad = grad\n        # Custom backpropagation algorithm...\n        print("✓ Propagation completed successfully.")`
    },
    {
      id: 'async-pipeline',
      title: 'Specter Async',
      tech: 'Python / Asyncio / UVLoop',
      desc: 'High-performance asynchronous microservice event-broker wrapper engineered for microsecond-scale dispatch. Handles up to 85,000 requests per second with ultra-low garbage collector interference.',
      stat: '0.45ms Latency',
      tag: 'Infrastructure',
      code: `import asyncio\nimport uvloop\n\nasync def dispatch_event(channel, payload):\n    writer = await get_socket_pool(channel)\n    writer.write(payload.serialize())\n    await writer.drain()\n    return "Event Sent"\n\n# Engineered for sub-millisecond dispatch times\nuvloop.install()\nasyncio.run(dispatch_event("core_broker", "0x3F9"))`
    },
    {
      id: 'vision-quant',
      title: 'Vision Quantizer',
      tech: 'Python / PyTorch / OpenCV',
      desc: 'Real-time post-training model quantization utility translating heavyweight Vision Transformer weights into int8 formats for edge devices, minimizing parameters while retaining accuracy benchmarks.',
      stat: '4.2x Compression',
      tag: 'AI Optimization',
      code: `import torch\nimport torch.quantization as quant\n\ndef quantize_vit_model(float_model):\n    float_model.eval()\n    float_model.qconfig = quant.get_default_qconfig('fbgemm')\n    prepared = quant.prepare(float_model, inplace=True)\n    # Calibration on domain samples...\n    quantized = quant.convert(prepared, inplace=True)\n    return quantized`
    }
  ];

  // CLI engine logic
  const handleCliSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    executeCommand(cliInput.trim());
    setCliInput('');
  };

  const executeCommand = (cmd: string) => {
    const cleanCmd = cmd.toLowerCase().trim();
    let response = '';
    playBeep(600, 'triangle', 0.1);

    switch(cleanCmd) {
      case 'help':
        response = 'Available instructions: "stack", "about", "projects", "clear", "ping", "contact".';
        break;
      case 'stack':
        response = 'Languages: Python, JavaScript/TypeScript, C++, Rust, SQL. Tools: PyTorch, Docker, NumPy, React, Tailwind.';
        break;
      case 'about':
        response = 'Adit Malik: Web developer & core Python engineer designing AI pipelines and efficient backends.';
        break;
      case 'projects':
        response = 'Active frameworks: NeuroCore Light, Specter Async, Vision Quantizer. Click "Work" for code views.';
        break;
      case 'ping':
        response = 'pong! connection latency: 12ms (simulated running local event-broker)';
        break;
      case 'contact':
        response = 'Connect via: github.com/AditMalikYT or linkedin.com (Links at top/bottom right).';
        break;
      case 'clear':
        setCliLogs([]);
        return;
      default:
        response = `Command not recognized: "${cmd}". Type "help" for dynamic list of functions.`;
    }

    setCliLogs(prev => [...prev, `> ${cmd}`, response]);
  };

  const handlePresetCommand = (cmd: string) => {
    executeCommand(cmd);
  };

  const simulateScriptExecution = () => {
    if (isRunningScript) return;
    setIsRunningScript(true);
    playBeep(350, 'square', 0.15);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      playBeep(450 + (step * 80), 'sine', 0.05);
      if (step >= 5) {
        clearInterval(interval);
        setIsRunningScript(false);
        playBeep(880, 'sine', 0.2);
      }
    }, 450);
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      
      {/* Dynamic Embedded Styling for fonts and subtle micro-shadows */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        
        .font-display {
          font-family: 'Instrument Serif', serif;
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(255,255,255,0.15);
        }
        .glass-panel {
          background-color: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>

      {/* Decorative background grid line element for luxury tech branding feel */}
      <div className="absolute inset-0 bg-[radial-gradient(#161616_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* HEADER BAR */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 border-b border-neutral-900 pb-6">
        {/* Left Side Logo */}
        <div 
          onClick={() => { playBeep(220, 'sine', 0.15); }} 
          className="font-display text-[2.4rem] tracking-tight hover:opacity-80 transition-opacity cursor-pointer select-none"
        >
          Adit~
        </div>

        {/* Center Navigation Pill Selector */}
        <div className="bg-[#0f0f0f] border border-neutral-900 rounded-full p-1.5 flex items-center relative gap-1">
          {/* Work Button */}
          <button
            onClick={() => {
              setActiveTab('work');
              playBeep(440, 'sine', 0.08);
            }}
            className={`font-display text-[1.45rem] italic px-6 py-1 rounded-full transition-all duration-300 relative z-10 ${
              activeTab === 'work' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Work
          </button>

          {/* Info Button */}
          <button
            onClick={() => {
              setActiveTab('info');
              playBeep(440, 'sine', 0.08);
            }}
            className={`font-display text-[1.45rem] italic px-6 py-1 rounded-full transition-all duration-300 relative z-10 ${
              activeTab === 'info' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Info
          </button>

          {/* Smooth sliding capsule background under selected tab */}
          <div 
            className="absolute top-[6px] bottom-[6px] rounded-full bg-[#1e1e1e] border border-neutral-800 transition-all duration-300 ease-out"
            style={{
              left: activeTab === 'work' ? '6px' : 'calc(50% + 1px)',
              width: 'calc(50% - 7px)'
            }}
          />
        </div>

        {/* Right Side Social/Nav Anchors */}
        <div className="flex items-center gap-6">
          {/* Audio Feedback Toggle Switch */}
          <a 
            href="https://www.instagram.com/coderadit3" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playBeep(500, 'triangle', 0.08)}
            className="font-display text-lg italic hover:text-neutral-400 transition-colors flex items-center gap-1.5"
          >
            Insta <span className="text-[10px] opacity-60">↗</span>
          </a>
          <a 
            href="https://github.com/AditMalikYT" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playBeep(500, 'triangle', 0.08)}
            className="font-display text-lg italic hover:text-neutral-400 transition-colors flex items-center gap-1.5"
          >
            GitHub <span className="text-[10px] opacity-60">↗</span>
          </a>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <main className="my-auto py-12 flex justify-center items-center relative z-10 w-full max-w-7xl mx-auto">
        
        {/* VIEW 1: INFO TAB VIEW */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 w-full items-start animate-fadeIn">
            
            {/* Left Side Column: Asymmetric Decorative Boxes */}
            <div className="md:col-span-5 flex flex-row items-start gap-6 md:gap-8">
              
              {/* Asymmetric Vertical Pill Box */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => playBeep(260, 'sawtooth', 0.12)}
                  className="w-10 h-48 sm:w-12 sm:h-64 bg-[#111111] border border-neutral-900 rounded-full flex flex-col justify-between p-1.5 sm:p-2 cursor-pointer group hover:border-neutral-700 transition-all"
                  title="Interactive System Load Metaphor"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
                    CPU
                  </div>
                  {/* Glowing internal running gauge indicators */}
                  <div className="flex flex-col gap-1 sm:gap-1.5 items-center mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-600 tracking-wider vertical-text select-none">SYSTEM</span>
              </div>

              {/* Main "About me." Text & Custom Interactive Display Square below */}
              <div className="flex-1 flex flex-col gap-4 sm:gap-6">
                
                {/* About me text exactly as mockups */}
                <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none text-white text-glow select-none">
                  About<br />me.
                </h1>

                {/* Left side Square element - styled to have active live canvas simulation */}
                <div 
                  className="w-36 h-36 sm:w-48 sm:h-48 bg-[#111111] border border-neutral-900 rounded-[1.8rem] sm:rounded-[2.2rem] overflow-hidden relative group hover:border-neutral-700 transition-all cursor-crosshair"
                  onClick={() => playBeep(320, 'sine', 0.2)}
                  title="Click to interact with the Live Neural Grid"
                >
                  <canvas ref={canvasRef} className="w-full h-full opacity-80" />
                  
                  {/* Subtle hover prompt overlay */}
                  <div className="absolute inset-x-0 bottom-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] font-mono tracking-widest text-neutral-400 bg-[#000]/80 px-2 py-0.5 rounded-full">
                      NEURAL NODE ACTIVE
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side Column: Now perfectly positioned directly next to "About me" */}
            <div className="md:col-span-7 flex flex-col gap-6 md:gap-8">
              
              {/* Dynamic Action Status Pill */}
              <div className="bg-[#111111] border border-neutral-900 min-h-14 sm:h-14 w-full rounded-[1.5rem] sm:rounded-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3 sm:py-2 group hover:border-neutral-800 transition-all relative overflow-hidden gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                  <span className="text-xs font-mono text-neutral-400 tracking-wider">
                    ● Available for high-performance Python & Web systems
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-600 bg-[#1e1e1e] border border-neutral-800 px-2.5 py-1 rounded-full">
                    ADIT_OS v2.6
                  </span>
                </div>
              </div>

              {/* Monospace main paragraph verbatim from image 1 */}
              <p className="font-mono text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl text-glow">
                I am <span className="text-white font-medium">Adit Malik</span>, a web developer and python professional focused on core engineering. I build high-performance, hands-on software and explore the fundamentals of AI and ML.
              </p>

              {/* Interactive Core Capabilities Deck */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#090909]/60 border border-neutral-900 hover:border-neutral-800 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                      <Cpu size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-mono text-sm text-white font-medium">Core Python</h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 leading-relaxed">
                    Custom async orchestration, PyTorch pipeline engineering, low-level NumPy mathematical optimization.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#090909]/60 border border-neutral-900 hover:border-neutral-800 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                      <Code size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-mono text-sm text-white font-medium">Full Stack Integration</h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 leading-relaxed">
                    Developing hyper-minimalist, exceptionally fast frontends paired with optimized JSON/WebSocket brokers.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: WORK TAB VIEW */}
        {activeTab === 'work' && (
          <div className="w-full flex flex-col gap-12 animate-fadeIn">
            
            {/* The Master Callout Card (From Image 0) */}
            <div className="w-full bg-[#070707] border border-neutral-900 rounded-[1.8rem] sm:rounded-[2.5rem] p-6 sm:p-12 md:p-16 flex items-center justify-center min-h-[250px] sm:min-h-[350px] relative group overflow-hidden shadow-2xl">
              
              {/* Internal subtle grid aesthetic overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <div className="text-center max-w-4xl relative z-10 flex flex-col gap-4">
                {/* Image 0 Text Clone */}
                <h2 className="font-display text-3xl sm:text-4xl md:text-6xl tracking-tight leading-snug text-white max-w-3xl mx-auto">
                  See my engineering in action <br className="hidden md:block"/>
                  <span className="italic font-light opacity-60 text-neutral-400">—</span> <br className="hidden md:block"/>
                  visit my site or GitHub profile.
                </h2>
                
                <p className="text-xs font-mono text-neutral-500 mt-2 select-none tracking-widest uppercase">
                  Interactive Python & AI Engine below
                </p>
              </div>

              {/* Aesthetic absolute positioning corner indicators */}
              <div className="hidden sm:block absolute top-6 left-6 font-mono text-[9px] text-neutral-700 select-none">SYS_READY_0x1A</div>
              <div className="hidden sm:block absolute bottom-6 right-6 font-mono text-[9px] text-neutral-700 select-none">STABLE_COMPILATION</div>
            </div>

            {/* INTEGRATED CORE PLAYGROUND */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
              
              {/* Project Showcase Selector */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <span className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-2">
                  Active Code Repositories
                </span>
                
                {projects.map((project, idx) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setActiveProject(idx);
                      playBeep(400 + (idx * 50), 'triangle', 0.1);
                    }}
                    className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                      activeProject === idx
                        ? 'bg-[#0f0f0f] border-neutral-700 shadow-lg'
                        : 'bg-[#050505] border-neutral-900 hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-neutral-500">{project.tech}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        activeProject === idx ? 'bg-white text-black' : 'bg-[#111] text-neutral-400'
                      }`}>
                        {project.tag}
                      </span>
                    </div>
                    <h4 className="font-display text-2xl italic mb-2">{project.title}</h4>
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      {project.desc}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-900 text-xs font-mono text-neutral-500">
                      <span>Performance Metric:</span>
                      <span className="text-white font-semibold">{project.stat}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Interactive Environment Terminal */}
              <div className="lg:col-span-7 bg-[#050505] border border-neutral-900 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
                
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/20" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <span className="w-3 h-3 rounded-full bg-green-500/20" />
                    <span className="text-xs font-mono text-neutral-400 ml-2">adit@server-node: ~/core_packages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-neutral-500">Online API sandbox</span>
                  </div>
                </div>

                {/* Main Code & Console Output */}
                <div className="flex-1 flex flex-col gap-4 font-mono text-xs overflow-y-auto max-h-[300px] pr-2">
                  
                  {/* Selected code block */}
                  <div className="bg-[#090909] p-4 rounded-xl border border-neutral-900 relative">
                    <div className="absolute top-2 right-3 text-[9px] text-neutral-600 uppercase tracking-widest">
                      PySource Readonly
                    </div>
                    <pre className="text-neutral-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {projects[activeProject].code}
                    </pre>
                  </div>

                  {/* Terminal interactive log output */}
                  <div className="bg-[#020202] p-4 rounded-xl border border-neutral-950 font-mono text-neutral-400 flex flex-col gap-1.5 min-h-[100px]">
                    <div className="text-neutral-600 text-[10px] uppercase tracking-wider mb-1">Interactive Shell Outputs</div>
                    {cliLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                    {isRunningScript && (
                      <div className="text-yellow-500/80 animate-pulse flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                        Executing internal neural matrix calibration calculations...
                      </div>
                    )}
                  </div>

                </div>

                {/* Input & Action Panel */}
                <div className="mt-4 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* CLI Form */}
                  <form onSubmit={handleCliSubmit} className="w-full sm:w-auto flex-1 flex items-center bg-[#0d0d0d] rounded-xl px-3 py-2 border border-neutral-900">
                    <Command size={14} className="text-neutral-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Type 'help', 'stack', 'ping'..."
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      className="bg-transparent focus:outline-none text-xs text-white font-mono flex-1 placeholder:text-neutral-700"
                    />
                  </form>

                  {/* Quick Action Button */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handlePresetCommand('stack')}
                      className="px-3 py-1.5 rounded-lg border border-neutral-900 hover:border-neutral-800 bg-[#090909] text-neutral-400 hover:text-white transition-all text-xs font-mono"
                    >
                      Check Stack
                    </button>
                    
                    <button
                      onClick={simulateScriptExecution}
                      disabled={isRunningScript}
                      className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all rounded-lg flex items-center gap-2 text-xs font-mono font-medium"
                    >
                      <Play size={11} fill="currentColor" /> Run Demo
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center border-t border-neutral-900 pt-6 mt-12 text-sm text-neutral-500 select-none">
        {/* Left Logo */}
        <div 
          onClick={() => playBeep(220, 'sine', 0.15)} 
          className="font-display text-[1.8rem] tracking-tight text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          Adit~
        </div>

        {/* Center Copyright as shown in mockup */}
        <div className="font-display text-xl text-neutral-300 italic tracking-wide">
          © 2026
        </div>

        {/* Right Social Anchors */}
        <div className="flex items-center gap-6">
          <a 
            href="https://www.instagram.com/coderadit3" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playBeep(500, 'triangle', 0.08)}
            className="font-display text-lg italic hover:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            Insta <span className="text-[10px] opacity-60">↗</span>
          </a>
          <a 
            href="https://github.com/AditMalikYT" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playBeep(500, 'triangle', 0.08)}
            className="font-display text-lg italic hover:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            GitHub <span className="text-[10px] opacity-60">↗</span>
          </a>
        </div>
      </footer>

    </div>
  );
}
