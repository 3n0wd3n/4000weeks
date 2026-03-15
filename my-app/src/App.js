import { useMemo, useState } from "react";
import "./App.css";
import LifeCalendar from "./components/LifeCalendar";
import PersonForm from "./components/PersonForm";
import { computeLifeSummary } from "./utils/time";

const DEFAULT_LIFE_EXPECTANCY = 90;

function randomColor(seed) {
  const hash = [...String(seed)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

function App() {
  const [people, setPeople] = useState(() => [
    {
      id: crypto.randomUUID(),
      name: "You",
      birthDate: "1990-01-01",
      lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
      accent: randomColor("You"),
    },
  ]);

  const [unit, setUnit] = useState("weeks");
  const [layout] = useState("grid");
  const [showCalendar, setShowCalendar] = useState(true);

  const totals = useMemo(() => {
    const now = new Date();
    return people.map((person) => ({
      id: person.id,
      summary: {
        ...computeLifeSummary(person.birthDate, person.lifeExpectancy, now, unit),
        name: person.name,
      },
    }));
  }, [people, unit]);

  const handleAddPerson = ({ name, birthDate, lifeExpectancy }) => {
    const id = crypto.randomUUID();
    setPeople((prev) => [
      ...prev,
      {
        id,
        name: name || `Person ${prev.length + 1}`,
        birthDate,
        lifeExpectancy,
        accent: randomColor(id),
      },
    ]);
  };

  const handleRemovePerson = (id) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Weeks of Life</h1>
        <p className='subtitle'>
          A minimalist visualization of time. Add people, choose a lifespan, and watch the weeks fill.
        </p>
      </header>

      <main className='App-main'>
        <section className='controls'>
          <div className='row'>
            <div className='control'>
              <label htmlFor='unit'>Summary Unit</label>
              <select id='unit' value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value='weeks'>Weeks</option>
                <option value='months'>Months</option>
                <option value='years'>Years</option>
              </select>
            </div>
          </div>

          <PersonForm onAdd={handleAddPerson} />

          <div className='summary'>
            {totals.map(({ id, summary }) => (
              <div key={id} className='summary-item'>
                <div className='summary-name'>{summary.name}</div>
                <div>
                  Lived <strong>{summary.daysLived.toLocaleString()}</strong> days (
                  <strong>{summary.unitsLived}</strong> {unit})
                </div>
                <div>
                  Remaining <strong>{Math.max(0, summary.remainingDays).toLocaleString()}</strong> days (
                  <strong>{Math.max(0, summary.remainingUnits)}</strong> {unit})
                </div>
              </div>
            ))}
          </div>

          <button type='button' className='toggle-calendar' onClick={() => setShowCalendar((prev) => !prev)}>
            {showCalendar ? "Hide" : "Show"} Calendar
          </button>
        </section>

        {showCalendar && (
          <LifeCalendar
            people={people}
            unit='weeks'
            layout={layout}
            onRemovePerson={handleRemovePerson}
            totals={totals}
            selectedUnit={unit}
          />
        )}
      </main>

      <footer className='App-footer'>
        <p>
          Tip: Hover a dot to see the exact date range it represents. The current week is highlighted and pulses to
          remind you where you are.
        </p>
      </footer>
    </div>
  );
}

export default App;
