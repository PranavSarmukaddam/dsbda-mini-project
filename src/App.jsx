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
  Cell
} from 'recharts';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Global Filters
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');

  // Risk Calculator State
  const [calcValues, setCalcValues] = useState({
    age: 50,
    sex: '1',
    cp: '1',
    trestbps: 120,
    chol: 200,
    thalach: 150
  });
  const [riskScore, setRiskScore] = useState(null);

  useEffect(() => {
    Papa.parse('/heart_disease.csv', {
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

    // Apply Global Filters
    const filteredData = data.filter(row => {
      const genderMatch = genderFilter === 'All' || row.sex_label === genderFilter;
      const ageMatch = ageFilter === 'All' || row.age_group === ageFilter;
      return genderMatch && ageMatch;
    });

    let totalPatients = filteredData.length;
    if (totalPatients === 0) return { totalPatients: 0 };

    let heartDiseaseCount = 0;
    let sumAge = 0;
    let sumChol = 0;
    let sumTrestbps = 0;
    let sumThalach = 0;

    let maleCount = 0;
    let femaleCount = 0;
    let maleDisease = 0;
    let femaleDisease = 0;

    const ageGroupCounts = { '<45': 0, '45-55': 0, '56-65': 0, '>65': 0 };
    const ageGroupDisease = { '<45': 0, '45-55': 0, '56-65': 0, '>65': 0 };
    
    const cpCounts = { 'Typical Angina': 0, 'Atypical Angina': 0, 'Non-anginal Pain': 0, 'Asymptomatic': 0 };
    const cpDisease = { 'Typical Angina': 0, 'Atypical Angina': 0, 'Non-anginal Pain': 0, 'Asymptomatic': 0 };

    const fbsCounts = { 'Normal (<=120)': 0, 'High (>120)': 0 };
    const fbsDisease = { 'Normal (<=120)': 0, 'High (>120)': 0 };

    filteredData.forEach(row => {
      const target = parseInt(row.target);
      const age = parseInt(row.age);
      const chol = parseInt(row.chol);
      const trestbps = parseInt(row.trestbps);
      const thalach = parseInt(row.thalach);
      
      sumAge += age;
      sumChol += chol;
      sumTrestbps += trestbps;
      sumThalach += thalach;

      if (target === 1) heartDiseaseCount++;

      if (row.sex_label === 'Male') {
        maleCount++;
        if (target === 1) maleDisease++;
      } else {
        femaleCount++;
        if (target === 1) femaleDisease++;
      }

      if (row.age_group in ageGroupCounts) {
        ageGroupCounts[row.age_group]++;
        if (target === 1) ageGroupDisease[row.age_group]++;
      }

      if (row.cp_label in cpCounts) {
        cpCounts[row.cp_label]++;
        if (target === 1) cpDisease[row.cp_label]++;
      }

      const fbsLabel = row.fbs == 1 ? 'High (>120)' : 'Normal (<=120)';
      fbsCounts[fbsLabel]++;
      if (target === 1) fbsDisease[fbsLabel]++;
    });

    const ageData = Object.keys(ageGroupCounts).map(group => ({
      group,
      'Healthy': ageGroupCounts[group] - ageGroupDisease[group],
      'Heart Disease': ageGroupDisease[group]
    }));

    const cpData = Object.keys(cpCounts).map(type => ({
      type,
      'Healthy': cpCounts[type] - cpDisease[type],
      'Heart Disease': cpDisease[type]
    }));

    const fbsData = Object.keys(fbsCounts).map(type => ({
      type,
      'Healthy': fbsCounts[type] - fbsDisease[type],
      'Heart Disease': fbsDisease[type]
    }));

    return {
      totalPatients,
      heartDiseaseCount,
      avgAge: Math.round(sumAge / totalPatients),
      avgChol: Math.round(sumChol / totalPatients),
      avgTrestbps: Math.round(sumTrestbps / totalPatients),
      avgThalach: Math.round(sumThalach / totalPatients),
      maleCount,
      femaleCount,
      maleDisease,
      femaleDisease,
      ageData,
      cpData,
      fbsData
    };
  }, [data, genderFilter, ageFilter]);

  const handleDownload = (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = '/heart_disease.csv';
    link.download = 'heart_disease_dataset.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateRisk = (e) => {
    e.preventDefault();
    const { age, sex, cp, trestbps, chol, thalach } = calcValues;
    let score = 5; // Base risk
    
    if (age > 50) score += 15;
    if (age > 60) score += 10;
    
    if (sex === '1') score += 10;
    
    if (cp === '1') score += 15;
    if (cp === '4') score += 30;
    
    if (trestbps > 130) score += 10;
    if (trestbps > 140) score += 10;
    
    if (chol > 200) score += 10;
    if (chol > 240) score += 10;
    
    if (thalach < 140) score += 15;
    if (thalach < 120) score += 10;

    score = Math.min(score, 95); 
    setRiskScore(score);
  };

  const handleCalcChange = (e) => {
    const { name, value } = e.target;
    setCalcValues(prev => ({ ...prev, [name]: value }));
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#637f64'; // Green
    if (score < 60) return '#e0c9a3'; // Yellow/Tan
    return '#b76c5b'; // Red
  };

  if (loading) {
    return <div className="loader">Analyzing clinical data...</div>;
  }

  if (!processedData) return <div className="loader">Error loading data.</div>;

  const { 
    totalPatients, heartDiseaseCount, avgAge, avgChol, avgTrestbps,
    maleCount, femaleCount, maleDisease, femaleDisease, ageData, cpData, fbsData 
  } = processedData;

  const genderData = [
    { name: 'Male (Healthy)', value: maleCount - maleDisease },
    { name: 'Male (Disease)', value: maleDisease },
    { name: 'Female (Healthy)', value: femaleCount - femaleDisease },
    { name: 'Female (Disease)', value: femaleDisease },
  ].filter(d => d.value > 0);

  const overallDiseaseData = [
    { name: 'Healthy', value: totalPatients - heartDiseaseCount },
    { name: 'Heart Disease', value: heartDiseaseCount }
  ];

  const COLORS = ['#8d9f8e', '#b76c5b', '#e0c9a3', '#4a453f'];
  const PIE_COLORS = ['#637f64', '#b76c5b'];

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
          </svg>
          CardioScan Insights
        </div>
        <div className="nav-links">
          <a href="#overview" className={activeTab === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>Overview</a>
          <a href="#demographics" className={activeTab === 'demographics' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('demographics'); }}>Demographics</a>
          <a href="#factors" className={activeTab === 'factors' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('factors'); }}>Risk Factors</a>
          <a href="#calculator" className={activeTab === 'calculator' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('calculator'); }}>Risk Calculator ✦</a>
          <a href="#explorer" className={activeTab === 'explorer' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('explorer'); }}>Explorer</a>
          <a href="#download" onClick={handleDownload} aria-label="Download CSV dataset">Download CSV</a>
        </div>
      </nav>

      <section className="hero">
        <span className="tag">Dataset Analysis Active</span>
        <h1>Decoding Heart Disease Risks</h1>
        <p>A comprehensive data science mini-project analyzing clinical metrics, demographics, and predicting risk factors.</p>
      </section>

      {/* Global Filters UI - Shown everywhere except Calculator */}
      {activeTab !== 'calculator' && activeTab !== 'explorer' && (
        <div className="filters-container">
          <span style={{ fontWeight: '600', color: '#6d665a' }}>Global Filters:</span>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="All">All Genders</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
          </select>
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
            <option value="All">All Ages</option>
            <option value="<45">Under 45</option>
            <option value="45-55">45 - 55</option>
            <option value="56-65">56 - 65</option>
            <option value=">65">Over 65</option>
          </select>
        </div>
      )}

      {totalPatients === 0 ? (
        <div className="loader">No records match the current filters.</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <section className="dashboard-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Patients</h3>
                  <div className="value">{formatNumber(totalPatients)}</div>
                </div>
                <div className="stat-card">
                  <h3>Heart Disease Cases</h3>
                  <div className="value">{formatNumber(heartDiseaseCount)}</div>
                </div>
                <div className="stat-card">
                  <h3>Prevalence Rate</h3>
                  <div className="value">{((heartDiseaseCount / totalPatients) * 100).toFixed(1)}%</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Age</h3>
                  <div className="value">{avgAge} yrs</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Cholesterol</h3>
                  <div className="value">{avgChol} mg/dl</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Blood Pressure</h3>
                  <div className="value">{avgTrestbps} mmHg</div>
                </div>
              </div>

              <div className="chart-container" style={{ marginTop: '2rem' }}>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={overallDiseaseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {overallDiseaseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-title">Overall Population Health Status</div>
              </div>
            </section>
          )}

          {activeTab === 'demographics' && (
            <section className="dashboard-content">
              <div className="chart-container">
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0ddd0" />
                      <XAxis dataKey="group" tick={{fill: '#6d665a'}} />
                      <YAxis tick={{fill: '#6d665a'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fcfaf5', borderRadius: '8px', border: '1px solid #d1cbbb' }} />
                      <Legend />
                      <Bar dataKey="Healthy" fill="#8d9f8e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Heart Disease" fill="#b76c5b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-title">Health Status by Age Group</div>
              </div>

              <div className="chart-container" style={{ marginTop: '2rem' }}>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-title">Health Status Breakdown by Gender</div>
              </div>
            </section>
          )}

          {activeTab === 'factors' && (
            <section className="dashboard-content">
              <div className="chart-container">
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={cpData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0ddd0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{fill: '#6d665a'}} width={160} />
                      <Tooltip cursor={{fill: '#f7f5ef'}} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="Healthy" fill="#8d9f8e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Heart Disease" fill="#b76c5b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-title">Health Status by Chest Pain Type</div>
              </div>

              <div className="chart-container" style={{ marginTop: '2rem' }}>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={fbsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0ddd0" />
                      <XAxis dataKey="type" tick={{fill: '#6d665a'}} />
                      <YAxis tick={{fill: '#6d665a'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fcfaf5', borderRadius: '8px', border: '1px solid #d1cbbb' }} />
                      <Legend />
                      <Bar dataKey="Healthy" fill="#8d9f8e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Heart Disease" fill="#b76c5b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-title">Health Status by Fasting Blood Sugar Level</div>
              </div>
            </section>
          )}

          {activeTab === 'calculator' && (
            <section className="dashboard-content">
              <div className="section-header">
                <h2>Predictive Risk Calculator</h2>
                <p>Input clinical metrics to generate a simulated heart disease probability score based on dataset trends.</p>
              </div>
              
              <form className="risk-form" onSubmit={calculateRisk}>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={calcValues.age} onChange={handleCalcChange} required />
                </div>
                
                <div className="form-group">
                  <label>Biological Sex</label>
                  <select name="sex" value={calcValues.sex} onChange={handleCalcChange}>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chest Pain Type</label>
                  <select name="cp" value={calcValues.cp} onChange={handleCalcChange}>
                    <option value="1">Typical Angina</option>
                    <option value="2">Atypical Angina</option>
                    <option value="3">Non-anginal Pain</option>
                    <option value="4">Asymptomatic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Resting Blood Pressure</label>
                  <input type="number" name="trestbps" value={calcValues.trestbps} onChange={handleCalcChange} required />
                </div>

                <div className="form-group">
                  <label>Serum Cholesterol</label>
                  <input type="number" name="chol" value={calcValues.chol} onChange={handleCalcChange} required />
                </div>

                <div className="form-group">
                  <label>Max Heart Rate Achieved</label>
                  <input type="number" name="thalach" value={calcValues.thalach} onChange={handleCalcChange} required />
                </div>

                <button type="submit" className="calc-btn">Calculate Risk Probability</button>
              </form>

              {riskScore !== null && (
                <div className="risk-result" style={{ borderColor: getRiskColor(riskScore) }}>
                  <h3>Estimated Heart Disease Risk</h3>
                  <div className="risk-score-display" style={{ 
                    color: getRiskColor(riskScore), 
                    backgroundColor: `${getRiskColor(riskScore)}15` 
                  }}>
                    {riskScore}%
                  </div>
                  <p style={{ color: '#6d665a', fontSize: '1.1rem' }}>
                    {riskScore < 30 ? "Low Risk: Metrics are generally within healthy ranges." :
                     riskScore < 60 ? "Moderate Risk: Some clinical factors indicate elevated risk. Monitor closely." :
                     "High Risk: Several critical factors indicate a high probability of heart disease."}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === 'explorer' && (
            <section className="dashboard-content">
              <div className="section-header">
                <h2>Raw Data Explorer</h2>
                <p>View the underlying patient records used to generate this dashboard.</p>
              </div>
              <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', padding: '1rem', border: '1px solid #e0ddd0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0ddd0', color: '#6d665a' }}>
                      <th style={{ padding: '12px 8px' }}>Age</th>
                      <th style={{ padding: '12px 8px' }}>Sex</th>
                      <th style={{ padding: '12px 8px' }}>Chest Pain</th>
                      <th style={{ padding: '12px 8px' }}>Blood Pressure</th>
                      <th style={{ padding: '12px 8px' }}>Cholesterol</th>
                      <th style={{ padding: '12px 8px' }}>Max Heart Rate</th>
                      <th style={{ padding: '12px 8px' }}>Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f7f5ef' }}>
                        <td style={{ padding: '12px 8px' }}>{row.age}</td>
                        <td style={{ padding: '12px 8px' }}>{row.sex_label}</td>
                        <td style={{ padding: '12px 8px' }}>{row.cp_label}</td>
                        <td style={{ padding: '12px 8px' }}>{row.trestbps}</td>
                        <td style={{ padding: '12px 8px' }}>{row.chol}</td>
                        <td style={{ padding: '12px 8px' }}>{row.thalach}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: row.target == 1 ? '#b76c5b' : '#8d9f8e' }}>
                          {row.target_label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '16px 10px', textAlign: 'center', color: '#6d665a', fontSize: '0.9em' }}>
                  Showing first 50 records of {data.length} total.
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
