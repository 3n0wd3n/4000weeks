import { useMemo, useState } from "react";

const DEFAULT_LIFE_EXPECTANCY = 90;

export default function PersonForm({ onAdd }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_LIFE_EXPECTANCY);

  const canAdd = useMemo(() => {
    return name.trim() !== "" && birthDate && lifeExpectancy > 0;
  }, [name, birthDate, lifeExpectancy]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canAdd) return;

    onAdd({ name: name.trim(), birthDate, lifeExpectancy: Number(lifeExpectancy) });
    setName("");
    setBirthDate("");
    setLifeExpectancy(DEFAULT_LIFE_EXPECTANCY);
  };

  return (
    <form className='person-form' onSubmit={handleSubmit}>
      <div className='person-form-row'>
        <label>
          Name
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Alex'
            required
            autoComplete='name'
          />
        </label>

        <label>
          Birth date
          <input type='date' value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        </label>

        <label>
          Expected lifespan
          <div className='range-row'>
            <input
              type='range'
              min='60'
              max='120'
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
            />
            <span className='range-value'>{lifeExpectancy} yrs</span>
          </div>
        </label>
      </div>

      <button type='submit' className='primary' disabled={!canAdd}>
        Add person
      </button>
    </form>
  );
}
