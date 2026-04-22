import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dataset');

  useEffect(() => {
    Papa.parse('/covid_vaccine_statewise.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, []);

  const processedData = useMemo(() => {
    if (!data.length) return null;

    const stateMaxMap = new Map();

    data.forEach((row) => {
      const state = row.State;
      if (!state) return;

      const firstDose = parseFloat(row['First Dose Administered']) || 0;
      const secondDose = parseFloat(row['Second Dose Administered']) || 0;
      
      const male1 = parseFloat(row['Male (Doses Administered)']) || 0;
      const male2 = parseFloat(row['Male(Individuals Vaccinated)']) || 0;
      const male = Math.max(male1, male2);

      const female1 = parseFloat(row['Female (Doses Administered)']) || 0;
      const female2 = parseFloat(row['Female(Individuals Vaccinated)']) || 0;
      const female = Math.max(female1, female2);

      const covaxin = parseFloat(row['Covaxin (Doses Administered)']) || 0;
      const covishield = parseFloat(row['CoviShield (Doses Administered)']) || 0;
      const sputnik = parseFloat(row['Sputnik V (Doses Administered)']) || 0;

      const age1D = parseFloat(row['18-44 Years (Doses Administered)']) || 0;
      const age1I = parseFloat(row['18-44 Years(Individuals Vaccinated)']) || 0;
      const age18_44 = Math.max(age1D, age1I);

      const age2D = parseFloat(row['45-60 Years (Doses Administered)']) || 0;
      const age2I = parseFloat(row['45-60 Years(Individuals Vaccinated)']) || 0;
      const age45_60 = Math.max(age2D, age2I);

      const age3D = parseFloat(row['60+ Years (Doses Administered)']) || 0;
      const age3I = parseFloat(row['60+ Years(Individuals Vaccinated)']) || 0;
      const age60plus = Math.max(age3D, age3I);

      // Extract Sessions and Sites natively from rows across all dates
      const sessions = parseFloat(row['Sessions']) || 0;
      const sites = parseFloat(row['Sites']) || 0;

      if (!stateMaxMap.has(state)) {
        stateMaxMap.set(state, {
          state, firstDose, secondDose, male, female,
          covaxin, covishield, sputnik, age18_44, age45_60, age60plus,
          sessions, sites
        });
      } else {
        const current = stateMaxMap.get(state);
        stateMaxMap.set(state, {
          state,
          firstDose: Math.max(current.firstDose, firstDose),
          secondDose: Math.max(current.secondDose, secondDose),
          male: Math.max(current.male, male),
          female: Math.max(current.female, female),
          covaxin: Math.max(current.covaxin, covaxin),
          covishield: Math.max(current.covishield, covishield),
          sputnik: Math.max(current.sputnik, sputnik),
          age18_44: Math.max(current.age18_44, age18_44),
          age45_60: Math.max(current.age45_60, age45_60),
          age60plus: Math.max(current.age60plus, age60plus),
          sessions: Math.max(current.sessions, sessions),
          sites: Math.max(current.sites, sites)
        });
      }
    });

    const indiaTotal = stateMaxMap.get('India');
    stateMaxMap.delete('India');
    
    const stateDataValid = Array.from(stateMaxMap.values())
      .filter(s => s.firstDose > 0)
      .sort((a, b) => b.firstDose - a.firstDose);

    return {
      totalRows: data.length,
      nationalTotals: indiaTotal,
      allStates: stateDataValid,
    };
  }, [data]);

  const handleDownload = (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = '/covid_vaccine_statewise.csv';
    link.download = 'covid_vaccine_statewise.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loader">Analyzing dataset numbers...</div>;
  }

  if (!processedData || !processedData.nationalTotals) {
    return <div className="loader">Failed to parse data properly.</div>;
  }

  const { nationalTotals, allStates, totalRows } = processedData;

  const genderData = [
    { name: 'Male', value: nationalTotals.male },
    { name: 'Female', value: nationalTotals.female },
  ];
  
  const vaccineBrandData = [
    { name: 'CoviShield', value: nationalTotals.covishield },
    { name: 'Covaxin', value: nationalTotals.covaxin },
    { name: 'Sputnik V', value: nationalTotals.sputnik },
  ].filter(d => d.value > 0);

  const ageDemographicData = [
    { name: '18-44 Years', value: nationalTotals.age18_44 },
    { name: '45-60 Years', value: nationalTotals.age45_60 },
    { name: '60+ Years', value: nationalTotals.age60plus },
  ].filter(d => d.value > 0);

  const COLORS = ['#637f64', '#b76c5b', '#e0c9a3'];
  const BRAND_COLORS = ['#3b3631', '#8d9f8e', '#d1cbbb'];
  const AGE_COLORS = ['#e0c9a3', '#b76c5b', '#4a453f'];

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);
  const chartWidth = Math.max(800, allStates.length * 60);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m9.182 9.498 4.949 4.95"/><path d="M4.5 16.5 6 15"/><path d="m18 8 1.5-1.5"/>
          </svg>
          VaxTracker India
        </div>
        <div className="nav-links">
          <a href="#dataset" className={activeTab === 'dataset' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dataset'); }}>Dataset Overview</a>
          <a href="#statewise" className={activeTab === 'statewise' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('statewise'); }}>Statewise Doses</a>
          <a href="#gender" className={activeTab === 'gender' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('gender'); }}>Demographics & Data</a>
          <a href="#download" onClick={handleDownload} aria-label="Download CSV dataset">Download CSV</a>
        </div>
      </nav>

      <section className="hero">
        <span className="tag">Research Phase Complete</span>
        <h1>Mapping India's Vaccine Journey</h1>
        <p>A simple mini project for Data Science and Big Data Analysis, designed to explore and visually break down the national vaccination drive.</p>
      </section>

      {activeTab === 'dataset' && (
        <section className="dashboard-content">
          <div className="section-header">
            <h2>Dataset Overview</h2>
            <p>High-level aggregated statistics pulled from the latest reported date in India.</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Rows Parsed</h3>
              <div className="value">{formatNumber(totalRows)}</div>
            </div>
            <div className="stat-card">
              <h3>States & UTs Recorded</h3>
              <div className="value">{allStates.length}</div>
            </div>
            <div className="stat-card">
              <h3>First Doses (National)</h3>
              <div className="value">{formatNumber(nationalTotals.firstDose)}</div>
            </div>
            <div className="stat-card">
              <h3>Second Doses (National)</h3>
              <div className="value">{formatNumber(nationalTotals.secondDose)}</div>
            </div>
            <div className="stat-card">
              <h3>Peak Daily Sessions</h3>
              <div className="value">{formatNumber(nationalTotals.sessions)}</div>
            </div>
            <div className="stat-card">
              <h3>Peak Active Sites</h3>
              <div className="value">{formatNumber(nationalTotals.sites)}</div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'statewise' && (
        <section className="dashboard-content">
          <div className="section-header">
            <h2>Statewise Vaccination Counts</h2>
            <p>Comparing vaccination reach across all Indian States and UTs. Scroll horizontally to view all regions.</p>
          </div>
          
          <div className="chart-container">
            <div className="scrollable-chart">
              <div style={{ width: chartWidth, height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allStates}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0ddd0" />
                    <XAxis 
                      dataKey="state" 
                      angle={-45} 
                      textAnchor="end" 
                      interval={0} 
                      tick={{fill: '#6d665a', fontSize: 12}} 
                      tickMargin={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                      tick={{fill: '#6d665a', fontSize: 12}}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{ backgroundColor: '#fcfaf5', borderRadius: '8px', border: '1px solid #d1cbbb' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="firstDose" name="First Dose" fill="#8d9f8e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="secondDose" name="Second Dose" fill="#e0c9a3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-title">Vaccination Spikes by Region</div>
          </div>
        </section>
      )}

      {activeTab === 'gender' && (
        <section className="dashboard-content">
          <div className="section-header">
            <h2>Demographics & Logistics Breakdown</h2>
            <p>Analyzing critical demographic segments and types of vaccines administered nationally.</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Number of Males Vaccinated</h3>
              <div className="value">{formatNumber(nationalTotals.male)}</div>
            </div>
            <div className="stat-card">
              <h3>Number of Females Vaccinated</h3>
              <div className="value">{formatNumber(nationalTotals.female)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="chart-container" style={{ margin: 0 }}>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-title">Gender Proportion</div>
            </div>

            <div className="chart-container" style={{ margin: 0 }}>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={vaccineBrandData} layout="vertical" margin={{ left: 20, right: 100, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0ddd0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6d665a'}} width={80} />
                    <Tooltip formatter={(value) => formatNumber(value)} cursor={{fill: '#f7f5ef'}} />
                    <Bar dataKey="value" fill="#b76c5b" radius={[0, 4, 4, 0]}>
                      {vaccineBrandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" formatter={(value) => formatNumber(value)} fill="#6d665a" fontSize={13} fontWeight={600} offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-title">Brand Distribution (Doses)</div>
            </div>
          </div>

          <div className="chart-container">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={ageDemographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {ageDemographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-title">Age Groups Vaccinated</div>
          </div>
        </section>
      )}
    </div>
  );
}
