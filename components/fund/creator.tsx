import { FormEvent, useState } from 'react'

const FundCreator = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label>Name:
          <input type="text" value={name} onChange={event => setName(event.target.value)}/>
        </label>
      </p>
      <p>
        <label>Amount:
          <input type="number" step="0.01" value={amount} onChange={event => setAmount(parseFloat(event.target.value))}/>
        </label>
      </p>
      <p><input type="submit" value="Create" /></p>
    </form>
  )
}

export default FundCreator