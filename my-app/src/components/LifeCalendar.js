import { useMemo, useState } from "react";
import { computeUnitCounts, formatDate, getUnitDateRange } from "../utils/time";

const UNIT_COLUMNS = {
  weeks: 52,
  months: 12,
  years: 10,
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Tooltip({ point, visible }) {
  if (!visible || !point) return null;
  const style = {
    left: point.x + 12,
    top: point.y + 12,
  };

  return (
    <div className='tooltip' style={style}>
      <div className='tooltip-title'>{point.label}</div>
      <div className='tooltip-line'>{point.range}</div>
    </div>
  );
}

function PersonTimeline({ person, unit, layout, onRemove, summary, selectedUnit }) {
  const { totalUnits, currentUnit } = useMemo(() => {
    return computeUnitCounts(person.birthDate, person.lifeExpectancy, unit, new Date());
  }, [person.birthDate, person.lifeExpectancy, unit]);

  const [hoverPoint, setHoverPoint] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDotEnter = (index, event) => {
    const { start, end } = getUnitDateRange(person.birthDate, index, unit);
    const label = `${person.name} • ${unit === "weeks" ? "Week" : unit === "months" ? "Month" : "Year"} ${index + 1}`;
    setHoverPoint({
      label,
      range: `${formatDate(start)} → ${formatDate(end)}`,
      x: event.clientX,
      y: event.clientY,
    });
    setTooltipVisible(true);
  };

  const handleDotMove = (event) => {
    if (!tooltipVisible) return;
    setHoverPoint((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
  };

  const handleDotLeave = () => {
    setTooltipVisible(false);
  };

  const dotCount = totalUnits;
  const columns = UNIT_COLUMNS[unit] || 52;

  const dots = useMemo(() => {
    const list = [];
    for (let i = 0; i < dotCount; i += 1) {
      const status = i < currentUnit ? "past" : i === currentUnit ? "current" : "future";
      list.push({ index: i, status });
    }
    return list;
  }, [dotCount, currentUnit]);

  const dotStyle = {
    "--accent": person.accent,
  };

  return (
    <div className='person-timeline' style={dotStyle}>
      <div className='person-header'>
        <div>
          <strong>{person.name}</strong>
          <span className='person-birth'>{person.birthDate}</span>{" "}
          {summary && (
            <div className='person-summary'>
              {summary.unitsLived} {selectedUnit} lived
            </div>
          )}{" "}
        </div>
        <div className='person-actions'>
          <button
            type='button'
            className='collapse'
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          <button type='button' className='remove' onClick={() => onRemove(person.id)} title='Remove'>
            ×
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {layout === "grid" ? (
            <div
              className='dot-grid'
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(6px, 1fr))` }}
              onMouseLeave={handleDotLeave}
              onMouseMove={handleDotMove}
            >
              {dots.map(({ index, status }) => (
                <button
                  key={index}
                  type='button'
                  className={classNames("dot", status)}
                  style={dotStyle}
                  onMouseEnter={(e) => handleDotEnter(index, e)}
                />
              ))}
            </div>
          ) : (
            <div className='dot-circle' onMouseLeave={handleDotLeave} onMouseMove={handleDotMove}>
              <svg viewBox='0 0 400 400' aria-label={`${person.name} timeline`}>
                <defs>
                  <filter id='soft' x='-20%' y='-20%' width='140%' height='140%'>
                    <feGaussianBlur in='SourceGraphic' stdDeviation='0.5' />
                  </filter>
                </defs>
                {dots.map(({ index, status }) => {
                  const angle = index * 137.508 * (Math.PI / 180);
                  const spacing = 3.1;
                  const radius = 20 + spacing * Math.sqrt(index);
                  const cx = 200 + Math.cos(angle) * radius;
                  const cy = 200 + Math.sin(angle) * radius;
                  return (
                    <circle
                      key={index}
                      className={classNames("dot", status)}
                      cx={cx}
                      cy={cy}
                      r={status === "current" ? 5.1 : 4}
                      style={dotStyle}
                      onMouseEnter={(e) => handleDotEnter(index, e)}
                    />
                  );
                })}
              </svg>
            </div>
          )}
        </>
      )}

      <Tooltip point={hoverPoint} visible={tooltipVisible} />
    </div>
  );
}

export default function LifeCalendar({ people, unit, layout, onRemovePerson, totals, selectedUnit }) {
  return (
    <section className='calendar'>
      {people.map((person) => {
        const summary = totals.find((t) => t.id === person.id)?.summary;
        return (
          <PersonTimeline
            key={person.id}
            person={person}
            unit={unit}
            layout={layout}
            onRemove={onRemovePerson}
            summary={summary}
            selectedUnit={selectedUnit}
          />
        );
      })}
    </section>
  );
}
