import React, { useState, useEffect } from "react";
import "./calculator.css"; // Import the CSS file for styling

const Calculator = () => {
  const [resources, setResources] = useState({});
  const [selectedItem, setSelectedItem] = useState(""); // Selected item (e.g., wood)
  const [quantity, setQuantity] = useState(0); // Quantity per time period
  const [time, setTime] = useState(0); // Time period in seconds
  const [results, setResults] = useState(null);

  // Fetch the resource data from the JSON file
  useEffect(() => {
    fetch("/resources.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setResources(data))
      .catch((error) => console.error("Error loading resource data:", error));
  }, []);

  const calculatePerTimePeriod = (item, qty, timePeriod) => {
    if (!resources[item]) return {};

    const result = {};
    const stack = [{ name: item, qty }];

    while (stack.length > 0) {
      const { name, qty } = stack.pop();

      if (!result[name]) {
        result[name] = 0;
      }

      // Time required to produce one unit of the current resource
      const productionTime = resources[name].time;
      
      // Calculate production capacity (unitsPerPeriod was calculated but not used)
      Math.floor(timePeriod / productionTime); // Result not stored as it's unused
      result[name] += qty;

      const requirements = resources[name]?.requires || {};

      // Add the required quantities of dependent resources
      for (const [requiredItem, requiredQty] of Object.entries(requirements)) {
        stack.push({ name: requiredItem, qty: requiredQty * qty });
      }
    }

    return result;
  };

  const handleCalculate = () => {
    if (!selectedItem || quantity <= 0 || time <= 0) return;

    const requirements = calculatePerTimePeriod(selectedItem, quantity, time);

    setResults(requirements);
  };

  return (

    <div className="calculator-container">
      <h1>Game Resource Calculator</h1>

      <div className="input-group">
        <label>Select Item: </label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">--Select an Item--</option>
          {Object.keys(resources).map((resource) => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Quantity (Per Time Period): </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <div className="input-group">
        <label>Time Period (in seconds): </label>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />
      </div>

      <button onClick={handleCalculate}>Calculate</button>

      {results && (
        <div>
          <h2>Resource Requirements Per {time} Seconds</h2>
          <ul>
            {Object.entries(results).map(([resource, amount]) => (
              <li key={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}: {amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calculator;