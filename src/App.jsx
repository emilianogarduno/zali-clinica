import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Play, FileText, ChevronLeft, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bluetooth, BluetoothConnected, StopCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ZaliTherapyApp() {
  // --- ESTADO GLOBAL ---
  const [view, setView] = useState('welcome'); 
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  // --- ESTADO BLUETOOTH ---
  const [isConnected, setIsConnected] = useState(false);
  const [, setBleDevice] = useState(null);
  const [bleCharacteristic, setBleCharacteristic] = useState(null);

  // Navegación
  const goHome = () => setView('patients');
  const goWelcome = () => setView('welcome');
  const goMenu = (patient) => { setActivePatient(patient); setView('patientMenu'); };
  
  // --- CONEXIÓN BLUETOOTH BLE ---
  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Zali' }],
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] 
      });
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const characteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
      
      setBleCharacteristic(characteristic);
      setBleDevice(device);
      setIsConnected(true);

      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setBleCharacteristic(null);
        alert("Zalí se ha desconectado");
      });
    } catch (error) {
      console.log("Bluetooth cancelado o no disponible", error);
    }
  };

  const sendCommand = async (cmd) => {
    if (bleCharacteristic) {
      try {
        const encoder = new TextEncoder();
        await bleCharacteristic.writeValue(encoder.encode(cmd + '\n'));
      } catch (e) {
        console.error("Error enviando:", e);
      }
    } else {
      console.log("Simulando comando (No conectado):", cmd);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col h-screen">
        
        {/* ENCABEZADO */}
        <header className="bg-[#0F766E] text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'welcome' && (
              <button onClick={view === 'patients' ? goWelcome : goHome} className="p-1 hover:bg-teal-700 rounded-lg transition-colors">
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-wide">Zalí</h1>
          </div>
          <button 
            onClick={connectBluetooth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isConnected ? 'bg-teal-900 text-teal-200' : 'bg-rose-500 text-white'}`}
          >
            {isConnected ? <BluetoothConnected size={14} /> : <Bluetooth size={14} />}
            {isConnected ? 'Conectado' : 'Vincular'}
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto">
          {view === 'welcome' && <WelcomeView onStart={() => setView('patients')} />}
          {view === 'patients' && <PatientsView patients={patients} setPatients={setPatients} onSelect={goMenu} />}
          {view === 'patientMenu' && <PatientMenuView patient={activePatient} setView={setView} />}
          {view === 'metrics' && <MetricsView patient={activePatient} therapies={therapies} />}
          {view === 'therapy' && (
            <TherapySession 
              patient={activePatient} 
              sendCommand={sendCommand} 
              onFinish={(newTherapy) => {
                setTherapies([...therapies, newTherapy]);
                setView('metrics');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: PÁGINA DE BIENVENIDA
// ==========================================
function WelcomeView({ onStart }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-teal-50 to-white">
      <div className="mb-8">
        <div className="w-24 h-24 bg-teal-600 text-white rounded-full flex items-center justify-center text-5xl font-bold shadow-lg">
          🐡
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-slate-800 mb-3">Zalí</h1>
      <p className="text-lg text-slate-600 mb-2 font-semibold">Robot de asistencia para Hidroterapia en pacientes con TEA</p>
      <p className="text-slate-500 mb-12 text-sm leading-relaxed">
        Sistema de control y seguimiento para sesiones de hidroterapia con dispositivos Bluetooth
      </p>

      <div className="w-full space-y-4 mb-8">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <h3 className="font-bold text-teal-800 mb-2">🎯 Características</h3>
          <ul className="text-sm text-teal-700 space-y-1 text-left">
            <li>✓ Gestión de pacientes</li>
            <li>✓ Control remoto Joystick</li>
            <li>✓ Métricas de sesiones</li>
            <li>✓ Conexión Bluetooth</li>
          </ul>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-600/30 transition-transform active:scale-95"
      >
        Comenzar
      </button>

      <p className="text-xs text-slate-400 mt-8">v1.0.0</p>
    </div>
  );
}

// ==========================================
// VISTA: LISTA DE PACIENTES
// ==========================================
function PatientsView({ patients, setPatients, onSelect }) {
  const [newName, setNewName] = useState('');

  const addPatient = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setPatients([...patients, { id: Date.now(), name: newName, age: '', notes: '' }]);
    setNewName('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 text-teal-800">
        <Users size={28} />
        <h2 className="text-2xl font-bold">Mis Pacientes</h2>
      </div>

      <form onSubmit={addPatient} className="mb-8 flex gap-2">
        <input 
          type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo paciente..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button type="submit" className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700">
          <UserPlus size={24} />
        </button>
      </form>

      <div className="space-y-3">
        {patients.length === 0 ? (
          <div className="text-center bg-slate-100 p-8 rounded-2xl border border-slate-200 mt-10">
            <Users size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay pacientes registrados aún.</p>
            <p className="text-slate-400 text-sm">Agrega tu primer paciente para comenzar.</p>
          </div>
        ) : (
          patients.map(p => (
            <div 
              key={p.id} onClick={() => onSelect(p)}
              className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-400 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-bold text-lg text-slate-700">{p.name}</h3>
                <p className="text-sm text-slate-400">ID: {p.id.toString().slice(-4)}</p>
              </div>
              <ChevronLeft size={20} className="text-slate-300 rotate-180" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// VISTA: MENÚ DEL PACIENTE
// ==========================================
function PatientMenuView({ patient, setView }) {
  return (
    <div className="p-6 flex flex-col items-center pt-12">
      <div className="w-24 h-24 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
        {patient.name.charAt(0)}
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-1">{patient.name}</h2>
      <p className="text-slate-500 mb-12">Perfil Terapéutico</p>

      <div className="w-full space-y-4">
        <button 
          onClick={() => setView('therapy')}
          className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-teal-500/30 transition-transform active:scale-95"
        >
          <Play size={24} />
          Iniciar Nueva Terapia
        </button>
        
        <button 
          onClick={() => setView('metrics')}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-sm transition-transform active:scale-95"
        >
          <FileText size={24} />
          Ver Métricas (Historial)
        </button>
      </div>
    </div>
  );
}

// ==========================================
// VISTA: SESIÓN DE TERAPIA Y CONTROL REMOTO
// ==========================================
function TherapySession({ patient, sendCommand, onFinish }) {
  const [phase, setPhase] = useState('idle'); // idle, countdown, adaptation, routine, summary
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [routineNumber, setRoutineNumber] = useState(1);
  const [metrics, setMetrics] = useState([]);
  const [velocity, setVelocity] = useState(1); // 1=slow, 2=medium, 3=fast

  // Formato MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const cycleVelocity = () => {
    const newVelocity = velocity === 3 ? 1 : velocity + 1;
    setVelocity(newVelocity);
    const velocityCmd = ['S', 'M', 'F'][newVelocity - 1]; // Slow, Medium, Fast
    sendCommand(velocityCmd);
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const id = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(id);
      } else {
        setPhase('adaptation');
        setTimer(0);
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    let interval;
    if (phase === 'adaptation' || phase === 'routine') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleContinue = () => {
    if (phase === 'adaptation') {
      setMetrics([...metrics, { section: 'Adaptación', time: timer }]);
      setPhase('routine');
      setTimer(0);
    } else if (phase === 'routine') {
      setMetrics([...metrics, { section: `Rutina ${routineNumber}`, time: timer }]);
      setRoutineNumber(r => r + 1);
      setTimer(0);
    }
  };

  const handleFinish = () => {
    const finalMetrics = [...metrics, { section: `Rutina ${routineNumber}`, time: timer }];
    setMetrics(finalMetrics);
    setPhase('summary');
    sendCommand('STOP'); // Detener al pez al finalizar
  };

  const saveAndExit = () => {
    onFinish({
      id: Date.now(),
      patientId: patient.id,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      data: metrics
    });
  };

  // 1. Pantalla de Inicio
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
          <Play size={40} className="text-teal-600 ml-2" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Preparar Terapia</h2>
        <p className="text-slate-500 mb-10">Coloque el pez en el agua. La terapia comenzará con la etapa de adaptación del paciente.</p>
        <button onClick={() => setPhase('countdown')} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg active:scale-95">
          Iniciar Rutina
        </button>
      </div>
    );
  }

  // 2. Pantalla de Conteo
  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-teal-600 text-white">
        <h2 className="text-2xl font-bold mb-8">Comenzando en...</h2>
        <span className="text-9xl font-black">{countdown}</span>
      </div>
    );
  }

  // 3. Pantalla de Resumen Final
  if (phase === 'summary') {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex flex-col items-center mb-8 pt-8">
          <CheckCircle size={60} className="text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Terapia Finalizada</h2>
          <p className="text-slate-500">Métricas guardadas exitosamente</p>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Sección</th>
                <th className="p-4 font-semibold text-right">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="p-4 font-bold text-slate-700">{m.section}</td>
                  <td className="p-4 text-right font-mono text-teal-600 font-bold">{formatTime(m.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={saveAndExit} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold mt-6 active:scale-95">
          Guardar y Salir
        </button>
      </div>
    );
  }

  // 4. PANTALLA DEL CONTROL REMOTO (Joystick)
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className={`p-4 text-white flex justify-between items-center shadow-md transition-colors duration-500 ${phase === 'adaptation' ? 'bg-amber-500' : 'bg-teal-600'}`}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Fase Actual</span>
          <h2 className="text-xl font-bold">{phase === 'adaptation' ? 'Tiempo de Adaptación' : `Rutina ${routineNumber}`}</h2>
        </div>
        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
          <Clock size={20} />
          <span className="text-2xl font-mono font-bold tracking-widest">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative w-64 h-64 bg-slate-200 rounded-full shadow-inner flex items-center justify-center p-2 mb-8">
          <div className="absolute top-2">
            <JoyButton icon={<ArrowUp size={32}/>} cmd="F" sendCommand={sendCommand} />
          </div>
          <div className="absolute bottom-2">
            <JoyButton icon={<ArrowDown size={32}/>} cmd="B" sendCommand={sendCommand} />
          </div>
          <div className="absolute left-2">
            <JoyButton icon={<ArrowLeft size={32}/>} cmd="L" sendCommand={sendCommand} />
          </div>
          <div className="absolute right-2">
            <JoyButton icon={<ArrowRight size={32}/>} cmd="R" sendCommand={sendCommand} />
          </div>
          <div className="w-16 h-16 bg-slate-300 rounded-full shadow-sm"></div>
        </div>

        <button 
          onClick={cycleVelocity}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
        >
          <Zap size={24} />
          Velocidad: {velocity === 1 ? 'Lenta' : velocity === 2 ? 'Media' : 'Rápida'}
        </button>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex gap-3 pb-8 shrink-0">
        {phase === 'routine' && (
          <button 
            onClick={handleFinish}
            className="flex-1 bg-rose-100 text-rose-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-rose-200"
          >
            <StopCircle size={20} /> Finalizar
          </button>
        )}
        <button 
          onClick={handleContinue}
          className="flex-[2] bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          {phase === 'adaptation' ? 'Terminar Adaptación' : 'Siguiente Rutina'} 
          <ChevronLeft size={20} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}

function JoyButton({ icon, cmd, sendCommand }) {
  // Prevenir menú contextual en el celular al dejar apretado
  const handleTouch = (e, command) => {
    e.preventDefault();
    sendCommand(command);
  }

  return (
    <button
      onMouseDown={() => sendCommand(cmd)}
      onMouseUp={() => sendCommand('STOP')}
      onMouseLeave={() => sendCommand('STOP')}
      onTouchStart={(e) => handleTouch(e, cmd)}
      onTouchEnd={(e) => handleTouch(e, 'STOP')}
      className="w-16 h-16 bg-white rounded-full shadow-lg border-b-4 border-slate-300 flex items-center justify-center text-slate-600 active:border-b-0 active:translate-y-1 transition-all"
    >
      {icon}
    </button>
  );
}

// ==========================================
// VISTA: MÉTRICAS (HISTORIAL) CON GRÁFICOS
// ==========================================
function MetricsView({ patient, therapies }) {
  const patientTherapies = therapies.filter(t => t.patientId === patient.id).reverse();

  // Preparar datos para gráficos
  const chartData = patientTherapies.map((t, index) => ({
    session: `Sesión ${index + 1}`,
    totalTime: t.data.reduce((sum, d) => sum + d.time, 0),
    ...t.data.reduce((acc, d) => {
      acc[d.section.replace(/\s+/g, '_')] = d.time;
      return acc;
    }, {})
  }));

  // Datos para línea de tendencia
  const trendData = patientTherapies.map((t, index) => ({
    session: `S${index + 1}`,
    duracion: Math.floor(t.data.reduce((sum, d) => sum + d.time, 0) / 60) // en minutos
  }));

  const getBarColors = (section) => {
    if (section.includes('Adaptación')) return '#f59e0b';
    if (section.includes('Rutina')) return '#14b8a6';
    return '#6b7280';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Historial Médico</h2>
        <p className="text-slate-500">Métricas de {patient.name}</p>
      </div>

      {patientTherapies.length === 0 ? (
        <div className="text-center bg-slate-100 p-8 rounded-2xl border border-slate-200 mt-10">
          <FileText size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aún no hay terapias registradas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* GRÁFICO DE LÍNEA - Tendencia de duración */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Tendencia de Duración (minutos)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="session" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value} min`, 'Duración']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="duracion" 
                  stroke="#06b6d4" 
                  dot={{ fill: '#0891b2', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Duración Total"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* GRÁFICO DE BARRAS - Comparación de sesiones */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Comparación de Sesiones (segundos)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="session" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value}s`, 'Tiempo']}
                />
                <Legend />
                {Array.from(new Set(patientTherapies.flatMap(t => t.data.map(d => d.section)))).map((section) => (
                  <Bar 
                    key={section}
                    dataKey={section.replace(/\s+/g, '_')} 
                    fill={getBarColors(section)}
                    name={section}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SESIONES DETALLADAS */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">📋 Sesiones Detalladas</h3>
            {patientTherapies.map(t => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700">{t.date}</span>
                  <span className="text-sm text-slate-500">{t.time}</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {t.data.map((m, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0">
                          <td className="p-3 pl-4 text-slate-600 font-medium">{m.section}</td>
                          <td className="p-3 pr-4 text-right font-mono text-teal-600 font-bold">{Math.floor(m.time / 60).toString().padStart(2, '0') + ':' + (m.time % 60).toString().padStart(2, '0')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
