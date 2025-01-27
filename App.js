import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DrugOverdoseVisualization = () => {
  const [data, setData] = useState([]);
  const [visibleDrugs, setVisibleDrugs] = useState({});

  const colors = {
    'Other_Opioids': '#ff7f0e',
    'Fentanyl': '#d62728',
    'Heroin': '#9467bd',
    'Cocaine': '#1f77b4',
    'Psychostimulants': '#2ca02c',
    'Methadone': '#8c564b'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await window.fs.readFile('overdose_data.csv', { encoding: 'utf8' });
        const lines = response.split('\n');
        const headers = lines[0].split(',');
        const years = headers.slice(1);
        
        // Process the data
        const drugData = {};
        lines.slice(1).forEach(line => {
          if (line.trim()) {
            const values = line.split(',');
            const drugType = values[0].replace('/', '_');
            drugData[drugType] = values.slice(1).map(v => parseFloat(v));
          }
        });

        // Transform into the format needed for Recharts
        const transformedData = years.map((year, index) => {
          const dataPoint = { year: parseInt(year) };
          Object.keys(drugData).forEach(drug => {
            dataPoint[drug] = drugData[drug][index];
          });
          return dataPoint;
        });

        // Set initial visibility
        const initialVisibility = {};
        Object.keys(drugData).forEach(drug => {
          initialVisibility[drug] = true;
        });

        setVisibleDrugs(initialVisibility);
        setData(transformedData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const toggleDrug = (drugType) => {
    setVisibleDrugs(prev => ({
      ...prev,
      [drugType]: !prev[drugType]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
          <p className="font-bold mb-2">{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name.replace('_', ' ')}: ${entry.value?.toFixed(1) || 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Drug Overdose Rates (1999-2022)</h2>
      <div className="mb-4">
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          {Object.keys(visibleDrugs).map(drugType => (
            <button
              key={drugType}
              onClick={() => toggleDrug(drugType)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                visibleDrugs[drugType] 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {drugType.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              label={{ value: 'Year', position: 'bottom', offset: 0 }}
            />
            <YAxis
              label={{ 
                value: 'Overdose Rate per 100,000', 
                angle: -90, 
                position: 'insideLeft'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(visibleDrugs).map(drugType => (
              visibleDrugs[drugType] && (
                <Line
                  key={drugType}
                  type="monotone"
                  dataKey={drugType}
                  name={drugType.replace('_', ' ')}
                  stroke={colors[drugType]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Click on the drug names above to show/hide their trends. Hover over the chart to see detailed values.</p>
      </div>
    </div>
  );
};

export default DrugOverdoseVisualization;