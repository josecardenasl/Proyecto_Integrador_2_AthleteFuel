import { useState, useRef, useEffect } from "react";

// ─── Tooltip flotante ─────────────────────────────────────────────────────────
function EventTooltip({ event, type, onEdit, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const isSession = type === "session";

  return (
    <div
      ref={ref}
      className={`absolute z-50 bottom-full left-0 mb-2 w-56 rounded-2xl shadow-2xl border text-sm
        ${isSession
          ? "bg-white border-red-100"
          : "bg-white border-blue-100"
        }`}
      style={{ minWidth: "14rem" }}
    >
      {/* Header color bar */}
      <div className={`rounded-t-2xl px-4 py-2 ${isSession ? "bg-red-500" : "bg-blue-500"}`}>
        <p className="text-white font-bold truncate">
          {isSession ? event.workoutName : event.supplementName}
        </p>
        <p className="text-white/80 text-xs">
          {isSession ? "Entrenamiento" : "Suplemento"}
        </p>
      </div>

      {/* Details */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {isSession ? (
          <>
            <Detail icon="🕐" label="Hora" value={event.time} />
            <Detail icon="📅" label="Fecha" value={event.date} />
            {event.timezone && <Detail icon="🌍" label="Zona" value={event.timezone} />}
            {event.notes && <Detail icon="📝" label="Notas" value={event.notes} />}
          </>
        ) : (
          <>
            <Detail icon="📅" label="Fecha" value={event.date} />
            <Detail icon="🕐" label="Horarios" value={(event.intakeTimes || []).join(", ")} />
            {event.timezone && <Detail icon="🌍" label="Zona" value={event.timezone} />}
            {event.notes && <Detail icon="📝" label="Notas" value={event.notes} />}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => { onEdit(event); onClose(); }}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition
            ${isSession
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => { onDelete(event.id); onClose(); }}
          className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <div>
        <span className="text-gray-400 text-xs">{label}: </span>
        <span className="text-gray-800 text-xs font-medium">{value}</span>
      </div>
    </div>
  );
}

// ─── Chip de evento en celda ──────────────────────────────────────────────────
function EventChip({ event, type, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const isSession = type === "session";
  const label = isSession
    ? `${event.time} ${event.workoutName}`
    : `${(event.intakeTimes || [])[0] || ""} ${event.supplementName}`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left text-white text-xs rounded-md px-1.5 py-0.5 truncate font-medium transition
          ${isSession
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
          }`}
        title={label}
      >
        {label}
      </button>

      {open && (
        <EventTooltip
          event={event}
          type={type}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Modales de edición ───────────────────────────────────────────────────────
function EditSessionModal({ session, onSave, onClose }) {
  const [form, setForm] = useState({ date: session.date, time: session.time, notes: session.notes || "" });
  const today = new Date().toISOString().split("T")[0];

  const inputClass = "border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 w-full text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Editar sesión</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Entrenamiento</label>
            <p className="text-sm font-semibold text-gray-800">{session.workoutName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={today} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hora *</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Opcional..." className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => onSave(form)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-semibold transition">Guardar</button>
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm transition">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditIntakeModal({ intake, onSave, onClose }) {
  const [date, setDate] = useState(intake.date || "");
  const [times, setTimes] = useState(intake.intakeTimes || ["08:00"]);
  const [notes, setNotes] = useState(intake.notes || "");
  const today = new Date().toISOString().split("T")[0];

  const inputClass = "border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Editar schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suplemento</label>
            <p className="text-sm font-semibold text-gray-800">{intake.supplementName}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Horarios de ingesta *</label>
            {times.map((t, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="time" value={t} onChange={e => { const u = [...times]; u[idx] = e.target.value; setTimes(u); }} className={inputClass} />
                {times.length > 1 && <button type="button" onClick={() => setTimes(times.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 px-1">✕</button>}
              </div>
            ))}
            <button type="button" onClick={() => setTimes([...times, "12:00"])} className="text-xs text-blue-600 hover:underline">+ Agregar horario</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional..." className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => onSave({ date, intakeTimes: times, notes })} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold transition">Guardar</button>
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm transition">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CalendarView principal ───────────────────────────────────────────────────
function CalendarView({ sessions, intakeSchedules, timezone, onEditSession, onDeleteSession, onEditIntake, onDeleteIntake }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [editingSession, setEditingSession] = useState(null);
  const [editingIntake, setEditingIntake] = useState(null);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  function dateStr(day) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getEventsForDay(day) {
    const d = dateStr(day);
    const s = (sessions || []).filter(s => s.date === d);
    const i = (intakeSchedules || []).filter(i => i.date === d);
    return { sessions: s, intakes: i };
  }

  const totalEvents = (sessions || []).length + (intakeSchedules || []).length;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-lg font-bold">
            ‹
          </button>
          <div className="text-center">
            <h3 className="text-white font-bold text-lg">{monthNames[currentMonth]} {currentYear}</h3>
            {timezone && <p className="text-gray-400 text-xs mt-0.5">{timezone}</p>}
          </div>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-lg font-bold">
            ›
          </button>
        </div>

        {/* Leyenda */}
        <div className="px-5 pt-3 pb-1 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
            <span className="text-xs text-gray-500">Entrenamiento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span className="text-xs text-gray-500">Suplemento</span>
          </div>
          <span className="ml-auto text-xs text-gray-400">{totalEvents} eventos este mes</span>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border-t border-gray-100 mx-3 mb-3 rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="bg-white min-h-[72px]" />;
            const { sessions: ds, intakes: di } = getEventsForDay(day);
            const isToday = dateStr(day) === todayStr;
            const hasEvents = ds.length > 0 || di.length > 0;

            return (
              <div
                key={dateStr(day)}
                className={`bg-white min-h-[72px] p-1.5 flex flex-col gap-0.5 relative
                  ${isToday ? "ring-2 ring-inset ring-red-400" : ""}
                  ${hasEvents ? "bg-gray-50/50" : ""}
                `}
              >
                <span className={`text-xs font-semibold self-end w-5 h-5 flex items-center justify-center rounded-full
                  ${isToday ? "bg-red-500 text-white" : "text-gray-600"}`}>
                  {day}
                </span>
                <div className="flex flex-col gap-0.5">
                  {ds.map(s => (
                    <EventChip
                      key={s.id}
                      event={s}
                      type="session"
                      onEdit={() => setEditingSession(s)}
                      onDelete={onDeleteSession}
                    />
                  ))}
                  {di.map(i => (
                    <EventChip
                      key={i.id}
                      event={i}
                      type="intake"
                      onEdit={() => setEditingIntake(i)}
                      onDelete={onDeleteIntake}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Próximos eventos */}
      {totalEvents > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Próximos eventos</h3>
          <div className="flex flex-col gap-2">
            {[
              ...(sessions || []).filter(s => s.date >= todayStr).map(s => ({ ...s, _type: "session" })),
              ...(intakeSchedules || []).filter(i => i.date >= todayStr).map(i => ({ ...i, _type: "intake" })),
            ]
              .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
              .slice(0, 6)
              .map(ev => (
                <div key={ev.id} className={`bg-white border rounded-xl px-4 py-3 flex items-center justify-between
                  ${ev._type === "session" ? "border-red-100" : "border-blue-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ev._type === "session" ? "bg-red-500" : "bg-blue-500"}`} />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {ev._type === "session" ? ev.workoutName : ev.supplementName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ev.date}
                        {ev._type === "session" && ` · ${ev.time}`}
                        {ev._type === "intake" && ` · ${(ev.intakeTimes || []).join(", ")}`}
                        {ev.timezone && ` · ${ev.timezone}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => ev._type === "session" ? setEditingSession(ev) : setEditingIntake(ev)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition font-medium
                        ${ev._type === "session" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => ev._type === "session" ? onDeleteSession(ev.id) : onDeleteIntake(ev.id)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit modals */}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onSave={(data) => { onEditSession(editingSession.id, data); setEditingSession(null); }}
          onClose={() => setEditingSession(null)}
        />
      )}
      {editingIntake && (
        <EditIntakeModal
          intake={editingIntake}
          onSave={(data) => { onEditIntake(editingIntake.id, data); setEditingIntake(null); }}
          onClose={() => setEditingIntake(null)}
        />
      )}
    </>
  );
}

export default CalendarView;
